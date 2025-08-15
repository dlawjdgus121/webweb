import { askOpenAI, askOpenAIJson } from "../../utils/openaiClient.ts";

/**
 * 📌 책 제목 추출
 * - 모호하거나 불완전한 문장에서도 최대한 제목을 유추
 * - 확실하지 않으면 후보와 신뢰도를 함께 반환
 */
export async function getBookTitleFromText(input: string) {
  const prompt = `
다음 문장에서 책 제목을 추출하세요.
- 제목은 한글로 정확히 표기합니다.
- 표기나 맞춤법이 다르면 보정합니다.
- 확실하지 않으면 유사 후보를 1~3개까지 제시하고 신뢰도를 함께 반환합니다.
출력 형식:
{
  "main_title": "정확한 책 제목",
  "alternatives": ["후보1", "후보2"],
  "confidence": 0.0 ~ 1.0
}
문장: "${input}"
  `;
  return await askOpenAIJson(prompt);
}

/**
 * 📌 책 메타데이터 추출
 * - 제목, 저자, 출판사, 출판일, 장르
 * - 누락된 값은 가능한 범위에서 추론
 */
export async function extractBookProperties(text: string) {
  const prompt = `
다음 텍스트에서 책 정보를 추출하세요.
필수 항목: 제목, 저자, 출판사, 출판일(YYYY-MM-DD), 장르
누락된 값은 가능한 범위에서 추론하고, 모르면 null로 표시합니다.
출력 형식:
{
  "title": "",
  "author": "",
  "publisher": "",
  "publishedDate": "",
  "genre": ""
}
텍스트:
${text}
  `;
  return await askOpenAIJson(prompt);
}

/**
 * 📌 자유 질의응답
 * - 독서/책 관련 질문에 자유롭게 답변
 */
export async function askAboutBooksFree(question: string) {
  return await askOpenAI(question);
}

/**
 * 📌 리뷰 기반 추천 도서 생성
 * - 입력된 리뷰 내용과 비슷한 장르/스타일 책 3권 추천
 */
export async function getRecommendedBooksByReview(review: string) {
  const prompt = `
다음 리뷰를 기반으로 비슷한 장르나 분위기의 책 3권을 추천하세요.
출력 형식:
{
  "recommendations": ["책 제목1", "책 제목2", "책 제목3"]
}
리뷰:
${review}
  `;
  return await askOpenAIJson(prompt);
}
