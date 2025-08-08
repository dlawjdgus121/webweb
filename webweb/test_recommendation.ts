// 📂 test_recent_recommendations.ts
import oracledb from "oracledb";
import dotenv from "dotenv";

dotenv.config();
oracledb.initOracleClient({ libDir: process.env.ORACLE_CLIENT_PATH });

// CLOB을 문자열로 읽는 함수
function readClobAsText(clob: any): Promise<string> {
  return new Promise((resolve, reject) => {
    if (typeof clob === "string") return resolve(clob);

    let result = "";
    clob.setEncoding("utf8");
    clob.on("data", (chunk: string) => result += chunk);
    clob.on("end", () => resolve(result));
    clob.on("error", (err: any) => reject(err));
  });
}

async function fetchRecommendations() {
  let conn;

  try {
    conn = await oracledb.getConnection({
      user: process.env.ORACLE_USER,
      password: process.env.ORACLE_PW,
      connectString: process.env.ORACLE_CONNECT,
      walletLocation: process.env.ORACLE_WALLET_PATH,
    });

    const sql = `
      SELECT base_book_id, recommended_book_title, recommended_reason, created_at
      FROM recommendation
      ORDER BY created_at DESC
    `;

    const result = await conn.execute(sql, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
    const rows = result.rows ?? [];

    console.log("📚 전체 추천 도서 목록:");

    for (let i = 0; i < rows.length; i++) {
      const rec = rows[i];
      const reason = await readClobAsText(rec.RECOMMENDED_REASON);

      console.log(`\n${i + 1}.`);
      console.log(`- 기준 도서 ID: ${rec.BASE_BOOK_ID}`);
      console.log(`- 추천 도서 제목: ${rec.RECOMMENDED_BOOK_TITLE}`);
      console.log(`- 추천 이유: ${reason}`);
      console.log(`- 추천 시각: ${rec.CREATED_AT}`);
    }
  } catch (err) {
    console.error("❌ 오류:", err);
  } finally {
    if (conn) await conn.close();
  }
}

fetchRecommendations();
