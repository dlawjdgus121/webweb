import oracledb from 'oracledb';
import dotenv from 'dotenv';
import readline from 'readline';

dotenv.config();
oracledb.initOracleClient({ libDir: process.env.ORACLE_CLIENT_PATH! });

async function promptUser(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise(resolve => rl.question(question, ans => {
    rl.close();
    resolve(ans);
  }));
}

async function checkTables() {
  let conn;
  try {
    conn = await oracledb.getConnection({
      user: process.env.ORACLE_USER,
      password: process.env.ORACLE_PW,
      connectString: process.env.ORACLE_CONNECT,
      walletLocation: process.env.ORACLE_WALLET_PATH,
    });

    // ✅ 테이블 목록 정렬
    const tables = await conn.execute(`SELECT table_name FROM user_tables ORDER BY table_name`);
    const tableNames: string[] = (tables.rows || []).map(row => row[0]);

    if (tableNames.length === 0) {
      console.log("조회 가능한 테이블이 없습니다.");
      return;
    }

    console.log("현재 계정의 테이블 목록:");
    tableNames.forEach((name, idx) => console.log(`${idx + 1}. ${name}`));

    const input = await promptUser("\n확인할 테이블 번호를 입력하세요: ");
    const index = parseInt(input.trim(), 10) - 1;

    if (isNaN(index) || index < 0 || index >= tableNames.length) {
      console.error("유효하지 않은 번호입니다.");
      return;
    }

    const selectedTable = tableNames[index];
    console.log(`\n선택한 테이블: ${selectedTable}`);

    // ✅ 정렬 컬럼 자동 탐색
    const metaRes = await conn.execute(`SELECT * FROM ${selectedTable} FETCH FIRST 1 ROWS ONLY`);
    const meta = metaRes.metaData || [];
    const colNames = meta.map(c => c.name.toUpperCase());

    const preferred = ["CREATED_AT", "UPDATED_AT", "CREATE_AT", "ID", "BOOK_ID"];
    const orderCol = preferred.find(c => colNames.includes(c)) ?? colNames[0];
    const descCols = new Set(["CREATED_AT", "UPDATED_AT", "CREATE_AT"]);
    const orderDir = descCols.has(orderCol) ? "DESC" : "ASC";

    // ✅ 데이터 조회 (최대 100건)
    const data = await conn.execute(`
      SELECT * FROM ${selectedTable}
      ORDER BY ${orderCol} ${orderDir}
      FETCH FIRST 100 ROWS ONLY
    `);

    const rows = data.rows || [];
    const limitedMeta = meta.slice(0, 8);

    if (rows.length === 0) {
      console.log("데이터가 없습니다.");
      return;
    }

    const result = rows.map(row => {
      const obj: Record<string, string> = {};
      row.slice(0, 8).forEach((value, idx) => {
        const colName = limitedMeta[idx]?.name ?? `COL${idx}`;
        let str = String(value ?? "");
        if (str.length > 8) str = str.slice(0, 8);
        obj[colName] = str;
      });
      return obj;
    });

    console.log(`\n정렬 기준: ${orderCol} ${orderDir} (최대 100건 표시)`);
    console.table(result);

  } catch (err) {
    console.error("오류 발생:", err);
  } finally {
    if (conn) {
      await conn.close();
    }
  }
}

checkTables();
