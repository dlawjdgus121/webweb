import oracledb from "oracledb";
import dotenv from "dotenv";
dotenv.config();

oracledb.initOracleClient({
  libDir: "C:\\Users\\dltjd\\Desktop\\instantclient_23_8"
});

export async function getRecentBooks() {
  const conn = await oracledb.getConnection({
    user: process.env.ORACLE_USER,
    password: process.env.ORACLE_PW,
    connectString: process.env.ORACLE_CONNECT,
  });

  const result = await conn.execute(
    `SELECT * FROM book_info ORDER BY created_at DESC FETCH FIRST 5 ROWS ONLY`
  );

  await conn.close();
  return result.rows;
}

getRecentBooks()
  .then((rows) => {
    console.log("📚 최근 등록된 책 5개:");
    console.table(rows);
  })
  .catch((err) => {
    console.error("❌ 오류 발생:", err);
  });
