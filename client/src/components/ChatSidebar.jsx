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
          top: "20px",
          width: "24px",
          height: "24px",
          borderRadius: "50%",
          background: "#ff6b00",
          color: "white",
          border: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
          zIndex: 11,
          transition: "transform 0.2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        {isOpen ? <FiChevronLeft size={14} /> : <FiChevronRight size={14} />}
      </button>

      {isOpen && (
        <div
          style={{
            padding: "12px",
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
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
              color: "white",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              marginBottom: "20px",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,107,0,0.1)";
              e.currentTarget.style.borderColor = "rgba(255,107,0,0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.05)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
            }}
          >
            <FiPlus size={18} /> New Calculation
          </button>

          {/* History List */}
          <div
            style={{ flex: 1, overflowY: "auto" }}
            className="scrollbar-hide"
          >
            <div
              style={{
                fontSize: "11px",
                color: "#64748b",
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: "12px",
                paddingLeft: "8px",
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
                  color: chat.sessionId === sessionId ? "#ff8c38" : "#cbd5e1",
                  transition: "all 0.2s",
                  position: "relative",
                  group: "true",
                }}
                onClick={() => loadChat(chat.sessionId)}
                onMouseEnter={(e) => {
                  if (chat.sessionId !== sessionId)
                    e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                  const delBtn = e.currentTarget.querySelector(".delete-btn");
                  if (delBtn) delBtn.style.opacity = "1";
                }}
                onMouseLeave={(e) => {
                  if (chat.sessionId !== sessionId)
                    e.currentTarget.style.background = "transparent";
                  const delBtn = e.currentTarget.querySelector(".delete-btn");
                  if (delBtn) delBtn.style.opacity = "0";
                }}
              >
                <FiMessageSquare size={16} style={{ flexShrink: 0 }} />
                <div
                  style={{
                    flex: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    fontSize: "13.5px",
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
                    color: "#64748b",
                    cursor: "pointer",
                    padding: "4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: 0,
                    transition: "opacity 0.2s, color 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "#ef4444")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "#64748b")
                  }
                >
                  <FiTrash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          {/* User Profile / Status */}
          <div
            style={{
              marginTop: "auto",
              paddingTop: "12px",
              borderTop: "1px solid rgba(255,255,255,0.05)",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: "linear-gradient(135deg, #ff6b00, #ff8c38)",
                display: "flex",
                alignItems: "center",
                justifyCenter: "center",
                fontWeight: "700",
                fontSize: "14px",
              }}
            >
              M
            </div>
            <div style={{ flex: 1, fontSize: "13px", color: "#94a3b8" }}>
              Mechanical User
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
