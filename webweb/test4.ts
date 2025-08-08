import oracledb from 'oracledb';
import dotenv from 'dotenv';

dotenv.config();

//oracledb.initOracleClient({ libDir: 'C:\\Users\\gram\\Desktop\\oracle\\instantclient_23_8' });

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
      // walletLocation: process.env.ORACLE_WALLET_PATH,
    });

const test = await conn.execute(
  `SELECT * FROM book_info_num WHERE book_id_num = 27`,
  [],
  { outFormat: oracledb.OUT_FORMAT_OBJECT }
);
console.log("🔎 book_info_num에 27번 도서 존재 여부:", test.rows);

   

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

