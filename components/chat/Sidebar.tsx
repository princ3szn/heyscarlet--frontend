"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { chatApi, authApi } from "@/lib/apiClient";
import { TheLemniscate } from "@/components/ui/TheLemniscate";
import { useAuth } from "@/lib/AuthProvider";
import { SettingsModal } from "./SettingsModal";
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

// Highly responsive, snappy spring physics for UI interactions
const snappySpring = { type: "spring", stiffness: 450, damping: 35 } as const;
const menuSpring = { type: "spring", stiffness: 400, damping: 30 } as const;

// ------------------------------------------------------------------
// User Profile Menu
// ------------------------------------------------------------------
function UserMenu({ user, collapsed, onSignOut, onOpenSettings }: { user: UserResponse | null; collapsed: boolean; onSignOut: () => void; onOpenSettings: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const initials = user 
    ? ([user.first_name, user.last_name].filter(Boolean).map((n) => n![0].toUpperCase()).join("") || user.email[0].toUpperCase())
    : "G";

  const displayName = user 
    ? ([user.first_name, user.last_name].filter(Boolean).join(" ") || user.username || "User")
    : "Guest Mode";

  const emailDisplay = user ? user.email : "Not signed in";

  return (
    <div ref={ref} style={{ position: "relative", width: "100%" }}>
      <motion.button
        aria-label="User profile menu"
        aria-expanded={open}
        whileTap={{ scale: 0.96 }}
        onClick={() => setOpen((v) => !v)}
        style={{
          width: "100%", display: "flex", alignItems: "center",
          justifyContent: collapsed ? "center" : "flex-start",
          gap: 10, padding: collapsed ? "8px" : "10px 14px",
          background: open ? "var(--hover-bg)" : "transparent",
          border: "none", cursor: "pointer", borderRadius: 12,
          transition: "background 0.2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--hover-bg)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = open ? "var(--hover-bg)" : "transparent")}
      >
        <div style={{
          width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
          background: "linear-gradient(135deg, var(--scarlet-deep), var(--scarlet))",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600, color: "#FFFFFF",
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
            <motion.svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" strokeWidth="2" strokeLinecap="round" animate={{ rotate: open ? 180 : 0 }} transition={menuSpring} style={{ flexShrink: 0 }}>
              <polyline points="6 9 12 15 18 9" />
            </motion.svg>
          </>
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={menuSpring}
            style={{
              position: "absolute", bottom: "calc(100% + 6px)", left: collapsed ? "calc(100% + 10px)" : 0, 
              minWidth: 220, background: "var(--surface-2)", border: "1px solid var(--border)",
              borderRadius: 14, overflow: "hidden", boxShadow: "0 16px 40px rgba(0,0,0,0.4)", zIndex: 9999,
            }}
          >
            <div style={{ padding: "14px 16px 12px", borderBottom: "1px solid var(--border-subtle)" }}>
              <div style={{ fontSize: 13, color: "var(--text-primary)", fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>{displayName}</div>
              <div style={{ fontSize: 12, color: "var(--text-dim)", fontFamily: "'DM Sans', sans-serif", marginTop: 2 }}>{emailDisplay}</div>
            </div>
            <div style={{ padding: "4px" }}>
              <button
                aria-label="Settings"
                onClick={() => { setOpen(false); onOpenSettings(); }}
                style={{
                  width: "100%", padding: "10px 12px", background: "transparent", border: "none",
                  cursor: "pointer", display: "flex", alignItems: "center", gap: 10,
                  fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "var(--text-muted)",
                  textAlign: "left", borderRadius: "10px", transition: "all 0.15s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "var(--hover-bg)"; e.currentTarget.style.color = "var(--text-primary)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-muted)"; }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                Change Password
              </button>
              
              <button
                aria-label="Sign out"
                onClick={() => { setOpen(false); onSignOut(); }}
                style={{
                  width: "100%", padding: "10px 12px", background: "transparent", border: "none",
                  cursor: "pointer", display: "flex", alignItems: "center", gap: 10,
                  fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "var(--text-muted)",
                  textAlign: "left", borderRadius: "10px", transition: "all 0.15s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(192,57,43,0.1)"; e.currentTarget.style.color = "var(--scarlet)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-muted)"; }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
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

// ------------------------------------------------------------------
// Main Sidebar
// ------------------------------------------------------------------
export function Sidebar({ activeId, onSelect, onNewChat, mobileOpen, onMobileClose, collapsed, onToggleCollapse }: SidebarProps) {
  const router = useRouter();
  const { logout } = useAuth();
  const [conversations, setConversations] = useState<ConversationResponse[]>([]);
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  
  // Header interaction states
  const [isHeaderHovered, setIsHeaderHovered] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipTimeout = useRef<NodeJS.Timeout | null>(null);
  
  // Renaming State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    Promise.all([chatApi.listConversations(), authApi.me()])
      .then(([convs, u]) => {
        setConversations(convs.filter((c) => !c.is_archived));
        setUser(u);
      })
      .catch((err) => {
        console.error("Sidebar load error:", err);
        const isAuthError = 
          err?.status === 401 || 
          err?.status === 403 || 
          String(err?.message || "").toLowerCase().includes('unauthorized') ||
          String(err?.message || "").toLowerCase().includes('forbidden');

        if (isAuthError) {
          console.warn("Security constraint: Invalid session. Force logging out.");
          logout();
          router.push("/auth");
        } else {
          console.warn("Backend unreachable. Gracefully degrading to offline/local mode.");
          setUser({ 
            id: "local", 
            email: "waiting_for_backend@heyscarlet.com", 
            first_name: "Local", 
            last_name: "Mode",
            username: "local_dev",
            onboarding_complete: true
          });
        }
      })
      .finally(() => setLoading(false));
  }, [activeId, logout, router]);

  // NEW FIX: Sync document title & dispatch event for top bar
  useEffect(() => {
    const activeConv = conversations.find(c => c.id === activeId);
    const currentTitle = activeConv?.title || "New Session";
    
    // Update the browser tab
    if (typeof window !== "undefined") {
      document.title = activeId ? `${currentTitle} | HeyScarlet` : "HeyScarlet";
      
      // Dispatch event to update the top bar in the ChatPage
      window.dispatchEvent(new CustomEvent("chat-active-title", { detail: currentTitle }));
    }
  }, [activeId, conversations]);

  useEffect(() => {
    const handleRenamed = (e: Event) => {
      const customEvent = e as CustomEvent<{ id: string, title: string }>;
      setConversations(prev => prev.map(c => c.id === customEvent.detail.id ? { ...c, title: customEvent.detail.title } : c));
    };
    window.addEventListener("chat-renamed", handleRenamed);
    return () => window.removeEventListener("chat-renamed", handleRenamed);
  }, []);

  async function handleArchive(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    try {
      await chatApi.archiveConversation(id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeId === id) onNewChat();
    } catch (err) {
      console.error("Failed to archive conversation", err);
    }
  }

  async function submitRename(id: string) {
    const newTitle = editValue.trim();
    if (!newTitle) { 
      setEditingId(null); 
      return; 
    }
    
    const targetConv = conversations.find(c => c.id === id);
    const oldTitle = targetConv?.title || "";

    setConversations(prev => prev.map(c => c.id === id ? { ...c, title: newTitle } : c));
    setEditingId(null);

    try {
      const api = chatApi as unknown as { updateConversation: (id: string, data: { title: string }) => Promise<void> };
      await api.updateConversation(id, { title: newTitle }); 
    } catch (err) {
      console.error("Failed to rename conversation", err);
      setConversations(prev => prev.map(c => c.id === id ? { ...c, title: oldTitle } : c));
    }
  }

  // Handle tooltip delays
  const handleMouseEnterHeader = () => {
    setIsHeaderHovered(true);
    if (collapsed) {
      tooltipTimeout.current = setTimeout(() => setShowTooltip(true), 600); // Wait 600ms before showing text
    }
  };

  const handleMouseLeaveHeader = () => {
    setIsHeaderHovered(false);
    setShowTooltip(false);
    if (tooltipTimeout.current) clearTimeout(tooltipTimeout.current);
  };

  const sidebarContent = (
    <motion.div
      initial={false}
      animate={{ width: collapsed ? 68 : 260 }}
      transition={snappySpring}
      style={{
        height: "100vh", background: "var(--sidebar-bg)", borderRight: "1px solid var(--border-subtle)",
        display: "flex", flexDirection: "column", overflow: "hidden", flexShrink: 0,
      }}
    >
      {/* Header Area - ALIGNMENT FIX */}
      <div 
        onMouseEnter={handleMouseEnterHeader}
        onMouseLeave={handleMouseLeaveHeader}
        style={{
          position: "relative",
          height: 54, // Matched exactly to topbar height
          padding: "0 16px", 
          borderBottom: "1px solid var(--border-subtle)",
          display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "space-between", 
          flexShrink: 0, overflow: "visible" 
        }}
      >
        {/* Expanded State: Logo on left, button on right */}
        <AnimatePresence mode="popLayout">
          {!collapsed && (
            <>
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={snappySpring} style={{ display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap" }}>
                <TheLemniscate width={32} height={18} style={{ color: "var(--text-primary)" }} />
                <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 16, fontWeight: 300, color: "var(--text-primary)", letterSpacing: "0.02em", marginTop: 2 }}>
                  Hey<span style={{ color: "var(--scarlet)" }}>Scarlet</span>
                </span>
              </motion.div>
              <motion.button 
                aria-label="Collapse sidebar"
                whileTap={{ scale: 0.9 }} 
                onClick={onToggleCollapse} 
                style={{ 
                  background: "none", border: "none", cursor: "pointer", color: "var(--text-dim)", 
                  padding: 4, display: "flex", alignItems: "center", borderRadius: 6, 
                  backgroundColor: "transparent"
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--hover-bg)"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <line x1="9" y1="3" x2="9" y2="21" />
                  <polyline points="15 9 11 12 15 15" />
                </svg>
              </motion.button>
            </>
          )}
        </AnimatePresence>

        {/* Collapsed State: Logo OR Button occupying the exact same center space */}
        {collapsed && (
          <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            
            {/* The Logo (Fades out on hover) */}
            <motion.div 
              initial={false}
              animate={{ opacity: isHeaderHovered ? 0 : 1, scale: isHeaderHovered ? 0.9 : 1 }} 
              transition={{ duration: 0.15 }}
              style={{ position: "absolute", pointerEvents: "none" }}
            >
              <TheLemniscate width={24} height={14} style={{ color: "var(--text-primary)" }} />
            </motion.div>

            {/* The Button (Fades in on hover) */}
            <motion.button 
              aria-label="Expand sidebar"
              whileTap={{ scale: 0.9 }} 
              onClick={() => { handleMouseLeaveHeader(); onToggleCollapse(); }} 
              initial={false}
              animate={{ opacity: isHeaderHovered ? 1 : 0, scale: isHeaderHovered ? 1 : 0.9 }}
              transition={{ duration: 0.15 }}
              style={{ 
                background: "transparent", border: "none", cursor: "pointer", color: "var(--text-primary)", 
                padding: 6, display: "flex", alignItems: "center", borderRadius: 8, position: "absolute"
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--hover-bg)"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <line x1="9" y1="3" x2="9" y2="21" />
                <polyline points="13 9 17 12 13 15" />
              </svg>
            </motion.button>

            <AnimatePresence>
              {showTooltip && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 5, transition: { duration: 0.1 } }}
                  style={{
                    position: "absolute", left: "100%", marginLeft: 16,
                    background: "var(--text-primary)", color: "var(--void)",
                    padding: "6px 12px", borderRadius: 6, fontSize: 12,
                    fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
                    whiteSpace: "nowrap", pointerEvents: "none", zIndex: 50,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
                  }}
                >
                  Expand sidebar
                  {/* Little triangle pointer */}
                  <div style={{
                    position: "absolute", top: "50%", left: -4, transform: "translateY(-50%)",
                    borderTop: "4px solid transparent", borderBottom: "4px solid transparent",
                    borderRight: "4px solid var(--text-primary)"
                  }} />
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        )}
      </div>

      {/* New chat */}
      <div style={{ padding: collapsed ? "16px 12px" : "16px 20px", flexShrink: 0 }}>
        <motion.button 
          aria-label="Start new session"
          onClick={() => { onNewChat(); onMobileClose(); }} 
          whileHover={{ scale: 1.02 }} 
          whileTap={{ scale: 0.96 }} 
          transition={snappySpring} 
          style={{
            width: "100%", padding: collapsed ? "12px" : "10px 14px", background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: 10, display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "flex-start", gap: 10,
            cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "var(--text-primary)", fontWeight: 500,
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)", transition: "border-color 0.2s"
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          <AnimatePresence mode="popLayout">
            {!collapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} style={{ whiteSpace: "nowrap" }}>
                New Session
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Conversation list */}
      <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: collapsed ? "0 8px" : "0 12px" }} className="sb-scroll">
        {!collapsed && (
          loading ? (
            <div style={{ padding: "16px 8px" }}>
              {[1, 2, 3].map((i) => <div key={i} style={{ height: 36, background: "var(--hover-bg)", borderRadius: 8, marginBottom: 8, animation: "sb-shimmer 1.4s ease-in-out infinite" }} />)}
            </div>
          ) : conversations.length === 0 ? (
            <div style={{ padding: "32px 16px", fontSize: 12, color: "var(--text-faint)", textAlign: "center", lineHeight: 1.7, fontFamily: "'DM Sans', sans-serif" }}>
              No history found.<br />Start a session above.
            </div>
          ) : (
            <div style={{ paddingBottom: 20 }}>
              {conversations.map((c) => {
                const isActive = activeId === c.id;
                const isEditing = editingId === c.id;

                return (
                  <motion.div key={c.id} layout transition={snappySpring} style={{ position: "relative", marginBottom: 4 }}>
                    {isEditing ? (
                      <input
                        autoFocus
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={() => submitRename(c.id)}
                        onKeyDown={(e) => { if (e.key === "Enter") submitRename(c.id); if (e.key === "Escape") setEditingId(null); }}
                        style={{
                          width: "100%", padding: "10px 12px", background: "var(--surface)", border: "1px solid var(--scarlet)",
                          borderRadius: 8, color: "var(--text-primary)", fontSize: 13, fontFamily: "'DM Sans', sans-serif", outline: "none"
                        }}
                      />
                    ) : (
                      <motion.button
                        onClick={() => { onSelect(c.id); onMobileClose(); }}
                        whileTap={{ scale: 0.98 }}
                        className="group"
                        style={{
                          width: "100%", padding: "10px 12px", background: isActive ? "var(--hover-bg)" : "transparent",
                          border: "none", borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center",
                          textAlign: "left", transition: "background 0.2s"
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = isActive ? "var(--hover-bg)" : "var(--hover-bg)"}
                        onMouseLeave={(e) => e.currentTarget.style.background = isActive ? "var(--hover-bg)" : "transparent"}
                      >
                        <span style={{
                          flex: 1, fontSize: 13, color: isActive ? "var(--text-primary)" : "var(--text-muted)",
                          fontFamily: "'DM Sans', sans-serif", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
                        }}>
                          {c.title || "New Session"}
                        </span>
                        
                        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity" style={{ marginLeft: 8 }}>
                          <button 
                            aria-label="Rename conversation"
                            onClick={(e) => { e.stopPropagation(); setEditingId(c.id); setEditValue(c.title || ""); }}
                            style={{ background: "none", border: "none", color: "var(--text-dim)", padding: 4, cursor: "pointer", borderRadius: 4 }}
                            onMouseEnter={e => e.currentTarget.style.color = "var(--text-primary)"}
                            onMouseLeave={e => e.currentTarget.style.color = "var(--text-dim)"}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                          </button>
                          <button 
                            aria-label="Archive conversation"
                            onClick={(e) => handleArchive(c.id, e)}
                            style={{ background: "none", border: "none", color: "var(--text-dim)", padding: 4, cursor: "pointer", borderRadius: 4 }}
                            onMouseEnter={e => e.currentTarget.style.color = "var(--scarlet)"}
                            onMouseLeave={e => e.currentTarget.style.color = "var(--text-dim)"}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                          </button>
                        </div>
                      </motion.button>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )
        )}
      </div>

      {/* User profile */}
      <div style={{ borderTop: "1px solid var(--border-subtle)", padding: collapsed ? "12px 10px" : "12px 16px", flexShrink: 0 }}>
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--hover-bg)", flexShrink: 0, animation: "sb-shimmer 1.5s infinite" }} />
          </div>
        ) : (
          <UserMenu user={user} collapsed={collapsed} onSignOut={() => setShowSignOutModal(true)} onOpenSettings={() => setShowSettingsModal(true)} />
        )}
      </div>

      <style>{`
        @keyframes sb-shimmer { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.7; } }
        .sb-scroll::-webkit-scrollbar { width: 3px; }
        .sb-scroll::-webkit-scrollbar-thumb { background: var(--border-subtle); border-radius: 3px; }
      `}</style>
    </motion.div>
  );

  return (
    <>
      <div className="sb-desktop" style={{ position: "relative", zIndex: 40, height: "100vh" }}>
        {sidebarContent}
      </div>

      {/* Mobile Overlays with Springs */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onMobileClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", zIndex: 40 }} />
            <motion.div initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", stiffness: 450, damping: 35 }} style={{ position: "fixed", left: 0, top: 0, bottom: 0, zIndex: 50 }}>
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSignOutModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowSignOutModal(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 15 }} transition={menuSpring} onClick={(e) => e.stopPropagation()} style={{ background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: 16, padding: "32px", maxWidth: 360, width: "100%", textAlign: "center", boxShadow: "0 24px 48px rgba(0,0,0,0.4)" }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}><TheLemniscate width={48} height={30} style={{ color: "var(--scarlet)" }} /></div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 300, color: "var(--text-primary)", marginBottom: 12, lineHeight: 1.2 }}>Leave the room?</div>
              <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 32, fontWeight: 300, fontFamily: "'DM Sans', sans-serif" }}>You can always come back. Scarlet will remember where you left off.</div>
              <div style={{ display: "flex", gap: 12 }}>
                <motion.button aria-label="Cancel sign out" whileTap={{ scale: 0.96 }} onClick={() => setShowSignOutModal(false)} style={{ flex: 1, padding: "12px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500, color: "var(--text-primary)", cursor: "pointer" }}>Stay</motion.button>
                <motion.button aria-label="Confirm sign out" whileTap={{ scale: 0.96 }} onClick={() => { setShowSignOutModal(false); logout(); router.push('/auth'); }} style={{ flex: 1, padding: "12px", background: "var(--scarlet)", border: "none", borderRadius: 10, fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500, color: "#fff", cursor: "pointer", boxShadow: "0 4px 16px var(--scarlet-glow)" }}>Sign out</motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <SettingsModal isOpen={showSettingsModal} onClose={() => setShowSettingsModal(false)} />

      <style>{`
        .sb-desktop { display: flex; }
        @media (max-width: 768px) { .sb-desktop { display: none; } }
      `}</style>
    </>
  );
}