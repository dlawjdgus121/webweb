import oracledb from "oracledb";
import dotenv from "dotenv";

dotenv.config();
oracledb.initOracleClient({ libDir: process.env.ORACLE_CLIENT_PATH });

async function checkReadingLogs(bookId?: string) {
  let conn;

  try {
    conn = await oracledb.getConnection({
      user: process.env.ORACLE_USER,
      password: process.env.ORACLE_PW,
      connectString: process.env.ORACLE_CONNECT,
    });

    console.log("✅ Oracle 연결 성공");

    let query = `
      SELECT book_id, log_date, page, content, is_final
      FROM READING_LOG
    `;
    if (bookId) {
      query += ` WHERE book_id = :bookId`;
    }
    query += ` ORDER BY log_date DESC FETCH FIRST 8 ROWS ONLY`;

    const result = await conn.execute(query, bookId ? [bookId] : [], {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    });

    console.log("📘 최근 감상 로그:");
    for (const row of result.rows as any[]) {
      console.log({
        BOOK_ID: row.BOOK_ID,
        LOG_DATE: row.LOG_DATE,
        PAGE: row.PAGE,
        CONTENT: typeof row.CONTENT === "string" ? row.CONTENT : "[CLOB]",
        IS_FINAL: row.IS_FINAL,
      });
    }
  } catch (err) {
    console.error("❌ 오류:", err);
  } finally {
    if (conn) await conn.close();
  }
}

// 특정 bookId만 보고 싶으면 인자로 전달
checkReadingLogs(process.argv[2]); 
