// notion.ts
import { Client } from "@notionhq/client";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import { extractReviewText } from "../functions/recommendBook.ts";
dotenv.config();

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const databaseId = process.env.NOTION_DATABASE_ID!;
const reviewDbId = process.env.NOTION_READDATABASE_ID!;
const RECOMMENDED_DB_ID = process.env.RECOMMENDED_BOOK_DB_ID!;

export function getDatabaseId() {
  const id = process.env.NOTION_DATABASE_ID;
  if (!id) throw new Error("❌ NOTION_DATABASE_ID가 정의되어 있지 않습니다.");
  return id;
}

export function getReviewDbId() {
  const id = process.env.NOTION_READDATABASE_ID;
  if (!id) throw new Error("❌ NOTION_READDATABASE_ID가 정의되어 있지 않습니다.");
  return id;
}


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


export async function findPageIdByBookName(bookName: string): Promise<string | null> {
  const res = await notion.databases.query({
    database_id: databaseId,
    filter: {
      property: "이름",
      rich_text: {
        equals: bookName,
      },
    },
  });
  const page = res.results[0];
  return page ? page.id : null;
}

export async function uploadImageToCloud(localPath: string, title: string): Promise<string> {
  // Cloudinary가 처리 가능한 형식으로 URL 정제
  if (localPath.includes("??")) {
    localPath = localPath.replace("??", "?");
  }

  try {
    const result = await cloudinary.uploader.upload(localPath, {
      folder: "your-folder-name",
      use_filename: true,
      unique_filename: false,
      overwrite: true,
      secure: true,
    });
    return result.secure_url;
  } catch (error) {
    console.error("❌ Cloudinary 업로드 실패:", error);
    throw error;
  }
}

export interface Book {
  이름: string;
  저자: string;
  책표지: string | null;
  "도서 기록"?: string;
  상태?: string;
  진행률?: number;
  장르?: string;
  "책갈피"?: string;
  "총 페이지"?: number;
  "처음 읽은 날"?: string;
}

export const getTodayISODate = (): string => {
  return new Date().toISOString().slice(0, 10);
};

export const saveBookToNotion = async (book: Book) => {
  console.log("📢 saveBookToNotion - 책표지:", book.책표지);

  let imageUrl: string | null = null;
  if (book.책표지) {
    try {
      imageUrl = await uploadImageToCloud(book.책표지, book.이름);
    } catch (error) {
      console.error("❌ 이미지 업로드 실패:", error);
      imageUrl = null;
    }
  }

  if (!book["처음 읽은 날"]) {
    book["처음 읽은 날"] = getTodayISODate();
    console.log("📅 처음 읽은 날 기본값으로 오늘 날짜 설정:", book["처음 읽은 날"]);
  }

  const properties: Record<string, any> = {
    이름: { title: [{ text: { content: book.이름 } }] },
    저자: { rich_text: [{ text: { content: book.저자 } }] },
    상태: { select: { name: book.상태 || "예정" } },
    "책 표지": imageUrl
      ? { files: [{ name: "cover.jpg", type: "external", external: { url: imageUrl } }] }
      : { files: [] },
  };

  if (book["도서 기록"]) {
    properties["도서 기록"] = {
      relation: [{ id: book["도서 기록"] }],
    };
  }
  if (book.진행률 !== undefined) properties["진행률"] = { number: book.진행률 };
  if (book.장르) properties["장르"] = { rich_text: [{ text: { content: book.장르 } }] };
  if (book.책갈피) properties["책갈피"] = { rich_text: [{ text: { content: book.책갈피 } }] };
  if (book["총 페이지"] !== undefined) properties["총 페이지"] = { number: book["총 페이지"] };
  if (book["처음 읽은 날"]) properties["처음 읽은 날"] = { date: { start: book["처음 읽은 날"] } };

  return await notion.pages.create({
    parent: { database_id: databaseId },
    properties,
    icon: {
      type: "external",
      external: { url: "https://img.icons8.com/ios/250/000000/book.png"}
    }
    }
  );
};

// ✅ 감상문 페이지 생성 함수
export async function createReviewPage(bookPageId: string, reviewText: string, readPageNumber?: number) {
  const properties: Record<string, any> = {
    기록: {
      title: [{ text: { content: reviewText.slice(0, 100) } }],
    },
    감상일: {
      date: { start: new Date().toISOString().slice(0, 10) },
    },
    책장: {
      relation: [{ id: bookPageId }],
    },
  };

  if (readPageNumber !== undefined) {
    properties["기록 페이지"] = {
      number: readPageNumber,
    };
  }

  const newPage = await notion.pages.create({
    parent: { database_id: reviewDbId },
    properties,
  });

  return newPage.id;
}

// ✅ 책 속성 업데이트 함수
export const updateBookProperties = async (pageId: string, updates: Record<string, any>) => {
  const properties: Record<string, any> = {};

  if (updates["상태"]) {
    properties["상태"] = { select: { name: updates["상태"] } };
  }
  if (updates["진행률"] !== undefined) {
    properties["진행률"] = { number: updates["진행률"] };
  }
  if (updates["책갈피"]) {
    properties["책갈피"] = { rich_text: [{ text: { content: updates["책갈피"] } }] };
  }
  if (updates["장르"]) {
    properties["장르"] = { rich_text: [{ text: { content: updates["장르"] } }] };
  }
  if (updates["총 페이지"] !== undefined) {
    properties["총 페이지"] = { number: updates["총 페이지"] };
  }

  // 감상문 처리
  if (updates["도서 기록"] && typeof updates["도서 기록"] === "string") {
    let reviewText = updates["도서 기록"];

    const pageMatch = reviewText.match(/(\d+)\s*(쪽|페이지)/);
    const parsedPage = pageMatch ? Number(pageMatch[1]) : undefined;

    if (parsedPage) {
      updates["책갈피"] = `${parsedPage}쪽`;
      properties["책갈피"] = {
        rich_text: [{ text: { content: updates["책갈피"] } }],
      };

      if (!reviewText.startsWith(`${parsedPage}쪽`)) {
        reviewText = `${parsedPage}쪽: ${reviewText}`;
      }
    }

    try {
      const reviewPageId = await createReviewPage(pageId, reviewText, parsedPage);

      // 도서 기록 → Relation 연결
      properties["도서 기록"] = {
        relation: [{ id: reviewPageId }],
      };
    } catch (err) {
      console.error("📛 도서 기록 페이지 생성 실패:", err);
    }
  }

  return await notion.pages.update({
    page_id: pageId,
    archived: false,
    properties,
  });
};

export interface ReadingPlan {
  title: string;
  author: string;
  total_pages: number;
  days: number;
  start_date: string; // "YYYY-MM-DD"
  end_date: string;   // "YYYY-MM-DD"
  bookPageId?: string;
}

function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
}

/**
 * Notion 캘린더 DB에 독서 일정(하루 단위) 생성
 */
export async function createReadingScheduleInNotion(plan: ReadingPlan) {
  if (!process.env.NOTION_CALENDAR_DB_ID) {
    throw new Error("❌ NOTION_CALENDAR_DB_ID가 .env에 정의되어 있지 않습니다.");
  }
  const calendarDbId = process.env.NOTION_CALENDAR_DB_ID;
  const response = await notion.databases.retrieve({ database_id: calendarDbId });
  console.log(Object.keys(response.properties));
  const { title, author, total_pages, days, start_date, end_date } = plan;

  const bookPageId = await findBookPageIdByTitle(title);

  const pagesPerDay = Math.ceil(total_pages / days);
  const promises = [];

  const startDateObj = new Date(start_date);

  for (let i = 0; i < days; i++) {
    const currentDate = addDays(start_date, i); // YYYY-MM-DD 형식 날짜

    const startPage = i * pagesPerDay + 1;
    let endPage = (i + 1) * pagesPerDay;
    if (endPage > total_pages) endPage = total_pages;

    const pageTitle = `${i + 1}일차`;  // 예: 동물농장 1일차
    const content = `${startPage}~${endPage}쪽`;

    // Notion 페이지 속성 세팅
    const properties = {
      이름: {
        title: [
          { text: { content: pageTitle } }
        ]
      },
      "완독 목표일": {
        date: { start: end_date }
      },
      저자: author ? {
        rich_text: [
          { text: { content: author } }
        ]
      } : {
        rich_text: []
      },
      "도서 목표일": {
        date: { start: currentDate }   // 여기 currentDate로 변경
      },
      총페이지: {
        number: total_pages
      },
      페이지: {
      number: endPage // 이 부분이 추가된 것! 누적 페이지 수
    }
    };
    if (bookPageId) {
      properties["책장"] = {
        relation: [{ id: bookPageId }]
    };

    
  }
    

    promises.push(
      notion.pages.create({
        parent: { database_id: calendarDbId },
        properties,
      })
    );
  }

  await Promise.all(promises);
}

//도서추천

export const registerRecommendedBook = async ({
  title,
  imageUrl,
}: {
  title: string;
  imageUrl: string;
}) => {
  const pageParams: any = {
    parent: { database_id: RECOMMENDED_DB_ID },
    properties: {
      이름: { title: [{ text: { content: title } }] },
    },
  };

  if (imageUrl) {
    pageParams.cover = {
      external: {
        url: imageUrl,
      },
    };
  }

  await notion.pages.create(pageParams);
  console.log("📸 imageUrl 확인:", imageUrl);
console.log("📚 title 확인:", title);
};

// 책 제목으로 책장DB에서 page_id 찾기
export async function findBookPageIdByTitle(title: string): Promise<string | null> {
  if (!process.env.NOTION_DATABASE_ID) {
    throw new Error("❌ NOTION_DATABASE_ID가 .env에 정의되어 있지 않습니다.");
  }

  const response = await notion.databases.query({
    database_id: process.env.NOTION_DATABASE_ID,
    filter: {
      property: "이름",
      title: {
        equals: title
      }
    }
  });

  return response.results[0]?.id ?? null;
}

export const getExistingShelfTitles = async (): Promise<Set<string>> => {
  const titles = new Set<string>();

  const response = await notion.databases.query({
    database_id: databaseId,
  });

  for (const page of response.results) {
    const properties = (page as any).properties;
    const titleProp = properties["이름"]?.title?.[0]?.text?.content;

    if (titleProp) {
      titles.add(titleProp.trim().toLowerCase());
    }
  }

  return titles;
};


export const getAllReviewTexts = async (): Promise<string[]> => {
  const reviews: string[] = [];
  let cursor = undefined;

  while (true) {
    const response = await notion.databases.query({
      database_id: databaseId,
      start_cursor: cursor,
      page_size: 100,
    });

    for (const page of response.results) {
      const prop = (page as any).properties["도서 기록"];
      const text = prop?.rich_text?.[0]?.plain_text;
      if (text && text.length > 10) {
        reviews.push(text);
      }
    }

    if (!response.has_more) break;
    cursor = response.next_cursor;
  }

  return reviews;
};


export const getCombinedTop3Reviews = async (): Promise<string> => {
  const reviews: string[] = [];
  let cursor = undefined;

  while (true) {
    const response = await notion.databases.query({
      database_id: databaseId,
      start_cursor: cursor,
      page_size: 100,
    });

    for (const page of response.results) {

      const prop = (page as any).properties["도서 기록"];

      if (prop?.type === "relation") {
        for (const rel of prop.relation) {
          const relatedPage = await notion.pages.retrieve({ page_id: rel.id });
          const reviewProp = (relatedPage as any).properties["기록"];

          let rawText = "";

          if (reviewProp?.type === "title") {
            rawText = reviewProp.title.map((r: any) => r.plain_text).join("");
          } else if (reviewProp?.type === "rich_text") {
            rawText = reviewProp.rich_text.map((r: any) => r.plain_text).join("");
          }

          const text = extractReviewText(rawText); // 감상문만 추출
          if (text && text.length > 10) {
            reviews.push(text);
          }
        }
      }
    }

    if (!response.has_more) break;
    cursor = response.next_cursor;
  }

  console.log("📊 가져온 감상문 수:", reviews.length);

  const top3 = reviews.sort((a, b) => b.length - a.length).slice(0, 3);
  console.log("🔍 선택된 감상문 Top 3:");
  top3.forEach((r, idx) => {
    console.log(`📖 감상문 ${idx + 1} ${r}\n---`);
  });

  return top3.join("\n\n");
};
