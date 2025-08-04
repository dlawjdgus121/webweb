import oracledb from 'oracledb';
import dotenv from 'dotenv';

dotenv.config();

oracledb.initOracleClient({ libDir: 'C:\\Users\\gram\\Desktop\\oracle\\instantclient_23_8' });

async function fetchUsers() {
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

    const result = await conn.execute(
      `SELECT user_id, user_name, created_at, email, password_hash FROM users`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    console.log(`🧾 사용자 수: ${result.rows.length}`);
    for (const row of result.rows as any[]) {
      console.log({
        USER_ID: row.USER_ID,
        USER_NAME: row.USER_NAME,
        CREATED_AT: row.CREATED_AT,
        EMAIL: row.EMAIL,
        PASSWORD_HASH: row.PASSWORD_HASH,
      });
    }

    await conn.close();
  } catch (err) {
    console.error('❌ 사용자 조회 실패:', err);
    if (conn) {
      try {
        await conn.close();
      } catch {}
    }
  }
}

fetchUsers();
