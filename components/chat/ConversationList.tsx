"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ConversationResponse } from "@/lib/apiClient";

interface ConversationListProps {
  conversations: ConversationResponse[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onArchive: (id: string) => void;
}

function groupConversations(conversations: ConversationResponse[]) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);

  const groups: Record<string, ConversationResponse[]> = {
    Today: [],
    Yesterday: [],
    "Last 7 days": [],
    Older: [],
  };

  conversations.forEach((c) => {
    const date = new Date(c.updated_at);
    const day = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    if (day >= today) groups["Today"].push(c);
    else if (day >= yesterday) groups["Yesterday"].push(c);
    else if (day >= lastWeek) groups["Last 7 days"].push(c);
    else groups["Older"].push(c);
  });

  return groups;
}

function ConversationItem({
  conversation,
  isActive,
  onSelect,
  onArchive,
}: {
  conversation: ConversationResponse;
  isActive: boolean;
  onSelect: () => void;
  onArchive: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onSelect}
      style={{
        position: "relative",
        padding: "9px 14px",
        marginBottom: 1,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
        borderLeft: `2px solid ${isActive ? "#C0392B" : "transparent"}`,
        background: isActive
          ? "rgba(192,57,43,0.07)"
          : hovered
          ? "rgba(255,255,255,0.03)"
          : "transparent",
        transition: "background 0.15s, border-color 0.15s",
        borderRadius: "0 7px 7px 0",
      }}
    >
      <span style={{
        fontSize: 12,
        color: isActive ? "#E8E0D5" : "#555",
        lineHeight: 1.5,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        flex: 1,
        fontFamily: "'DM Sans', sans-serif",
        transition: "color 0.15s",
      }}>
        {conversation.title ?? "Untitled conversation"}
      </span>

      <AnimatePresence>
        {hovered && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            onClick={(e) => { e.stopPropagation(); onArchive(); }}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#444",
              padding: 3,
              display: "flex",
              alignItems: "center",
              flexShrink: 0,
              transition: "color 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#C0392B")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#444")}
            title="Archive"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <polyline points="21 8 21 21 3 21 3 8" />
              <rect x="1" y="3" width="22" height="5" />
              <line x1="10" y1="12" x2="14" y2="12" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function ConversationList({
  conversations,
  activeId,
  onSelect,
  onArchive,
}: ConversationListProps) {
  const groups = groupConversations(conversations);

  return (
    <div style={{ paddingBottom: 8 }}>
      {Object.entries(groups).map(([label, items]) => {
        if (items.length === 0) return null;
        return (
          <div key={label}>
            <div style={{
              padding: "12px 16px 5px",
              fontSize: 9,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#2e2e2e",
              fontFamily: "'DM Sans', sans-serif",
            }}>
              {label}
            </div>
            {items.map((c) => (
              <ConversationItem
                key={c.id}
                conversation={c}
                isActive={activeId === c.id}
                onSelect={() => onSelect(c.id)}
                onArchive={() => onArchive(c.id)}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}