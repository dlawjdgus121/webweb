// core/functions/updateReadingProgress.ts
import oracledb, { getConnection } from "../../backend/db/oracle.ts";
import { findPageIdByBookName, updateBookProperties } from "../notion/notionUtils.ts";


/**
 * 📚 책갈피 진행 상황을 Oracle + Notion 양쪽에 동기화
 */
export async function updateReadingProgressAndSync({
  bookName,
  page,
}: {
  bookName: string;
  page: number;
}) {
  let conn;

  console.log("🧠 Agentica 함수 호출됨: updateReadingProgressAndSync");
  console.log("📥 입력값:", { bookName, page });

  try {
    // 1. Oracle 연결
    conn = await getConnection();

    console.log("🔌 Oracle 연결 완료");

    // 2. Oracle에서 book_id 조회
    const findBookSql = `SELECT book_id FROM book_info WHERE title = :title`;
    const bookResult = await conn.execute(findBookSql, { title: bookName });
    const bookId = bookResult.rows?.[0]?.[0];

    if (!bookId) {
      throw new Error(`📛 Oracle에 "${bookName}" 책이 없습니다.`);
    }
    console.log(`🔍 Oracle book_id: ${bookId}`);

    // 3. 책갈피 업데이트 (Oracle MERGE)
    const updateSql = `
      MERGE INTO reading_progress rp
      USING (SELECT :bookId AS book_id FROM dual) input
      ON (rp.book_id = input.book_id)
      WHEN MATCHED THEN
        UPDATE SET current_page = :page, updated_at = SYSDATE
      WHEN NOT MATCHED THEN
        INSERT (book_id, current_page, updated_at, created_at)
        VALUES (:bookId, :page, SYSDATE, SYSDATE)
    `;
    await conn.execute(updateSql, { bookId, page }, { autoCommit: true });
    console.log("✅ Oracle 책갈피 업데이트 완료");

    // 4. Notion 페이지 ID 조회
    const notionPageId = await findPageIdByBookName(bookName);
    if (!notionPageId) {
      throw new Error(`📛 Notion에서 "${bookName}" 책 페이지를 찾을 수 없습니다.`);
    }
    console.log(`🔍 Notion pageId: ${notionPageId}`);

    // 5. 책갈피 업데이트 (Notion)
    const updatePayload = { 책갈피: `${page}쪽` };
    const notionRes = await updateBookProperties(notionPageId, updatePayload);
    console.log("✅ Notion 책갈피 업데이트 완료");

    return {
      message: `📘 Oracle + Notion 책갈피 ${page}쪽 저장 완료`,
      notionRes,
    };
  } catch (err) {
    console.error("❌ 책갈피 업데이트 실패:", err);
    throw err;
  } finally {
    if (conn) await conn.close();
  }
}
