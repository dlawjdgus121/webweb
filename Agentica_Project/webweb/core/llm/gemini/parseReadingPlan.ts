// backend/gemini/parseReadingPlan.ts
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function parseReadingPlan(userInput: string) {
  const prompt = `
다음 문장을 분석해서 아래 JSON 형식으로 응답해.
형식은 꼭 JSON만 반환해. 설명하지 마.

입력 예시:
"난 동물농장을 10일 동안 읽을 거야"

출력 예시:
{
  "title": "동물농장",
  "days": 10
}
입력:
"${userInput}"
`;

  const model = genAI.getGenerativeModel({ model: 'models/gemini-2.5-pro' });

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  try {
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}') + 1;
    const jsonString = text.slice(jsonStart, jsonEnd);

    const parsed = JSON.parse(jsonString);
    return parsed;
  } catch (error) {
    console.error('❌ Gemini 응답 파싱 실패:', error);
    throw new Error('Gemini 응답 파싱에 실패했습니다.');
  }
}
