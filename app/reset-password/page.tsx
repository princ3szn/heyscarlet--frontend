"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { authApi } from "@/lib/apiClient";
import { TheLemniscate } from "@/components/ui/TheLemniscate";

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

// Cinematic Particle Background (Hydration Safe)
function Particles() {
  const [mounted, setMounted] = useState(false);
  const [particles, setParticles] = useState<any[]>([]);

  useEffect(() => {
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
        <motion.div key={p.id} animate={{ y: ["0vh", "-100vh"], x: p.x, opacity: [0, 0.5, 0] }} transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "linear" }} style={{ position: "absolute", bottom: "-10%", left: p.left, width: p.size, height: p.size, borderRadius: "50%", background: "var(--scarlet)", boxShadow: "0 0 10px var(--scarlet)" }} />
      ))}
    </div>
  );
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // SECURITY FIX: Capture token in state on initial load...
  const [token] = useState<string | null>(searchParams.get("token"));

  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  // SECURITY FIX: ...then immediately scrub the URL bar so it cannot leak via Referer headers.
  useEffect(() => {
    if (token) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [token]);

  // Strict Password Complexity Rules
  const criteria = [
    { id: "length", label: "At least 8 characters", met: password.length >= 8 },
    { id: "upper", label: "One uppercase letter", met: /[A-Z]/.test(password) },
    { id: "lower", label: "One lowercase letter", met: /[a-z]/.test(password) },
    { id: "num", label: "One number", met: /[0-9]/.test(password) },
    { id: "spec", label: "One special character", met: /[^A-Za-z0-9]/.test(password) },
  ];

  const score = criteria.filter(c => c.met).length;
  const allMet = score === criteria.length;

  let strengthColor = "var(--border)";
  let strengthLabel = "Weak";
  if (score >= 2) { strengthColor = "#F59E0B"; strengthLabel = "Fair"; }
  if (score >= 4) { strengthColor = "#3B82F6"; strengthLabel = "Good"; }
  if (score === 5) { strengthColor = "#27AE60"; strengthLabel = "Strong"; }
  if (password.length === 0) strengthLabel = "";

  if (!token) {
    return (
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--msg-user-bg)", border: "1px solid var(--msg-user-border)", color: "var(--scarlet)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path><line x1="3" y1="3" x2="21" y2="21"></line></svg>
        </div>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 300, marginBottom: 12 }}>Invalid Link</h2>
        <p style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.6, marginBottom: 32 }}>
          For your security, password reset links expire after a short time and can only be used once. Please request a new link to continue.
        </p>
        <button onClick={() => router.push("/forgot-password")} style={{ width: "100%", padding: "14px", background: "var(--text-primary)", border: "none", borderRadius: 10, color: "var(--void)", fontWeight: 500, fontSize: 13, cursor: "pointer", transition: "opacity 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.opacity="0.8"} onMouseLeave={(e) => e.currentTarget.style.opacity="1"}>
          Request New Link
        </button>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!allMet) {
      setError("Please meet all password requirements before continuing.");
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword(token as string, password);
      setSuccess(true);
      setTimeout(() => router.push("/auth"), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: "center" }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(39,174,96,0.1)", border: "1px solid rgba(39,174,96,0.3)", color: "#27AE60", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
        </div>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 300, marginBottom: 12 }}>Password Updated</h2>
        <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.6 }}>Your new key has been secured. Redirecting you to the room...</p>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 300, textAlign: "center", marginBottom: 12 }}>New Password</h1>
      <p style={{ fontSize: 13, color: "var(--text-dim)", textAlign: "center", marginBottom: 32, lineHeight: 1.6 }}>
        Create a new, highly secure password to protect your data and access.
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
        <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <span style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-muted)" }}>Secure Password</span>
          <span style={{ fontSize: 11, color: strengthColor, fontWeight: 500, transition: "color 0.3s" }}>{strengthLabel}</span>
        </label>
        
        <div style={{ position: "relative", marginBottom: 12 }}>
          <input
            type={showPw ? "text" : "password"}
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(""); }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Min. 8 characters"
            disabled={loading}
            style={{
              width: "100%", background: "var(--input-bg)",
              border: `1px solid ${isFocused ? "var(--scarlet)" : "var(--input-border)"}`,
              borderRadius: 10, padding: "14px 42px 14px 16px", fontSize: 14, color: "var(--text-primary)", outline: "none",
              boxShadow: isFocused ? "0 0 0 3px rgba(192,57,43,0.15)" : "none",
              transition: "all 0.3s ease"
            }}
          />
          <button
            type="button"
            onClick={() => setShowPw(!showPw)}
            style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text-dim)", cursor: "pointer", display: "flex", alignItems: "center", padding: 4 }}
          >
            <EyeIcon open={showPw} />
          </button>
        </div>

        <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
          {[...Array(5)].map((_, i) => (
            <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i < score ? strengthColor : "var(--border)", transition: "background 0.3s ease" }} />
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 32 }}>
          {criteria.map((c) => (
            <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: c.met ? "var(--text-primary)" : "var(--text-dim)", transition: "color 0.3s" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ color: c.met ? "#27AE60" : "transparent" }}>
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              {c.label}
            </div>
          ))}
        </div>

        <motion.button
          type="submit"
          disabled={loading || !allMet}
          whileHover={{ scale: loading || !allMet ? 1 : 1.02 }}
          whileTap={{ scale: loading || !allMet ? 1 : 0.98 }}
          style={{ width: "100%", padding: "14px", background: "linear-gradient(135deg, var(--scarlet-deep), var(--scarlet))", border: "none", borderRadius: 10, fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 500, color: "#fff", cursor: loading || !allMet ? "not-allowed" : "pointer", opacity: loading || !allMet ? 0.5 : 1, boxShadow: "0 8px 24px rgba(192,57,43,0.3)" }}
        >
          {loading ? (
            <span style={{ display: "inline-block", width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
          ) : "Update Password"}
        </motion.button>
      </form>
    </motion.div>
  );
}

export default function ResetPasswordPage() {
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
        mixBlendMode: "var(--glow-blend)" as any,
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

        <Suspense fallback={<div style={{ textAlign: "center", padding: "40px" }}><span style={{ display: "inline-block", width: 24, height: 24, border: "2px solid var(--border)", borderTopColor: "var(--scarlet)", borderRadius: "50%", animation: "spin 1s linear infinite" }} /></div>}>
          <ResetPasswordForm />
        </Suspense>
      </motion.div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
