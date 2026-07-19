"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { useRouter } from "next/navigation";
import { authApi } from "@/lib/apiClient";
import { useAuthStore } from "@/store/authStore";
import { TheLemniscate } from "@/components/ui/TheLemniscate";

// ---------------------------------------------------------------
// Security constants
// ---------------------------------------------------------------
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; 
const LOCKOUT_KEY = "hs_lockout";
const ATTEMPTS_KEY = "hs_attempts";

// ---------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------
function validateEmail(v: string): string {
  if (!v.trim()) return "Email is required.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())) return "Enter a valid email address.";
  if (v.length > 254) return "Email is too long.";
  return "";
}

function validateName(v: string, label: string): string {
  if (!v.trim()) return `${label} is required.`;
  if (v.trim().length < 2) return `${label} must be at least 2 characters.`;
  if (v.trim().length > 50) return `${label} is too long.`;
  if (!/^[a-zA-Z\s\-']+$/.test(v.trim())) return `${label} contains invalid characters.`;
  return "";
}

function validateUsername(v: string): string {
  if (!v.trim()) return "Username is required.";
  if (v.trim().length < 3) return "Username must be at least 3 characters.";
  if (v.trim().length > 30) return "Username must be 30 characters or fewer.";
  if (!/^[a-zA-Z0-9_]+$/.test(v.trim())) return "Username can only contain letters, numbers, and underscores.";
  return "";
}

function sanitize(v: string): string {
  return v.replace(/\0/g, "").trim();
}

// ---------------------------------------------------------------
// Rate limiting helpers
// ---------------------------------------------------------------
function getAttempts(): number {
  if (typeof window === 'undefined') return 0;
  try { return parseInt(sessionStorage.getItem(ATTEMPTS_KEY) ?? "0", 10); } catch { return 0; }
}

function incrementAttempts(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const n = getAttempts() + 1;
    sessionStorage.setItem(ATTEMPTS_KEY, String(n));
    return n;
  } catch { return 0; }
}

function resetAttempts() {
  if (typeof window === 'undefined') return;
  try { sessionStorage.removeItem(ATTEMPTS_KEY); } catch {}
}

function getLockoutExpiry(): number {
  if (typeof window === 'undefined') return 0;
  try { return parseInt(sessionStorage.getItem(LOCKOUT_KEY) ?? "0", 10); } catch { return 0; }
}

function setLockout() {
  if (typeof window === 'undefined') return;
  try { sessionStorage.setItem(LOCKOUT_KEY, String(Date.now() + LOCKOUT_DURATION_MS)); } catch {}
}

function isLockedOut(): boolean {
  if (typeof window === 'undefined') return false;
  const expiry = getLockoutExpiry();
  if (expiry && Date.now() < expiry) return true;
  if (expiry) {
    try { sessionStorage.removeItem(LOCKOUT_KEY); sessionStorage.removeItem(ATTEMPTS_KEY); } catch {}
  }
  return false;
}

function lockoutRemainingSeconds(): number {
  if (typeof window === 'undefined') return 0;
  const expiry = getLockoutExpiry();
  if (!expiry) return 0;
  return Math.max(0, Math.ceil((expiry - Date.now()) / 1000));
}

// ---------------------------------------------------------------
// Quotes
// ---------------------------------------------------------------
const QUOTES = [
  '"You already know what to do."',
  '"Every week is a hard week. That\'s not new information."',
  '"The question is whether you\'re willing to do it."',
  '"I have been waiting. Let\'s begin."',
];

// ---------------------------------------------------------------
// Eye icon
// ---------------------------------------------------------------
function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

// ---------------------------------------------------------------
// Reusable Input field with Cinematic Focus Glow
// ---------------------------------------------------------------
interface FieldProps {
  label: string;
  id: string;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  error: string;
  onClearError: () => void;
  autoComplete?: string;
  maxLength?: number;
}

function Field({
  label, id, type = "text", placeholder, value, onChange,
  error, onClearError, autoComplete, maxLength = 254,
}: FieldProps) {
  const [showPw, setShowPw] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [shaking, setShaking] = useState(false);
  const prevError = useRef("");

  useEffect(() => {
    if (error && error !== prevError.current) {
      setShaking(true);
      const t = setTimeout(() => setShaking(false), 500);
      prevError.current = error;
      return () => clearTimeout(t);
    }
    if (!error) prevError.current = "";
  }, [error]);

  const inputType = type === "password" ? (showPw ? "text" : "password") : type;

  return (
    <div style={{ marginBottom: 16 }}>
      <label htmlFor={id} style={{
        display: "block",
        fontSize: 10,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: "var(--text-muted)",
        marginBottom: 7,
        fontFamily: "'DM Sans', sans-serif",
      }}>
        {label}
      </label>

      <motion.div
        animate={shaking ? {
          x: [0, -8, 8, -6, 6, -3, 3, 0],
          transition: { duration: 0.45, ease: "easeInOut" },
        } : {}}
        style={{ position: "relative" }}
      >
        <input
          id={id}
          type={inputType}
          placeholder={placeholder}
          value={value}
          maxLength={maxLength}
          autoComplete={autoComplete}
          spellCheck={false}
          autoCapitalize="off"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChange={(e) => {
            onChange(e.target.value);
            if (error) onClearError();
          }}
          style={{
            width: "100%",
            background: error ? "var(--msg-user-bg)" : "var(--input-bg)",
            border: `1px solid ${error ? "var(--scarlet)" : isFocused ? "var(--scarlet)" : "var(--input-border)"}`,
            borderRadius: 9,
            padding: type === "password" ? "12px 42px 12px 14px" : "12px 14px",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 14,
            color: "var(--text-primary)",
            outline: "none",
            boxShadow: isFocused && !error ? "0 0 0 3px rgba(192,57,43,0.15)" : "none",
            transition: "all 0.3s ease",
          }}
        />

        {type === "password" && (
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            aria-label={showPw ? "Hide password" : "Show password"}
            style={{
              position: "absolute",
              right: 12, top: "50%",
              transform: "translateY(-50%)",
              background: "none", border: "none",
              cursor: "pointer",
              color: "var(--text-dim)",
              padding: 4,
              display: "flex", alignItems: "center",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-dim)")}
          >
            <EyeIcon open={showPw} />
          </button>
        )}
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: 5 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              fontSize: 11,
              color: "var(--scarlet)",
              display: "flex",
              alignItems: "center",
              gap: 5,
              overflow: "hidden",
            }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------------------------------------------------------------
// Lockout banner
// ---------------------------------------------------------------
function LockoutBanner() {
  const [remaining, setRemaining] = useState(0); 

  useEffect(() => {
    setRemaining(lockoutRemainingSeconds());
    const interval = setInterval(() => {
      const r = lockoutRemainingSeconds();
      setRemaining(r);
      if (r <= 0) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (remaining <= 0) return null;

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        padding: "12px 14px",
        background: "var(--msg-user-bg)",
        border: "1px solid var(--msg-user-border)",
        borderRadius: 9,
        marginBottom: 20,
        fontSize: 12,
        color: "var(--scarlet)",
        lineHeight: 1.6,
      }}
    >
      Too many failed attempts. Please wait {mins}:{secs.toString().padStart(2, "0")} before trying again.
    </motion.div>
  );
}

// ---------------------------------------------------------------
// Login form
// ---------------------------------------------------------------
function LoginForm() {
  const router = useRouter();
  const setAccessToken = useAuthStore((s: { setAccessToken: (token: string) => void }) => s.setAccessToken);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [locked, setLocked] = useState(false); 

  useEffect(() => {
    setLocked(isLockedOut());
  }, []);

  useEffect(() => {
    if (!locked) return;
    const interval = setInterval(() => {
      if (!isLockedOut()) {
        setLocked(false);
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [locked]);

  function validate(): boolean {
    const e = { email: validateEmail(email), password: !password ? "Password is required." : "" };
    setErrors(e);
    return !e.email && !e.password;
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (locked) return;
    setServerError("");
    if (!validate()) return;

    setLoading(true);
    try {
      const data = await authApi.login({
        email: sanitize(email),
        password,
      });
      resetAttempts();
      setAccessToken(data.access_token);
      const user = await authApi.me();
      router.push(user.onboarding_complete ? "/chat" : "/onboarding");
    } catch (err) {
      const attempts = incrementAttempts();
      if (attempts >= MAX_LOGIN_ATTEMPTS) {
        setLockout();
        setLocked(true);
        setServerError("");
      } else {
        const remaining = MAX_LOGIN_ATTEMPTS - attempts;
        setServerError(
          err instanceof Error
            ? `${err.message}${remaining <= 2 ? ` (${remaining} attempt${remaining === 1 ? "" : "s"} remaining)` : ""}`
            : "Something went wrong. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate autoComplete="on">
      <div style={{ marginBottom: 32 }}>
        <div style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 32, fontWeight: 300,
          color: "var(--text-primary)",
          marginBottom: 8,
        }}>
          Welcome back.
        </div>
        <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6 }}>
          Scarlet has been waiting for you. Enter your details to return to the room.
        </div>
      </div>

      {locked && <LockoutBanner />}

      {serverError && !locked && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            padding: "10px 13px",
            background: "var(--msg-user-bg)",
            border: "1px solid var(--msg-user-border)",
            borderRadius: 8,
            marginBottom: 16,
            fontSize: 12,
            color: "var(--scarlet)",
            lineHeight: 1.6,
          }}
        >
          {serverError}
        </motion.div>
      )}

      <Field
        label="Email address" id="login-email" type="email"
        placeholder="you@example.com" value={email} onChange={setEmail}
        error={errors.email} onClearError={() => setErrors((e) => ({ ...e, email: "" }))}
        autoComplete="email" maxLength={254}
      />

      <Field
        label="Password" id="login-password" type="password"
        placeholder="Your password" value={password} onChange={setPassword}
        error={errors.password} onClearError={() => setErrors((e) => ({ ...e, password: "" }))}
        autoComplete="current-password" maxLength={128}
      />

      <div style={{ textAlign: "right", marginBottom: 24, marginTop: -4 }}>
        <a href="/forgot-password" style={{
          fontSize: 12, color: "var(--text-dim)",
          textDecoration: "none", transition: "color 0.2s",
        }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-dim)")}
        >
          Forgot password?
        </a>
      </div>

      <motion.button
        type="submit"
        disabled={loading || locked}
        whileHover={{ opacity: loading || locked ? 1 : 0.88 }}
        whileTap={{ scale: loading || locked ? 1 : 0.97 }}
        style={{
          width: "100%", padding: "14px",
          background: "linear-gradient(135deg, var(--scarlet-deep), var(--scarlet))",
          border: "none", borderRadius: 10,
          fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 500,
          color: "#fff", letterSpacing: "0.04em",
          cursor: loading || locked ? "not-allowed" : "pointer",
          opacity: loading || locked ? 0.5 : 1,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 8px 24px rgba(192,57,43,0.3)",
          transition: "opacity 0.2s",
        }}
      >
        {loading ? (
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
            style={{
              display: "inline-block", width: 16, height: 16,
              border: "2px solid rgba(255,255,255,0.25)",
              borderTopColor: "#fff", borderRadius: "50%",
            }}
          />
        ) : "Sign In"}
      </motion.button>
    </form>
  );
}

// ---------------------------------------------------------------
// Register form
// ---------------------------------------------------------------
function RegisterForm() {
  const router = useRouter();
  const setAccessToken = useAuthStore((s: { setAccessToken: (token: string) => void }) => s.setAccessToken);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [isPwFocused, setIsPwFocused] = useState(false);

  const [errors, setErrors] = useState({
    firstName: "", lastName: "", username: "", email: "", password: "",
  });
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

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

  function validate(): boolean {
    const e = {
      firstName: validateName(firstName, "First name"),
      lastName: validateName(lastName, "Last name"),
      username: validateUsername(username),
      email: validateEmail(email),
      password: !allMet ? "Please fulfill all password requirements." : "",
    };
    setErrors(e);
    return Object.values(e).every((v) => !v);
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    setServerError("");
    if (!validate()) return;

    setLoading(true);
    try {
      const data = await authApi.register({
        email: sanitize(email),
        password,
        username: sanitize(username),
        first_name: sanitize(firstName),
        last_name: sanitize(lastName),
      });
      setAccessToken(data.access_token);
      sessionStorage.setItem("hs_authed", "1");
      router.push("/onboarding");
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate autoComplete="on">
      <div style={{ marginBottom: 32 }}>
        <div style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 32, fontWeight: 300,
          color: "var(--text-primary)",
          marginBottom: 8,
        }}>
          Commit to it.
        </div>
        <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6 }}>
          Create your profile and secure your access to the room.
        </div>
      </div>

      {serverError && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            padding: "10px 13px",
            background: "var(--msg-user-bg)",
            border: "1px solid var(--msg-user-border)",
            borderRadius: 8, marginBottom: 16,
            fontSize: 12, color: "var(--scarlet)", lineHeight: 1.6,
          }}
        >
          {serverError}
        </motion.div>
      )}

      <div className="name-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Field
          label="First Name" id="r-fname" placeholder="John"
          value={firstName} onChange={setFirstName}
          error={errors.firstName} onClearError={() => setErrors((e) => ({ ...e, firstName: "" }))}
          autoComplete="given-name" maxLength={50}
        />
        <Field
          label="Last Name" id="r-lname" placeholder="Doe"
          value={lastName} onChange={setLastName}
          error={errors.lastName} onClearError={() => setErrors((e) => ({ ...e, lastName: "" }))}
          autoComplete="family-name" maxLength={50}
        />
      </div>

      <Field
        label="Username" id="r-username" placeholder="your_username"
        value={username} onChange={setUsername}
        error={errors.username} onClearError={() => setErrors((e) => ({ ...e, username: "" }))}
        autoComplete="username" maxLength={30}
      />

      <Field
        label="Email address" id="r-email" type="email"
        placeholder="you@example.com" value={email} onChange={setEmail}
        error={errors.email} onClearError={() => setErrors((e) => ({ ...e, email: "" }))}
        autoComplete="email" maxLength={254}
      />

      {/* Cinematic Password Setup */}
      <div style={{ marginBottom: 32 }}>
        <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
          <span style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-muted)", fontFamily: "'DM Sans', sans-serif" }}>Secure Password</span>
          <span style={{ fontSize: 11, color: strengthColor, fontWeight: 500, transition: "color 0.3s" }}>{strengthLabel}</span>
        </label>
        
        <div style={{ position: "relative", marginBottom: 12 }}>
          <input
            id="r-password"
            type={showPw ? "text" : "password"}
            value={password}
            onChange={(e) => { setPassword(e.target.value); setErrors(err => ({ ...err, password: "" })); }}
            onFocus={() => setIsPwFocused(true)}
            onBlur={() => setIsPwFocused(false)}
            placeholder="Create a strong key"
            disabled={loading}
            style={{
              width: "100%", background: errors.password ? "var(--msg-user-bg)" : "var(--input-bg)",
              border: `1px solid ${errors.password ? "var(--scarlet)" : isPwFocused ? "var(--scarlet)" : "var(--input-border)"}`,
              borderRadius: 9, padding: "12px 42px 12px 14px", fontSize: 14, color: "var(--text-primary)", outline: "none",
              boxShadow: isPwFocused && !errors.password ? "0 0 0 3px rgba(192,57,43,0.15)" : "none",
              transition: "all 0.3s ease", fontFamily: "'DM Sans', sans-serif"
            }}
          />
          <button
            type="button"
            onClick={() => setShowPw(!showPw)}
            style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text-dim)", cursor: "pointer", display: "flex", alignItems: "center", padding: 4, transition: "color 0.2s" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-dim)")}
          >
            <EyeIcon open={showPw} />
          </button>
        </div>

        {/* Strength Meter Bars */}
        <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
          {[...Array(5)].map((_, i) => (
            <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i < score ? strengthColor : "var(--border)", transition: "background 0.3s ease" }} />
          ))}
        </div>

        {/* Requirements Checklist */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 8 }}>
          {criteria.map((c) => (
            <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, fontFamily: "'DM Sans', sans-serif", color: c.met ? "var(--text-primary)" : "var(--text-dim)", transition: "color 0.3s" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ color: c.met ? "#27AE60" : "transparent" }}>
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              {c.label}
            </div>
          ))}
        </div>

        <AnimatePresence>
          {errors.password && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ fontSize: 11, color: "var(--scarlet)", display: "flex", alignItems: "center", gap: 5, marginTop: 10, overflow: "hidden" }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
              {errors.password}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <motion.button
        type="submit"
        disabled={loading || !allMet}
        whileHover={{ opacity: loading || !allMet ? 1 : 0.88 }}
        whileTap={{ scale: loading || !allMet ? 1 : 0.97 }}
        style={{
          width: "100%", padding: "14px", marginTop: 4,
          background: "linear-gradient(135deg, var(--scarlet-deep), var(--scarlet))",
          border: "none", borderRadius: 10,
          fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 500,
          color: "#fff", letterSpacing: "0.04em",
          cursor: loading || !allMet ? "not-allowed" : "pointer",
          opacity: loading || !allMet ? 0.5 : 1,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 8px 24px rgba(192,57,43,0.3)",
          transition: "opacity 0.2s",
        }}
      >
        {loading ? (
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
            style={{
              display: "inline-block", width: 16, height: 16,
              border: "2px solid rgba(255,255,255,0.25)",
              borderTopColor: "#fff", borderRadius: "50%",
            }}
          />
        ) : "Create Account"}
      </motion.button>

      <p style={{
        marginTop: 20, fontSize: 11, color: "var(--text-dim)",
        textAlign: "center", lineHeight: 1.8,
        fontFamily: "'DM Sans', sans-serif",
      }}>
        By creating an account you agree to our{" "}
        <a href="/terms" style={{ color: "var(--text-muted)", textDecoration: "none" }}>Terms of Service</a>{" "}
        and{" "}
        <a href="/privacy" style={{ color: "var(--text-muted)", textDecoration: "none" }}>Privacy Policy</a>.
      </p>
    </form>
  );
}

// ---------------------------------------------------------------
// Main auth page
// ---------------------------------------------------------------
export default function AuthPage() {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [quoteVisible, setQuoteVisible] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const auraRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setQuoteVisible(true), 800);
    const interval = setInterval(() => {
      setQuoteVisible(false);
      setTimeout(() => {
        setQuoteIndex((i) => (i + 1) % QUOTES.length);
        setQuoteVisible(true);
      }, 1500);
    }, 6500);
    return () => { clearTimeout(t); clearInterval(interval); };
  }, []);

  useEffect(() => {
    const hero = heroRef.current;
    const aura = auraRef.current;
    if (!hero || !aura) return;

    function onMove(e: MouseEvent) {
      const r = hero!.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width - 0.5) * 40;
      const y = ((e.clientY - r.top) / r.height - 0.5) * 40;
      aura!.style.transition = "none";
      aura!.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
    }

    function onLeave() {
      aura!.style.transition = "transform 1s ease-out";
      aura!.style.transform = "translate(-50%, -50%)";
    }

    hero.addEventListener("mousemove", onMove);
    hero.addEventListener("mouseleave", onLeave);
    return () => {
      hero.removeEventListener("mousemove", onMove);
      hero.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      if (window.location.pathname !== "/auth") {
        window.location.reload(); 
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  function switchTab(next: "login" | "register") {
    setTab(next);
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes breatheSignal {
          0%   { transform: translate(-50%, -50%) scale(0.9) rotate(-5deg); opacity: 0.2; }
          100% { transform: translate(-50%, -50%) scale(1.05) rotate(5deg); opacity: 0.4; }
        }
        @keyframes floatSignal {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes authFadeUp {
          from { opacity: 0; transform: translateY(40px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .auth-scroll::-webkit-scrollbar { width: 4px; }
        .auth-scroll::-webkit-scrollbar-thumb { background: var(--border-subtle); border-radius: 4px; }

        @media (max-width: 768px) {
          .auth-layout { flex-direction: column !important; }
          .auth-hero { display: none !important; }
          .auth-scroll { min-width: 100% !important; flex: none !important; padding: 24px !important; }
          .name-grid { display: flex !important; flex-direction: column !important; gap: 16px !important; }
        }
      `}} />

      {/* Global Noise Layer explicitly scoped here instead of the body */}
      <div style={{
        position: "fixed", inset: 0,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        opacity: 0.035, pointerEvents: "none", zIndex: 9999
      }} />

      <div className="auth-layout" style={{
        display: "flex", 
        height: "100vh",
        width: "100vw",
        overflow: "hidden", // Scoped lock so it doesn't break the landing page
        background: "var(--void)",
        fontFamily: "'DM Sans', sans-serif",
        position: "relative"
      }}>

        {/* LEFT — Hero panel */}
        <div
          ref={heroRef}
          className="auth-hero"
          style={{
            flex: 1.3,
            position: "relative",
            background: "transparent",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            overflow: "hidden",
            borderRight: "1px solid var(--border)",
            padding: 60,
          }}
        >
          {/* Logo */}
          <div style={{
            position: "absolute", top: 40, left: 40,
            display: "flex", alignItems: "center", gap: 12,
            zIndex: 10,
            opacity: 0,
            animation: "authFadeUp 1.5s cubic-bezier(0.2,0.8,0.2,1) 0.2s forwards",
          }}>
            <TheLemniscate width={52} height={30} style={{ color: "var(--text-primary)" }} />
            <div style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 22, fontWeight: 300, color: "var(--text-primary)",
              letterSpacing: "0.02em",
            }}>
              Hey<span style={{ color: "var(--scarlet)" }}>Scarlet</span>
            </div>
          </div>

          {/* Aura */}
          <div
            ref={auraRef}
            style={{
              position: "absolute",
              top: "50%", left: "50%",
              width: "85vh", height: "85vh",
              transform: "translate(-50%, -50%)",
              zIndex: 0,
              pointerEvents: "none",
              display: "flex", alignItems: "center", justifyContent: "center",
              filter: "blur(24px)",
              opacity: 0.3,
              animation: "breatheSignal 18s ease-in-out infinite alternate",
            }}
          >
            <div style={{ width: "100%", height: "100%", animation: "floatSignal 40s linear infinite", color: "var(--text-primary)" }}>
              <TheLemniscate width={800} height={800} />
            </div>
          </div>

          {/* Quote */}
          <div style={{ position: "relative", zIndex: 2, textAlign: "center", maxWidth: 600 }}>
            <div
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 48, fontWeight: 300, fontStyle: "italic",
                color: "var(--text-primary)", lineHeight: 1.2,
                opacity: quoteVisible ? 1 : 0,
                transform: quoteVisible ? "translateY(0)" : "translateY(20px)",
                transition: "opacity 1.5s cubic-bezier(0.2,0.8,0.2,1), transform 1.5s cubic-bezier(0.2,0.8,0.2,1)",
              }}
            >
              {QUOTES[quoteIndex]}
            </div>
            <div style={{
              marginTop: 24, fontSize: 11, color: "var(--scarlet)",
              letterSpacing: "0.2em", textTransform: "uppercase",
              opacity: 0,
              animation: "authFadeUp 1.5s cubic-bezier(0.2,0.8,0.2,1) 1.2s forwards",
            }}>
              — Scarlet
            </div>
          </div>
        </div>

        {/* RIGHT — Form panel */}
        <div
          className="auth-scroll"
          style={{
            flex: 1,
            background: "var(--surface)",
            display: "flex", 
            flexDirection: "column",
            padding: 40, 
            overflowY: "auto",
            transition: "background 0.4s",
            position: "relative",
            zIndex: 10
          }}
        >
          <div style={{
            margin: "auto",
            width: "100%", maxWidth: 420,
            paddingTop: 20,
            paddingBottom: 20,
            flexShrink: 0,
            opacity: 0,
            animation: "authFadeUp 1.2s cubic-bezier(0.2,0.8,0.2,1) 0.6s forwards",
          }}>

            {/* Toggle */}
            <div style={{
              display: "flex",
              background: "var(--input-bg)",
              borderRadius: 12, padding: 6,
              marginBottom: 40,
              border: "1px solid var(--border-subtle)",
              position: "relative",
            }}>
              <motion.div
                layout
                style={{
                  position: "absolute",
                  top: 6, bottom: 6,
                  width: "calc(50% - 6px)",
                  background: "var(--msg-user-bg)",
                  border: "1px solid var(--msg-user-border)",
                  borderRadius: 8,
                  left: tab === "login" ? 6 : "calc(50%)",
                  transition: "left 0.4s cubic-bezier(0.2,0.8,0.2,1)",
                }}
              />
              {(["login", "register"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => switchTab(t)}
                  style={{
                    flex: 1, background: "transparent", border: "none",
                    padding: "10px", cursor: "pointer",
                    fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500,
                    color: tab === t ? "var(--text-primary)" : "var(--text-muted)",
                    position: "relative", zIndex: 2,
                    transition: "color 0.3s",
                  }}
                >
                  {t === "login" ? "Sign In" : "Create Account"}
                </button>
              ))}
            </div>

            {/* Form panels */}
            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, x: tab === "register" ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: tab === "register" ? -20 : 20 }}
                transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
              >
                {tab === "login" ? <LoginForm /> : <RegisterForm />}
              </motion.div>
            </AnimatePresence>

          </div>
        </div>
      </div>
    </>
  );
}