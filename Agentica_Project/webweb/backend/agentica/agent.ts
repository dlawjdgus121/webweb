import { Agentica } from "@agentica/core";
import OpenAI from "openai";
import typia from "typia";
import { BookAgentService } from "./BookAgentService.ts";

export function createAgent() {
  return new Agentica<"chatgpt">({
    model: "chatgpt",
    vendor: {
      api: new OpenAI({ apiKey: process.env.OPENAI_API_KEY! }),
      model: "gpt-4o-mini",
    },
    controllers: [
      {
        protocol: "class",
        name: "book",
        application: typia.llm.application<BookAgentService, "chatgpt">(),
        execute: new BookAgentService(),
      },
    ],
    config: {
      systemPrompt: {
        common: () => [
          "너는 독서 도우미다.",
          "사용자의 문맥에서 의도를 파악해 적절한 함수를 선택해 호출해라.",
          "반드시 타입에 맞는 인자를 채워라.",
        ].join("\n"),
      },
      locale: "ko-KR",
      timezone: "Asia/Seoul",
      retry: 3,
    },
  });
}
