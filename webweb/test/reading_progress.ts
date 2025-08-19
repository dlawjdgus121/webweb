import oracledb from "oracledb";
import dotenv from "dotenv";

dotenv.config();

// Instant Client 경로 지정 (필요할 때만)
oracledb.initOracleClient({ libDir: process.env.ORACLE_CLIENT_PATH });

async function checkReadingProgress() {
  let conn;

  try {
    conn = await oracledb.getConnection({
      user: process.env.ORACLE_USER,
      password: process.env.ORACLE_PW,
      connectString: process.env.ORACLE_CONNECT,
    });

    console.log("✅ Oracle DB 연결 성공!");

    // reading_progress 테이블 전체 조회
    const result = await conn.execute(
      `SELECT book_id, current_page, created_at FROM reading_progress ORDER BY created_at DESC`,
      [], // 바인드 변수 없음
      { outFormat: oracledb.OUT_FORMAT_OBJECT } // 객체 형태로 반환
    );

    console.log("📖 Reading Progress 기록:", result.rows);

  } catch (err) {
    console.error("❌ 오류 발생:", err);
  } finally {
    if (conn) {
      try {
        await conn.close();
      } catch (err) {
        console.error("❌ 연결 닫기 실패:", err);
      }
    }
  }
}

checkReadingProgress();
