import { getConnection } from "../oracle.ts";

export interface BookInfo {
  book_id_num: string;
  title: string;
  author: string;
  publisher?: string;
  genre?: string;
  cover_url?: string;
  total_pages?: number;
  created_at?: Date;
  isbn?: string;
  publish_date?: Date;
  description?: string;
}

// 책 정보 저장 또는 업데이트 (Upsert)
export async function upsertBookInfo(book: BookInfo) {
  const conn = await getConnection();
  try {
    // 예시: MERGE 구문을 이용해 upsert 구현
    const sql = `
      MERGE INTO BOOK_INFO_NUM b
      USING (SELECT :book_id_num AS book_id_num FROM dual) src
      ON (b.book_id_num = src.book_id_num)
      WHEN MATCHED THEN
        UPDATE SET
          title = :title,
          author = :author,
          publisher = :publisher,
          genre = :genre,
          cover_url = :cover_url,
          total_pages = :total_pages,
          isbn = :isbn,
          publish_date = :publish_date,
          description = :description
      WHEN NOT MATCHED THEN
        INSERT (book_id_num, title, author, publisher, genre, cover_url, total_pages, created_at, isbn, publish_date, description)
        VALUES (:book_id_num, :title, :author, :publisher, :genre, :cover_url, :total_pages, SYSDATE, :isbn, :publish_date, :description)
    `;
    await conn.execute(sql, book, { autoCommit: true });
  } finally {
    await conn.close();
  }
}

// book_id_num으로 도서 조회
export async function findBookById(book_id_num: string): Promise<BookInfo | null> {
  const conn = await getConnection();
  try {
    const result = await conn.execute(
      `SELECT * FROM BOOK_INFO_NUM WHERE book_id_num = :id`,
      [book_id_num]
    );
    if (result.rows?.length) {
      const row = result.rows[0];
      // 컬럼 인덱스에 맞게 매핑 (예: oracledb 옵션 이용 가능)
      return {
        book_id_num: row[0],
        title: row[1],
        author: row[2],
        publisher: row[3],
        genre: row[4],
        cover_url: row[5],
        total_pages: row[6],
        created_at: row[7],
        isbn: row[8],
        publish_date: row[9],
        description: row[10],
      };
    }
    return null;
  } finally {
    await conn.close();
  }
}
