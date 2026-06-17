"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PERSONAS, type PersonaId, type Persona } from "@/components/chat/PersonaSwitcher";
import { TheLemniscate } from "@/components/ui/TheLemniscate";

interface InputBarProps {
  onSend: (text: string) => void;
  disabled: boolean;
  personaId: PersonaId;
  onPersonaSwitch: (p: Persona) => void;
}

export function InputBar({ onSend, disabled, personaId, onPersonaSwitch }: InputBarProps) {
  const [text, setText] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  const activePersona = PERSONAS.find(p => p.id === personaId) || PERSONAS[0];

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [text]);

  // Close picker on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (text.trim() && !disabled) {
        onSend(text.trim());
        setText("");
      }
    }
  }

  return (
    <div style={{ width: "100%", position: "relative" }}>
      
      {/* 
        The main input container 
        Uses high-contrast CSS variables so it adapts perfectly to Light/Dark mode
      */}
      <div style={{
        background: "var(--surface)",
        border: "1px solid var(--input-border)",
        borderRadius: 16,
        padding: "12px 14px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        boxShadow: "0 8px 24px rgba(0,0,0,0.05)",
        transition: "border-color 0.3s",
      }}
      onFocus={(e) => e.currentTarget.style.borderColor = "var(--scarlet)"}
      onBlur={(e) => e.currentTarget.style.borderColor = "var(--input-border)"}
      >
        
        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="What have you been deferring?"
          disabled={disabled}
          rows={1}
          style={{
            width: "100%",
            background: "transparent",
            border: "none",
            color: "var(--text-primary)",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 15,
            lineHeight: 1.5,
            resize: "none",
            outline: "none",
            maxHeight: 200,
          }}
        />

        {/* Footer: Persona Switcher (Left) + Send Button (Right) */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative" }}>
          
          {/* Embedded Persona Switcher */}
          <div ref={pickerRef} style={{ position: "relative" }}>
            <button
              type="button"
              onClick={() => setPickerOpen(!pickerOpen)}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                background: pickerOpen ? "var(--hover-bg)" : "transparent",
                border: "none", borderRadius: 8,
                padding: "6px 10px", cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 500,
                color: "var(--text-muted)", transition: "all 0.2s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text-primary)"; e.currentTarget.style.background = "var(--hover-bg)"; }}
              onMouseLeave={(e) => { if (!pickerOpen) { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.background = "transparent"; } }}
            >
              <span style={{ color: "var(--scarlet)" }}><TheLemniscate width={14} height={9} /></span>
              {activePersona.name}
              <motion.svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" animate={{ rotate: pickerOpen ? 180 : 0 }}>
                <polyline points="6 9 12 15 18 9" />
              </motion.svg>
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {pickerOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  style={{
                    position: "absolute", bottom: "calc(100% + 8px)", left: 0,
                    width: 240, background: "var(--surface-2)",
                    border: "1px solid var(--border)", borderRadius: 12,
                    boxShadow: "0 10px 40px rgba(0,0,0,0.2)", overflow: "hidden", zIndex: 50,
                  }}
                >
                  <div style={{ padding: "10px 14px 8px", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-faint)", borderBottom: "1px solid var(--border-subtle)" }}>
                    Switch Persona
                  </div>
                  {PERSONAS.map(p => (
                    <button
                      key={p.id}
                      onClick={() => { if (!p.premium) onPersonaSwitch(p); setPickerOpen(false); }}
                      style={{
                        width: "100%", padding: "12px 14px", textAlign: "left",
                        background: personaId === p.id ? "var(--msg-user-bg)" : "transparent",
                        border: "none", borderLeft: `2px solid ${personaId === p.id ? "var(--scarlet)" : "transparent"}`,
                        display: "flex", alignItems: "center", gap: 10, cursor: "pointer", transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) => { if (personaId !== p.id) e.currentTarget.style.background = "var(--hover-bg)"; }}
                      onMouseLeave={(e) => { if (personaId !== p.id) e.currentTarget.style.background = "transparent"; }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, color: personaId === p.id ? "var(--text-primary)" : "var(--text-muted)", fontFamily: "'DM Sans', sans-serif" }}>
                          {p.name} {p.premium && <span style={{ fontSize: 9, color: p.accent, marginLeft: 6 }}>(Premium)</span>}
                        </div>
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Send Button */}
          <button
            type="button"
            onClick={() => { if (text.trim() && !disabled) { onSend(text.trim()); setText(""); } }}
            disabled={!text.trim() || disabled}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: 32, height: 32, borderRadius: 8, border: "none",
              background: text.trim() && !disabled ? "var(--scarlet)" : "var(--surface-2)",
              color: text.trim() && !disabled ? "#fff" : "var(--text-faint)",
              cursor: text.trim() && !disabled ? "pointer" : "default",
              transition: "all 0.2s",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>

        </div>
      </div>

      <div style={{ textAlign: "center", fontSize: 11, color: "var(--text-faint)", marginTop: 10 }}>
        Enter to send · Shift + Enter for new line
      </div>
    </div>
  );
}