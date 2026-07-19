"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { authApi } from "@/lib/apiClient";
import { TheLemniscate } from "@/components/ui/TheLemniscate";
import { useRouter } from "next/navigation";

// Floating particle effect for the background (Hydration Safe)
function Particles() {
  const [mounted, setMounted] = useState(false);
  const [particles, setParticles] = useState<{id: number, x: number, delay: number, duration: number, left: string, size: number}[]>([]);

  useEffect(() => {
    // Generate random values only on the client
    const generated = [...Array(15)].map((_, i) => ({
      id: i,
      x: Math.sin(i) * 50,
      delay: Math.random() * 10,
      duration: Math.random() * 10 + 10,
      left: `${Math.random() * 100}%`,
      size: Math.random() * 4 + 1
    }));
    setParticles(generated);
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          animate={{
            y: ["0vh", "-100vh"],
            x: p.x,
            opacity: [0, 0.5, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "linear",
          }}
          style={{
            position: "absolute",
            bottom: "-10%",
            left: p.left,
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            background: "var(--scarlet)",
            boxShadow: "0 0 10px var(--scarlet)",
          }}
        />
      ))}
    </div>
  );
}

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      await authApi.forgotPassword(email.trim());
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      position: "relative",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--void)",
      color: "var(--text-primary)",
      fontFamily: "'DM Sans', sans-serif",
      overflow: "hidden"
    }}>
      
      {/* Cinematic Background Elements */}
      <div style={{
        position: "absolute",
        bottom: 0, left: 0, right: 0, height: "60%",
        backgroundImage: `linear-gradient(var(--border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)`,
        backgroundSize: "44px 44px",
        transform: "perspective(600px) rotateX(60deg)",
        transformOrigin: "bottom center",
        maskImage: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 80%)",
        WebkitMaskImage: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 80%)",
        pointerEvents: "none",
        zIndex: 0
      }} />
      <div style={{
        position: "absolute",
        width: 600, height: 600,
        background: "radial-gradient(circle, rgba(192,57,43,0.15) 0%, transparent 60%)",
        filter: "blur(60px)",
        mixBlendMode: "var(--glow-blend)" as "normal",
        pointerEvents: "none",
        zIndex: 0
      }} />
      <Particles />

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: "relative",
          zIndex: 10,
          width: "100%",
          maxWidth: 420,
          padding: 48,
          background: "var(--card-bg)",
          border: "1px solid var(--border)",
          borderRadius: 24,
          boxShadow: "0 32px 64px rgba(0,0,0,0.4)",
          backdropFilter: "blur(20px)"
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 32 }}>
          <motion.div animate={{ filter: ["drop-shadow(0 0 10px rgba(192,57,43,0.2))", "drop-shadow(0 0 24px rgba(192,57,43,0.6))", "drop-shadow(0 0 10px rgba(192,57,43,0.2))"] }} transition={{ duration: 4, repeat: Infinity }}>
            <TheLemniscate width={56} height={32} style={{ color: "var(--scarlet)" }} />
          </motion.div>
        </div>

        <AnimatePresence mode="wait">
          {success ? (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: "center" }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(39,174,96,0.1)", border: "1px solid rgba(39,174,96,0.3)", color: "#27AE60", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              </div>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 300, marginBottom: 12 }}>Check your inbox</h2>
              <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.6, marginBottom: 32 }}>If an account exists for that email, we have sent instructions to reset your password.</p>
              <button onClick={() => router.push("/auth")} style={{ width: "100%", padding: "14px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 10, color: "var(--text-primary)", fontSize: 13, cursor: "pointer", transition: "all 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.background="var(--hover-bg)"} onMouseLeave={(e) => e.currentTarget.style.background="var(--surface-2)"}>
                Return to Sign In
              </button>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 300, textAlign: "center", marginBottom: 12 }}>Recovery</h1>
              <p style={{ fontSize: 13, color: "var(--text-dim)", textAlign: "center", marginBottom: 32, lineHeight: 1.6 }}>
                Enter your email address. We will send you a secure link to regain access to your room.
              </p>

              <AnimatePresence>
                {error && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden", marginBottom: 20 }}>
                    <div style={{ padding: "12px 14px", background: "var(--msg-user-bg)", border: "1px solid var(--msg-user-border)", borderRadius: 8, fontSize: 12, color: "var(--scarlet)", display: "flex", alignItems: "center", gap: 8 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                      {error}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit}>
                <label style={{ display: "block", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 8 }}>Email Address</label>
                <div style={{ position: "relative", marginBottom: 32 }}>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(""); }}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder="you@example.com"
                    disabled={loading}
                    style={{
                      width: "100%", background: "var(--input-bg)",
                      border: `1px solid ${isFocused ? "var(--scarlet)" : "var(--input-border)"}`,
                      borderRadius: 10, padding: "14px 16px", fontSize: 14, color: "var(--text-primary)", outline: "none",
                      boxShadow: isFocused ? "0 0 0 3px rgba(192,57,43,0.15)" : "none",
                      transition: "all 0.3s ease"
                    }}
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={loading || !email}
                  whileHover={{ scale: loading || !email ? 1 : 1.02 }}
                  whileTap={{ scale: loading || !email ? 1 : 0.98 }}
                  style={{ width: "100%", padding: "14px", background: "linear-gradient(135deg, var(--scarlet-deep), var(--scarlet))", border: "none", borderRadius: 10, fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 500, color: "#fff", cursor: loading || !email ? "not-allowed" : "pointer", opacity: loading || !email ? 0.5 : 1, boxShadow: "0 8px 24px rgba(192,57,43,0.3)" }}
                >
                  {loading ? (
                    <span style={{ display: "inline-block", width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                  ) : "Send Recovery Link"}
                </motion.button>
              </form>

              <div style={{ textAlign: "center", marginTop: 24 }}>
                <a href="/auth" style={{ fontSize: 12, color: "var(--text-dim)", textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.color="var(--text-primary)"} onMouseLeave={(e) => e.currentTarget.style.color="var(--text-dim)"}>
                  Cancel and return to Sign In
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
