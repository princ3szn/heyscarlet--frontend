"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { TheLemniscate } from "@/components/ui/TheLemniscate";

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

const messageSpring = {
  type: "spring",
  stiffness: 400,
  damping: 35,
  mass: 0.8
} as const;

export function MessageBubble({ role, content, isStreaming }: MessageBubbleProps) {
  const isUser = role === "user";
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    if (!content) return;
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      <style>{`
        .hs-markdown p { margin-bottom: 0.8em; }
        .hs-markdown p:last-child { margin-bottom: 0; }
        .hs-markdown strong { font-weight: 600; color: var(--text-primary); }
        .hs-markdown ul { list-style-type: disc; padding-left: 1.5em; margin-bottom: 0.8em; }
        .hs-markdown ol { list-style-type: decimal; padding-left: 1.5em; margin-bottom: 0.8em; }
        .hs-markdown li { margin-bottom: 0.3em; }
        .hs-markdown code { 
          background: rgba(192,57,43,0.1); 
          color: var(--scarlet);
          padding: 0.2em 0.4em; 
          border-radius: 4px; 
          font-family: monospace; 
          font-size: 0.9em; 
        }
        .hs-markdown pre { 
          background: var(--surface-2); 
          border: 1px solid var(--border);
          padding: 1em; 
          border-radius: 8px; 
          overflow-x: auto; 
          margin-bottom: 0.8em; 
        }
        .hs-markdown pre code { background: none; color: var(--text-primary); padding: 0; }
      `}</style>

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

        <div 
          className={!isUser ? "hs-markdown" : ""}
          style={{
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
          }}
        >
          {isUser ? (
             content
          ) : (
             <ReactMarkdown>{content}</ReactMarkdown>
          )}

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
                verticalAlign: "middle",
                marginTop: isUser ? 0 : -2 
              }}
            />
          )}
        </div>

        {/* Copy Button Action Bar for Assistant Messages */}
        {!isUser && !isStreaming && content && (
          <div style={{ marginTop: 8, paddingLeft: 4 }}>
            <button
              onClick={handleCopy}
              title="Copy message"
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 11,
                color: copied ? "#27AE60" : "var(--text-dim)",
                fontFamily: "'DM Sans', sans-serif",
                transition: "color 0.2s"
              }}
              onMouseEnter={e => { if(!copied) e.currentTarget.style.color = "var(--text-primary)" }}
              onMouseLeave={e => { if(!copied) e.currentTarget.style.color = "var(--text-dim)" }}
            >
              {copied ? (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Copied
                </>
              ) : (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                  Copy
                </>
              )}
            </button>
          </div>
        )}

      </motion.div>
    </>
  );
}
