// classifyIntent.ts
import axios from "axios";

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
※ 반드시 위 분류 중 하나만 텍스트로 반환하고, 설명하지 마!
`;

  const body = {
    contents: [{ role: "user", parts: [{ text: systemPrompt }] }],
  };

  const headers = { "Content-Type": "application/json" };

  const res = await axios.post(url, body, { headers });
  return res.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim().toLowerCase() as any;
}
