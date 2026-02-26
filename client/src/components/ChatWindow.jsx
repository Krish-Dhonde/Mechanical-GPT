import { useState, useEffect, useRef } from "react";
import { useChatStore } from "../store/useChatStore";
import axios from "../api/axios";
import { v4 as uuidv4 } from "uuid";
import ImageUploader from "./ImageUploader";

const UserAvatar = () => (
  <div
    style={{
      width: 30,
      height: 30,
      borderRadius: "50%",
      background: "linear-gradient(135deg, #ff6b00, #ff8c38)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      fontSize: 13,
      color: "white",
      fontWeight: 700,
      fontFamily: "Outfit, sans-serif",
    }}
  >
    U
  </div>
);

const BotAvatar = () => (
  <div
    style={{
      width: 30,
      height: 30,
      borderRadius: "50%",
      background: "linear-gradient(135deg, #1e293b, #334155)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    }}
  >
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#ff6b00"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
    </svg>
  </div>
);

export default function ChatWindow() {
  const {
    operationType,
    subOperation,
    inputs,
    messages,
    addMessage,
    setResult,
    loading,
    setLoading,
    sessionId,
  } = useChatStore();

  const [prompt, setPrompt] = useState("");
  const bottomRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async () => {
    if (!prompt.trim()) return;

    const currentPrompt = prompt;
    addMessage({ role: "user", content: currentPrompt });
    setPrompt("");
    setLoading(true);

    try {
      const response = await axios.post("/chat", {
        sessionId,
        operationType,
        subOperation,
        userPrompt: currentPrompt,
        inputs,
        image: inputs.image || null,
      });

      const data = response.data;
      addMessage({ role: "assistant", content: data.aiExplanation });
      if (data.status === "success") setResult(data);

      // Update sidebar history after a successful message which saves the chat
      useChatStore.getState().fetchChats();
    } catch (error) {
      console.error(error);
      const msg =
        error?.response?.data?.message ||
        "Error processing request. Please try again.";
      addMessage({ role: "assistant", content: msg });
    }

    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (prompt.trim() && !loading) handleSend();
    }
  };

  const [status, setStatus] = useState("Planning...");
  useEffect(() => {
    let interval;
    if (loading) {
      const statuses = [
        "Planning...",
        "Identifying Material Constants...",
        "Calculating Forces...",
        "Simulating Operation...",
        "Estimating Costs...",
        "Running Safety Algorithms...",
        "Analyzing Machine Capacity...",
        "Generating AI Insights...",
        "Finalizing Results...",
      ];
      let i = 0;
      setStatus(statuses[0]);
      interval = setInterval(() => {
        i = (i + 1) % statuses.length;
        setStatus(statuses[i]);
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [loading]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "#f8fafc",
      }}
    >
      {/* ── Chat History ── */}
      <div
        className="scrollbar-hide"
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "20px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {messages.length === 0 && (
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--steel-gray)",
              textAlign: "center",
              gap: 10,
              opacity: 0.6,
              paddingBottom: 40,
            }}
          >
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <p style={{ fontSize: 14, margin: 0 }}>
              Select an operation and start your analysis
            </p>
          </div>
        )}

        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              gap: 10,
              flexDirection: msg.role === "user" ? "row-reverse" : "row",
              alignItems: "flex-end",
            }}
          >
            {msg.role === "user" ? <UserAvatar /> : <BotAvatar />}
            <div
              className={
                msg.role === "user"
                  ? "chat-bubble-user"
                  : "chat-bubble-assistant"
              }
            >
              {msg.content}
              {msg.image && (
                <div style={{ marginTop: 10 }}>
                  <img
                    src={msg.image}
                    alt="uploaded"
                    style={{
                      maxWidth: 200,
                      borderRadius: 8,
                      border: "1px solid rgba(255,255,255,0.2)",
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
            <BotAvatar />
            <div className="typing-indicator">
              <div className="typing-dots">
                <div className="typing-dot" />
                <div className="typing-dot" />
                <div className="typing-dot" />
              </div>
              <span
                style={{
                  fontSize: 12,
                  color: "var(--steel-gray)",
                  fontWeight: 500,
                }}
              >
                {status}
              </span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Validation Hints ── */}
      <div style={{ padding: "0 16px" }}>
        {(!operationType || !subOperation) && (
          <p
            style={{
              fontSize: 12,
              color: "#94a3b8",
              margin: "0 0 6px",
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            <span>💡</span> Select an operation above to run simulations — or
            just ask me anything about mechanical engineering!
          </p>
        )}
      </div>

      {/* ── Input Area ── */}
      <div
        style={{
          borderTop: "1px solid var(--border-gray)",
          padding: "12px 16px",
          display: "flex",
          gap: 10,
          alignItems: "center",
          background: "white",
        }}
      >
        <ImageUploader />

        <input
          type="text"
          style={{
            flex: 1,
            padding: "10px 14px",
            border: "1.5px solid var(--border-gray)",
            borderRadius: 10,
            fontSize: 14,
            fontFamily: "Inter, sans-serif",
            color: "var(--text-primary)",
            outline: "none",
            transition: "border-color 0.2s, box-shadow 0.2s",
          }}
          placeholder="Ask me anything about mechanical engineering..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={(e) => {
            e.target.style.borderColor = "var(--spark-orange)";
            e.target.style.boxShadow = "0 0 0 3px var(--spark-orange-glow)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "var(--border-gray)";
            e.target.style.boxShadow = "none";
          }}
        />

        <button
          onClick={handleSend}
          disabled={!prompt.trim() || loading}
          style={{
            padding: "10px 20px",
            borderRadius: 10,
            border: "none",
            fontFamily: "Outfit, sans-serif",
            fontWeight: 600,
            fontSize: 14,
            cursor: prompt.trim() && !loading ? "pointer" : "not-allowed",
            background:
              prompt.trim() && !loading
                ? "linear-gradient(135deg, #ff6b00, #ff8c38)"
                : "#e2e8f0",
            color: prompt.trim() && !loading ? "white" : "#94a3b8",
            transition: "all 0.2s",
            display: "flex",
            alignItems: "center",
            gap: 6,
            flexShrink: 0,
          }}
        >
          {loading ? (
            "Processing..."
          ) : (
            <>
              Send
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m22 2-7 20-4-9-9-4 20-7z" />
                <path d="M22 2 11 13" />
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
