import {
  getBookTitleFromText,
  extractBookProperties,
  askAboutBooksFree,
  getRecommendedBooksByReview,
} from "../../core/llm/openai/bookAnalysis.ts";
import {
  Book,
  searchBook,
  saveBookToNotion,
  convertBookToBookInfo,
} from "../../core/functions/registerBook.ts";
import { registerBook } from "../../core/functions/registerBookOracle.ts";
import { getBookFromOracleByTitle } from "../../core/functions/getBookFromOracleByTitle.ts";
import { insertReadingLog } from "../../core/functions/insertReadingLog.ts";
import { getLatestReadingLogByBookId } from "../../core/functions/getLatestReadingLog.ts";
import {
  findPageIdByBookName,
  updateBookProperties,
  createReviewPage,
  createReadingScheduleInNotion,
  findBookPageIdByTitle,
} from "../../core/notion/notionUtils.ts";
import { generateReadingPlan } from "../../core/llm/openai/readingPlanGenerator.ts";
import { insertReadingPlan } from "../../core/functions/insertReadingPlan.ts";
import { getReadingPlanWithBookInfoByTitle } from "../../core/functions/getReadingPlanWithBookInfoByTitle.ts";
import {
  handleRecommendBooks,
  extractReviewText,
  normalizeTitle,
} from "../../core/functions/recommendBook.ts";
import { updateReadingProgressAndSync } from "../../core/functions/updateReadingProgress.ts";

export function convertBookInfoToBook(bookInfo: any): Book {
  return {
    이름: bookInfo.title,
    저자: bookInfo.author,
    책표지: bookInfo.coverUrl,
    출판사: bookInfo.publisher,
    장르: bookInfo.genre,
    isbn: bookInfo.isbn,
    줄거리: bookInfo.description,
    "총 페이지": bookInfo.totalPages,
    "처음 읽은 날": bookInfo.publishDate
      ? bookInfo.publishDate.toISOString().split("T")[0]
      : undefined,
  };
}

export class BookAgentService {
  // 1) 책 등록
  async addBook(props: { prompt: string }) {
    console.log("📌 [BookAgentService] addBook 호출됨:", props);

    const titleData = await getBookTitleFromText(props.prompt);
    const title = titleData?.main_title || "";

    if (!title) {
      throw new Error("요청에서 책 제목을 찾을 수 없습니다.");
    }

    const book = await searchBook(title);
    const bookInfo = convertBookToBookInfo(book);

    // 1. 오라클에 책 정보 등록 및 유효성 검사
    const row = await registerBook(bookInfo);
    if (!row) {
      throw new Error("Oracle에 책 등록 실패");
    }

    // ⭐ 2. Notion에 저장하기 전, 타입 변환
    const convertedRow = convertBookInfoToBook(row);

    // 3. Notion에 책 정보 저장
    const notionPage = await saveBookToNotion(convertedRow);
    if (!notionPage) {
      throw new Error("Notion에 책 등록 실패");
    }

    // 4. 모든 작업이 완료된 후 최종 응답 반환
    return { title: bookInfo.title, notionPage };
  }

  // 2) 책 속성/감상 업데이트
  async updateBook(props: { userInput: string }) {
    console.log("📌 [BookAgentService] updateBook 호출됨:", props);

    const titleData = await getBookTitleFromText(props.userInput);
    const bookName = titleData?.main_title || "";
    const updates = await extractBookProperties(props.userInput);

    const oracleBook = await getBookFromOracleByTitle(bookName);
    if (!oracleBook?.bookId) throw new Error(`Oracle에 "${bookName}" 없음`);

    if (updates["도서 기록"]) {
      const content = updates["도서 기록"];
      const m = content.match(/(\d+)\s*(쪽|페이지)/);
      const page = m ? Number(m[1]) : undefined;
      if (!page) throw new Error("도서 기록에서 페이지 추출 실패");

      await insertReadingLog({
        bookId: oracleBook.bookId,
        content,
        page,
        isFinal: updates["상태"] === "완료" ? 1 : 0,
      });
    }

    const notionPageId = await findPageIdByBookName(bookName);
    if (!notionPageId) throw new Error("Notion 책 페이지 ID 없음");

    const latest = await getLatestReadingLogByBookId(oracleBook.bookId);
    if (!latest?.content) throw new Error("Oracle 최근 감상 없음");

    const reviewPageId = await createReviewPage(
      notionPageId,
      latest.content,
      latest.page
    );

    updates["도서 기록"] = { relation: [{ id: reviewPageId }] };
    await updateBookProperties(notionPageId, updates);

    return { message: "Oracle + Notion 감상 기록 저장 완료" };
  }

  // 3) 독서 계획
  async createReadingPlan(props: { message: string }) {
    console.log("📌 [BookAgentService] createReadingPlan 호출됨:", props);

    const planData = await generateReadingPlan(props.message);
    const title = planData?.title || "";
    const normalizedTitle = normalizeTitle(title);
    const daysArray = planData?.days || [];
    const book = await getBookFromOracleByTitle(title);
    if (!book) throw new Error(`Oracle에 "${title}" 없음`);

    const start = new Date();
    const end = new Date(start.getTime() + (daysArray.length - 1) * 86400000);
    const isoStart = this.f(start);
    const isoEnd = this.f(end);

    await insertReadingPlan({
      bookId: book.bookId,
      startDate: isoStart,
      endDate: isoEnd,
      intervalDays: 1,
    });

    const plan = await getReadingPlanWithBookInfoByTitle(title);
    if (!plan) throw new Error("Oracle 독서 계획 재조회 실패");

    const bookPageId = await findBookPageIdByTitle(plan.TITLE);
    if (!bookPageId) throw new Error(`Notion에 "${plan.TITLE}" 페이지 없음`);

    await createReadingScheduleInNotion({
      title: plan.TITLE,
      author: plan.AUTHOR,
      total_pages: plan.TOTAL_PAGES,
      start_date: this.f(plan.START_DATE),
      end_date: this.f(plan.END_DATE),
      days: this.days(plan.START_DATE, plan.END_DATE),
      bookPageId,
    });

    return {
      title: plan.TITLE,
      start: this.f(plan.START_DATE),
      end: this.f(plan.END_DATE),
    };
  }

  // 4) 추천 도서
  async recommendBooks(props: { prompt?: string; review?: string }) {
    console.log("📌 [BookAgentService] recommendBooks 호출됨:", props);

    const review = props.review ?? (await extractReviewText(props.prompt ?? ""));
    await getRecommendedBooksByReview(review); // OpenAI 기반 추천 호출
    await handleRecommendBooks({ userId: "사용자 ID" });

    return { message: "추천 도서 등록 완료!" };
  }

  // 5) 책갈피(진행도) 업데이트
  async updateReadingProgress(props: { bookName: string; page: number }) {
    console.log("📌 [BookAgentService] updateReadingProgress 호출됨:", props);

    const result = await updateReadingProgressAndSync({
      bookName: props.bookName,
      page: props.page,
    });

    return { message: result.message };
  }

  // ⭐ 로컬 날짜를 YYYY-MM-DD 형식으로 포맷하는 함수 (유일한 정의)
  private f(d: Date | string) {
    const date = new Date(d);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  // ⭐ 날짜 차이를 계산하는 함수 (유일한 정의)
  private days(a: Date | string, b: Date | string) {
    const s = new Date(a),
      e = new Date(b);
    return Math.ceil((e.getTime() - s.getTime()) / 86400000) + 1;
  }
}