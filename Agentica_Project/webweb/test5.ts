import oracledb from 'oracledb';
import dotenv from 'dotenv';

dotenv.config();

oracledb.initOracleClient({ libDir: 'C:\\Users\\gram\\Desktop\\oracle\\instantclient_23_8' });

const dbConfig = {
  user: process.env.ORACLE_USER,
  password: process.env.ORACLE_PW,
  connectString: process.env.ORACLE_CONNECT,
  walletLocation: process.env.ORACLE_WALLET_PATH,
};

async function selectReadingPlans() {
  let conn;
  try {
    console.log("📡 연결 시도 중...");
    conn = await oracledb.getConnection(dbConfig);
    console.log("✅ 연결 성공");

    const result = await conn.execute(
      `
      SELECT id, book_id, start_date, end_date, interval_days
      FROM READING_PLAN
      ORDER BY id DESC
      `,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    console.log("📘 등록된 독서 계획:");
    for (const row of result.rows as any[]) {
      console.log(row);
    }

  } catch (err) {
    console.error("❌ SELECT 실패:", err);
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

selectReadingPlans();
