// backend/agentica/BookAgentService.ts
import { askGemini, extractBookProperties } from "../../core/llm/gemini/geminiSummaryTest.ts";
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
import { parseReadingPlan } from "../../core/llm/gemini/parseReadingPlan.ts";
import { insertReadingPlan } from "../../core/functions/insertReadingPlan.ts";
import { getReadingPlanWithBookInfoByTitle } from "../../core/functions/getReadingPlanWithBookInfoByTitle.ts";
import { handleRecommendBooks, extractReviewText } from "../../core/functions/recommendBook.ts";
import { updateReadingProgressAndSync } from "../../core/functions/updateReadingProgress.ts";
//import { updateReadingProgressAndSync } from "../../core/functions/updateReadingProgress.ts";


export class BookAgentService {
  // 1) 책 등록
  async addBook(props: { prompt: string }) {
    console.log("📌 [BookAgentService] addBook 호출됨:", props);

    // 1️⃣ 제목 추출
    const title = await askGemini(props.prompt);

    // 2️⃣ 책 검색
    const book = await searchBook(title);

    // 3️⃣ BookInfo 변환
    const bookInfo = convertBookToBookInfo(book);

    // 4️⃣ Oracle + Notion 동시 저장
    const result = await registerBook(bookInfo);

    // 5️⃣ 결과 반환
    return { title: bookInfo.title, bookId: result.bookId };
  }


  // 2) 책 속성/감상 업데이트
async updateBook(props: { userInput: string }) {
  console.log("📌 [BookAgentService] updateBook 호출됨:", props);

  // 1. 책 제목, 속성 추출
  const bookName = await askGemini(props.userInput);
  const updates = await extractBookProperties(props.userInput);
  console.log("🧪 추출된 속성:", updates);

  // 2. Oracle에서 책 정보 확인
  const oracleBook = await getBookFromOracleByTitle(bookName);
  if (!oracleBook || !oracleBook.bookId) {
    throw new Error(`📛 "${bookName}" 책이 Oracle에 존재하지 않습니다.`);
  }

  // 3. 도서 기록이 있는 경우 처리
  if (updates["도서 기록"]) {
    const content: string = updates["도서 기록"];
    const pageMatch = content.match(/(\d+)\s*(쪽|페이지)/);
    const pageStr = pageMatch?.[1];
    const page = pageStr ? Number(pageStr) : undefined;

    if (page === undefined || isNaN(page)) {
      throw new Error("📛 유효한 페이지 번호를 추출할 수 없습니다.");
    }

    // 3-1. 감상 로그 저장 (Oracle)
    await insertReadingLog({
      bookId: oracleBook.bookId,
      content,
      page,
      isFinal: updates["상태"] === "완료" ? 1 : 0,
    });

    // 3-2. 책갈피 업데이트도 같이 (Oracle)
    await updateReadingProgressAndSync({
      bookName: oracleBook.이름, // ✅ title 또는 이름
      page,
    });

    // 3-3. Notion 페이지 ID 조회
    const notionPageId = await findPageIdByBookName(bookName);
    if (!notionPageId) {
      throw new Error(`📛 Notion에서 "${bookName}" 책 페이지 ID를 찾을 수 없습니다.`);
    }

    // 3-4. 최근 감상 로그 재조회
    const latestLog = await getLatestReadingLogByBookId(oracleBook.bookId);
    if (!latestLog || !latestLog.content) {
      throw new Error("📛 최근 감상 기록을 Oracle에서 찾을 수 없습니다.");
    }

    // 3-5. 감상 페이지 생성 (Notion)
    const reviewPageId = await createReviewPage(
      notionPageId,
      latestLog.content,
      latestLog.page
    );

    // 3-6. 속성 재구성
    const notionUpdates: Record<string, any> = {
      ...updates,
      ["도서 기록"]: { relation: [{ id: reviewPageId }] },
      ["책갈피"]: `${latestLog.page}쪽`,
    };

    // 3-7. Notion 속성 업데이트
    const notionRes = await updateBookProperties(notionPageId, notionUpdates);

    return {
      message: "📘 Oracle + Notion 감상 기록 + 책갈피 저장 완료",
      notionRes,
    };
  }

  // 4. 도서 기록은 없지만 책갈피만 있을 경우
  if (updates["책갈피"]) {
    const pageMatch = String(updates["책갈피"]).match(/(\d+)\s*(쪽|페이지)/);
    const pageStr = pageMatch?.[1];
    const page = pageStr ? Number(pageStr) : undefined;

    if (page === undefined || isNaN(page)) {
      throw new Error("📛 책갈피에서 유효한 페이지 번호를 추출할 수 없습니다.");
    }

    await updateReadingProgressAndSync({
      bookName: oracleBook.이름, // ✅ title 또는 이름
      page,
    });

    return { message: `📘 Oracle 책갈피만 업데이트 완료 (📖 ${page}쪽)` };
  }

  // 5. 도서 기록도 책갈피도 없는 경우
  throw new Error("도서 기록과 책갈피 모두 없어 저장할 수 없습니다.");
}


 // 3) 독서 계획
async createReadingPlan(props: { message: string }) {
  console.log("📌 [BookAgentService] createReadingPlan 호출됨:", props);

  // 1. 챗봇으로부터 도서명과 기간 추출
  const { title, days } = await parseReadingPlan(props.message);
  if (!title || !days) {
    throw new Error("📛 도서명 또는 기간을 추출할 수 없습니다.");
  }

  // 2. Oracle DB에서 책 조회
  const book = await getBookFromOracleByTitle(title);
  if (!book) throw new Error(`Oracle에서 "${title}" 책을 찾을 수 없습니다.`);

  // 3. 날짜 계산 (Invalid time value 방지)
  const today = new Date();
  const startDate = isNaN(today.getTime()) ? new Date() : today;
  const endDate = new Date(startDate.getTime() + (days - 1) * 86400000);

  const isoStart = this.formatDate(startDate);
  const isoEnd = this.formatDate(endDate);

  // 4. Oracle에 독서 계획 저장
  await insertReadingPlan({
    bookId: book.bookId,
    startDate: isoStart,
    endDate: isoEnd,
    intervalDays: 1, // 매일 1일차~n일차
  });

  // 5. Oracle에서 방금 저장한 독서 계획 + 책 정보 다시 조회
  const planRow = await getReadingPlanWithBookInfoByTitle(title);
  if (!planRow) throw new Error(`📛 Oracle에서 독서 계획 정보를 가져올 수 없습니다.`);

  // 6. Notion 책장에서 해당 책 page_id 찾기
  const bookPageId = await findBookPageIdByTitle(planRow.TITLE);
  if (!bookPageId) throw new Error(`📛 Notion에서 "${planRow.TITLE}" 페이지를 찾을 수 없습니다.`);

  // 7. Notion에 독서 캘린더 일정 생성
  await createReadingScheduleInNotion({
    title: planRow.TITLE,
    author: planRow.AUTHOR,
    total_pages: planRow.TOTAL_PAGES,
    start_date: this.formatDate(planRow.START_DATE),
    end_date: this.formatDate(planRow.END_DATE),
    days: this.calculateDays(planRow.START_DATE, planRow.END_DATE),
    bookPageId,
  });

  // 8. 반환
  return {
    message: `✅ Oracle + Notion에 독서 계획이 등록되었습니다.`,
    book: planRow.TITLE,
    start: this.formatDate(planRow.START_DATE),
    end: this.formatDate(planRow.END_DATE),
  };
}

// 유틸 메서드 (클래스 안에 추가)
private formatDate(date: Date | string): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().split("T")[0];
}

private calculateDays(start: Date | string, end: Date | string): number {
  const s = new Date(start);
  const e = new Date(end);
  if (isNaN(s.getTime()) || isNaN(e.getTime())) return 0;
  return Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}


  // 4) 추천 도서
  // 4) 추천 도서
async recommendBooks(props: { userId: string }) {
  console.log("📌 [BookAgentService] recommendBooks 호출됨:", props);

  const { userId } = props;
  if (!userId) {
    throw new Error("📛 userId가 필요합니다.");
  }

  // 🔁 리딩로그(등) 기반 추천 생성
  const { titles } = await handleRecommendBooks({ userId });

  // ✅ 라우터와 동일 형태로 응답
  return {
    type: "recommend",
    titles,
  };
}

// (기존 보조 메서드 유지)
private f(d: Date | string) {
  return new Date(d).toISOString().split("T")[0];
}
private days(a: Date | string, b: Date | string) {
  const s = new Date(a), e = new Date(b);
  return Math.ceil((e.getTime() - s.getTime()) / 86400000) + 1;
}
}
