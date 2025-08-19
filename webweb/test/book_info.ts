import oracledb from "oracledb";
import dotenv from "dotenv";

dotenv.config();

// 오라클 클라이언트 초기화 (instant client 경로 필요할 때만)
oracledb.initOracleClient({ libDir: process.env.ORACLE_CLIENT_PATH });

async function testConnection() {
  let connection;

  try {
    connection = await oracledb.getConnection({
      user: process.env.ORACLE_USER,
      password: process.env.ORACLE_PW,
      connectString: process.env.ORACLE_CONNECT, // .env에 넣어둔 connect string
    });

    console.log("✅ Oracle DB 연결 성공!");
    const result = await connection.execute("SELECT sysdate FROM dual");
    console.log("🕒 현재 시간:", result.rows);

  } catch (err) {
    console.error("❌ 연결 실패:", err);
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("❌ 연결 닫기 실패:", err);
      }
    }
  }
}

testConnection();
