import React, { useState } from "react";
import axios from "axios";

interface Message {
  id: number;
  role: "user" | "bot";
  content: string;
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([// 초기 환영 메시지 추가
    {
      id: 1,
      role: "bot",
      content:
        "안녕하세요! 저는 당신의 독서 생활을 도와주는 챗봇입니다. 무엇을 도와드릴까요?\n\n더 자세한 것을 원하시면 '도움말'을 입력해주세요.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg: Message = { id: Date.now(), role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      // 백엔드 agentica 엔드포인트로 단일 요청
      const res = await axios.post("http://localhost:3001/agent/chat", { prompt: input });

      // 백엔드 응답 구조에 맞게 수정
      const operationName = res.data.operation; // 호출된 함수명: "addBook", "chat" 등
      const functionResult = res.data.value; // 함수 반환값: addBook의 경우 Notion 데이터, chat의 경우 텍스트
      const summary = res.data.summary; // 함수 호출에 대한 요약

      let botContent = "";

      switch (operationName) {
        case "addBook":
          // addBook 함수는 객체를 반환하므로, 그 객체에서 필요한 정보를 추출
          botContent = `✅ "${functionResult?.title || "제목 없음"}" 등록 완료!\n📘 Notion: ${functionResult?.notionPage?.url ?? "없음"}`;
          break;
        case "updateBook":
          // updateBook 함수도 객체를 반환
          botContent = `🔄 ${functionResult?.message || "업데이트 완료!"}`;
          break;
        case "createReadingPlan":
          // createReadingPlan 함수도 객체를 반환
          botContent = `📅 독서 일정 등록 완료!\n${functionResult?.title ?? ""}: ${functionResult?.start ?? ""} ~ ${functionResult?.end ?? ""}`;
          break;
        case "recommendBooks":
          // recommendBooks 함수도 객체를 반환
          botContent = `📚 ${functionResult?.message || "추천 도서 등록 완료!"}`;
          break;
        case "updateReadingProgress":
          // updateReadingProgress 함수도 객체를 반환
          botContent = `🔖 ${functionResult?.message || "진행도 업데이트 완료!"}`;
          break;
        case "chat":
          // chat 함수의 반환값은 텍스트 그 자체입니다.
          botContent = functionResult || "🤖 응답이 없습니다.";
          break;
        default:
          // 어떤 함수도 호출되지 않았을 때의 응답 (예: Agentica가 직접 응답을 생성한 경우)
          botContent = summary || "🤖 응답이 없습니다.";
      }

      const botMsg: Message = {
        id: Date.now() + 1,
        role: "bot",
        content: botContent,
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (e: any) {
      const errMsg: Message = {
        id: Date.now() + 2,
        role: "bot",
        content: "❌ 오류: " + (e.message || "알 수 없는 오류"),
      };
      setMessages((prev) => [...prev, errMsg]);
    }

    setLoading(false);
  };

  return (
    <div
      style={{
        maxWidth: 600,
        margin: "2rem auto",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1>Notion Book Logger with Gemini</h1>

      {/* 메시지 표시 영역 */}
      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: 8,
          padding: "1rem",
          height: 400,
          overflowY: "auto",
          backgroundColor: "#f9f9f9",
        }}
      >
        {messages.map(({ id, role, content }) => (
          <div
            key={id}
            style={{
              textAlign: role === "user" ? "right" : "left",
              margin: "0.5rem 0",
            }}
          >
            <div
              style={{
                display: "inline-block",
                padding: "0.5rem 1rem",
                borderRadius: 20,
                backgroundColor: role === "user" ? "#007bff" : "#e1e1e1",
                color: role === "user" ? "white" : "black",
                whiteSpace: "pre-wrap",
                maxWidth: "80%",
              }}
            >
              {content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ fontStyle: "italic", color: "#666", marginTop: 10 }}>
            작성 중...
          </div>
        )}
      </div>

      {/* 입력창 + 전송 버튼 */}
      <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem" }}>
        <input
          type="text"
          placeholder="예: 데미안 등록해줘"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{
            flexGrow: 1,
            padding: "0.75rem",
            fontSize: "1rem",
            borderRadius: 6,
            border: "1px solid #ccc",
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !loading) sendMessage();
          }}
          disabled={loading}
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          style={{
            padding: "0.75rem 1.5rem",
            fontSize: "1rem",
            borderRadius: 6,
            border: "none",
            backgroundColor: loading ? "#ccc" : "#007bff",
            color: "white",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          전송
        </button>
      </div>
    </div>
  );
}