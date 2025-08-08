import oracledb from 'oracledb';
import dotenv from 'dotenv';

dotenv.config();

// Oracle Instant Client 초기화
oracledb.initOracleClient({ libDir: "C:\\Users\\dltjd\\Desktop\\instantclient_23_8" });

const dbConfig = {
  user: process.env.ORACLE_USER,
  password: process.env.ORACLE_PW,
  connectString: process.env.ORACLE_CONNECT,
};

async function readRecentReadingLogs() {
  let conn;
  try {
    console.log("🧪 연결 정보 확인:", dbConfig);
    console.log("📡 연결 시도 중...");
    conn = await oracledb.getConnection(dbConfig);
    console.log("✅ 연결 성공");

    // 📖 READING_LOG 테이블에서 최근 5개 감상 로그 조회
    const result = await conn.execute(
      `
      SELECT book_id, log_date, page, content, is_final
      FROM reading_log
      ORDER BY log_date DESC
      FETCH FIRST 5 ROWS ONLY
      `,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    console.log("📘 최근 감상 로그 조회 결과:");

    for (const row of result.rows as any[]) {
      let content = "";

      // CLOB 처리
      if (row.CONTENT && typeof row.CONTENT === "object" && row.CONTENT.on) {
        content = await readCLOB(row.CONTENT);
      } else if (typeof row.CONTENT === "string") {
        content = row.CONTENT;
      }

      console.log({
        BOOK_ID: row.BOOK_ID,
        LOG_DATE: row.LOG_DATE,
        PAGE: row.PAGE,
        CONTENT: content,
        IS_FINAL: row.IS_FINAL,
      });
    }

  } catch (err) {
    console.error("❌ 오류 발생:", err);
  } finally {
    if (conn) {
      try {
        await conn.close();
        console.log("🔌 연결 종료");
      } catch (closeErr) {
        console.error("❌ 연결 종료 실패:", closeErr);
      }
    }
  }
}

// 📦 CLOB 타입을 문자열로 읽어들이는 함수
function readCLOB(clob: oracledb.Lob): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = "";
    clob.setEncoding("utf8");
    clob.on("data", chunk => data += chunk);
    clob.on("end", () => resolve(data));
    clob.on("error", reject);
  });
}

readRecentReadingLogs();