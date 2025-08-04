import axios from "axios";
import { uploadImageToCloud,getExistingShelfTitles,getCombinedTop3Reviews  } from "../../notion/notionUtils.ts";
import { fetchBookCover } from "../../functions/registerBook.ts";
import {getExistingRecommendedTitles, normalizeTitle} from "../../functions/recommendBook.ts"
import { response } from "express";



export const askGemini = async (input: string): Promise<string> => {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = "models/gemini-2.5-pro";
  const url = `https://generativelanguage.googleapis.com/v1beta/${model}:generateContent?key=${apiKey}`;

  const body = {
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `다음 문장에서 책 제목만 한글로 정확히 추출해줘. 예시는 포함하지 마. 오직 제목만 출력:\n"${input}"`,
          },
        ],
      },
    ],
  };

  const headers = {
    "Content-Type": "application/json",
  };

  try {
    const res = await axios.post(url, body, { headers });
    const output = res.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (
      !output ||
      output === "?" ||
      output.includes("다시 입력") ||
      output.length < 1
    ) {
      throw new Error("책 제목을 추출하지 못했습니다.");
    }

    return output.replace(/["']/g, "");
  } catch (error: any) {
    console.error("❌ Gemini API 호출 실패:", error.response?.data || error.message);
    throw new Error("Gemini 호출 실패");
  }

};

export const extractBookProperties = async (input: string): Promise<Record<string, any>> => {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = "models/gemini-2.5-pro";
  const url = `https://generativelanguage.googleapis.com/v1beta/${model}:generateContent?key=${apiKey}`;

  const prompt = `
다음 문장에서 도서 관련 속성들만 JSON으로 추출해줘.
가능한 속성:
- 상태 ("예정", "읽는 중", "완료")
- 진행률 (숫자)
- 책갈피 (텍스트, 예: "15쪽" 또는 "15페이지")
- 총 페이지 (숫자)
- 장르 (텍스트)
- 도서 기록 (텍스트, 감상/리뷰/느낀점 등과, 페이지 정보 포함 예시:"100쪽" )

책갈피와 도서 기록은 절대 중복되면 안 됩니다.


입력 문장: "${input}"
※ 다른 설명 없이 JSON만 출력해줘. 예시 금지.
`;

  const body = {
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ],
  };

  const headers = { "Content-Type": "application/json" };

  try {
    const res = await axios.post(url, body, { headers });
    const output = res.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!output || !output.includes("{")) {
      throw new Error("JSON 응답이 아닙니다.");
    }

    const jsonStart = output.indexOf("{");
    const jsonEnd = output.lastIndexOf("}");
    const jsonStr = output.slice(jsonStart, jsonEnd + 1);

    const parsed = JSON.parse(jsonStr);
    // 책갈피가 없고 기록 페이지가 있으면 책갈피 자동 생성
    if (parsed["기록 페이지"] !== undefined && !parsed["책갈피"]) {
      parsed["책갈피"] = `현재 ${parsed["기록 페이지"]}쪽까지 읽음`;
    }
    return parsed;
  } catch (err: any) {
    console.error("❌ Gemini 속성 추출 실패:", err.response?.data || err.message);
    throw new Error("속성 추출 실패");
  }
};


//자유대화
export const askGeminiFree = async (input: string): Promise<string> => {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = "models/gemini-2.5-pro";
  const url = `https://generativelanguage.googleapis.com/v1beta/${model}:generateContent?key=${apiKey}`;

  const body = {
    contents: [
      {
        role: "user",
        parts: [{ text: input }],
      },
    ],
  };

  const headers = { "Content-Type": "application/json" };

  try {
    const res = await axios.post(url, body, { headers });
    const output = res.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!output) throw new Error("응답이 없습니다.");
    return output;
  } catch (err: any) {
    console.error("❌ 자유 대화 Gemini 실패:", err.response?.data || err.message);
    throw new Error("자유 대화 실패");
  }
};



//도서추천

interface RecommendedBook {
  author: string;
  title: string;
  description: string;
  reason:string;
  imageUrl: string;
}



//프롬프트 강화 필요 "좋아할만한은 애매함"
export const getRecommendedBooksByReview = async (): Promise<RecommendedBook[]> => {
  const review = await getCombinedTop3Reviews(); // ✅ 여기서 감상문 3개 가져옴
  const existingTitles = await getExistingRecommendedTitles();
  const shelfTitles = await getExistingShelfTitles();
  const finalList: RecommendedBook[] = [];
  const alreadySeenTitles = new Set<string>();

  const apiKey = process.env.GEMINI_API_KEY!;
  const model = "models/gemini-2.5-pro";
  const url = `https://generativelanguage.googleapis.com/v1beta/${model}:generateContent?key=${apiKey}`;
  const headers = { "Content-Type": "application/json" };

  console.log("📥 추천 도서 목록을 Notion에서 가져옵니다...");

  while (finalList.length < 3) {
    const prompt = `
다음은 사용자의 독서 감상문입니다:

---
${review}
---

이 감상문을 분석하여 다음 요소를 파악해주세요:
1. 감상문에서 드러난 **감정, 주제, 인물관점, 문체 선호** 등을 분석할 것  
2. 단순한 책 소개가 아닌, **왜 이 책이 감상문과 연결되는지**를 설명할 것
반드시 감정, 주제, 인물 등을 감상문에서 먼저 분석한 뒤, 그에 맞춰 추천해주세요. 예시는 포함하지 마세요.
형식은 반드시 지킬 것. 예시는 넣지 마세요. 일반 설명도 없이 JSON만 출력하세요.
단, 반드시 Google Books에 표지가 등록된 책만 추천하고,
다음 목록에 있는 책은 추천에서 제외해주세요:

✅ 이미 추천된 도서:
${Array.from(existingTitles).join(", ")}

✅ 사용자가 읽은 도서(책장):
${Array.from(shelfTitles).join(", ")}

형식:
[
  {
    "title": "책 제목",
    "author": "책 저자",
    "description": "왜 이 책이 적절한 추천인지에 대한 간단한 설명",
    "reason": "사용자의 감상문과 어떤 부분이 연결되는지 상세하게 설명"
  }
]
※ 예시 금지
`;

    const body = {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    };

    try {
      const res = await axios.post(url, body, { headers });
      const output = res.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      const jsonStr = output.slice(output.indexOf("["), output.lastIndexOf("]") + 1);
      const rawList: any[] = JSON.parse(jsonStr);

      for (const item of rawList) {
        const title = item.title?.trim();
        if (!title) {
          console.warn("❗ title이 비어있음:", item);
          continue;
        }

        const author = item.author?.trim();
        const description = item.description?.trim();
        const normalizedTitle = normalizeTitle(title);

        if (
          !normalizedTitle ||
          existingTitles.has(normalizedTitle) ||
          shelfTitles.has(normalizedTitle) ||
          alreadySeenTitles.has(normalizedTitle)
        ) {
          continue;
        }

        alreadySeenTitles.add(normalizedTitle);

        try {
          const thumbnail = await fetchBookCover(title, author);
          if (!thumbnail) continue;

          const uploadedUrl = await uploadImageToCloud(thumbnail, title);
          const reason = item.reason?.trim() ?? "추천 이유가 제공되지 않았습니다.";

          finalList.push({ title, author, description, reason, imageUrl: uploadedUrl });

          if (finalList.length === 3) break;
        } catch (err) {
          console.warn("⚠️ 썸네일 처리 중 오류:", err);
        }
      }
    } catch (err) {
      console.error("❌ Gemini 호출 실패:", err);
      break;
    }
  }

  console.log("✅ 최종 추천 리스트:", finalList);
  return finalList;
};