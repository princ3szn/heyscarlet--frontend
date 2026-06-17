"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useSpring, useTransform } from "framer-motion";
import { apiFetch } from "@/lib/apiClient";
import { useAuthStore } from "@/store/authStore";
import { TheLemniscate } from "@/components/ui/TheLemniscate";

interface MemoryPayload {
  key: string;
  value: string;
  source: string;
  sensitivity_flag: boolean;
}

// ---------------------------------------------------------------
// Typing indicator
// ---------------------------------------------------------------
function TypingDots() {
  return (
    <div style={{ display: "flex", gap: 5, marginBottom: 20 }}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          style={{ width: 5, height: 5, borderRadius: "50%", background: "#C0392B" }}
          animate={{ y: [0, -6, 0], opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------
// Orbit ring
// ---------------------------------------------------------------
function OrbitRing({ size, duration, reverse, dotColor }: {
  size: number;
  duration: number;
  reverse?: boolean;
  dotColor?: string;
}) {
  return (
    <motion.div
      style={{
        position: "absolute",
        width: size, height: size,
        borderRadius: "50%",
        border: "1px solid rgba(192,57,43,0.11)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
      }}
      animate={{ rotate: reverse ? -360 : 360 }}
      transition={{ duration, repeat: Infinity, ease: "linear" }}
    >
      <div style={{
        width: 5, height: 5,
        borderRadius: "50%",
        background: dotColor ?? "#C0392B",
        boxShadow: `0 0 8px ${dotColor ?? "#C0392B"}`,
        marginTop: -2.5,
      }} />
    </motion.div>
  );
}

// ---------------------------------------------------------------
// Pulse ring
// ---------------------------------------------------------------
function PulseRing({ delay }: { delay: number }) {
  return (
    <motion.div
      style={{
        position: "absolute",
        width: 220, height: 120,
        borderRadius: "50%",
        border: "1px solid rgba(192,57,43,0.25)",
        pointerEvents: "none",
      }}
      animate={{ scale: [0.8, 2.6], opacity: [0.45, 0] }}
      transition={{ duration: 3.5, repeat: Infinity, delay, ease: "easeOut" }}
    />
  );
}

// ---------------------------------------------------------------
// Particle
// ---------------------------------------------------------------
function Particle({ x, y, delay }: { x: number; y: number; delay: number }) {
  return (
    <motion.div
      style={{
        position: "absolute",
        width: 3, height: 3,
        borderRadius: "50%",
        background: "#F5822A",
        top: "50%", left: "50%",
        pointerEvents: "none",
      }}
      animate={{
        x: [0, x], y: [0, y],
        opacity: [0, 0.9, 0],
        scale: [0, 1.4, 0],
      }}
      transition={{ duration: 4, repeat: Infinity, delay, ease: "easeOut" }}
    />
  );
}

// ---------------------------------------------------------------
// 3D mouse-reactive Lemniscate stage
// ---------------------------------------------------------------
function LemniscateStage() {
  const containerRef = useRef<HTMLDivElement>(null);

  const mouseX = useSpring(0, { stiffness: 80, damping: 20 });
  const mouseY = useSpring(0, { stiffness: 80, damping: 20 });

  const rotateY = useTransform(mouseX, [-1, 1], [-28, 28]);
  const rotateX = useTransform(mouseY, [-1, 1], [18, -18]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    function onMove(e: MouseEvent) {
      const r = el!.getBoundingClientRect();
      const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
      const ny = ((e.clientY - r.top) / r.height) * 2 - 1;
      mouseX.set(nx);
      mouseY.set(ny);
    }

    function onLeave() {
      mouseX.set(0);
      mouseY.set(0);
    }

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [mouseX, mouseY]);

  const PARTICLES = [
    { x: -90, y: -50 }, { x: 90, y: -50 },
    { x: -70, y: 55 },  { x: 70, y: 55 },
    { x: -120, y: 0 },  { x: 120, y: 0 },
    { x: 0, y: -110 },  { x: -80, y: -85 },
    { x: 80, y: -85 },  { x: -100, y: 35 },
  ];

  return (
    <>
      <style>{`
        @keyframes hs-stage-morph {
          0%   { border-radius: 40% 60% 70% 30% / 40% 40% 60% 50%; }
          33%  { border-radius: 70% 30% 50% 50% / 30% 30% 70% 70%; }
          66%  { border-radius: 100% 60% 60% 100% / 100% 100% 60% 60%; }
          100% { border-radius: 40% 60% 70% 30% / 40% 40% 60% 50%; }
        }
      `}</style>

      <div
        ref={containerRef}
        style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          overflow: "hidden",
          cursor: "none",
        }}
      >
        {/* Perspective grid floor */}
        <div style={{
          position: "absolute",
          bottom: 0, left: 0, right: 0, height: "55%",
          backgroundImage: `
            linear-gradient(rgba(192,57,43,0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(192,57,43,0.08) 1px, transparent 1px)
          `,
          backgroundSize: "44px 44px",
          transform: "perspective(600px) rotateX(55deg)",
          transformOrigin: "bottom center",
          maskImage: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 80%)",
          WebkitMaskImage: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 80%)",
          pointerEvents: "none",
        }} />

        {/* Scanline */}
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
          <motion.div
            style={{
              position: "absolute", left: 0, right: 0, height: 2,
              background: "linear-gradient(90deg, transparent, rgba(192,57,43,0.06), transparent)",
            }}
            animate={{ y: ["-100%", "100vh"] }}
            transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
          />
        </div>

        {/* Ambient blob */}
        <div style={{
          position: "absolute",
          width: 480, height: 480,
          background: "radial-gradient(ellipse at 40% 45%, rgba(139,26,26,0.28) 0%, rgba(192,57,43,0.06) 50%, transparent 70%)",
          animation: "hs-stage-morph 22s linear infinite",
          filter: "blur(70px)",
          mixBlendMode: "screen",
          pointerEvents: "none",
        }} />

        {/* 3D perspective wrapper — reacts to mouse */}
        <div style={{ perspective: "900px", perspectiveOrigin: "50% 50%" }}>
          <motion.div
            style={{
              rotateX,
              rotateY,
              transformStyle: "preserve-3d",
            }}
          >
            {/* Orbit + Lemniscate cluster */}
            <div style={{
              position: "relative",
              width: 440, height: 440,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <PulseRing delay={0} />
              <PulseRing delay={1.2} />
              <PulseRing delay={2.4} />

              <OrbitRing size={300} duration={20} />
              <OrbitRing size={400} duration={32} reverse dotColor="rgba(248,212,160,0.8)" />

              {PARTICLES.map((p, i) => (
                <Particle key={i} x={p.x} y={p.y} delay={i * 0.38} />
              ))}

              {/* The Lemniscate */}
              <motion.div
                initial={{ opacity: 0, scale: 0.5, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 1.5, ease: [0.2, 0.8, 0.2, 1], delay: 0.4 }}
                style={{ position: "relative", zIndex: 2, transformStyle: "preserve-3d" }}
              >
                <motion.div
                  animate={{
                    y: [0, -14, 0],
                    filter: [
                      "drop-shadow(0 0 24px rgba(192,57,43,0.35)) drop-shadow(0 0 70px rgba(139,26,26,0.18))",
                      "drop-shadow(0 0 50px rgba(248,212,160,0.45)) drop-shadow(0 0 110px rgba(192,57,43,0.28))",
                      "drop-shadow(0 0 24px rgba(192,57,43,0.35)) drop-shadow(0 0 70px rgba(139,26,26,0.18))",
                    ],
                  }}
                  transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                >
                  <TheLemniscate width={310} height={200} />
                </motion.div>
              </motion.div>

            </div>
          </motion.div>
        </div>

      </div>
    </>
  );
}

// ---------------------------------------------------------------
// Progress dots
// ---------------------------------------------------------------
function ProgressDots({ step }: { step: number }) {
  return (
    <div style={{ display: "flex", gap: 6, marginBottom: 28 }}>
      {[1, 2].map((i) => (
        <div key={i} style={{
          width: 6, height: 6, borderRadius: "50%",
          background:
            i < step ? "rgba(192,57,43,0.35)"
            : i === step ? "#C0392B"
            : "var(--border-subtle)", // Theme fix
          transition: "background 0.5s",
        }} />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------
// Main page
// ---------------------------------------------------------------
export default function OnboardingPage() {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);

  const [beatStep, setBeatStep] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const taRef = useRef<HTMLTextAreaElement>(null);

  // YOUR EXACT AUTH LOGIC
  useEffect(() => {
    // if (!accessToken) router.push("/auth");
  }, [accessToken, router]);

  useEffect(() => {
    const t1 = setTimeout(() => setBeatStep(1), 600);
    const t2 = setTimeout(() => setBeatStep(2), 2100);
    const t3 = setTimeout(() => setBeatStep(3), 3300);
    const t4 = setTimeout(() => setBeatStep(4), 5500);
    const t5 = setTimeout(() => setBeatStep(5), 7600);
    return () => [t1, t2, t3, t4, t5].forEach(clearTimeout);
  }, []);

  function handleTextarea(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInputValue(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  }

  async function handleSend() {
    const value = inputValue.trim();
    if (!value || loading) return;
    setError("");
    setLoading(true);
    try {
      await apiFetch<unknown>("/api/v1/memory", {
        method: "POST",
        body: JSON.stringify({
          key: "user_intro",
          value,
          source: "onboarding",
          sensitivity_flag: false,
        } satisfies MemoryPayload),
      });
      router.push("/onboarding/complete");
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  const progressStep = beatStep < 5 ? 1 : 2;
  const hasInput = inputValue.trim().length > 0;

  return (
    <>
      <style>{`
        @keyframes hs-spin { to { transform: rotate(360deg); } }
        .ob-ta::placeholder { color: var(--text-faint); font-style: italic; }
        .ob-ta::-webkit-scrollbar { width: 2px; }
        .ob-ta::-webkit-scrollbar-thumb { background: #8B1A1A; border-radius: 2px; }
      `}</style>

      <main style={{
        position: "relative",
        height: "100vh",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        background: "var(--void)", // FIXED FOR DARKMODE
        color: "var(--text-primary)", // FIXED FOR DARKMODE
        transition: "background 0.35s ease, color 0.35s ease",
        overflow: "hidden",
        fontFamily: "'DM Sans', sans-serif",
      }}>

        {/* LEFT — 3D Lemniscate stage */}
        <div style={{ position: "relative", borderRight: "1px solid rgba(192,57,43,0.1)" }}>
          <LemniscateStage />
        </div>

        {/* RIGHT — Form */}
        <div style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px",
          zIndex: 3,
        }}>
          <div style={{
            position: "absolute", top: "-10%", right: "-10%",
            width: 380, height: 380,
            background: "radial-gradient(circle, rgba(248,212,160,0.04) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />

          <div style={{ width: "100%", maxWidth: 400 }}>

            {/* Wordmark */}
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 40 }}
            >
              <motion.div
                animate={{
                  filter: [
                    "drop-shadow(0 0 5px rgba(192,57,43,0.25))",
                    "drop-shadow(0 0 12px rgba(248,212,160,0.4))",
                    "drop-shadow(0 0 5px rgba(192,57,43,0.25))",
                  ],
                }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
              >
                <TheLemniscate width={50} height={28} />
              </motion.div>
              <div style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 18, fontWeight: 300, color: "var(--text-primary)", letterSpacing: "0.02em",
              }}>
                Hey<span style={{ color: "#C0392B" }}>Scarlet</span>
              </div>
            </motion.div>

            <ProgressDots step={progressStep} />

            <AnimatePresence>
              {beatStep === 1 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <TypingDots />
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {beatStep >= 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1.2, ease: [0.2, 0.8, 0.2, 1] }}
                  style={{
                    fontSize: 10, letterSpacing: "0.2em",
                    textTransform: "uppercase", color: "#C0392B", marginBottom: 14,
                  }}
                >
                  First time here
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {beatStep >= 3 && (
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1.3, ease: [0.2, 0.8, 0.2, 1] }}
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 40, fontWeight: 300,
                    lineHeight: 1.12, color: "var(--text-primary)", marginBottom: 18,
                  }}
                >
                  Good — you&apos;re here.<br />
                  That&apos;s already the{" "}
                  <em style={{ fontStyle: "italic", color: "#C0392B" }}>move</em>
                  <br />
                  most people don&apos;t make.
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {beatStep >= 4 && (
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1.3, ease: [0.2, 0.8, 0.2, 1] }}
                  style={{
                    fontSize: 13,
                    color: "var(--text-dim)",
                    lineHeight: 1.88, fontWeight: 300,
                    marginBottom: 32,
                  }}
                >
                  I&apos;m not here to manage your tasks or track your habits.<br />
                  I&apos;m here for the gap — the distance between where you are<br />
                  and where you can feel yourself going.
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {beatStep >= 5 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, ease: [0.2, 0.8, 0.2, 1] }}
                >
                  <span style={{
                    display: "block", fontSize: 9,
                    letterSpacing: "0.14em", textTransform: "uppercase",
                    color: "rgba(192,57,43,0.6)", marginBottom: 10,
                  }}>
                    Scarlet is listening
                  </span>

                  <div style={{
                    position: "relative",
                    background: hasInput ? "var(--msg-user-bg)" : "var(--input-bg)",
                    border: `1px solid ${hasInput ? "rgba(192,57,43,0.4)" : "var(--input-border)"}`,
                    borderRadius: 12,
                    padding: "15px 52px 15px 18px",
                    transition: "border-color 0.3s, background 0.3s",
                  }}>
                    <textarea
                      ref={taRef}
                      className="ob-ta"
                      value={inputValue}
                      onChange={handleTextarea}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                      rows={2}
                      placeholder="Tell me the one thing you&apos;ve been carrying the longest — the thing that keeps sitting in the someday column — that you&apos;re genuinely ready to stop deferring. Start there."
                      style={{
                        width: "100%", background: "none", border: "none", outline: "none",
                        fontSize: 13, color: "var(--text-primary)", resize: "none", lineHeight: 1.75,
                        minHeight: 50, maxHeight: 120, overflowY: "auto",
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    />

                    <button
                      onClick={handleSend}
                      disabled={!hasInput || loading}
                      style={{
                        position: "absolute", right: 11, bottom: 11,
                        width: 32, height: 32, borderRadius: 8,
                        background: "#C0392B", border: "none",
                        cursor: hasInput && !loading ? "pointer" : "not-allowed",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        opacity: hasInput && !loading ? 1 : 0.35,
                        transition: "opacity 0.2s",
                      }}
                    >
                      {loading ? (
                        <span style={{
                          width: 13, height: 13, border: "2px solid rgba(255,255,255,0.25)",
                          borderTopColor: "#fff", borderRadius: "50%",
                          display: "inline-block", animation: "hs-spin 0.7s linear infinite",
                        }} />
                      ) : (
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="22" y1="2" x2="11" y2="13" />
                          <polygon points="22 2 15 22 11 13 2 9 22 2" />
                        </svg>
                      )}
                    </button>
                  </div>

                  {error && (
                    <div style={{ fontSize: 11, color: "#e05a4e", marginTop: 8 }}>
                      {error}
                    </div>
                  )}

                  <div style={{
                    fontSize: 9, color: "var(--text-faint)",
                    marginTop: 8, letterSpacing: "0.04em",
                  }}>
                    Enter to send &nbsp;&middot;&nbsp; Shift + Enter for new line
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>

        {/* Vertical divider */}
        <div style={{
          position: "absolute",
          left: "50%", top: "8%", bottom: "8%",
          width: 1,
          background: "linear-gradient(to bottom, transparent, rgba(192,57,43,0.15) 30%, rgba(192,57,43,0.15) 70%, transparent)",
          pointerEvents: "none",
          zIndex: 4,
        }} />

      </main>
    </>
  );
}
