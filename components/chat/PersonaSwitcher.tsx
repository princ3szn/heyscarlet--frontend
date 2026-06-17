"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

function TheLemniscate({ width = 24, height = 24, style }: { width?: number | string, height?: number | string, style?: React.CSSProperties }) {
  return (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <path d="M4 12c0-2.2 1.8-4 4-4 2.8 0 4.8 4 8 8 2.2 0 4-1.8 4-4s-1.8-4-4-4c-2.8 0-4.8 4-8 8-2.2 0-4-1.8-4-4z" />
    </svg>
  );
}

// ---------------------------------------------------------------
// Persona definitions
// ---------------------------------------------------------------
export type PersonaId = "scarlet" | "executive" | "anchor";

export interface Persona {
  id: PersonaId;
  name: string;
  tagline: string;
  accent: string;
  accentDeep: string;
  accentGlow: string;
  premium: boolean;
  description: string;
}

export const PERSONAS: Persona[] = [
  {
    id: "scarlet",
    name: "Scarlet",
    tagline: "Balanced · Strategic · Present",
    accent: "#C0392B",
    accentDeep: "#8B1A1A",
    accentGlow: "rgba(192,57,43,0.15)",
    premium: false,
    description: "Your default companion. Poised, precise, and genuinely challenging.",
  },
  {
    id: "executive",
    name: "The Executive",
    tagline: "Direct · Pressured · Zero cushioning",
    accent: "#E8A020",
    accentDeep: "#A06010",
    accentGlow: "rgba(232,160,32,0.15)",
    premium: true,
    description: "No patience for excuses. High pressure, high output. For when you need to be pushed hard.",
  },
  {
    id: "anchor",
    name: "The Anchor",
    tagline: "Warm · Patient · Unconditional",
    accent: "#4A90C4",
    accentDeep: "#2A5A8A",
    accentGlow: "rgba(74,144,196,0.15)",
    premium: true,
    description: "The quiet room. Deep patience, slow challenge. For recovery, grief, and identity-level work.",
  },
];

// ---------------------------------------------------------------
// Persona takeover animation
// ---------------------------------------------------------------
function PersonaTakeover({
  persona,
  onComplete,
}: {
  persona: Persona;
  onComplete: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 1, 0] }}
      transition={{ duration: 1.6, times: [0, 0.2, 0.75, 1], ease: "easeInOut" }}
      onAnimationComplete={onComplete}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#040404",
        pointerEvents: "none",
      }}
    >
      {/* Radial burst in persona color */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 3], opacity: [0.6, 0] }}
        transition={{ duration: 1.4, ease: "easeOut" }}
        style={{
          position: "absolute",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${persona.accent}40 0%, transparent 70%)`,
          filter: "blur(40px)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
        style={{ marginBottom: 24, position: "relative", zIndex: 1 }}
      >
        <TheLemniscate width={80} height={50} style={{
          filter: `drop-shadow(0 0 30px ${persona.accent}80)`,
        }} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.6 }}
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 36,
          fontWeight: 300,
          color: "#fff",
          position: "relative",
          zIndex: 1,
          textAlign: "center",
          lineHeight: 1.2,
        }}
      >
        {persona.name === "Scarlet" ? (
          <>You&apos;re back with <em style={{ color: persona.accent, fontStyle: "italic" }}>Scarlet.</em></>
        ) : (
          <><em style={{ color: persona.accent, fontStyle: "italic" }}>{persona.name}</em> is here.</>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        style={{
          fontSize: 12,
          color: "rgba(228,221,215,0.4)",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          marginTop: 12,
          position: "relative",
          zIndex: 1,
        }}
      >
        {persona.tagline}
      </motion.div>
    </motion.div>
  );
}

// ---------------------------------------------------------------
// Upgrade prompt modal
// ---------------------------------------------------------------
function UpgradeModal({
  persona,
  onClose,
}: {
  persona: Persona;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.75)",
        zIndex: 150,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 12 }}
        transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#0e0e0e",
          border: `1px solid ${persona.accent}30`,
          borderRadius: 14,
          padding: "32px 28px 24px",
          maxWidth: 380,
          width: "100%",
          textAlign: "center",
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
          <TheLemniscate width={52} height={32} style={{
            filter: `drop-shadow(0 0 12px ${persona.accent}60)`,
          }} />
        </div>

        <div style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 24,
          fontWeight: 300,
          color: "#fff",
          marginBottom: 8,
          lineHeight: 1.3,
        }}>
          {persona.name}
        </div>

        <div style={{
          fontSize: 11,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: persona.accent,
          marginBottom: 16,
        }}>
          Premium Persona
        </div>

        <div style={{
          fontSize: 13,
          color: "rgba(228,221,215,0.45)",
          lineHeight: 1.75,
          marginBottom: 8,
          fontWeight: 300,
        }}>
          {persona.description}
        </div>

        <div style={{
          fontSize: 12,
          color: "rgba(228,221,215,0.25)",
          lineHeight: 1.7,
          marginBottom: 28,
          fontStyle: "italic",
          fontFamily: "'Cormorant Garamond', serif",
          
        }}>
          &quot;I operate it, but not here.&quot;
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "11px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 9,
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              color: "#555",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#888")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#555")}
          >
            Stay with Scarlet
          </button>
          <button
            style={{
              flex: 1,
              padding: "11px",
              background: `linear-gradient(135deg, ${persona.accentDeep}, ${persona.accent})`,
              border: "none",
              borderRadius: 9,
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              color: "#fff",
              cursor: "pointer",
              boxShadow: `0 4px 16px ${persona.accent}40`,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            Upgrade
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ---------------------------------------------------------------
// Persona picker dropdown
// ---------------------------------------------------------------
function PersonaPicker({
  current,
  onSelect,
  onClose,
}: {
  current: PersonaId;
  onSelect: (p: Persona) => void;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.96 }}
      transition={{ duration: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
      style={{
        position: "absolute",
        bottom: "calc(100% + 10px)",
        left: 0,
        width: 300,
        background: "#0e0e0e",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 12,
        overflow: "hidden",
        zIndex: 50,
        boxShadow: "0 16px 48px rgba(0,0,0,0.6)",
      }}
    >
      <div style={{
        padding: "12px 14px 8px",
        fontSize: 9,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: "#333",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
      }}>
        Choose your Scarlet
      </div>

      {PERSONAS.map((p) => {
        const isActive = current === p.id;
        return (
          <motion.button
            key={p.id}
            onClick={() => { onSelect(p); onClose(); }}
            whileHover={{ backgroundColor: "rgba(255,255,255,0.04)" }}
            style={{
              width: "100%",
              padding: "12px 14px",
              background: isActive ? "rgba(255,255,255,0.03)" : "transparent",
              border: "none",
              borderLeft: `2px solid ${isActive ? p.accent : "transparent"}`,
              cursor: "pointer",
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
              textAlign: "left",
              transition: "background 0.15s",
            }}
          >
            <div style={{ paddingTop: 2, flexShrink: 0 }}>
              <TheLemniscate width={28} height={18} style={{
                filter: isActive ? `drop-shadow(0 0 6px ${p.accent}80)` : "none",
                opacity: isActive ? 1 : 0.4,
                transition: "filter 0.2s, opacity 0.2s",
              }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                <span style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 15,
                  fontWeight: 300,
                  color: isActive ? "#fff" : "#666",
                  transition: "color 0.15s",
                }}>
                  {p.name}
                </span>
                {p.premium && (
                  <span style={{
                    fontSize: 8,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: p.accent,
                    background: `${p.accent}15`,
                    border: `1px solid ${p.accent}30`,
                    borderRadius: 4,
                    padding: "1px 5px",
                  }}>
                    Premium
                  </span>
                )}
              </div>
              <div style={{
                fontSize: 10,
                color: "#333",
                letterSpacing: "0.04em",
                lineHeight: 1.5,
              }}>
                {p.tagline}
              </div>
            </div>
          </motion.button>
        );
      })}
    </motion.div>
  );
}

// ---------------------------------------------------------------
// Main PersonaSwitcher component — lives inside the InputBar area
// ---------------------------------------------------------------
interface PersonaSwitcherProps {
  current: PersonaId;
  onSwitch: (persona: Persona) => void;
}

export function PersonaSwitcher({ current, onSwitch }: PersonaSwitcherProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [upgradeTarget, setUpgradeTarget] = useState<Persona | null>(null);
  const [takeover, setTakeover] = useState<Persona | null>(null);

  const currentPersona = PERSONAS.find((p) => p.id === current) ?? PERSONAS[0];

  function handleSelect(persona: Persona) {
    if (persona.premium) {
      setUpgradeTarget(persona);
      return;
    }
    if (persona.id === current) return;
    setTakeover(persona);
  }

  function handleTakeoverComplete() {
    if (takeover) {
      onSwitch(takeover);
      setTakeover(null);
    }
  }

  return (
    <>
      {/* Trigger button */}
      <div style={{ position: "relative" }}>
        <motion.button
          onClick={() => setPickerOpen((v) => !v)}
          whileHover={{ borderColor: `${currentPersona.accent}50` }}
          whileTap={{ scale: 0.97 }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "rgba(255,255,255,0.02)",
            border: `1px solid ${pickerOpen ? currentPersona.accent + "50" : "rgba(255,255,255,0.07)"}`,
            borderRadius: 8,
            padding: "6px 10px",
            cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 11,
            color: "#555",
            transition: "border-color 0.2s, color 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#888")}
          onMouseLeave={(e) => (e.currentTarget.style.color = pickerOpen ? "#888" : "#555")}
        >
          <TheLemniscate width={20} height={13} />
          <span style={{ letterSpacing: "0.04em" }}>{currentPersona.name}</span>
          <motion.svg
            width="10" height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            animate={{ rotate: pickerOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <polyline points="6 9 12 15 18 9" />
          </motion.svg>
        </motion.button>

        {/* Picker dropdown */}
        <AnimatePresence>
          {pickerOpen && (
            <>
              {/* Click outside to close */}
              <div
                style={{ position: "fixed", inset: 0, zIndex: 40 }}
                onClick={() => setPickerOpen(false)}
              />
              <PersonaPicker
                current={current}
                onSelect={handleSelect}
                onClose={() => setPickerOpen(false)}
              />
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Upgrade modal */}
      <AnimatePresence>
        {upgradeTarget && (
          <UpgradeModal
            persona={upgradeTarget}
            onClose={() => setUpgradeTarget(null)}
          />
        )}
      </AnimatePresence>

      {/* Takeover animation */}
      <AnimatePresence>
        {takeover && (
          <PersonaTakeover
            persona={takeover}
            onComplete={handleTakeoverComplete}
          />
        )}
      </AnimatePresence>
    </>
  );
}