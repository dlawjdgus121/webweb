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
           "책을 등록하라고 하면 registerBook 함수를 호출해라.",
           "책 추천을 원하면 recommendBooks 함수를 호출해라.",
           "감상문 업데이트를 원하면 updateBook 함수를 호출해라",
           "반드시 타입에 맞는 인자를 채워라.",
        ].join("\n"),
      },
      locale: "ko-KR",
      timezone: "Asia/Seoul",
      retry: 3,
      
    // 토큰 최적화 (타입스크립트 타입 무시)
      // @ts-expect-error: Agentica 타입에 beforeSend 없음
      beforeSend: (messages) => {
        // 최근 5개의 대화만 유지
        const shortHistory = messages.slice(-5);

        return shortHistory.map((msg) => {
          // 긴 감상문(user 입력)은 5000자까지 허용
          if (msg.role === "user" && msg.content.length > 5000) {
            msg.content = msg.content.slice(0, 5000) + "...(생략)";
          }

          // system / assistant 메시지는 2000자 제한
          if (
            (msg.role === "system" || msg.role === "assistant") &&
            msg.content.length > 2000
          ) {
            msg.content = msg.content.slice(0, 2000) + "...(생략)";
          }

          return msg;
        });
      },
    },
  });
}