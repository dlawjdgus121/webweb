import { getConnection } from "../oracle";

export async function saveReviewToOracle(bookId: string, bookTitle: string, review: string) {
  let conn;
  try {
    conn = await getConnection();
    const sql = `
      INSERT INTO book_summary (title, summary, book_id)
      VALUES (:title, :summary, :bookId)
    `;
    const binds = { title: bookTitle, summary: review, bookId };
    const result = await conn.execute(sql, binds, { autoCommit: true });
    console.log("📦 Oracle 저장 완료 (서평):", bookTitle, "Rows:", result.rowsAffected);
  } finally {
    if (conn) await conn.close();
  }
}
