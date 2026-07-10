"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { chatApi, authApi } from "@/lib/apiClient";
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

const scrollSpring = { type: "spring", stiffness: 400, damping: 30 } as const;

function generateCleanSummary(text: string): string {
  let clean = text.replace(/^(hey|hi|hello|scarlet|i keep|i am|i feel|i have|there is|there's|help me|can you|please|so basically|i've been|i just|okay|so|well)\s+/gi, "");
  clean = clean.trim().charAt(0).toUpperCase() + clean.trim().slice(1);
  const words = clean.split(/\s+/).slice(0, 4).join(" ").replace(/[^\w\s]+$/, "");
  return words ? `${words}...` : "New Session";
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
  const [firstName, setFirstName] = useState("");

  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isCreatingRef = useRef(false);

  useEffect(() => {
    authApi.me()
      .then((user) => {
        if (user.first_name) setFirstName(user.first_name);
        else if (user.username) setFirstName(user.username);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!conversationId) { setMessages([]); return; }

    if (isCreatingRef.current) {
      isCreatingRef.current = false;
      return;
    }

    setLoading(true);
    setError("");
    chatApi.getMessages(conversationId)
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

  function scrollToBottom() {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    setShowScrollBtn(false);
  }

  function handleEditMessage(messageId: string, newContent: string) {
    if (streaming) return;
    const index = messages.findIndex(m => m.id === messageId);
    if (index === -1) return;
    
    setMessages(prev => prev.slice(0, index));
    handleSend(newContent);
  }

  function handleReloadMessage(messageId: string) {
    if (streaming) return;
    const index = messages.findIndex(m => m.id === messageId);
    if (index === -1) return;
    
    const targetMsg = messages[index];
    
    if (targetMsg.role === "user") {
      setMessages(prev => prev.slice(0, index));
      handleSend(targetMsg.content);
    } else {
      const userMsgIndex = index - 1;
      if (userMsgIndex >= 0 && messages[userMsgIndex].role === "user") {
        const contentToResend = messages[userMsgIndex].content;
        setMessages(prev => prev.slice(0, userMsgIndex));
        handleSend(contentToResend);
      }
    }
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

    let activeConvId = conversationId;

    try {
      if (!activeConvId) {
        isCreatingRef.current = true;
        const generatedTitle = generateCleanSummary(text);
        const conv = await chatApi.createConversation({ title: generatedTitle });
        activeConvId = conv.id;
        onConversationCreated(conv.id);

        window.dispatchEvent(new CustomEvent("chat-renamed", { detail: { id: conv.id, title: generatedTitle } }));
      }

      const res = await chatApi.stream({ message: text, conversation_id: activeConvId });
      
      if (res.status === 429) {
        setError("I need a moment to process. Please wait 60 seconds and try again.");
        setMessages((prev) => prev.filter((m) => m.id !== scarletId));
        setStreaming(false);
        return;
      }

      if (!res.ok) throw new Error("Stream failed");

      const contentType = res.headers.get("content-type") || "";
      const isSSE = contentType.includes("text/event-stream");
      
      if (contentType.includes("application/json")) {
        const data = await res.json();
        const content = data.content || data.message || data.text || data.response || "No response content found.";
        setMessages((prev) => prev.map((m) => m.id === scarletId ? { ...m, content } : m));
        return;
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error("No reader");

      let buffer = "";
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        
        if (!isSSE) {
          setMessages((prev) => prev.map((m) => m.id === scarletId ? { ...m, content: m.content + chunk } : m));
          continue;
        }

        buffer += chunk;
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        let chunkAppended = "";

        for (const line of lines) {
          if (line.startsWith("data:")) {
            let data = line.slice(5);
            if (data.startsWith(" ")) data = data.slice(1);
            data = data.replace(/\r$/, ""); 
            
            if (data === "[DONE]") continue;
            if (!data) continue;
            
            try {
              const parsed = JSON.parse(data);
              let token = "";
              
              if (typeof parsed === "string") {
                token = parsed;
              } else if (parsed?.choices?.[0]?.delta?.content !== undefined) {
                token = parsed.choices[0].delta.content;
              } else if (parsed?.choices?.[0]?.text !== undefined) {
                token = parsed.choices[0].text;
              } else if (parsed?.message !== undefined) {
                token = parsed.message;
              } else if (parsed?.response !== undefined) {
                token = parsed.response;
              } else if (parsed?.text !== undefined) {
                token = parsed.text;
              } else if (parsed?.content !== undefined) {
                token = parsed.content;
              }

              // Always append exactly what the token is, even if it's just " " or "\n"
              chunkAppended += token;

            } catch {
              chunkAppended += data;
            }
          } else if (line.trim() !== "" && !line.startsWith("event:") && !line.startsWith("id:") && !line.startsWith("retry:")) {
            chunkAppended += "\n" + line;
          }
        }

        if (chunkAppended) {
          const cleanText = chunkAppended.replace(/\\n/g, "\n");
          setMessages((prev) => prev.map((m) => m.id === scarletId ? { ...m, content: m.content + cleanText } : m));
        }
      }
    } catch (e) {
      console.error("Stream interrupted", e);
      setError("Connection interrupted. Please try again.");
      setMessages((prev) => prev.filter((m) => m.id !== scarletId));
    } finally {
      setMessages((prev) => prev.map((m) => m.id === scarletId ? { ...m, isStreaming: false } : m));
      setStreaming(false);
    }
  }

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", position: "relative", background: "transparent" }}>
      <div style={{ position: "absolute", top: 0, left: "20%", right: "20%", height: 1, background: "linear-gradient(90deg, transparent, var(--scarlet-glow), transparent)", pointerEvents: "none", zIndex: 1 }} />

      <div ref={scrollRef} onScroll={handleScroll} style={{ flex: 1, overflowY: "auto", padding: "40px 32px 0" }} className="chat-scroll">
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", gap: 8 }}>
            {[0, 1, 2].map((i) => (
              <motion.div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--scarlet)" }} animate={{ y: [0, -8, 0], opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }} />
            ))}
          </div>
        ) : messages.length === 0 ? (
          <WelcomeState onPrompt={handleSend} firstName={firstName} />
        ) : (
          <div style={{ maxWidth: 760, margin: "0 auto", paddingBottom: 40 }}>
            <motion.div layout transition={scrollSpring}>
              <AnimatePresence initial={false} mode="popLayout">
                {messages.map((m) => (
                  <MessageBubble 
                    key={m.id} 
                    role={m.role} 
                    content={m.content} 
                    isStreaming={m.isStreaming} 
                    onEdit={(newContent) => handleEditMessage(m.id, newContent)}
                    onReload={() => handleReloadMessage(m.id)}
                  />
                ))}
              </AnimatePresence>
            </motion.div>

            {error && (
              <motion.div initial={{ opacity: 0, y: 10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={scrollSpring} style={{ fontSize: 13, color: "var(--scarlet)", textAlign: "center", padding: "12px 16px", background: "var(--msg-user-bg)", border: "1px solid var(--msg-user-border)", borderRadius: 12, marginBottom: 16, fontFamily: "'DM Sans', sans-serif" }}>
                {error}
              </motion.div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <AnimatePresence>
        {showScrollBtn && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.5, y: 20 }}
            whileTap={{ scale: 0.9 }} transition={scrollSpring} onClick={scrollToBottom}
            style={{ position: "absolute", bottom: 120, left: "50%", transform: "translateX(-50%)", width: 40, height: 40, borderRadius: "50%", background: "var(--card-bg)", border: "1px solid var(--border)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-primary)", zIndex: 10, backdropFilter: "blur(12px)", boxShadow: "0 8px 24px rgba(0,0,0,0.2)" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
          </motion.button>
        )}
      </AnimatePresence>

      <div style={{ maxWidth: 800, width: "100%", margin: "0 auto", padding: "0 32px 32px", position: "relative", zIndex: 20 }}>
        <InputBar 
          key={conversationId || "new-session"} 
          onSend={handleSend} 
          disabled={streaming} 
          personaId={personaId} 
          onPersonaSwitch={onPersonaSwitch} 
        />
      </div>

      <style>{`
        .chat-scroll::-webkit-scrollbar { width: 4px; }
        .chat-scroll::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }
      `}</style>
    </div>
  );
}