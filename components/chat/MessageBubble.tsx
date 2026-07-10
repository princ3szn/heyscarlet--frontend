"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { TheLemniscate } from "@/components/ui/TheLemniscate";

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
  onEdit?: (newContent: string) => void;
  onReload?: () => void;
}

const messageSpring = {
  type: "spring",
  stiffness: 400,
  damping: 35,
  mass: 0.8
} as const;

export function MessageBubble({ role, content, isStreaming, onEdit, onReload }: MessageBubbleProps) {
  const isUser = role === "user";
  const [copied, setCopied] = useState(false);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // THE FIX: Standard Markdown ignores single newlines. 
  // By injecting two spaces before every newline, we force a hard line break in real-time.
  const formattedContent = isUser ? content : content.replace(/\n/g, '  \n');

  function handleCopy() {
    if (!content) return;
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [editValue, isEditing]);

  function submitEdit() {
    if (editValue.trim() && editValue !== content) {
      onEdit?.(editValue.trim());
    }
    setIsEditing(false);
  }

  function cancelEdit() {
    setEditValue(content);
    setIsEditing(false);
  }

  const actionBtnStyle = {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 5,
    fontSize: 11,
    color: "var(--text-dim)",
    fontFamily: "'DM Sans', sans-serif",
    transition: "color 0.2s",
    padding: 0
  };

  return (
    <>
      <style>{`
        .hs-markdown {
          display: flex;
          flex-direction: column;
          gap: 0.8em;
          white-space: pre-wrap; 
        }
        .hs-markdown p { 
          margin: 0; 
          white-space: pre-wrap; 
        }
        .hs-markdown strong { font-weight: 600; color: var(--text-primary); }
        .hs-markdown em { font-style: italic; opacity: 0.9; }
        
        .hs-markdown h1, .hs-markdown h2, .hs-markdown h3, .hs-markdown h4 {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 600;
          color: var(--text-primary);
          margin-top: 0.5em;
          margin-bottom: 0.2em;
          line-height: 1.2;
        }
        .hs-markdown h1 { font-size: 1.5em; }
        .hs-markdown h2 { font-size: 1.3em; }
        .hs-markdown h3 { font-size: 1.1em; }
        
        .hs-markdown ul { list-style-type: disc; padding-left: 1.5em; margin: 0; }
        .hs-markdown ol { list-style-type: decimal; padding-left: 1.5em; margin: 0; }
        .hs-markdown li { margin-bottom: 0.4em; padding-left: 0.2em; }
        .hs-markdown li::marker { color: var(--scarlet); }
        
        .hs-markdown blockquote {
          border-left: 3px solid var(--scarlet);
          padding-left: 1em;
          margin: 0;
          color: var(--text-muted);
          font-style: italic;
          background: var(--hover-bg);
          padding: 0.8em 1em;
          border-radius: 0 8px 8px 0;
        }

        .hs-markdown a {
          color: var(--scarlet);
          text-decoration: none;
          border-bottom: 1px solid transparent;
          transition: border-color 0.2s;
        }
        .hs-markdown a:hover { border-bottom-color: var(--scarlet); }

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
          margin: 0;
        }
        .hs-markdown pre code { background: none; color: var(--text-primary); padding: 0; }
        
        .hs-markdown table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 0.5em;
        }
        .hs-markdown th, .hs-markdown td {
          border: 1px solid var(--border);
          padding: 0.6em;
          text-align: left;
        }
        .hs-markdown th {
          background: var(--hover-bg);
          font-weight: 600;
        }
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
          className={!isUser && !isEditing ? "hs-markdown" : ""}
          style={{
            background: isUser ? "var(--msg-user-bg)" : "transparent",
            border: isUser ? "1px solid var(--msg-user-border)" : "none",
            borderRadius: 16,
            borderTopRightRadius: isUser ? 4 : 16,
            borderTopLeftRadius: !isUser ? 4 : 16,
            padding: isUser ? "14px 20px" : "4px 0",
            maxWidth: "85%",
            width: isEditing ? "100%" : "auto",
            color: "var(--text-primary)",
            fontSize: 15,
            lineHeight: 1.6,
            fontFamily: "'DM Sans', sans-serif",
            position: "relative"
          }}
        >
          {isEditing ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <textarea
                ref={textareaRef}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                style={{
                  width: "100%",
                  background: "transparent",
                  border: "none",
                  color: "var(--text-primary)",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 15,
                  lineHeight: 1.6,
                  resize: "none",
                  outline: "none"
                }}
              />
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
                <button 
                  onClick={cancelEdit} 
                  style={{ padding: "6px 12px", borderRadius: 6, border: "none", background: "transparent", color: "var(--text-dim)", fontSize: 12, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}
                  onMouseEnter={(e) => e.currentTarget.style.color = "var(--text-primary)"}
                  onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-dim)"}
                >
                  Cancel
                </button>
                <button 
                  onClick={submitEdit} 
                  disabled={!editValue.trim() || editValue === content} 
                  style={{ padding: "6px 12px", borderRadius: 6, border: "none", background: "var(--scarlet)", color: "#fff", fontSize: 12, cursor: editValue.trim() && editValue !== content ? "pointer" : "not-allowed", opacity: editValue.trim() && editValue !== content ? 1 : 0.5, fontFamily: "'DM Sans', sans-serif" }}
                >
                  Save & Send
                </button>
              </div>
            </div>
          ) : isUser ? (
             content
          ) : (
             <ReactMarkdown remarkPlugins={[remarkGfm]}>
               {formattedContent}
             </ReactMarkdown>
          )}
          
          {isStreaming && !content && (
            <motion.div 
              animate={{ opacity: [0.3, 1, 0.3] }} 
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              style={{ display: "flex", alignItems: "center", height: 24, paddingLeft: 4 }}
            >
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--scarlet)" }} />
            </motion.div>
          )}

          {isStreaming && content && (
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

        {/* Action Bar for User */}
        {isUser && !isStreaming && !isEditing && (
          <div style={{ marginTop: 8, paddingRight: 8, display: "flex", gap: 16, justifyContent: "flex-end" }}>
            {onEdit && (
              <button onClick={() => setIsEditing(true)} style={actionBtnStyle} onMouseEnter={(e) => e.currentTarget.style.color="var(--text-primary)"} onMouseLeave={(e) => e.currentTarget.style.color="var(--text-dim)"}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                Edit
              </button>
            )}
            {onReload && (
              <button onClick={onReload} style={actionBtnStyle} onMouseEnter={(e) => e.currentTarget.style.color="var(--text-primary)"} onMouseLeave={(e) => e.currentTarget.style.color="var(--text-dim)"}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><polyline points="3 3 3 8 8 8"></polyline></svg>
                Reload
              </button>
            )}
            <button onClick={handleCopy} style={actionBtnStyle} onMouseEnter={(e) => { if(!copied) e.currentTarget.style.color="var(--text-primary)"}} onMouseLeave={(e) => { if(!copied) e.currentTarget.style.color="var(--text-dim)"}}>
              {copied ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#27AE60" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>}
              <span style={{ color: copied ? "#27AE60" : "inherit" }}>{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>
        )}

        {/* Action Bar for Scarlet */}
        {!isUser && !isStreaming && content && (
          <div style={{ marginTop: 8, paddingLeft: 4, display: "flex", gap: 16 }}>
            <button onClick={handleCopy} style={actionBtnStyle} onMouseEnter={(e) => { if(!copied) e.currentTarget.style.color="var(--text-primary)"}} onMouseLeave={(e) => { if(!copied) e.currentTarget.style.color="var(--text-dim)"}}>
              {copied ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#27AE60" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>}
              <span style={{ color: copied ? "#27AE60" : "inherit" }}>{copied ? "Copied" : "Copy"}</span>
            </button>
            {onReload && (
              <button onClick={onReload} style={actionBtnStyle} onMouseEnter={(e) => e.currentTarget.style.color="var(--text-primary)"} onMouseLeave={(e) => e.currentTarget.style.color="var(--text-dim)"}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><polyline points="3 3 3 8 8 8"></polyline></svg>
                Regenerate
              </button>
            )}
          </div>
        )}

      </motion.div>
    </>
  );
}