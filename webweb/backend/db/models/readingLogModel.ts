import { getConnection } from "../oracle.ts";

export interface ReadingLog {
  log_id?: number;
  book_id: string;
  user_id: string;
  log_date: Date;
  page: number;
  content?: string;
  is_final: number; // 0 or 1
}

export async function insertReadingLog(log: ReadingLog) {
  const conn = await getConnection();
  try {
    const sql = `
      INSERT INTO READING_LOG (log_id, book_id, user_id, log_date, page, content, is_final)
      VALUES (READING_LOG_SEQ.NEXTVAL, :book_id, :user_id, :log_date, :page, :content, :is_final)
    `;
    await conn.execute(sql, log, { autoCommit: true });
  } finally {
    await conn.close();
  }
}
