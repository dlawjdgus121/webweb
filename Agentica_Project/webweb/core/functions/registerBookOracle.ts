import { getConnection } from "../../backend/db/oracle.ts";
import { v4 as uuidv4 } from "uuid";
import { Client } from "@notionhq/client";
import { uploadImageToCloud } from "../notion/notionUtils.ts";

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const BOOK_DB_ID = process.env.NOTION_DATABASE_ID!;

export async function registerBook(book: {
  title: string;
  author: string;
  publisher?: string;
  genre?: string;
  created_at: Date;
  coverUrl?: string;
  totalPages?: number;
  isbn?: string;
  publishDate?: Date;
}) {
  let connection;

  try {
    connection = await getConnection();
    const bookId = `BOOK_${uuidv4()}`;

    // 0️⃣ 커버 업로드
    let uploadedCoverUrl: string | null = null;
    if (book.coverUrl) {
      try {
        uploadedCoverUrl = await uploadImageToCloud(book.coverUrl, book.title);
        console.log(`✅ Cloudinary 업로드 완료: ${uploadedCoverUrl}`);
      } catch (err) {
        console.warn("⚠️ Cloudinary 업로드 실패, 원본 URL 사용");
        uploadedCoverUrl = book.coverUrl;
      }
    }

    // 1️⃣ Oracle 저장 (Date 객체로 바인딩)
    const insertSql = `
      INSERT INTO BOOK_INFO (
        book_id, title, author, publisher, genre, created_at,
        cover_url, total_pages, isbn, publish_date
      ) VALUES (
        :book_id, :title, :author, :publisher, :genre,
        :created_at,
        :cover_url, :total_pages, :isbn, :publish_date
      )
    `;

    await connection.execute(
      insertSql,
      {
        book_id: bookId,
        title: book.title,
        author: book.author,
        publisher: book.publisher || null,
        genre: book.genre || null,
        created_at: book.created_at instanceof Date ? book.created_at : new Date(book.created_at),
        cover_url: uploadedCoverUrl,
        total_pages: book.totalPages ?? null,
        isbn: book.isbn || null,
        publish_date: book.publishDate
          ? (book.publishDate instanceof Date ? book.publishDate : new Date(book.publishDate))
          : null,
      },
      { autoCommit: true }
    );

    console.log(`✅ Oracle 저장 완료: ${bookId}`);

    // 2️⃣ Oracle 재조회
    const selectSql = `
      SELECT title, author, genre, created_at, cover_url, total_pages
      FROM BOOK_INFO
      WHERE book_id = :book_id
    `;
    const result = await connection.execute(selectSql, { book_id: bookId });
    const row = result.rows?.[0];
    if (!row) throw new Error(`❌ 저장된 책 정보를 찾을 수 없습니다: ${bookId}`);

    const [title, author, genre, created_at, cover_url, total_pages] = row;

    // 3️⃣ Notion 저장
    const properties: Record<string, any> = {
      이름: { title: [{ text: { content: String(title) } }] },
      저자: { rich_text: [{ text: { content: String(author) } }] },
    };

    // ✅ 장르는 rich_text로
    if (genre) {
      properties["장르"] = { rich_text: [{ text: { content: String(genre) } }] };
    }

    if (total_pages) {
      properties["총 페이지"] = { number: Number(total_pages) };
    }

    // created_at → 로컬 날짜로 변환
if (created_at) {
  const createdDate = new Date(created_at);
  properties["처음 읽은 날"] = {
    date: {
      start: `${createdDate.getFullYear()}-${String(
        createdDate.getMonth() + 1
      ).padStart(2, "0")}-${String(createdDate.getDate()).padStart(2, "0")}`,
    },
  };
}


    const finalCoverUrl =
      typeof cover_url === "string" && cover_url.startsWith("http")
        ? cover_url
        : "https://via.placeholder.com/240x340?text=No+Cover";

    // 썸네일/배너 둘 다 세팅
    properties["책 표지"] = {
      files: [{ name: "cover.jpg", type: "external", external: { url: finalCoverUrl } }],
    };

    const pageParams: any = {
      parent: { database_id: BOOK_DB_ID },
      properties,
      cover: { external: { url: finalCoverUrl } },
    };

    await notion.pages.create(pageParams);
    console.log(`✅ Notion 저장 완료: ${bookId}`);

    return { bookId };
  } catch (err) {
    console.error("❌ registerBook 전체 오류:", err);
    throw err;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeErr) {
        console.error("⚠️ DB 연결 종료 실패:", closeErr);
      }
    }
  }
}
