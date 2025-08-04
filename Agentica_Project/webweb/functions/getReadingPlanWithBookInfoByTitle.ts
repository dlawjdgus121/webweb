import oracledb from "oracledb";

import dotenv from "dotenv";
dotenv.config();
// Oracle Instant Client 초기화
oracledb.initOracleClient({ libDir: 'C:\\Users\\gram\\Desktop\\oracle\\instantclient_23_8' });

const dbConfig = {
  user: process.env.ORACLE_USER,
  password: process.env.ORACLE_PW,
  connectString: process.env.ORACLE_CONNECT,
};

export async function getReadingPlanWithBookInfoByTitle(title: string) {
  let conn;
  try {
    conn = await oracledb.getConnection(dbConfig);
    const result = await conn.execute(
      `
      SELECT
        r.book_id,
        r.start_date,
        r.end_date,
        r.interval_days,
        b.title,
        b.author,
        b.total_pages
      FROM reading_plan r
      JOIN book_info b ON r.book_id = b.book_id
      WHERE REPLACE(b.title, ' ', '') = REPLACE(:title, ' ', '')
      ORDER BY r.id DESC FETCH FIRST 1 ROWS ONLY
      `,
      [title],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return result.rows?.[0] || null;
  } finally {
    if (conn) await conn.close();
  }
}
