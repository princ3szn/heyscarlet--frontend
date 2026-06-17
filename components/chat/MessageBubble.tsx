"use client";

import { motion } from "framer-motion";
import { TheLemniscate } from "@/components/ui/TheLemniscate";

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

function renderContent(text: string) {
  const lines = text.split("\n");
  return lines.map((line, li) => {
    const parts = line.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
    return (
      <span key={li}>
        {parts.map((part, pi) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return <strong key={pi} style={{ color: "#E8E0D5", fontWeight: 500 }}>{part.slice(2, -2)}</strong>;
          }
          if (part.startsWith("*") && part.endsWith("*")) {
            return <em key={pi} style={{ fontStyle: "italic", color: "#C0392B" }}>{part.slice(1, -1)}</em>;
          }
          if (part.startsWith("`") && part.endsWith("`")) {
            return (
              <code key={pi} style={{
                fontFamily: "monospace",
                fontSize: 12,
                background: "rgba(192,57,43,0.12)",
                border: "1px solid rgba(192,57,43,0.2)",
                borderRadius: 4,
                padding: "1px 5px",
                color: "#F5822A",
              }}>
                {part.slice(1, -1)}
              </code>
            );
          }
          return <span key={pi}>{part}</span>;
        })}
        {li < lines.length - 1 && <br />}
      </span>
    );
  });
}

function StreamingIndicator() {
  return (
    <motion.div
      animate={{
        filter: [
          "drop-shadow(0 0 8px rgba(192,57,43,0.4))",
          "drop-shadow(0 0 18px rgba(248,212,160,0.5))",
          "drop-shadow(0 0 8px rgba(192,57,43,0.4))",
        ],
        scale: [1, 1.08, 1],
      }}
      transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      style={{ display: "inline-flex", alignItems: "center" }}
    >
      <TheLemniscate width={28} height={18} />
    </motion.div>
  );
}

export function MessageBubble({ role, content, isStreaming }: MessageBubbleProps) {
  const isUser = role === "user";

  if (isUser) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20, y: 4 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: 20,
          paddingLeft: 60,
        }}
      >
        <div style={{
          background: "rgba(192,57,43,0.1)",
          border: "1px solid rgba(192,57,43,0.18)",
          borderRadius: "14px 14px 3px 14px",
          padding: "12px 16px",
          maxWidth: "75%",
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 14,
          color: "#E8E0D5",
          lineHeight: 1.7,
          letterSpacing: "0.01em",
        }}>
          {content}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -12, y: 4 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
      style={{
        display: "flex",
        gap: 12,
        marginBottom: 24,
        paddingRight: 60,
        alignItems: "flex-start",
      }}
    >
      <div style={{
        width: 32, height: 32,
        borderRadius: "50%",
        background: "rgba(192,57,43,0.08)",
        border: "1px solid rgba(192,57,43,0.15)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        marginTop: 2,
      }}>
        {isStreaming ? <StreamingIndicator /> : <TheLemniscate width={20} height={13} />}
      </div>

      <div style={{ flex: 1 }}>
        <div style={{
          fontSize: 10,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "#C0392B",
          marginBottom: 7,
          fontFamily: "'DM Sans', sans-serif",
        }}>
          Scarlet
        </div>
        <div style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 14,
          color: "rgba(228,221,215,0.85)",
          lineHeight: 1.82,
          letterSpacing: "0.01em",
        }}>
          {content ? renderContent(content) : null}
          {isStreaming && !content && (
            <span style={{ color: "#444" }}>...</span>
          )}
          {isStreaming && content && (
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              style={{
                display: "inline-block",
                width: 2,
                height: "1em",
                background: "#C0392B",
                marginLeft: 2,
                verticalAlign: "middle",
              }}
            />
          )}
        </div>
      </div>
    </motion.div>
  );
}