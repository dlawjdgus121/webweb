import { Agentica } from "@agentica/core";
import OpenAI from "openai";
import { BookAgentService } from "./BookAgentService.ts";
import { SmalltalkService } from "./SmalltalkService.ts";

function bookApplication(): any {
  return {
    model: "chatgpt",
    errors: [],
    functions: [
      {
        name: "addBook",
        description: "새 책 등록",
        parameters: {
          type: "object",
          properties: {
            prompt: { type: "string" }
          },
          required: ["prompt"]
        },
        validate: (args: any) => {
          if (!args || typeof args.prompt !== "string") {
            throw new Error("prompt는 문자열이어야 합니다.");
          }
          return true;
        }
      },
      {
        name: "updateBook",
        description: "책 속성/감상 업데이트",
        parameters: {
          type: "object",
          properties: {
            userInput: { type: "string" }
          },
          required: ["userInput"]
        },
        validate: (args: any) => {
          if (!args || typeof args.userInput !== "string") {
            throw new Error("userInput은 문자열이어야 합니다.");
          }
          return true;
        }
      },
      {
        name: "createReadingPlan",
        description: "독서 계획 생성",
        parameters: {
          type: "object",
          properties: {
            message: { type: "string" }
          },
          required: ["message"]
        },
        validate: (args: any) => {
          if (!args || typeof args.message !== "string") {
            throw new Error("message는 문자열이어야 합니다.");
          }
          return true;
        }
      },
      {
        name: "recommendBooks",
        description: "리뷰/프롬프트 기반 추천",
        parameters: {
          type: "object",
          properties: {
            prompt: { type: "string" },
            review: { type: "string" }
          }
        },
        validate: (args: any) => {
          if (!args) throw new Error("arguments는 필수입니다.");
          if (args.prompt && typeof args.prompt !== "string")
            throw new Error("prompt는 문자열이어야 합니다.");
          if (args.review && typeof args.review !== "string")
            throw new Error("review는 문자열이어야 합니다.");
          return true;
        }
      },
      {
        name: "updateReadingProgress",
        description: "진행도 업데이트",
        parameters: {
          type: "object",
          properties: {
            bookName: { type: "string" },
            page: { type: "number" }
          },
          required: ["bookName", "page"]
        },
        validate: (args: any) => {
          if (!args || typeof args.bookName !== "string" || typeof args.page !== "number") {
            throw new Error("bookName은 문자열, page는 숫자여야 합니다.");
          }
          return true;
        }
      }
    ]
  };
}

function smalltalkApplication(): any {
  return {
    model: "chatgpt",
    errors: [],
    functions: [
      {
        name: "chat",
        description: "일반적인 잡담 처리",
        parameters: {
          type: "object",
          properties: {
            message: { type: "string" }
          },
          required: ["message"]
        },
        validate: (args: any) => {
          if (!args || typeof args.message !== "string") {
            throw new Error("message는 문자열이어야 합니다.");
          }
          return true;
        }
      }
    ]
  };
}

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
        name: "smalltalk",
        application: smalltalkApplication(),
        execute: new SmalltalkService(),
      },
      {
        protocol: "class",
        name: "book",
        application: bookApplication(),
        execute: new BookAgentService(),
      },
      
    ],
    config: {
      systemPrompt: {
        common: () => [
          "너는 'Agentica' 시스템에서 동작하는 독서 도우미이자 대화 상대야. 나는 너의 주 사용 언어를 한글로 지정해두었어.",
            "사용자의 요청을 듣고, 우선적으로 **'smalltalk'** 컨트롤러를 사용해 자연스러운 대화를 시도해줘.",
            "사용자가 책과 관련된 **구체적인 요청**(새 책 등록, 책 정보/감상 업데이트, 독서 계획 생성, 책 추천, 독서 진행도 업데이트 등)을 할 때만 **'book'** 컨트롤러의 함수를 호출해.",
            "만약 사용자의 요청이 구체적인 책 관련 작업이 아니라, 책에 대한 일반적인 이야기, 안부, 잡담 등이라면 절대로 book 컨트롤러 함수를 호출하지 않도록 주의해줘.",
            "[응답 모드 규칙]",
            "1) 함수 호출이 명확하면 JSON만 반환 (설명 금지)",
            "2) 일반 대화는 자연어로 정중하게 응답"
        ].join("\n"),
      },
      locale: "ko-KR",
      timezone: "Asia/Seoul",
      retry: 3,
    },
  });
}
