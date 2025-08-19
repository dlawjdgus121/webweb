import { getConnection } from "../oracle";

export interface ReadingPlan {
  plan_id?: number;
  book_id: string;
  user_id: string;
  start_date: Date;
  end_date: Date;
  interval_days: number;
}

export async function insertReadingPlan(plan: ReadingPlan) {
  const conn = await getConnection();
  try {
    const sql = `
      INSERT INTO READING_PLAN (plan_id, book_id, user_id, start_date, end_date, interval_days)
      VALUES (READING_PLAN_SEQ.NEXTVAL, :book_id, :user_id, :start_date, :end_date, :interval_days)
    `;
    await conn.execute(sql, plan, { autoCommit: true });
  } finally {
    await conn.close();
  }
}
