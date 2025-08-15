// 📄 SmalltalkService.ts
import { askOpenAI } from "../../core/utils/openaiClient.ts";

export class SmalltalkService {
  async chat(message: string): Promise<string> {
    // OpenAI를 이용해 자유 대화 생성
    return await askOpenAI(message, "gpt-4o-mini");
  }
}
