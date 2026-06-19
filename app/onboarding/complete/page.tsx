"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useSpring, useTransform } from "framer-motion";
import { authApi } from "@/lib/apiClient";
import { useAuthStore } from "@/store/authStore";
import { TheLemniscate } from "@/components/ui/TheLemniscate";

const appleEase: [number, number, number, number] = [0.16, 1, 0.3, 1];

function LemniscateHero() {
  const containerRef = useRef<HTMLDivElement>(null);

  const mouseX = useSpring(0, { stiffness: 70, damping: 18 });
  const mouseY = useSpring(0, { stiffness: 70, damping: 18 });

  const rotateY = useTransform(mouseX, [-1, 1], [-30, 30]);
  const rotateX = useTransform(mouseY, [-1, 1], [20, -20]);

  useEffect(() => {
    function onMove(e: MouseEvent) {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      mouseX.set(nx);
      mouseY.set(ny);
    }
    function onLeave() {
      mouseX.set(0);
      mouseY.set(0);
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, [mouseX, mouseY]);

  return (
    <div
      ref={containerRef}
      style={{
        marginBottom: 44,
        display: "flex",
        justifyContent: "center",
        perspective: "900px",
        perspectiveOrigin: "50% 50%",
      }}
    >
      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.4 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.4, ease: appleEase, delay: 0.1 }}
        >
          <motion.div
            animate={{
              y: [0, -14, 0],
              filter: [
                "drop-shadow(0 0 20px var(--scarlet-glow)) drop-shadow(0 0 60px rgba(139,26,26,0.15))",
                "drop-shadow(0 0 44px rgba(248,212,160,0.4)) drop-shadow(0 0 100px var(--scarlet-glow))",
                "drop-shadow(0 0 20px var(--scarlet-glow)) drop-shadow(0 0 60px rgba(139,26,26,0.15))",
              ],
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            style={{ mixBlendMode: "var(--glow-blend)" as any }}
          >
            <TheLemniscate width={260} height={160} style={{ color: "var(--scarlet)" }} />
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}

function ProgressDots({ step }: { step: number }) {
  return (
    <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 32 }}>
      {[1, 2].map((i) => (
        <div key={i} style={{
          width: 6, height: 6, borderRadius: "50%",
          background:
            i < step ? "var(--msg-user-bg)"
            : i === step ? "var(--scarlet)"
            : "var(--border-subtle)",
          transition: "background 0.5s",
        }} />
      ))}
    </div>
  );
}

export default function OnboardingCompletePage() {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // if (!accessToken) router.push("/auth");
  }, [accessToken, router]);

  // Smooth cinematic choreography without layout jumps
  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 600);
    const t2 = setTimeout(() => setStep(2), 1400);
    const t3 = setTimeout(() => setStep(3), 2400);
    const t4 = setTimeout(() => setStep(4), 3600);
    return () => [t1, t2, t3, t4].forEach(clearTimeout);
  }, []);

  async function handleComplete() {
    if (loading) return;
    setLoading(true);
    setError("");
    try {
      await authApi.completeOnboarding();
      router.push("/chat");
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  const buttonSpring = { type: "spring", stiffness: 400, damping: 25 } as const;

  return (
    <>
      <style>{`
        @keyframes hs-morph-c {
          0%   { border-radius: 40% 60% 70% 30% / 40% 40% 60% 50%; transform: rotate(0deg) scale(1); }
          33%  { border-radius: 70% 30% 50% 50% / 30% 30% 70% 70%; transform: rotate(120deg) scale(1.05); }
          66%  { border-radius: 100% 60% 60% 100% / 100% 100% 60% 60%; transform: rotate(240deg) scale(0.95); }
          100% { border-radius: 40% 60% 70% 30% / 40% 40% 60% 50%; transform: rotate(360deg) scale(1); }
        }
        @keyframes hs-spin-c { to { transform: rotate(360deg); } }
      `}</style>

      <main style={{
        position: "relative",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--void)",
        color: "var(--text-primary)",
        transition: "background 0.35s ease, color 0.35s ease",
        overflow: "hidden",
        fontFamily: "'DM Sans', sans-serif",
        textAlign: "center",
        padding: "40px 24px",
      }}>

        <div style={{
          position: "absolute",
          width: 600, height: 600,
          top: "50%", left: "50%",
          transform: "translate(-50%,-50%)",
          background: "radial-gradient(ellipse at 40% 40%, rgba(139,26,26,0.2) 0%, rgba(192,57,43,0.05) 50%, transparent 70%)",
          animation: "hs-morph-c 22s linear infinite",
          filter: "blur(90px)",
          mixBlendMode: "var(--glow-blend)" as any,
          pointerEvents: "none",
          zIndex: 0,
        }} />

        <div style={{
          position: "absolute",
          bottom: 0, left: 0, right: 0, height: "40%",
          backgroundImage: `
            linear-gradient(var(--border-subtle) 1px, transparent 1px),
            linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)
          `,
          backgroundSize: "44px 44px",
          transform: "perspective(600px) rotateX(55deg)",
          transformOrigin: "bottom center",
          maskImage: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 75%)",
          WebkitMaskImage: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 75%)",
          zIndex: 0,
          pointerEvents: "none",
        }} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 1.4, ease: appleEase }}
          style={{
            position: "absolute", top: 32, left: 40,
            display: "flex", alignItems: "center", gap: 10, zIndex: 10,
          }}
        >
          <TheLemniscate width={50} height={28} style={{ color: "var(--text-primary)" }} />
          <div style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 18, fontWeight: 300, color: "var(--text-primary)", letterSpacing: "0.02em",
          }}>
            Hey<span style={{ color: "var(--scarlet)" }}>Scarlet</span>
          </div>
        </motion.div>

        <div style={{ position: "relative", zIndex: 2, maxWidth: 520 }}>

          <LemniscateHero />

          <ProgressDots step={step >= 2 ? 2 : 1} />

          <AnimatePresence>
            {step >= 2 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.4, ease: appleEase }}
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 38, fontWeight: 300,
                  lineHeight: 1.15, color: "var(--text-primary)", marginBottom: 20,
                }}
              >
                I have what I need.<br />
                <em style={{ fontStyle: "italic", color: "var(--scarlet)" }}>
                  Now we can begin.
                </em>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {step >= 3 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.4, ease: appleEase }}
                style={{
                  fontSize: 14,
                  color: "var(--text-dim)",
                  lineHeight: 1.88, fontWeight: 300,
                  maxWidth: 400, margin: "0 auto 36px",
                }}
              >
                What you just named has been sitting in that column long enough.
                I&apos;m not here to manage the journey &mdash; I&apos;m here to make sure
                you actually move. That starts now.
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {step >= 4 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.4, ease: appleEase }}
              >
                <motion.button
                  onClick={handleComplete}
                  disabled={loading}
                  whileHover={!loading ? { scale: 1.03, y: -2 } : {}}
                  whileTap={!loading ? { scale: 0.95 } : {}}
                  transition={buttonSpring}
                  style={{
                    padding: "14px 52px",
                    background: "linear-gradient(135deg, var(--scarlet-deep), var(--scarlet))",
                    border: "none",
                    borderRadius: 10,
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 13, fontWeight: 500,
                    color: "#ffffff", letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading ? 0.5 : 1,
                    boxShadow: "0 8px 32px var(--scarlet-glow)",
                    display: "flex", alignItems: "center", gap: 10,
                    margin: "0 auto",
                  }}
                >
                  {loading && (
                    <span style={{
                      width: 14, height: 14,
                      border: "2px solid rgba(255,255,255,0.25)",
                      borderTopColor: "#fff", borderRadius: "50%",
                      display: "inline-block",
                      animation: "hs-spin-c 0.7s linear infinite",
                    }} />
                  )}
                  Enter the Room
                </motion.button>

                {error && (
                  <div style={{ fontSize: 11, color: "var(--scarlet)", marginTop: 14 }}>
                    {error}
                  </div>
                )}

                <div style={{
                  fontSize: 10,
                  color: "var(--text-faint)",
                  marginTop: 16, letterSpacing: "0.04em",
                }}>
                  This marks onboarding complete
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </main>
    </>
  );
}
