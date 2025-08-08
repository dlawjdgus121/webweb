import oracledb from "oracledb";
import dotenv from "dotenv";
dotenv.config();

oracledb.initOracleClient({
  libDir: "C:\\Users\\dltjd\\Desktop\\instantclient_23_8",
});

async function getTop3ReadingProgress() {
  const conn = await oracledb.getConnection({
    user: process.env.ORACLE_USER,
    password: process.env.ORACLE_PW,
    connectString: process.env.ORACLE_CONNECT,
  });

  const result = await conn.execute(
    `SELECT * FROM reading_progress
     ORDER BY updated_at DESC
     FETCH FIRST 3 ROWS ONLY`
  );

  await conn.close();
  return result.rows;
}

getTop3ReadingProgress()
  .then((rows) => {
    console.log("📘 최신 독서 진행 기록 3개:");
    console.table(rows);
  })
  .catch((err) => {
    console.error("❌ 조회 실패:", err.message || err);
  });
