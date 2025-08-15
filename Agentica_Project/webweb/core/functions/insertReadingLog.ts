import { getConnection } from "../../backend/db/oracle.ts";
import oracledb from "oracledb";

export interface ReadingLogInput {
  bookId: string;         // BOOK_INFO 테이블의 book_id
  userName?: string;      // 사용자 이름 (기본값: "임정현")
  content: string;        // 감상 내용
  page: number;           // 읽은 페이지
  isFinal?: number;       // 완독 여부 (기본값: 1)
}

export async function insertReadingLog({
  bookId,
  userName = "임정현",
  content,
  page,
  isFinal = 1,
}: ReadingLogInput): Promise<void> {
  let conn;

  try {
    const parsedPage = Number(page);
    if (isNaN(parsedPage) || parsedPage <= 0) {
      throw new Error(`📛 page 값이 유효하지 않습니다: ${page}`);
    }

    conn = await getConnection();

    // 1. book_id 유효성 검사
    const bookRes = await conn.execute(
      `SELECT COUNT(*) AS CNT FROM BOOK_INFO WHERE book_id = :bookId`,
      [bookId],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    const bookExists = (bookRes.rows?.[0] as any)?.CNT > 0;
    if (!bookExists) {
      throw new Error(`📛 BOOK_INFO에 book_id '${bookId}' 가 존재하지 않습니다.`);
    }

    // 2. 데이터 INSERT
    const finalIsFinal = isFinal ? 1 : 0;
    await conn.execute(
      `
      INSERT INTO READING_LOG (book_id, page, content, is_final)
      VALUES (:book_id, :page, :content, :is_final)
      `,
      {
        book_id: String(bookId),
        page: parsedPage,
        content,
        is_final: finalIsFinal,
      },
      { autoCommit: true }
    );

    console.log("✅ 감상 저장 완료:", {
      book_id: bookId,
      page: parsedPage,
      is_final: finalIsFinal,
    });

  } catch (err) {
    console.error("❌ insertReadingLog 실패:", err);
    throw err;
  } finally {
    if (conn) await conn.close().catch(console.error);
  }
}
