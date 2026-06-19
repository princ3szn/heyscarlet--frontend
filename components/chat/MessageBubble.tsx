"use client";

import { motion } from "framer-motion";
import { TheLemniscate } from "@/components/ui/TheLemniscate";

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

// Fixed TypeScript animation constraints
const messageSpring = { type: "spring", stiffness: 400, damping: 35, mass: 0.8 } as const;

export function MessageBubble({ role, content, isStreaming }: MessageBubbleProps) {
  const isUser = role === "user";

  return (
    <motion.div
      layout 
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={messageSpring}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: isUser ? "flex-end" : "flex-start",
        marginBottom: 24,
        width: "100%"
      }}
    >
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 6,
        padding: "0 4px",
      }}>
        {!isUser && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "var(--scarlet)" }}>
            <TheLemniscate width={16} height={10} style={{ filter: "drop-shadow(0 0 8px var(--scarlet-glow))" }} />
          </div>
        )}
        <span style={{
          fontSize: 10,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: isUser ? "var(--text-dim)" : "var(--scarlet)",
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 600
        }}>
          {isUser ? "You" : "Scarlet"}
        </span>
      </div>

      <div style={{
        background: isUser ? "var(--msg-user-bg)" : "transparent",
        border: isUser ? "1px solid var(--msg-user-border)" : "none",
        borderRadius: 16,
        borderTopRightRadius: isUser ? 4 : 16,
        borderTopLeftRadius: !isUser ? 4 : 16,
        padding: isUser ? "14px 20px" : "4px 0",
        maxWidth: "85%",
        color: "var(--text-primary)",
        fontSize: 15,
        lineHeight: 1.6,
        fontFamily: "'DM Sans', sans-serif",
        position: "relative"
      }}>
        {content}
        {isStreaming && (
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.8, repeat: Infinity }}
            style={{
              display: "inline-block",
              width: 8,
              height: 15,
              background: "var(--scarlet)",
              marginLeft: 6,
              verticalAlign: "middle"
            }}
          />
        )}
      </div>
    </motion.div>
  );
}
