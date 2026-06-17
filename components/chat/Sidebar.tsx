"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { chatApi, authApi } from "@/lib/apiClient";
import { TheLemniscate } from "@/components/ui/TheLemniscate";
import { ConversationList } from "@/components/chat/ConversationList";
import { useAuth } from "@/lib/AuthProvider";
import type { ConversationResponse, UserResponse } from "@/lib/apiClient";

interface SidebarProps {
  activeId: string | null;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

function UserMenu({ user, collapsed, onSignOut }: { user: UserResponse | null; collapsed: boolean; onSignOut: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Fallback to "G" for Guest if auth fails
  const initials = user 
    ? ([user.first_name, user.last_name].filter(Boolean).map((n) => n![0].toUpperCase()).join("") || user.email[0].toUpperCase())
    : "G";

  const displayName = user 
    ? ([user.first_name, user.last_name].filter(Boolean).join(" ") || user.username || "User")
    : "Guest Mode";

  const emailDisplay = user ? user.email : "Not signed in";

  return (
    <div ref={ref} style={{ position: "relative", width: "100%" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          width: "100%", display: "flex", alignItems: "center",
          justifyContent: collapsed ? "center" : "flex-start",
          gap: 10, padding: collapsed ? "8px" : "10px 14px",
          background: open ? "var(--hover-bg)" : "transparent",
          border: "none", cursor: "pointer", borderRadius: 8,
          transition: "background 0.2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--hover-bg)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = open ? "var(--hover-bg)" : "transparent")}
      >
        <div style={{
          width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
          background: "linear-gradient(135deg, var(--scarlet-deep), var(--scarlet))",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 500, color: "#FFFFFF",
        }}>
          {initials}
        </div>

        {!collapsed && (
          <>
            <div style={{ flex: 1, textAlign: "left", overflow: "hidden" }}>
              <div style={{ fontSize: 13, color: "var(--text-primary)", fontFamily: "'DM Sans', sans-serif", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {displayName}
              </div>
              <div style={{ fontSize: 11, color: "var(--text-dim)", fontFamily: "'DM Sans', sans-serif", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {emailDisplay}
              </div>
            </div>
            <motion.svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" strokeWidth="2" strokeLinecap="round" animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} style={{ flexShrink: 0 }}>
              <polyline points="6 9 12 15 18 9" />
            </motion.svg>
          </>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.2, 0.8, 0.2, 1] }}
            style={{
              position: "absolute", bottom: "calc(100% + 6px)", left: collapsed ? "calc(100% + 10px)" : 0, 
              minWidth: 220, background: "var(--surface-2)", border: "1px solid var(--border)",
              borderRadius: 10, overflow: "hidden", boxShadow: "0 12px 40px rgba(0,0,0,0.6)", zIndex: 9999,
            }}
          >
            <div style={{ padding: "14px 16px 12px", borderBottom: "1px solid var(--border-subtle)" }}>
              <div style={{ fontSize: 13, color: "var(--text-primary)", fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>{displayName}</div>
              <div style={{ fontSize: 12, color: "var(--text-dim)", fontFamily: "'DM Sans', sans-serif", marginTop: 2 }}>{emailDisplay}</div>
            </div>
            <div style={{ padding: "4px" }}>
              <button
                onClick={() => { setOpen(false); onSignOut(); }}
                style={{
                  width: "100%", padding: "10px 12px", background: "transparent", border: "none",
                  cursor: "pointer", display: "flex", alignItems: "center", gap: 10,
                  fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "var(--text-muted)",
                  textAlign: "left", borderRadius: "6px", transition: "background 0.15s, color 0.15s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(192,57,43,0.07)"; e.currentTarget.style.color = "#C0392B"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-muted)"; }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Sign out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Sidebar({
  activeId, onSelect, onNewChat,
  mobileOpen, onMobileClose,
  collapsed, onToggleCollapse,
}: SidebarProps) {
  const { logout } = useAuth();
  const [conversations, setConversations] = useState<ConversationResponse[]>([]);
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  useEffect(() => {
    Promise.all([
      chatApi.listConversations(),
      authApi.me(),
    ]).then(([convs, u]) => {
      setConversations(convs.filter((c) => !c.is_archived));
      setUser(u);
    }).catch(() => {
      // Catch prevents the app from crashing if token is invalid, allowing the UI to still render
    }).finally(() => setLoading(false));
  }, [activeId]);

  async function handleArchive(id: string) {
    try {
      await chatApi.archiveConversation(id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeId === id) onNewChat();
    } catch {}
  }

  const sidebarContent = (
    <motion.div
      animate={{ width: collapsed ? 60 : 260 }}
      transition={{ duration: 0.28, ease: [0.2, 0.8, 0.2, 1] }}
      style={{
        height: "100vh",
        background: "var(--sidebar-bg)",
        borderRight: "1px solid var(--border-subtle)",
        display: "flex",
        flexDirection: "column",
        overflow: "visible", 
        flexShrink: 0,
        transition: "background 0.35s",
      }}
    >
      {/* Header */}
      <div style={{
        padding: collapsed ? "24px 14px 20px" : "24px 16px 20px",
        borderBottom: "1px solid var(--border-subtle)",
        display: "flex", alignItems: "center",
        justifyContent: collapsed ? "center" : "space-between", flexShrink: 0,
      }}>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2 }}
              style={{ display: "flex", alignItems: "center", gap: 10, overflow: "hidden" }}
            >
              <TheLemniscate width={40} height={22} />
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 16, fontWeight: 300, color: "var(--text-primary)", letterSpacing: "0.02em", whiteSpace: "nowrap" }}>
                Hey<span style={{ color: "var(--scarlet)" }}>Scarlet</span>
              </span>
            </motion.div>
          )}
        </AnimatePresence>
        {collapsed && <TheLemniscate width={28} height={16} />}
        <button
          onClick={onToggleCollapse}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-dim)", padding: 4, display: "flex", alignItems: "center", borderRadius: 6, transition: "color 0.18s, background 0.18s" }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.background = "var(--hover-bg)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-dim)"; e.currentTarget.style.background = "transparent"; }}
        >
          {collapsed ? (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="9" y1="3" x2="9" y2="21" />
              <polyline points="13 9 17 12 13 15" />
            </svg>
          ) : (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="9" y1="3" x2="9" y2="21" />
              <polyline points="15 9 11 12 15 15" />
            </svg>
          )}
        </button>
      </div>

      {/* New chat */}
      <div style={{ padding: collapsed ? "12px 10px" : "12px 10px", flexShrink: 0 }}>
        <motion.button
          onClick={onNewChat}
          whileHover={{ backgroundColor: "var(--msg-user-bg)" }}
          whileTap={{ scale: 0.97 }}
          title="New conversation"
          style={{
            width: "100%", padding: collapsed ? "10px" : "9px 12px",
            background: "var(--msg-user-bg)", border: "1px solid var(--msg-user-border)",
            borderRadius: 8, display: "flex", alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start", gap: 8,
            cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 11,
            color: "var(--scarlet)", letterSpacing: "0.04em", textTransform: "uppercase", transition: "background 0.2s",
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                style={{ overflow: "hidden", whiteSpace: "nowrap" }}
              >
                New conversation
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Conversation list */}
      <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }} className="sb-scroll">
        {!collapsed && (
          loading ? (
            <div style={{ padding: "16px 12px" }}>
              {[1, 2, 3].map((i) => (
                <div key={i} style={{ height: 34, background: "var(--hover-bg)", borderRadius: 6, marginBottom: 5, animation: "sb-shimmer 1.4s ease-in-out infinite" }} />
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div style={{ padding: "28px 16px", fontSize: 12, color: "var(--text-faint)", textAlign: "center", lineHeight: 1.7, fontFamily: "'DM Sans', sans-serif" }}>
              No conversations yet.<br />Start one above.
            </div>
          ) : (
            <ConversationList conversations={conversations} activeId={activeId} onSelect={(id) => { onSelect(id); onMobileClose(); }} onArchive={handleArchive} />
          )
        )}
      </div>

      {/* User profile (Always renders so layout doesn't break) */}
      <div style={{
        borderTop: "1px solid var(--border-subtle)",
        padding: collapsed ? "10px" : "8px 10px 12px",
        flexShrink: 0,
      }}>
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: collapsed ? "8px" : "10px 14px" }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--hover-bg)", flexShrink: 0, animation: "sb-shimmer 1.5s infinite" }} />
            {!collapsed && <div style={{ flex: 1, height: 14, background: "var(--hover-bg)", borderRadius: 4, animation: "sb-shimmer 1.5s infinite" }} />}
          </div>
        ) : (
          <UserMenu
            user={user}
            collapsed={collapsed}
            onSignOut={() => setShowSignOutModal(true)}
          />
        )}
      </div>

      <style>{`
        @keyframes sb-shimmer { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.7; } }
        .sb-scroll::-webkit-scrollbar { width: 2px; }
        .sb-scroll::-webkit-scrollbar-thumb { background: rgba(192,57,43,0.18); border-radius: 2px; }
      `}</style>
    </motion.div>
  );

  return (
    <>
      <div className="sb-desktop" style={{ position: "relative", zIndex: 40, height: "100vh" }}>
        {sidebarContent}
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onMobileClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 40 }} />
            <motion.div initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: "spring", stiffness: 300, damping: 30 }} style={{ position: "fixed", left: 0, top: 0, bottom: 0, zIndex: 50 }}>
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSignOutModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowSignOutModal(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
            <motion.div initial={{ opacity: 0, scale: 0.92, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 12 }} transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }} onClick={(e) => e.stopPropagation()} style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 14, padding: "32px 28px 24px", maxWidth: 360, width: "100%", textAlign: "center" }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}><TheLemniscate width={48} height={30} /></div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 300, color: "var(--text-primary)", marginBottom: 10, lineHeight: 1.3 }}>Leave the room?</div>
              <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 28, fontWeight: 300, fontFamily: "'DM Sans', sans-serif" }}>You can always come back. Scarlet will remember where you left off.</div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setShowSignOutModal(false)} style={{ flex: 1, padding: "11px", background: "var(--hover-bg)", border: "1px solid var(--border)", borderRadius: 9, fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "var(--text-dim)", cursor: "pointer", transition: "color 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-muted)")} onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-dim)")}>Stay</button>
                <button onClick={() => { setShowSignOutModal(false); logout(); }} style={{ flex: 1, padding: "11px", background: "linear-gradient(135deg, var(--scarlet-deep), var(--scarlet))", border: "none", borderRadius: 9, fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#fff", cursor: "pointer", boxShadow: "0 4px 16px rgba(192,57,43,0.28)", transition: "opacity 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")} onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}>Sign out</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .sb-desktop { display: flex; }
        @media (max-width: 768px) { .sb-desktop { display: none; } }
      `}</style>
    </>
  );
}