import OperationSelector from "../components/OperationSelector";
import DynamicInputs from "../components/DynamicInputs";
import ChatWindow from "../components/ChatWindow";
import ResultPanel from "../components/ResultPanel";
import ChatSidebar from "../components/ChatSidebar";
import { useChatStore } from "../store/useChatStore";

export default function ChatPage() {
  const { operationType, subOperation } = useChatStore();

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        background: "var(--bg-light)",
        overflow: "hidden",
      }}
    >
      {/* ── Chat Sidebar ── */}
      <ChatSidebar />

      {/* ── Main Content Area ── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
      >
        {/* ── Top Navigation Bar ── */}
        <header className="top-bar">
          <div className="top-bar-logo">
            <svg
              width="20"
              height="20"
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
            Mechanical <span>GPT</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {operationType && subOperation ? (
              <span
                style={{
                  fontSize: 12,
                  color: "#94a3b8",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 8,
                  padding: "4px 10px",
                  fontFamily: "Outfit, sans-serif",
                }}
              >
                {operationType} → {subOperation}
              </span>
            ) : (
              <span style={{ fontSize: 12, color: "#475569" }}>
                No operation selected
              </span>
            )}
          </div>
        </header>

        {/* ── Controls Panel ── */}
        <div className="controls-panel">
          <OperationSelector />
          {subOperation && (
            <div style={{ animation: "slideDown 0.22s ease-out forwards" }}>
              <DynamicInputs />
            </div>
          )}
        </div>

        {/* ── Split Layout ── */}
        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          {/* Left — Chat */}
          <div
            style={{
              width: "58%",
              borderRight: "1px solid var(--border-gray)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <ChatWindow />
          </div>

          {/* Right — Results */}
          <div
            style={{
              width: "42%",
              background: "#f8fafc",
              padding: "16px",
              overflowY: "auto",
            }}
          >
            <ResultPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
