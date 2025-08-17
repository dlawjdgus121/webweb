// backend/agentica/BookAgentService.ts
import {
  getBookTitleFromText,
  extractBookProperties,
  askAboutBooksFree,
  getRecommendedBooksByReview,
  extractBookInfoFromText
} from "../../core/llm/openai/bookAnalysis.ts";
import { searchBook, saveBookToNotion, convertBookToBookInfo } from "../../core/functions/registerBook.ts";
import { registerBook } from "../../core/functions/registerBookOracle.ts";
import { getBookFromOracleByTitle } from "../../core/functions/getBookFromOracleByTitle.ts";
import { insertReadingLog } from "../../core/functions/insertReadingLog.ts";
import { getLatestReadingLogByBookId } from "../../core/functions/getLatestReadingLog.ts";
import {
  findPageIdByBookName,
  updateBookProperties,
  createReviewPage,
  createReadingScheduleInNotion,
  findBookPageIdByTitle
} from "../../core/notion/notionUtils.ts";
import { generateReadingPlan } from "../../core/llm/openai/readingPlanGenerator.ts";
import { insertReadingPlan } from "../../core/functions/insertReadingPlan.ts";
import { getReadingPlanWithBookInfoByTitle } from "../../core/functions/getReadingPlanWithBookInfoByTitle.ts";
import { handleRecommendBooks, extractReviewText } from "../../core/functions/recommendBook.ts";
import { updateReadingProgressAndSync } from "../../core/functions/updateReadingProgress.ts";

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

    await registerBook(bookInfo);
    const row = await getBookFromOracleByTitle(bookInfo.title);
    if (!row) throw new Error("Oracle 재조회 실패");

    const notionPage = await saveBookToNotion(row);
    return { title: bookInfo.title, notionPage };
  }

  // 2) 책 속성/감상 업데이트
async updateBook(props: { userInput: string }) {
  console.log("📌 [BookAgentService] updateBook 호출됨:", props);

  // 1️⃣ 한 번의 입력에서 책 제목, 페이지, 감상평 추출
  const bookInfo = await extractBookInfoFromText(props.userInput);
  const bookName = bookInfo.title;   // 정확한 책 제목
  const page = bookInfo.page;        // 읽은 마지막 페이지
  const review = bookInfo.review;    // 감상평

  if (!bookName) throw new Error("책 제목을 추출할 수 없습니다");

  // 2️⃣ Oracle에서 책 정보 조회
  const oracleBook = await getBookFromOracleByTitle(bookName);
  if (!oracleBook?.bookId) throw new Error(`Oracle에 "${bookName}" 없음`);

  // 3️⃣ Oracle 읽기 기록 저장
  if (page && review) {
    await insertReadingLog({
      bookId: oracleBook.bookId,
      content: review,
      page,
      isFinal: 0, // 필요 시 updates["상태"] 체크 가능
    });
  }

  // 3-2. 책갈피 업데이트도 같이 (Oracle)
    await updateReadingProgressAndSync({
      bookName: oracleBook.이름, // ✅ title 또는 이름
      page,
    });

  // 4️⃣ Notion 페이지 ID 조회
  const notionPageId = await findPageIdByBookName(bookName);
  if (!notionPageId) throw new Error("Notion 책 페이지 ID 없음");

  // 5️⃣ Oracle에서 최신 기록 가져오기
  const latest = await getLatestReadingLogByBookId(oracleBook.bookId);
  if (!latest?.content) throw new Error("Oracle 최근 감상 없음");

  // 6️⃣ Notion에 리뷰 페이지 생성
  const reviewPageId = await createReviewPage(
    notionPageId,
    latest.content,
    latest.page
  );

  // 7️⃣ Notion 책 속성 업데이트
  const updates = {
    "도서 기록": { relation: [{ id: reviewPageId }] },
  };
  await updateBookProperties(notionPageId, updates);

  return { message: "Oracle + Notion 감상 기록 저장 완료" };
}
  // 3) 독서 계획
  async createReadingPlan(props: { message: string }) {
    console.log("📌 [BookAgentService] createReadingPlan 호출됨:", props);

    const planData = await generateReadingPlan(props.message);
    const title = planData?.title || "";
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
      intervalDays: 1
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
      bookPageId
    });

    return {
      title: plan.TITLE,
      start: this.f(plan.START_DATE),
      end: this.f(plan.END_DATE)
    };
  }


 // 4) 추천 도서
  async recommendBooks(props: { prompt?: string; review?: string }) {
    console.log("📌 [BookAgentService] recommendBooks 호출됨:", props);

    const review = props.review ?? (await extractReviewText(props.prompt ?? ""));
    //await getRecommendedBooksByReview(review); // OpenAI 기반 추천 호출
    await handleRecommendBooks({ userId: "사용자 ID" });

    return { message: "추천 도서 등록 완료!" };
  }


/*
    // 4) 추천 도서
async recommendBooks(props: { userId: string }) {
  console.log("📌 [BookAgentService] recommendBooks 호출됨:", props);

  const { userId } = props;
  if (!userId) {
    throw new Error("📛 userId가 필요합니다.");
  }

  // 🔁 리딩로그(등) 기반 추천 생성
  const { titles } = await handleRecommendBooks({ userId });

  if (titles.length === 0) {
    console.warn("⚠️ 추천된 책이 없음. 빈 배열 반환."); // 수정됨
  }

  // ✅ 라우터와 동일 형태로 응답
  return {
    type: "recommend",
    titles,
  };
}
*/

  // 5) 책갈피(진행도) 업데이트
  async updateReadingProgress(props: { bookName: string; page: number }) {
    console.log("📌 [BookAgentService] updateReadingProgress 호출됨:", props);

    const result = await updateReadingProgressAndSync({
      bookName: props.bookName,
      page: props.page
    });

    return { message: result.message };
  }

  private f(d: Date | string) {
    return new Date(d).toISOString().split("T")[0];
  }
  private days(a: Date | string, b: Date | string) {
    const s = new Date(a),
      e = new Date(b);
    return Math.ceil((e.getTime() - s.getTime()) / 86400000) + 1;
  }
}
