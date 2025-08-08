import oracledb from "oracledb";
import dotenv from "dotenv";
dotenv.config();
oracledb.initOracleClient({ libDir: "C:\\Users\\dltjd\\Desktop\\instantclient_23_8" });

const dbConfig = {
  user: process.env.ORACLE_USER,
  password: process.env.ORACLE_PW,
  connectString: process.env.ORACLE_CONNECT,
};

export interface ReadingLogInput {
  bookId: string;         // BOOK_INFO 테이블의 book_id
  userName?: string;      // 사용자 이름 (기본값: "임정현")
  content: string;        // 감상 내용
  page: number;           // 읽은 페이지 (필수)
  isFinal?: number;       // 완독 여부 (기본값: 1)
}

export async function insertReadingLog({
  bookId,
  userName = "임정현",
  content,
  page,
  isFinal = 1,
}: ReadingLogInput): Promise<void> {
  let conn;

  try {
    console.log("과연");
    const parsedPage = Number(page);
    if (isNaN(parsedPage)) {
      throw new Error(`📛 page가 숫자가 아닙니다: ${page}`);
    }
console.log("과연1");
    conn = await oracledb.getConnection(dbConfig);
console.log("과연2");
    // 📚 book_id 유효성 확인
 //   const bookRes = await conn.execute(
   ///   `SELECT COUNT(*) AS CNT FROM BOOK_INFO WHERE book_id = :bookId`,
   //   [bookId],
   //   { outFormat: oracledb.OUT_FORMAT_OBJECT }
  //  );
console.log("과연3");
    //const bookExists = (bookRes.rows?.[0] as any)?.CNT > 0;
 //   if (!bookExists) {
    //  throw new Error(`❌ BOOK_INFO에 book_id '${bookId}' 가 존재하지 않습니다.`);
  //  }

    const finalIsFinal = isFinal ? 1 : 0;

    // 디버깅 로그
    console.log("🧪 감상 INSERT 전 확인:", {
      book_id: bookId,
      page: parsedPage,
      content,
      is_final: finalIsFinal,
    });
    console.log("🔍 bookId value and type:", bookId, typeof bookId);

    await conn.execute(
      `
      INSERT INTO READING_LOG (
        book_id, page, content, is_final
      ) VALUES (
        :book_id, :page, :content, :is_final
      )
      `,
      {
        book_id: String(bookId),
        page: parsedPage,
        content,
        is_final: finalIsFinal,
      },
      { autoCommit: true }
    );

    console.log("✅ 감상 저장 완료:", {
      book_id: bookId,
      page: parsedPage,
      is_final: finalIsFinal,
    });

  } catch (err) {
    console.error("❌ insertReadingLog 실패:", err);
    throw err;
  } finally {
    if (conn) await conn.close().catch(console.error);
  }
}
