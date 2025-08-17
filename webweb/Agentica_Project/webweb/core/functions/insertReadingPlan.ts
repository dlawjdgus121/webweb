import { getConnection } from "../../backend/db/oracle.ts";

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
    // 1. 날짜 형식 검증
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      throw new Error(`📛 잘못된 날짜 형식: startDate=${startDate}, endDate=${endDate}`);
    }

    // 2. 날짜 순서 검증
    if (new Date(startDate) > new Date(endDate)) {
      throw new Error(`📛 시작일이 종료일보다 늦습니다: ${startDate} > ${endDate}`);
    }

    conn = await getConnection();

    const result = await conn.execute(
      `
      INSERT INTO reading_plan (book_id, start_date, end_date, interval_days)
      VALUES (:book_id, TO_DATE(:start_date, 'YYYY-MM-DD'), TO_DATE(:end_date, 'YYYY-MM-DD'), :interval_days)
      `,
      {
        book_id: String(bookId),
        start_date: startDate,
        end_date: endDate,
        interval_days: intervalDays
      },
      { autoCommit: true }
    );

    console.log("✅ Oracle에 독서 계획 저장 완료:", { bookId, startDate, endDate, intervalDays });
    return result;
  } catch (err) {
    console.error("❌ Oracle에 독서 계획 저장 실패:", err);
    throw err;
  } finally {
    if (conn) await conn.close();
  }
}
