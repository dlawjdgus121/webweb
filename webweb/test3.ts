import oracledb from 'oracledb';
import dotenv from 'dotenv';

dotenv.config();

oracledb.initOracleClient({ libDir: "C:\\Users\\dltjd\\Desktop\\instantclient_23_8" });

async function fetchBooks() {
  let conn;
  try {
    console.log("🧪 연결 정보 확인", {
      user: process.env.ORACLE_USER,
      pw: process.env.ORACLE_PW,
      connectString: process.env.ORACLE_CONNECT,
      TNS_ADMIN: process.env.TNS_ADMIN,
    });

    console.log('연결 시도 중...');
    conn = await oracledb.getConnection({
      user: process.env.ORACLE_USER,
      password: process.env.ORACLE_PW,
      connectString: process.env.ORACLE_CONNECT,
    });

    const result = await conn.execute(
      `SELECT id, book_id, title, author, cover_url, genre, total_pages, created_at, isbn, publish_date, description FROM BOOK_INFO`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    console.log(`📚 책 정보 수: ${result.rows.length}`);
    for (const row of result.rows as any[]) {
      console.log({
        ID: row.ID,
        BOOK_ID: row.BOOK_ID,
        TITLE: row.TITLE,
        AUTHOR: row.AUTHOR,
        COVER_URL: row.COVER_URL,
        GENRE: row.GENRE,
        TOTAL_PAGES: row.TOTAL_PAGES,
        CREATED_AT: row.CREATED_AT,
        ISBN: row.ISBN,
        PUBLISH_DATE: row.PUBLISH_DATE,
        DESCRIPTION: row.DESCRIPTION,
      });
    }

    await conn.close();
  } catch (err) {
    console.error('❌ 책 정보 조회 실패:', err);
    if (conn) {
      try {
        await conn.close();
      } catch {}
    }
  }
}

fetchBooks();
