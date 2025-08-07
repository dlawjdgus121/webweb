import { getRecommendedBooksByReview } from "../llm/gemini/geminiSummaryTest.ts";
import { uploadImageToCloud, registerRecommendedBook } from "../notion/notionUtils.ts";
import { searchBook } from "../functions/registerBook.ts";
import { Client, PageObjectResponse } from "@notionhq/client";


export const handleRecommendBooks = async (review: string): Promise<string> => {
  type RecommendedBook = { title: string; imageUrl?: string; description?: string; author: string };

  // 1. 기존 추천 도서 + 책장 도서 제목 모두 가져오기 (중복 제거용)
  const prevRecommendedTitles = await getExistingRecommendedTitles(); // 삭제 전 가져오기!
  const shelfTitles = await getUserLibraryTitles(); // 책장 DB

  const exclusionList = Array.from(new Set([...prevRecommendedTitles, ...shelfTitles]));

  // 2. Gemini에게 요청 (제외할 제목들 넘김)
  const recommended: RecommendedBook[] = await getRecommendedBooksByReview();

  // 3. 기존 추천 도서 삭제 (이제 해도 됨!)
  await deleteAllRecommendedBooks();

  // 4. 추천 도서 등록
  const titles: string[] = [];

  for (const entry of recommended) {
    if (!entry?.title || entry.title === "undefined") continue;

    const title = entry.title.trim();
    const imageUrlRaw = entry.imageUrl ?? (entry as any).image ?? "";
    const imageUrl = imageUrlRaw.toString().trim();
    const description = entry.description?.trim() ?? "";

    let finalImageUrl: string | null = null;

    const isPlaceholder =
      !imageUrl ||
      imageUrl.includes("your-folder-name") ||
      imageUrl.includes("이미지 준비중") ||
      imageUrl.includes("placeholder");

    if (isPlaceholder) {
      try {
        const book = await searchBook(title);
        finalImageUrl = book.책표지 || "";
      } catch {
        finalImageUrl = "";
      }
    } else {
      try {
        finalImageUrl = await uploadImageToCloud(imageUrl, title);
      } catch {
        finalImageUrl = imageUrl;
      }
    }

    await registerRecommendedBook({
      title,
      imageUrl: finalImageUrl ?? "",
    });

    titles.push(`「${title}」`);
  }

  return titles.length > 0
    ? `📚 다음 도서를 추천했어요: ${titles.join(", ")}`
    : `📘 추천할 도서를 찾지 못했어요.`;
};



// 의도 분석
export const getIntentFromPrompt = (prompt: string): string => {
  if (prompt.includes("추천")) return "recommend";
  if (prompt.includes("요약")) return "summarize";
  return "unknown";
};

// 감상문 텍스트 추출
export const extractReviewText = (input: string): string => {
  const match = input.match(/\d+쪽[:：]\s*(.+)/);
  return match ? match[1] : input;
};


const notion = new Client({ auth: process.env.NOTION_TOKEN });
const RECOMMENDED_DB_ID = process.env.RECOMMENDED_BOOK_DB_ID!;

export function normalizeTitle(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\(.*?\)/g, "")    // 괄호 제거
    .replace(/:.*$/, "")        // 콜론 이후 제거
    .replace(/\s+/g, " ")       // 중복 공백 제거
    .trim();
}



// 1. 기존 추천 도서 제목을 가져오는 함수 (예: Notion DB에서)
export async function getExistingRecommendedTitles(): Promise<Set<string>> {
  const response = await notion.databases.query({
    database_id: process.env.RECOMMENDED_BOOK_DB_ID!,
  });

  const titles = new Set<string>();


 for (const page of response.results) {
  const fullPage = page as PageObjectResponse;

  if ("properties" in fullPage && fullPage.properties["이름"]?.type === "title") {
    const raw = fullPage.properties["이름"]?.title?.[0]?.plain_text;
    if (raw) {
      const normalized = normalizeTitle(raw);
      titles.add(normalized);
    }
  } else {
    console.warn("⚠️ 제목 속성 없음:", JSON.stringify((page as any).properties));
  }
}

  return titles;
}


export async function deleteAllRecommendedBooks(): Promise<void> {
  const notion = new Client({ auth: process.env.NOTION_TOKEN });
  const databaseId = process.env.RECOMMENDED_BOOK_DB_ID!;
  const { results } = await notion.databases.query({ database_id: databaseId });

  for (const page of results) {
    if ("id" in page) {
      await notion.pages.update({
        page_id: page.id,
        archived: true,
      });
    }
  }
}


export async function getUserLibraryTitles(): Promise<Set<string>> {
  const notion = new Client({ auth: process.env.NOTION_TOKEN });
  const databaseId = process.env.NOTION_DATABASE_ID!;

  const { results } = await notion.databases.query({ database_id: databaseId });
  const titles = new Set<string>();

  for (const page of results) {
    if ("properties" in page && page.properties["이름"]?.type === "title") {
      const title = page.properties["이름"].title?.[0]?.plain_text;
      if (title) {
        titles.add(title.trim().toLowerCase());
      }
    }
  }

  return titles;
}
