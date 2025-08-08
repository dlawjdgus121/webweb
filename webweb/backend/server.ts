// ✅ 병합된 서버 코드: 기존 기능 + 추천도서 기능 + 독서 일정
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// 📁 파일 경로 설정
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 📦 환경 변수 로드
dotenv.config({ path: path.resolve(__dirname, ".env") });

// 📚 Gemini, 책 등록 관련
import { askGemini, extractBookProperties } from "../llm/gemini/geminiSummaryTest.ts";
import { searchBook, saveBookToNotion } from "../functions/registerBook.ts";
import { findBookPageIdByTitle, findPageIdByBookName, updateBookProperties, createReviewPage, createReadingScheduleInNotion } from "../notion/notionUtils.ts";
import {convertBookToBookInfo} from "../functions/registerBook.ts";
import { insertReadingLog } from "../functions/insertReadingLog.ts"; // 경로 맞게 수정
import { getLatestReadingLogByBookId } from "../functions/getLatestReadingLog.ts";
// 📅 독서 일정 관련 라우터
import readingScheduleRouter from "./routes/readingSchedule.ts";
import { parseReadingPlan } from "../llm/gemini/parseReadingPlan.ts";
import { registerBook } from "../functions/registerBookOracle.ts";
import {getBookFromOracleByTitle} from "../functions/getBookFromOracleByTitle.ts"
import { insertReadingPlan } from "../functions/insertReadingPlan.ts";
import {getReadingPlanWithBookInfoByTitle} from "../functions/getReadingPlanWithBookInfoByTitle.ts"
// 🌟 추천도서 관련
import { handleRecommendBooks, extractReviewText } from "../functions/recommendBook.ts";
import { updateReadingProgressAndSync } from "../functions/updateReadingProgress.ts";

const app = express();
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
// 📌 일정 등록 라우터
app.use("/api", readingScheduleRouter);
/*
// 📘 책 등록
app.post("/add-book", async (req, res) => {
  try {
    const prompt = req.body.prompt;
    const intent = getIntentFromPrompt(prompt);
    console.log("🧠 의도 해석:", intent);

    if (intent === "recommend") {
      const review = await extractReviewText(prompt);
      await handleRecommendBooks(review);
      return res.json({ message: "추천 도서 등록 완료!" });
    }

    if (intent === "register") {
      const title = await askGemini(prompt);
      const book = await searchBook(title);
      const notionRes = await saveBookToNotion(book);
      return res.json({ message: `${title} 등록 완료`, notionRes, title: book.이름 });
    }

    res.status(400).json({ error: "알 수 없는 명령입니다." });
  } catch (err: any) {
    console.error("❌ add-book 오류:", err.message || err);
    res.status(500).json({ error: "처리 실패", details: err.message || err });
  }
});*/
app.post("/add-book", async (req, res) => {
  try {
    const prompt = req.body.prompt;
    const intent = getIntentFromPrompt(prompt);
    console.log("🧠 의도 해석:", intent);

    // 📚 책 추천 처리
    if (intent === "recommend") {
  const userId = "사용자ID";
  const { titles } = await handleRecommendBooks({ userId });

  return res.status(200).json({
    type: "recommend",
    titles,
  });
}
if (intent === "register") {
  // 1. prompt로부터 책 제목 추출
  const title = await askGemini(prompt);

const book = await searchBook(title);
const bookInfo = convertBookToBookInfo(book);
await registerBook(bookInfo);

 // 5. Oracle에서 저장된 데이터 다시 조회
  const bookFromOracle = await getBookFromOracleByTitle(bookInfo.title);
  if (!bookFromOracle) {
    return res.status(500).json({ error: "Oracle에서 책 정보를 다시 가져올 수 없습니다." });
  }

  // 6. Notion에 저장
  const notionPage = await saveBookToNotion(bookFromOracle);

  return res.json({
    message: `${bookInfo.title} 등록 완료 (Oracle + Notion)`,
    bookInfo,
    notionPage,
  });
}
    res.status(400).json({ error: "알 수 없는 명령입니다." });
  } catch (err: any) {
    console.error("❌ add-book 오류:", err.message || err);
    res.status(500).json({ error: "처리 실패", details: err.message || err });
  }
});




// 📗 책 속성 업데이트
// 📗 책 속성 업데이트
app.post("/update-book", async (req, res) => {
  try {
    const { userInput } = req.body;

    // 1. 책 제목, 속성 추출
    const bookName = await askGemini(userInput);
    const updates = await extractBookProperties(userInput);
    console.log("🧪 추출된 속성:", updates);

    // 2. Oracle에서 책 정보 확인
    const oracleBook = await getBookFromOracleByTitle(bookName);
    if (!oracleBook || !oracleBook.bookId) {
      throw new Error(`📛 "${bookName}" 책이 Oracle에 존재하지 않습니다.`);
    }

    // 3. 도서 기록이 있는 경우 처리
    if (updates["도서 기록"]) {
      const content = updates["도서 기록"];
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
      updates["도서 기록"] = { relation: [{ id: reviewPageId }] };
      updates["책갈피"] = `${latestLog.page}쪽`;

      // 3-7. Notion 속성 업데이트
      const notionRes = await updateBookProperties(notionPageId, updates);

      return res.json({
        message: "📘 Oracle + Notion 감상 기록 + 책갈피 저장 완료",
        notionRes,
      });
    }

    // 4. 도서 기록은 없지만 책갈피만 있을 경우
    if (updates["책갈피"]) {
      const pageMatch = updates["책갈피"].match(/(\d+)\s*(쪽|페이지)/);
      const pageStr = pageMatch?.[1];
      const page = pageStr ? Number(pageStr) : undefined;

      if (page === undefined || isNaN(page)) {
        throw new Error("📛 책갈피에서 유효한 페이지 번호를 추출할 수 없습니다.");
      }

     await updateReadingProgressAndSync({
  bookName: oracleBook.이름, // ✅ title 또는 이름
  page,
});


      return res.json({
        message: `📘 Oracle 책갈피만 업데이트 완료 (📖 ${page}쪽)`,
      });
    }

    // 5. 도서 기록도 책갈피도 없는 경우
    return res.status(400).json({
      error: "도서 기록과 책갈피 모두 없어 저장할 수 없습니다.",
    });
  } catch (err: any) {
    console.error("❌ 감상 저장 실패:", err.message || err);
    res.status(500).json({
      error: "감상 저장 실패",
      details: err.message,
    });
  }
});



app.post("/reading-plan", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "message is required" });

    // 1. 챗봇으로부터 도서명과 기간 추출
    const { title, days } = await parseReadingPlan(message);

    // 2. Oracle DB에서 책 조회
    const book = await getBookFromOracleByTitle(title);
    if (!book) throw new Error(`Oracle에서 "${title}" 책을 찾을 수 없습니다.`);

    // 3. 날짜 계산
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + (days - 1) * 86400000);
    const isoStart = startDate.toISOString().split("T")[0];
    const isoEnd = endDate.toISOString().split("T")[0];

    // 4. Oracle에 독서 계획 저장
    await insertReadingPlan({
      bookId: book.bookId,
      startDate: isoStart,
      endDate: isoEnd,
      intervalDays: 1, // 매일 1일차~n일차 (필요시 사용자 입력값에서 조정 가능)
    });

      // 5. 🔁 Oracle에서 방금 저장한 독서 계획 + 책 정보 다시 조회
    const planRow = await getReadingPlanWithBookInfoByTitle(title);
    if (!planRow) throw new Error(`📛 Oracle에서 독서 계획 정보를 가져올 수 없습니다.`);

    // 6. 🔎 Notion 책장에서 해당 책 page_id 찾기
    const bookPageId = await findBookPageIdByTitle(planRow.TITLE);
    if (!bookPageId) throw new Error(`📛 Notion에서 "${planRow.TITLE}" 페이지를 찾을 수 없습니다.`);

    // 7. 📝 Notion에 독서 캘린더 일정 생성
    await createReadingScheduleInNotion({
      title: planRow.TITLE,
      author: planRow.AUTHOR,
      total_pages: planRow.TOTAL_PAGES,
      start_date: formatDate(planRow.START_DATE),
      end_date: formatDate(planRow.END_DATE),
      days: calculateDays(planRow.START_DATE, planRow.END_DATE),
      bookPageId,
    });

    // 8. ✅ 응답
    res.json({
      message: `✅ Oracle + Notion에 독서 계획이 등록되었습니다.`,
      book: planRow.TITLE,
      start: formatDate(planRow.START_DATE),
      end: formatDate(planRow.END_DATE),
    });
  } catch (err: any) {
    console.error("❌ 독서 계획 저장 실패:", err.message || err);
    res.status(500).json({ error: err.message || "서버 오류 발생" });
  }
});

function formatDate(date: Date | string): string {
  return new Date(date).toISOString().split("T")[0];
}
function calculateDays(start: Date | string, end: Date | string): number {
  const s = new Date(start);
  const e = new Date(end);
  return Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}



// 🔍 명령 분류
function getIntentFromPrompt(prompt: string): "register" | "recommend" | "unknown" {
  const lowered = prompt.toLowerCase();
  if (lowered.includes("추천")) return "recommend";
  if (lowered.includes("등록")) return "register";
  return "unknown";
}

// 🚀 서버 시작
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ 서버 실행 중: http://localhost:${PORT}`);
});
