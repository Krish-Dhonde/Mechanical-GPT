import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import {
  FiPlus,
  FiMessageSquare,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

export default function ChatSidebar() {
  const {
    chats,
    fetchChats,
    loadChat,
    createNewChat,
    handleDeleteChat,
    sessionId,
  } = useChatStore();
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  const handleNewChat = () => {
    createNewChat();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div
      style={{
        width: isOpen ? "260px" : "0px",
        height: "100%",
        background: "#0f172a", // Dark sidebar for contrast, or white for full light theme? ChatGPT uses dark.
        color: "#f8fafc",
        display: "flex",
        flexDirection: "column",
        transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        position: "relative",
        overflow: "visible",
        zIndex: 10,
        borderRight: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: "absolute",
          right: "-12px",
          top: "32px",
          width: "24px",
          height: "24px",
          borderRadius: "50%",
          background: "#ff6b00",
          color: "white",
          border: "1px solid rgba(255,255,255,0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          zIndex: 11,
          transition: "all 0.2s ease",
          padding: 0,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.1)";
          e.currentTarget.style.background = "#ff8c38";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.background = "#ff6b00";
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
          }}
        >
          {isOpen ? <FiChevronLeft size={16} /> : <FiChevronRight size={16} />}
        </div>
      </button>

      {isOpen && (
        <div
          style={{
            padding: "16px 12px",
            display: "flex",
            flexDirection: "column",
            height: "100%",
            overflow: "hidden",
          }}
        >
          {/* New Chat Button */}
          <button
            onClick={handleNewChat}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "12px 14px",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "10px",
              color: "white",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              marginBottom: "24px",
              transition: "all 0.2s",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,107,0,0.15)";
              e.currentTarget.style.borderColor = "rgba(255,107,0,0.35)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.03)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
            }}
          >
            <FiPlus size={18} style={{ color: "#ff6b00" }} /> New Calculation
          </button>

          {/* History List */}
          <div
            style={{ flex: 1, overflowY: "auto", paddingRight: "4px" }}
            className="scrollbar-hide"
          >
            <div
              style={{
                fontSize: "10px",
                color: "#64748b",
                fontWeight: "800",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: "14px",
                paddingLeft: "8px",
                opacity: 0.8,
              }}
            >
              Recent History
            </div>

            {chats.map((chat) => (
              <div
                key={chat.sessionId}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  marginBottom: "4px",
                  background:
                    chat.sessionId === sessionId
                      ? "rgba(255,107,0,0.15)"
                      : "transparent",
                  color: chat.sessionId === sessionId ? "#ff8c38" : "#94a3b8",
                  transition: "all 0.2s",
                  position: "relative",
                }}
                onClick={() => loadChat(chat.sessionId)}
                onMouseEnter={(e) => {
                  if (chat.sessionId !== sessionId) {
                    e.currentTarget.style.background = "rgba(255,255,255,0.02)";
                    e.currentTarget.style.color = "#cbd5e1";
                  }
                  const delBtn = e.currentTarget.querySelector(".delete-btn");
                  if (delBtn) delBtn.style.opacity = "1";
                }}
                onMouseLeave={(e) => {
                  if (chat.sessionId !== sessionId) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "#94a3b8";
                  }
                  const delBtn = e.currentTarget.querySelector(".delete-btn");
                  if (delBtn) delBtn.style.opacity = "0";
                }}
              >
                <FiMessageSquare
                  size={15}
                  style={{ flexShrink: 0, opacity: 0.7 }}
                />
                <div
                  style={{
                    flex: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    fontSize: "13px",
                    fontWeight: chat.sessionId === sessionId ? "600" : "400",
                  }}
                >
                  {chat.operationType
                    ? `${chat.operationType}: ${chat.subOperation}`
                    : "New Session"}
                </div>

                <button
                  className="delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteChat(chat.sessionId);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#475569",
                    cursor: "pointer",
                    padding: "4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: 0,
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "#ef4444")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "#475569")
                  }
                >
                  <FiTrash2 size={13} />
                </button>
              </div>
            ))}
          </div>

          {/* User Profile / Status */}
          <div
            style={{
              marginTop: "auto",
              paddingTop: "16px",
              borderTop: "1px solid rgba(255,255,255,0.08)",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #ff6b00, #ff8c38)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "800",
                fontSize: "15px",
                color: "white",
                boxShadow: "0 2px 6px rgba(255,107,0,0.3)",
              }}
            >
              M
            </div>
            <div style={{ flex: 1, overflow: "hidden" }}>
              <div
                style={{
                  fontSize: "13px",
                  color: "#f8fafc",
                  fontWeight: "600",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                Mechanical User
              </div>
              <div style={{ fontSize: "11px", color: "#64748b" }}>
                Premium Analytics
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
