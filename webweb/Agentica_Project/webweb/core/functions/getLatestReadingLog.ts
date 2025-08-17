import oracledb, { getConnection } from "../../backend/db/oracle.ts";

export async function getLatestReadingLogByBookId(bookId: string) {
  let conn;
  try {
    conn = await getConnection();

    const result = await conn.execute(
      `
      SELECT content, page
      FROM reading_log
      WHERE book_id = :book_id
      ORDER BY log_date DESC
      FETCH FIRST 1 ROWS ONLY
      `,
      [bookId],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const row = result.rows?.[0];
    if (!row) return null;

    let content = "";
    if (typeof row.CONTENT === "object" && row.CONTENT.on) {
      content = await readCLOB(row.CONTENT);
    } else {
      content = row.CONTENT;
    }

    return {
      content,
      page: row.PAGE,
    };
  } finally {
    if (conn) await conn.close();
  }
  
}

function readCLOB(clob: any): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = "";
    clob.setEncoding("utf8");
    clob.on("data", chunk => data += chunk);
    clob.on("end", () => resolve(data));
    clob.on("error", reject);
  });
}
