import { Client } from '@notionhq/client';
import dotenv from 'dotenv';
dotenv.config();

const notion = new Client({ auth: process.env.NOTION_TOKEN });

(async () => {
  try {
    const res = await notion.databases.retrieve({
      database_id: process.env.NOTION_DATABASE_ID!,
    });
    console.log("✅ 연결된 DB 이름:", (res as any).title?.[0]?.plain_text);
  } catch (err: any) {
    console.error("❌ DB 연결 실패", err.body || err.message || err);
  }
})();
