import "../utils/env.ts";
import axios from "axios";
import { Client } from "@notionhq/client";
import FormData from "form-data";
import { getTodayISODate } from "../notion/notionUtils.ts";
import {askGemini} from "../llm/gemini/geminiSummaryTest.ts";

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const databaseId = process.env.NOTION_DATABASE_ID || "";

// 날짜 ISO 포맷 변환 함수
const formatDateISO = (dateStr: string): string => {
  const parts = dateStr.split("-");
  if (parts.length === 1) return `${parts[0]}-01-01`;
  if (parts.length === 2) return `${parts[0]}-${parts[1]}-01`;
  if (parts.length === 3) return `${parts[0]}-${parts[1]}-${parts[2]}`;
  return "1900-01-01";
};

// Cloudinary에 원격 이미지 URL 업로드 (unsigned)
async function uploadImageUrlToCloudinary(imageUrl: string): Promise<string> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME!;
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET!;

  const form = new FormData();
  form.append("file", imageUrl);
  form.append("upload_preset", uploadPreset);
  form.append("secure", "true");

  const response = await axios.post(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    form,
    { headers: form.getHeaders() }
  );

  const secureUrl = response.data.secure_url;
  if (!secureUrl.startsWith("https://")) {
    throw new Error("❌ secure_url이 https로 시작하지 않습니다.");
  }

  console.log("✅ Cloudinary 업로드된 이미지:", secureUrl);
  return secureUrl;
}



export interface Book {
  이름: string;
  저자: string;
  책표지: string | null;
  출판사?: string;
  장르?: string;
  isbn?: string;
  출판일?: string;
  줄거리?: string;
  "총 페이지"?: number;
  "처음 읽은 날"?: string;
  "도서 기록"?: string;
  상태?: string;
  진행률?: number;
  "책갈피"?: string;
}

interface BookInfo {
 // bookId: string;
  title: string;
  author: string;
  publisher?: string;
  genre?: string;
 created_at: Date;

  coverUrl//: string;
  totalPages?: number;
  isbn?: string;
  publishDate?;
  description?: string;
}

export function getTodayLocalDate(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // 시간 00:00:00으로 고정 (로컬 날짜)
  return today;
}

export function convertBookToBookInfo(book: Book): BookInfo {
  const rawPages = book["총 페이지"];
  const parsedPages = rawPages
    ? Number(String(rawPages).replace(/[^\d]/g, ""))
    : undefined;

  return {
    title: book.이름,
    author: book.저자,
    coverUrl: book.책표지 || undefined,
    totalPages: isNaN(parsedPages) ? undefined : parsedPages,
    publisher: book.출판사 || undefined,
    genre: book.장르 || undefined,
    created_at: getTodayLocalDate(), // ✅ 항상 Date 객체
    isbn: book.isbn || undefined,
    publishDate: book.출판일
      ? new Date(book.출판일) // ✅ 문자열이면 Date 변환
      : undefined,
    description: book.줄거리 || undefined,
  };
}


// 구글 북스 API로 도서 정보 가져오기 + Cloudinary 썸네일 업로드 + 총 페이지 포함
export const searchBook = async (prompt: string): Promise<Book> => {
  const title = await askGemini(prompt);
  if (!title) throw new Error("AI가 책 제목을 추출하지 못했습니다.");

  const gRes = await axios.get("https://www.googleapis.com/books/v1/volumes", {
    params: {
      q: title,
      key: process.env.GOOGLE_BOOKS_API_KEY,
    },
  });

  const item = gRes.data.items?.[0];
  if (!item) throw new Error("도서를 찾을 수 없습니다.");

  const info = item.volumeInfo;
  const links = info.imageLinks || {};

  const originalImageUrl =
    links.extraLarge ||
    links.large ||
    links.medium ||
    links.thumbnail ||
    links.smallThumbnail ||
    null;

  const totalPages = info.pageCount;

  let cloudImageUrl: string | null = null;
  if (originalImageUrl) {
    try {
      cloudImageUrl = await uploadImageUrlToCloudinary(originalImageUrl);
    } catch (err) {
      console.error("❌ Cloudinary 업로드 실패, 원본 URL 사용:", err);
      cloudImageUrl = originalImageUrl;
    }
  }

  return {
    이름: info.title || "제목 없음",
    저자: (info.authors || []).join(", "),
    책표지: cloudImageUrl,
    출판사: info.publisher || undefined,
    장르: info.categories?.[0] || undefined,
    isbn: (info.industryIdentifiers?.find(id => id.type.includes("ISBN"))?.identifier) || undefined,
    출판일: info.publishedDate || undefined,
    줄거리: info.description || undefined,
    "총 페이지": totalPages,
    "처음 읽은 날": getTodayISODate(),
  };
};

// Notion에 도서 정보 저장
export const saveBookToNotion = async (book: Book) => {
  try {
    const properties: Record<string, any> = {
      이름: {
        title: [{ text: { content: book.이름 } }],
      },
      저자: {
        rich_text: [{ text: { content: book.저자 } }],
      },
      상태: {
        select: { name: book.상태 || "예정" },
      },
      "책 표지": book.책표지
        ? {
            files: [
              {
                name: "cover.jpg",
                type: "external",
                external: { url: book.책표지 },
              },
            ],
          }
        : { files: [] },
    };

    if (book["도서 기록"]) {
      properties["도서 기록"] = {
        rich_text: [{ text: { content: book["도서 기록"] } }],
      };
    }
    if (book.진행률 !== undefined) {
      properties["진행률"] = {
        number: book.진행률,
      };
    }
    if (book.장르) {
      properties["장르"] = {
        rich_text: [{ text: { content: book.장르 } }],
      };
    }
    if (book.책갈피) {
      properties["책갈피"] = {
        rich_text: [{ text: { content: book.책갈피 } }],
      };
    }
    if (book["총 페이지"] !== undefined) {
      properties["총 페이지"] = {
        number: book["총 페이지"],
      };
    }
    if (book["처음 읽은 날"]) {
      properties["처음 읽은 날"] = {
        date: { start: book["처음 읽은 날"] },
      };
    }

    const response = await notion.pages.create({
      parent: { database_id: databaseId },
      properties,
    });

    return response;
  } catch (error: any) {
    console.error("❌ Notion 저장 실패:", error.message || error);
    console.error("❌ Notion 저장 실패 - message:", error.message);
    console.error("❌ Notion 저장 실패 - body:", error.body);
    throw new Error("Notion 저장 실패");
  }
};


export async function fetchBookCover(title: string, author: string): Promise<string> {
  const query = encodeURIComponent(`${title} ${author}`);
  const url = `https://www.googleapis.com/books/v1/volumes?q=${query}`;

  try {
    const response = await axios.get(url);
    const items = response.data.items;

    if (items && items.length > 0) {
      const links = items[0].volumeInfo?.imageLinks || {};
      const imageLink =
        links.extraLarge ||
        links.large ||
        links.medium ||
        links.thumbnail ||
        links.smallThumbnail ||
        "";

      if (imageLink) return imageLink.replace("http://", "https://");
    }

    // 📛 이걸 꼭 넣어야 함!
    throw new Error("📛 썸네일 없음");
  } catch (error) {
    console.error("❌ Google Books API 실패:", error.message);
    throw error;
  }
}

