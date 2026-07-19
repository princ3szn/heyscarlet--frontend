"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/chat/Sidebar";
import { ChatArea } from "@/components/chat/ChatArea";
import { TheLemniscate } from "@/components/ui/TheLemniscate";
import type { PersonaId, Persona } from "@/components/chat/PersonaSwitcher";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";

export default function ChatPage() {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);

  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [personaId, setPersonaId] = useState<PersonaId>("scarlet");

  const [resetKey, setResetKey] = useState(0);
  const [activeTitle, setActiveTitle] = useState("New Session");

  useEffect(() => {
    if (!accessToken) {
      router.push("/auth");
    }
  }, [accessToken, router]);

  useEffect(() => {
    const handleTitleUpdate = (e: Event) => {
      setActiveTitle((e as CustomEvent<string>).detail);
    };
    const handleRenamed = (e: Event) => {
      const detail = (e as CustomEvent<{id: string, title: string}>).detail;
      if (detail.id === activeConversationId) {
        setActiveTitle(detail.title);
        document.title = `${detail.title} | HeyScarlet`;
      }
    };

    window.addEventListener("chat-active-title" as any, handleTitleUpdate);
    window.addEventListener("chat-renamed" as any, handleRenamed);
    return () => {
      window.removeEventListener("chat-active-title" as any, handleTitleUpdate);
      window.removeEventListener("chat-renamed" as any, handleRenamed);
    };
  }, [activeConversationId]);

  const handleNewChat = () => {
    setActiveConversationId(null);
    setActiveTitle("New Session");
    document.title = "HeyScarlet";
    setResetKey(prev => prev + 1);
  };

  return (
    <>
      <style>{`
        @keyframes hs-chat-morph {
          0%   { border-radius: 40% 60% 70% 30% / 40% 40% 60% 50%; }
          33%  { border-radius: 70% 30% 50% 50% / 30% 30% 70% 70%; }
          66%  { border-radius: 100% 60% 60% 100% / 100% 100% 60% 60%; }
          100% { border-radius: 40% 60% 70% 30% / 40% 40% 60% 50%; }
        }
        @media (max-width: 768px) {
          .chat-mobile-menu { display: flex !important; }
          .chat-mobile-brand { display: flex !important; }
          .chat-conv-label { display: none !important; }
        }
      `}</style>

      <div style={{
        display: "flex", height: "100vh",
        background: "var(--void)",
        color: "var(--text-primary)",
        fontFamily: "'DM Sans', sans-serif",
        overflow: "hidden", position: "relative",
        transition: "background 0.35s, color 0.35s",
      }}>

        <div style={{
          position: "fixed", top: "-10%", left: "30%",
          width: 500, height: 500,
          background: "var(--scarlet-glow)",
          animation: "hs-chat-morph 25s linear infinite",
          filter: "blur(80px)", pointerEvents: "none", zIndex: 0,
          mixBlendMode: "var(--glow-blend)" as "normal",
          transition: "background 0.35s",
        }} />

        <div style={{ position: "relative", zIndex: 50, display: "flex" }}>
          <Sidebar
            activeId={activeConversationId}
            onSelect={setActiveConversationId}
            onNewChat={handleNewChat}
            mobileOpen={mobileMenuOpen}
            onMobileClose={() => setMobileMenuOpen(false)}
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
          />
        </div>

        <div style={{
          flex: 1, display: "flex", flexDirection: "column",
          overflow: "hidden", position: "relative", zIndex: 1,
          transition: "background 0.35s",
        }}>

          <div style={{
            height: 54,
            borderBottom: "1px solid var(--border-subtle)",
            display: "flex", alignItems: "center",
            justifyContent: "space-between",
            padding: "0 20px", flexShrink: 0,
            background: "var(--topbar-bg)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            transition: "background 0.35s, border-color 0.35s",
          }}>
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="chat-mobile-menu"
              style={{
                display: "none", background: "none", border: "none",
                cursor: "pointer", color: "var(--text-dim)",
                padding: 4, alignItems: "center",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>

            <div className="chat-mobile-brand" style={{ display: "none", alignItems: "center", gap: 8 }}>
              <TheLemniscate width={36} height={20} />
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 15, fontWeight: 300, color: "var(--text-primary)" }}>
                Hey<span style={{ color: "var(--scarlet)" }}>Scarlet</span>
              </span>
            </div>

            <div className="chat-conv-label" style={{
              fontSize: 11, color: "var(--text-faint)",
              letterSpacing: "0.06em", textTransform: "uppercase",
              fontFamily: "'DM Sans', sans-serif",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: 200
            }}>
              {activeConversationId ? activeTitle : "New Session"}
            </div>

            <div />
          </div>

          {/* CRITICAL FIX: Removed activeConversationId from the key so it doesn't unmount mid-stream */}
          <ChatArea
            key={`chat-area-${resetKey}`}
            conversationId={activeConversationId}
            onConversationCreated={(id) => setActiveConversationId(id)}
            personaId={personaId}
            onPersonaSwitch={(p: Persona) => setPersonaId(p.id)}
          />
        </div>
      </div>
    </>
  );
}