"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { chatApi } from "@/lib/apiClient";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { WelcomeState } from "@/components/chat/WelcomeState";
import { InputBar } from "@/components/chat/InputBar";
import type { MessageResponse } from "@/lib/apiClient";
import type { PersonaId, Persona } from "@/components/chat/PersonaSwitcher";

interface ChatAreaProps {
  conversationId: string | null;
  onConversationCreated: (id: string) => void;
  personaId: PersonaId;
  onPersonaSwitch: (p: Persona) => void;
}

interface LocalMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

export function ChatArea({
  conversationId,
  onConversationCreated,
  personaId,
  onPersonaSwitch,
}: ChatAreaProps) {
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState("");
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!conversationId) { setMessages([]); return; }
    setLoading(true);
    setError("");
    chatApi
      .getMessages(conversationId)
      .then((data: MessageResponse[]) => {
        setMessages(data.map((m) => ({ id: m.id, role: m.role, content: m.content })));
      })
      .catch(() => setError("Could not load messages."))
      .finally(() => setLoading(false));
  }, [conversationId]);

  useEffect(() => {
    if (!showScrollBtn) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, showScrollBtn]);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 120);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // FIXED: This function is now used by the scroll button
  function scrollToBottom() {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    setShowScrollBtn(false);
  }

  async function handleSend(text: string) {
    if (streaming) return;
    setError("");

    const userMsg: LocalMessage = { id: `u-${Date.now()}`, role: "user", content: text };
    const scarletId = `s-${Date.now()}`;
    const scarletMsg: LocalMessage = { id: scarletId, role: "assistant", content: "", isStreaming: true };

    setMessages((prev) => [...prev, userMsg, scarletMsg]);
    setStreaming(true);
    setShowScrollBtn(false);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);

    try {
      let activeConvId = conversationId;
      if (!activeConvId) {
        const conv = await chatApi.createConversation();
        activeConvId = conv.id;
        onConversationCreated(conv.id);
      }

      abortRef.current = new AbortController();
      const res = await chatApi.stream({ message: text, conversation_id: activeConvId });
      if (!res.ok) throw new Error("Stream failed");

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error("No reader");

      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6).trim();
            if (data === "[DONE]") continue;
            try {
              const parsed = JSON.parse(data);
              const token = parsed?.text ?? parsed?.delta ?? "";
              if (typeof token === "string" && token) {
                setMessages((prev) =>
                  prev.map((m) => m.id === scarletId ? { ...m, content: m.content + token } : m)
                );
              }
            } catch {
              if (data) setMessages((prev) =>
                prev.map((m) => m.id === scarletId ? { ...m, content: m.content + data } : m)
              );
            }
          }
        }
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setMessages((prev) => prev.filter((m) => m.id !== scarletId));
    } finally {
      setMessages((prev) =>
        prev.map((m) => m.id === scarletId ? { ...m, isStreaming: false } : m)
      );
      setStreaming(false);
    }
  }

  return (
    <div style={{
      flex: 1, display: "flex", flexDirection: "column",
      height: "100%", overflow: "hidden", position: "relative",
      background: "transparent",
    }}>
      <div style={{
        position: "absolute", top: 0, left: "20%", right: "20%", height: 1,
        background: "linear-gradient(90deg, transparent, var(--scarlet-glow), transparent)",
        pointerEvents: "none", zIndex: 1,
      }} />

      {/* Messages */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        style={{ flex: 1, overflowY: "auto", padding: "32px 28px 0" }}
        className="chat-scroll"
      >
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", gap: 6 }}>
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--scarlet)" }}
                animate={{ y: [0, -6, 0], opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
        ) : messages.length === 0 ? (
          <WelcomeState onPrompt={handleSend} />
        ) : (
          <div style={{ maxWidth: 720, margin: "0 auto", paddingBottom: 24 }}>
            <AnimatePresence initial={false}>
              {messages.map((m) => (
                <MessageBubble key={m.id} role={m.role} content={m.content} isStreaming={m.isStreaming} />
              ))}
            </AnimatePresence>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  fontSize: 12, color: "var(--scarlet)", textAlign: "center",
                  padding: "8px 16px",
                  background: "var(--msg-user-bg)",
                  border: "1px solid var(--msg-user-border)",
                  borderRadius: 8, marginBottom: 16,
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {error}
              </motion.div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Scroll to bottom button */}
      <AnimatePresence>
        {showScrollBtn && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 8 }}
            onClick={scrollToBottom} // FIXED: Now uses the function defined above
            style={{
              position: "absolute", bottom: 100, left: "50%",
              transform: "translateX(-50%)",
              width: 36, height: 36, borderRadius: "50%",
              background: "var(--hover-bg)",
              border: "1px solid var(--border)",
              cursor: "pointer", display: "flex",
              alignItems: "center", justifyContent: "center",
              color: "var(--text-muted)", zIndex: 10,
              backdropFilter: "blur(8px)",
            }}
            whileHover={{ color: "var(--text-primary)" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <div style={{ maxWidth: 720, width: "100%", margin: "0 auto", padding: "0 28px 24px", position: "relative", zIndex: 20 }}>
        <InputBar 
          onSend={handleSend} 
          disabled={streaming} 
          personaId={personaId}
          onPersonaSwitch={onPersonaSwitch}
        />
      </div>

      <style>{`
        .chat-scroll::-webkit-scrollbar { width: 3px; }
        .chat-scroll::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }
      `}</style>
    </div>
  );
}