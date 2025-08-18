import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import "./App.css";

interface Message {
  id: number;
  role: "user" | "bot";
  content: string;
}

// 임시 Notion 링크
const TEMP_NOTION_URL = "https://glory-impala-26f.notion.site/2397e4fff35f8097bfdbd02dbbc40996?source=copy_link"; 

export default function App() {
  // 초기 환영 메시지
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "bot",
      content:
        "안녕하세요! 저는 당신의 독서 생활을 도와주는 챗봇입니다. 무엇을 도와드릴까요?\n\n더 자세한 것을 원하시면 '도움말'을 입력해주세요.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // UI 상태
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [notionUrl] = useState<string | null>(TEMP_NOTION_URL || null); // 코드 내 임시 지정만 사용
 // const [notionUrl, setNotionUrl] = useState<string | null>(null);

  // 채팅 영역 스크롤 컨테이너
  const containerRef = useRef<HTMLDivElement>(null);

  // 메시지/로딩 변경 시 자동으로 맨 아래로 스크롤
  useEffect(() => {
    containerRef.current?.scrollTo({
      top: containerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  const canSend = useMemo(
    () => input.trim().length > 0 && !loading,
    [input, loading]
  );

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
    <div className={`app-shell ${theme === "dark" ? "theme-dark" : "theme-light"}`}>
      {/* 상단 바 */}
      <header className="topbar">
        <div className="brand">ChatBook</div>

        <div className="theme-switch">
          <span id="themeLabel" className="visually-hidden">
            Theme
          </span>
          <button
            className={`theme-btn ${theme === "light" ? "active" : ""}`}
            aria-labelledby="themeLabel"
            onClick={() => setTheme("light")}
            type="button"
          >
            Light
          </button>
          <button
            className={`theme-btn ${theme === "dark" ? "active" : ""}`}
            aria-labelledby="themeLabel"
            onClick={() => setTheme("dark")}
            type="button"
          >
            Dark
          </button>

          {/* Notion: 임시 링크가 없으면 비활성화 */}
          <a
            className={`theme-btn notion-btn ${!notionUrl ? "is-disabled" : ""}`}
            href={notionUrl ?? "#"}
            target="_blank"
            rel="noreferrer"
            tabIndex={notionUrl ? 0 : -1}
            onClick={(e) => {
              if (!notionUrl) {
                e.preventDefault();
                e.stopPropagation();
              }
            }}
          >
            Notion
          </a>
        </div>
      </header>

      {/* 카드만 중앙 배치 (사이드바 없음) */}
      <div className="chat-wrap">
        <main className="chat-card">
          <div className="chat-log" ref={containerRef}>
            {messages.map(({ id, role, content }) => (
              <div key={id} className={`msg-row ${role === "user" ? "right" : "left"}`}>
                {role !== "user" && (
                  <img
                    src={theme === "light" ? "/bot-avatar-light.png" : "/bot-avatar-dark.png"}
                    alt="Bot"
                    className="chat-avatar"
                  />
                )}
                <div className={`msg-bubble ${role}`}>
                  <pre className="msg-text">{content}</pre>
                </div>
              </div>
            ))}
            {loading && (
              <div className="msg-row left">
                <img
                  src={theme === "light" ? "/bot-avatar-light.png" : "/bot-avatar-dark.png"}
                  alt="Bot"
                  className="chat-avatar"
                />
                <div className="msg-bubble bot">
                  <span className="loading-text">작성 중</span>
                  <span className="dot-typing" aria-hidden="true"></span>
                </div>
              </div>
            )}
          </div>

          <div className="composer">
            <label htmlFor="chatInput" className="visually-hidden">
              메시지 입력
            </label>
            <input
              id="chatInput"
              className="composer-input"
              type="text"
              placeholder='예: "데미안 등록해줘"'
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && canSend) sendMessage();
              }}
              disabled={loading}
            />
            <button
              className="composer-btn"
              onClick={sendMessage}
              disabled={!canSend}
              type="button"
            >
              전송
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
