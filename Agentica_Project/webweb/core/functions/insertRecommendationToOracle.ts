import oracledb from "oracledb";
import dotenv from "dotenv";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { Client } from "@notionhq/client";

// ✅ .env 로드
dotenv.config();

// ✅ Notion 클라이언트 초기화
const notion = new Client({ auth: process.env.NOTION_TOKEN });
const RECOMMENDED_BOOK_DB_ID = process.env.RECOMMENDED_BOOK_DB_ID;

if (!RECOMMENDED_BOOK_DB_ID) {
  throw new Error("❌ RECOMMENDED_BOOK_DB_ID 환경 변수가 설정되지 않았습니다.");
}

oracledb.initOracleClient({ libDir: process.env.ORACLE_CLIENT_PATH });

interface RecommendationEntry {
  baseBookId: string;
  recommendedBookId: string;
  recommendedBookTitle: string;
  recommendedReason: string;
  imageUrl?: string; // ✅ 여기에 이미지 URL 추가
}

function getSafeReason(reason: any): string {
  if (typeof reason === "string") {
    return reason.trim();
  } else if (typeof reason === "object" && reason?.text) {
    return String(reason.text).trim();
  } else {
    return JSON.stringify(reason ?? "").trim();
  }
}

export async function insertRecommendationToOracle(entries: RecommendationEntry[]): Promise<void> {
  let conn;

  try {
    conn = await oracledb.getConnection({
      user: process.env.ORACLE_USER,
      password: process.env.ORACLE_PW,
      connectString: process.env.ORACLE_CONNECT,
      walletLocation: process.env.ORACLE_WALLET_PATH,
    });
    console.log("🟨 Oracle 연결 성공");

    // 🔹 1. Oracle에 3권 모두 저장
    const insertSql = `
      INSERT INTO recommendation (
        base_book_id,
        recommended_book_id,
        recommended_book_title,
        recommended_reason,
        created_at
      )
      VALUES (
        :base_book_id,
        :recommended_book_id,
        :recommended_book_title,
        :recommended_reason,
        SYSTIMESTAMP
      )
    `;

    for (const entry of entries) {
      const binds = {
  base_book_id: entry.baseBookId,
  recommended_book_id: entry.recommendedBookId,
  recommended_book_title: entry.recommendedBookTitle,
  recommended_reason: getSafeReason(entry.recommendedReason),
};


      const result = await conn.execute(insertSql, binds, { autoCommit: true });
      console.log(`📦 Oracle 저장 완료: ${entry.recommendedBookTitle} (Rows affected: ${result.rowsAffected})`);
    }

    // 🔹 2. 저장한 3권 다시 Oracle에서 조회
    const ids = entries.map(e => `'${e.recommendedBookId}'`).join(",");
    const selectSql = `
      SELECT recommended_book_title, recommended_reason
      FROM recommendation
      WHERE recommended_book_id IN (${ids})
    `;

    const res = await conn.execute(selectSql, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
    const books = res.rows || [];

    // 🔹 3. Notion에 3권 등록
   // 🔹 3. Notion에 3권 등록
for (const entry of entries) {
  const title = entry.recommendedBookTitle ?? "제목 없음";
  const reason = entry.recommendedReason ?? "";
  const imageUrl = entry.imageUrl ?? "";

  console.log("🔍 표지 URL 확인:", imageUrl); // ✅ 로그 찍어서 확인해봐

  try {
    await notion.pages.create({
      parent: { database_id: RECOMMENDED_BOOK_DB_ID },
      properties: {
        이름: {
          title: [{ text: { content: title } }],
        },
        추천이유: {
          rich_text: [{ type: "text", text: { content: reason } }],
        },
      },
      ...(imageUrl && imageUrl.startsWith("http") && {
        cover: {
          external: { url: imageUrl },
        },
      }),
    });

    console.log(`✅ Notion에 등록 완료: ${title}`);
  } catch (err) {
    console.error(`❌ Notion 저장 실패 (${title}):`, err);
  }
}




  } catch (err: any) {
    console.error("❌ 전체 실패:", err.message || err);
    throw err;
  } finally {
    if (conn) await conn.close();
  }
}
