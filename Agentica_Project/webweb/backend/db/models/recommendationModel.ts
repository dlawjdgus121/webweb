import { getConnection } from "../oracle";

export interface Recommendation {
  rec_id?: number;
  user_id: string;
  base_book_id: string;
  recommended_book_title: string;
  reason?: string;
  created_at?: Date;
  recommended_book_id?: string;
  score?: number;
  progress_status?: string;
}

export async function insertRecommendation(rec: Recommendation) {
  const conn = await getConnection();
  try {
    const sql = `
      INSERT INTO RECOMMENDATION (rec_id, user_id, base_book_id, recommended_book_title, reason, created_at, recommended_book_id, score, progress_status)
      VALUES (RECOMMENDATION_SEQ.NEXTVAL, :user_id, :base_book_id, :recommended_book_title, :reason, SYSDATE, :recommended_book_id, :score, :progress_status)
    `;
    await conn.execute(sql, rec, { autoCommit: true });
  } finally {
    await conn.close();
  }
}
