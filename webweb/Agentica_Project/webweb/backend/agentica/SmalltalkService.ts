// 📄 SmalltalkService.ts
import { askOpenAI } from "../../core/utils/openaiClient.ts";

export class SmalltalkService {
  async chat({ message }: { message: string }): Promise<string> {
    // 'message' 속성의 값만 구조분해 할당으로 추출
    // 사용자가 '도움말'을 요청했을 경우
    return await askOpenAI(message, "gpt-4o-mini");
  }

  // ⭐ '도움말' 전용 메서드 추가
  async getHelp(): Promise<string> {
    console.log("📌 [SmalltalkService] getHelp 호출됨");
    const helpMessage = [
      "🤖 **도움말**",
      "저는 당신의 독서 생활을 도와주는 챗봇입니다.",
      "",
      "아래 기능들을 사용해 보세요:",
      "",
      "1. 책 등록",
      " - 사용법: `[책 제목]을 읽을래` 또는 `[책 제목] 등록해줘`",
      " - 예시: `데미안 등록해줘`, `동물농장 읽을래`",
      "",
      "2. 독서 계획",
      " - 사용법: `[책 제목]을 하루에 [페이지]페이지씩 [기간]동안 읽을거야`",
      " - 예시: `어린 왕자를 하루에 10페이지씩 7일 동안 읽을거야`",
      "",
      "3. 진행도 업데이트",
      " - 사용법: `[책 제목] [현재 페이지]페이지까지 읽었어`",
      " - 예시: `데미안 50페이지까지 읽었어`",
      "",
    ].join("\n");
    return helpMessage;
  }
}
