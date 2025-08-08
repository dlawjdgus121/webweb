import oracledb from "oracledb";
import dotenv from "dotenv";

dotenv.config();

export async function getTopReviewAndBookId(): Promise<{ review: string; baseBookId: string }> {
  const conn = await oracledb.getConnection({
    user: process.env.ORACLE_USER,
    password: process.env.ORACLE_PW,
    connectString: process.env.ORACLE_CONNECT,
    walletLocation: process.env.ORACLE_WALLET_PATH,
  });

  try {
   const result = await conn.execute(
  `
  SELECT rp.content AS review, TO_CHAR(rp.book_id) AS book_id
  FROM reading_log rp
  WHERE LENGTH(rp.content) > 5
  ORDER BY rp.log_date DESC
  FETCH FIRST 1 ROWS ONLY
  `,
  [],
  { outFormat: oracledb.OUT_FORMAT_OBJECT }
);

const row = result.rows?.[0];
if (!row || !row.BOOK_ID || !row.REVIEW) {
  throw new Error("❌ 충분한 감상문이 없거나 제목을 찾지 못함");
}

const reviewLob = row.REVIEW;

const reviewText = await new Promise<string>((resolve, reject) => {
  let text = '';
  reviewLob.setEncoding('utf8');
  reviewLob.on('data', (chunk) => (text += chunk));
  reviewLob.on('end', () => resolve(text));
  reviewLob.on('error', reject);
});

console.log("✍️ 가장 최근 감상문:", reviewText);
console.log("북아이디", row.BOOK_ID);
return {
  review: reviewText,
  baseBookId: row.BOOK_ID,
};

  } finally {
    await conn.close();
  }
}
