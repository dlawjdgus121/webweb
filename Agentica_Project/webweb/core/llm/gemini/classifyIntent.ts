// classifyIntent.ts
import axios from "axios";
import { retryWithBackoff } from "../../utils/retry.ts";


export async function classifyIntent(prompt: string): Promise<
  "register" | "recommend" | "plan" | "update" | "smalltalk" | "unknown"
> {
  const apiKey = process.env.GEMINI_API_KEY!;
  const model = "models/gemini-2.5-pro";
  const url = `https://generativelanguage.googleapis.com/v1beta/${model}:generateContent?key=${apiKey}`;

  const systemPrompt = `
다음 문장의 의도를 분류해줘. 반드시 아래 중 하나만 반환해:
- register: 책 등록
- recommend: 책 추천
- plan: 독서 일정 생성
- update: 진도 기록/업데이트
- smalltalk: 인사, 잡담
- unknown: 해당 없음

문장: "${prompt}"
※ Return only one of the above categories.
`;

  const body = {
    contents: [{ role: "user", parts: [{ text: systemPrompt }] }],
  };

  const headers = { "Content-Type": "application/json" };

try {
    // 🔧 retry/backoff 적용
    const res = await retryWithBackoff(() => axios.post(url, body, { headers }));

    const output = res.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim().toLowerCase();

    if (!output) {
      console.warn("⚠️ classifyIntent 결과 없음 → unknown 처리");
      return "unknown";
    }

    const valid = ["register", "recommend", "plan", "update", "smalltalk", "unknown"];
    if (!valid.includes(output)) {
      console.warn("⚠️ classifyIntent 잘못된 응답:", output, "→ unknown 처리");
      return "unknown";
    }

    return output as any;
  } catch (err) {
    console.error("❌ classifyIntent 호출 실패:", err);
    return "unknown"; // 실패 시 절대 위험한 intent 반환 안 함
  }
}
