import oracledb from "oracledb";
import dotenv from "dotenv";
dotenv.config();

const dbConfig = {
  user: process.env.ORACLE_USER,
  password: process.env.ORACLE_PW,
  connectString: process.env.ORACLE_CONNECT,
};

export async function insertReadingPlan({
  bookId,
  startDate,
  endDate,
  intervalDays
}: {
  bookId: string;
  startDate: string;
  endDate: string;
  intervalDays: number;
}) {
  let conn;
  try {
    conn = await oracledb.getConnection(dbConfig);

    const result = await conn.execute(
      `
      INSERT INTO reading_plan (book_id, start_date, end_date, interval_days)
      VALUES (:book_id, TO_DATE(:start_date, 'YYYY-MM-DD'), TO_DATE(:end_date, 'YYYY-MM-DD'), :interval_days)
      `,
      {
        book_id: bookId,
        start_date: startDate,
        end_date: endDate,
        interval_days: intervalDays
      },
      { autoCommit: true }
    );

    console.log("✅ Oracle에 독서 계획 저장 완료");
    return result;
  } catch (err) {
    console.error("❌ Oracle에 독서 계획 저장 실패:", err);
    throw err;
  } finally {
    if (conn) await conn.close();
  }
}
