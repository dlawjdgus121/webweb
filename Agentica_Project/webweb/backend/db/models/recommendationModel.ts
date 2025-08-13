import { getConnection } from "../oracle";


export async function insertRecommendation(rec: {
  base_book_id: string;
  recommended_book_id?: string;
  recommended_book_title: string;
  recommended_reason?: string;
}) {
  const conn = await getConnection();
  try {
   const sql = `
  INSERT INTO "recommendation" (
    id,
    base_book_id,
    recommended_book_id,
    recommended_book_title,
    recommended_reason,
    created_at
  ) VALUES (
    RECOMMENDATION_SEQ.NEXTVAL,
    :base_book_id,
    :recommended_book_id,
    :recommended_book_title,
    :recommended_reason,
    SYSDATE
  )
`;
    await conn.execute(sql, rec, { autoCommit: true });
  } finally {
    await conn.close();
  }
}
