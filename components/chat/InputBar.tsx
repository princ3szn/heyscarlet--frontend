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

const popSpring = { type: "spring", stiffness: 400, damping: 30 } as const;

export function InputBar({ onSend, disabled, personaId, onPersonaSwitch }: InputBarProps) {
  const [text, setText] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  const activePersona = PERSONAS.find(p => p.id === personaId) || PERSONAS[0];

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [text]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) setPickerOpen(false);
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
    <motion.div layout style={{ width: "100%", position: "relative", zIndex: 30 }}>
      
      <div style={{
        background: "var(--card-bg)", border: "1px solid var(--input-border)", borderRadius: 24,
        padding: "16px 20px", display: "flex", flexDirection: "column", gap: 14,
        boxShadow: "0 12px 40px rgba(0,0,0,0.15)", backdropFilter: "blur(24px)", transition: "border-color 0.3s",
      }}
      onFocus={(e) => e.currentTarget.style.borderColor = "var(--scarlet)"}
      onBlur={(e) => e.currentTarget.style.borderColor = "var(--input-border)"}
      >
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="What have you been deferring?"
          disabled={disabled}
          rows={1}
          style={{
            width: "100%", background: "transparent", border: "none", color: "var(--text-primary)",
            fontFamily: "'DM Sans', sans-serif", fontSize: 15, lineHeight: 1.6, resize: "none",
            outline: "none", maxHeight: 200, padding: 0
          }}
        />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative" }}>
          
          <div ref={pickerRef} style={{ position: "relative" }}>
            <motion.button whileTap={{ scale: 0.96 }} type="button" onClick={() => setPickerOpen(!pickerOpen)} style={{
                display: "flex", alignItems: "center", gap: 8, background: pickerOpen ? "var(--hover-bg)" : "var(--input-bg)",
                border: "1px solid var(--border)", borderRadius: 10, padding: "8px 12px", cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 500, color: "var(--text-primary)", transition: "all 0.2s",
              }}
            >
              <span style={{ color: activePersona.accent }}><TheLemniscate width={18} height={12} /></span>
              {activePersona.name}
              <motion.svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" animate={{ rotate: pickerOpen ? 180 : 0 }} transition={popSpring}>
                <polyline points="6 9 12 15 18 9" />
              </motion.svg>
            </motion.button>

            <AnimatePresence>
              {pickerOpen && (
                <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} transition={popSpring} style={{
                    position: "absolute", bottom: "calc(100% + 12px)", left: 0, width: 280, background: "var(--card-bg)",
                    border: "1px solid var(--border)", borderRadius: 14, boxShadow: "0 16px 48px rgba(0,0,0,0.4)", overflow: "hidden", zIndex: 50, backdropFilter: "blur(20px)"
                  }}
                >
                  <div style={{ padding: "12px 16px 8px", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-dim)", borderBottom: "1px solid var(--border-subtle)", fontFamily: "'DM Sans', sans-serif" }}>
                    Switch Persona
                  </div>
                  {PERSONAS.map(p => (
                    <button key={p.id} onClick={() => { if (!p.premium) onPersonaSwitch(p); setPickerOpen(false); }} style={{
                        width: "100%", padding: "14px 16px", textAlign: "left", background: personaId === p.id ? "var(--hover-bg)" : "transparent",
                        border: "none", borderLeft: `3px solid ${personaId === p.id ? p.accent : "transparent"}`, display: "flex", alignItems: "center", gap: 10, cursor: p.premium ? "default" : "pointer", transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) => { if (personaId !== p.id && !p.premium) e.currentTarget.style.background = "var(--hover-bg)"; }}
                      onMouseLeave={(e) => { if (personaId !== p.id) e.currentTarget.style.background = "transparent"; }}
                    >
                      <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, opacity: p.premium ? 0.6 : 1 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: p.accent }}></div>
                        <div style={{ fontSize: 13, color: "var(--text-primary)", fontFamily: "'DM Sans', sans-serif", fontWeight: 500, display: "flex", alignItems: "center", flexWrap: "wrap", gap: "6px" }}>
                          {p.name} 
                          {p.premium && <span style={{ fontSize: 9, color: p.accent, padding: "2px 6px", background: `${p.accent}20`, borderRadius: 4, textTransform: "uppercase", whiteSpace: "nowrap" }}>Coming Soon</span>}
                        </div>
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.button whileTap={{ scale: text.trim() && !disabled ? 0.9 : 1 }} type="button" onClick={() => { if (text.trim() && !disabled) { onSend(text.trim()); setText(""); } }} disabled={!text.trim() || disabled} style={{
              display: "flex", alignItems: "center", justifyContent: "center", width: 40, height: 40, borderRadius: 12, border: "none",
              background: text.trim() && !disabled ? "var(--scarlet)" : "var(--surface)", color: text.trim() && !disabled ? "#fff" : "var(--text-muted)", cursor: text.trim() && !disabled ? "pointer" : "default", transition: "background 0.2s, color 0.2s",
              boxShadow: text.trim() && !disabled ? "0 4px 16px var(--scarlet-glow)" : "none"
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </motion.button>

        </div>
      </div>

      <div style={{ textAlign: "center", fontSize: 11, color: "var(--text-faint)", marginTop: 12, fontFamily: "'DM Sans', sans-serif" }}>
        Enter to send &nbsp;&middot;&nbsp; Shift + Enter for new line
      </div>
    </motion.div>
  );
}