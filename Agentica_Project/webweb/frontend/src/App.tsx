import React from "react";
import { useState } from "react";
import { addBook, updateBook, createReadingPlan } from "./api";

interface Message {
  id: number;
  role: "user" | "bot";
  content: string;
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastPageId, setLastPageId] = useState<string | null>(null);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg: Message = { id: Date.now(), role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      // 독서 일정 관련 문장 감지 (필요시 정교하게 조정 가능)
      if (/(\d+)\s*일\s*동안|읽을\s*거야|독서\s*계획/.test(input)) {
        const res = await createReadingPlan(input);
        const botMsg: Message = {
          id: Date.now() + 1,
          role: "bot",
          content: `📅 독서 일정 등록 완료!\n${res.message}`,
        };
        setMessages((prev) => [...prev, botMsg]);
      } else if (
        lastPageId &&
        /읽는 중|완료|진행률|쪽|장르|책갈피/.test(input)
      ) {
        // 책 속성 수정 요청
        const res = await updateBook(lastPageId, input);
        const botMsg: Message = {
          id: Date.now() + 1,
          role: "bot",
          content: `🔄 속성 업데이트 완료!\n📘 Notion: ${
            res.notionRes?.url ?? "없음"
          }`,
        };
        setMessages((prev) => [...prev, botMsg]);
      } else {
        // 책 등록 요청
const res = await addBook(input);

const notionUrl = res.notionPage?.url || "없음";
const title = res.bookInfo?.이름 || res.bookInfo?.title || "제목 없음";

const botMsg: Message = {
  id: Date.now() + 1,
  role: "bot",
  content: `✅ "${title}" 등록 완료!\n📘 Notion: ${notionUrl}`,
};

setMessages((prev) => [...prev, botMsg]);
setLastPageId(res.notionPage?.id ?? null);
      }
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
            등록 중...
          </div>
        )}
      </div>

      <div
        style={{ marginTop: "1rem", display: "flex", gap: "0.5rem" }}
      >
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
