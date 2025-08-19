import oracledb from "oracledb";
import dotenv from "dotenv";

dotenv.config();
oracledb.initOracleClient({ libDir: process.env.ORACLE_CLIENT_PATH });

export async function checkRecommendations() {
  let conn;

  try {
    conn = await oracledb.getConnection({
      user: process.env.ORACLE_USER,
      password: process.env.ORACLE_PW,
      connectString: process.env.ORACLE_CONNECT,
      walletLocation: process.env.ORACLE_WALLET_PATH,
    });

    const result = await conn.execute(
      `SELECT BASE_BOOK_ID, RECOMMENDED_BOOK_ID, RECOMMENDED_BOOK_TITLE, RECOMMENDED_REASON
       FROM RECOMMENDATION`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (result.rows && result.rows.length > 0) {
      console.log("✅ 추천 도서 목록:");
      console.table(result.rows);
    } else {
      console.log("⚠️ 추천 도서가 없습니다.");
    }

    return result.rows;
  } catch (err) {
    console.error("❌ 추천 테이블 조회 실패:", err);
    throw err;
  } finally {
    if (conn) {
      await conn.close();
    }
  }
}

// 🚀 실행 스크립트에서 바로 호출
checkRecommendations();
