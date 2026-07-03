"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { authApi } from "../../lib/apiClient";
import { TheLemniscate } from "../ui/TheLemniscate";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const modalSpring = { type: "spring", stiffness: 400, damping: 30 } as const;

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

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  
  const [showOldPw, setShowOldPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  
  const [isFocused, setIsFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const criteria = [
    { id: "length", label: "At least 8 characters", met: newPassword.length >= 8 },
    { id: "upper", label: "One uppercase letter", met: /[A-Z]/.test(newPassword) },
    { id: "lower", label: "One lowercase letter", met: /[a-z]/.test(newPassword) },
    { id: "num", label: "One number", met: /[0-9]/.test(newPassword) },
    { id: "spec", label: "One special character", met: /[^A-Za-z0-9]/.test(newPassword) },
  ];

  const score = criteria.filter(c => c.met).length;
  const allMet = score === criteria.length;

  let strengthColor = "var(--border)";
  let strengthLabel = "Weak";
  if (score >= 2) { strengthColor = "#F59E0B"; strengthLabel = "Fair"; }
  if (score >= 4) { strengthColor = "#3B82F6"; strengthLabel = "Good"; }
  if (score === 5) { strengthColor = "#27AE60"; strengthLabel = "Strong"; }
  if (newPassword.length === 0) strengthLabel = "";

  function handleClose() {
    onClose();
    setTimeout(() => {
      setOldPassword("");
      setNewPassword("");
      setError("");
      setSuccess(false);
    }, 300);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!oldPassword) {
      setError("Please enter your current password.");
      return;
    }
    if (!allMet) {
      setError("Please meet all new password requirements.");
      return;
    }

    setLoading(true);
    try {
      await authApi.changePassword({ old_password: oldPassword, new_password: newPassword });
      setSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to change password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          onClick={handleClose} 
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 15 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.95, y: 15 }} 
            transition={modalSpring} 
            onClick={(e) => e.stopPropagation()} 
            style={{ background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: 16, padding: "32px", maxWidth: 400, width: "100%", boxShadow: "0 24px 48px rgba(0,0,0,0.4)", position: "relative" }}
          >
            {/* Close Button */}
            <button 
              onClick={handleClose}
              style={{ position: "absolute", top: 20, right: 20, background: "transparent", border: "none", color: "var(--text-dim)", cursor: "pointer", padding: 4 }}
              onMouseEnter={(e) => e.currentTarget.style.color="var(--text-primary)"}
              onMouseLeave={(e) => e.currentTarget.style.color="var(--text-dim)"}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>

            <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
              <TheLemniscate width={48} height={28} style={{ color: "var(--scarlet)" }} />
            </div>
            
            {success ? (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(39,174,96,0.1)", border: "1px solid rgba(39,174,96,0.3)", color: "#27AE60", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                </div>
                <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 300, color: "var(--text-primary)", marginBottom: 8 }}>Password Updated</h2>
                <p style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.6 }}>Your new secure key has been set.</p>
              </motion.div>
            ) : (
              <>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 300, color: "var(--text-primary)", marginBottom: 6, textAlign: "center" }}>Account Settings</div>
                <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 24, textAlign: "center", fontFamily: "'DM Sans', sans-serif" }}>Update your security credentials below.</div>

                <AnimatePresence>
                  {error && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden", marginBottom: 16 }}>
                      <div style={{ padding: "10px 12px", background: "var(--msg-user-bg)", border: "1px solid var(--msg-user-border)", borderRadius: 8, fontSize: 12, color: "var(--scarlet)", display: "flex", alignItems: "center", gap: 8, fontFamily: "'DM Sans', sans-serif" }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        {error}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  {/* Old Password */}
                  <label style={{ display: "block", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 8 }}>Current Password</label>
                  <div style={{ position: "relative", marginBottom: 16 }}>
                    <input
                      type={showOldPw ? "text" : "password"}
                      value={oldPassword}
                      onChange={(e) => { setOldPassword(e.target.value); setError(""); }}
                      placeholder="Enter current password"
                      disabled={loading}
                      style={{ width: "100%", background: "var(--input-bg)", border: "1px solid var(--input-border)", borderRadius: 8, padding: "12px 42px 12px 14px", fontSize: 13, color: "var(--text-primary)", outline: "none", transition: "border-color 0.2s" }}
                      onFocus={(e) => e.currentTarget.style.borderColor="var(--border)"}
                      onBlur={(e) => e.currentTarget.style.borderColor="var(--input-border)"}
                    />
                    <button type="button" onClick={() => setShowOldPw(!showOldPw)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text-dim)", cursor: "pointer", display: "flex", alignItems: "center", padding: 4 }}>
                      <EyeIcon open={showOldPw} />
                    </button>
                  </div>

                  {/* New Password */}
                  <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-muted)" }}>New Password</span>
                    <span style={{ fontSize: 11, color: strengthColor, fontWeight: 500, transition: "color 0.3s" }}>{strengthLabel}</span>
                  </label>
                  <div style={{ position: "relative", marginBottom: 12 }}>
                    <input
                      type={showNewPw ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => { setNewPassword(e.target.value); setError(""); }}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                      placeholder="Min. 8 characters"
                      disabled={loading}
                      style={{
                        width: "100%", background: "var(--input-bg)",
                        border: `1px solid ${isFocused ? "var(--scarlet)" : "var(--input-border)"}`,
                        borderRadius: 8, padding: "12px 42px 12px 14px", fontSize: 13, color: "var(--text-primary)", outline: "none",
                        boxShadow: isFocused ? "0 0 0 3px rgba(192,57,43,0.15)" : "none", transition: "all 0.3s ease"
                      }}
                    />
                    <button type="button" onClick={() => setShowNewPw(!showNewPw)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text-dim)", cursor: "pointer", display: "flex", alignItems: "center", padding: 4 }}>
                      <EyeIcon open={showNewPw} />
                    </button>
                  </div>

                  {/* Strength Meter Bars */}
                  <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
                    {[...Array(5)].map((_, i) => (
                      <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i < score ? strengthColor : "var(--border)", transition: "background 0.3s ease" }} />
                    ))}
                  </div>

                  {/* Requirements Checklist */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 24 }}>
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
                    disabled={loading || !allMet || !oldPassword}
                    whileHover={{ scale: loading || !allMet || !oldPassword ? 1 : 1.02 }}
                    whileTap={{ scale: loading || !allMet || !oldPassword ? 1 : 0.98 }}
                    style={{ width: "100%", padding: "12px", background: "linear-gradient(135deg, var(--scarlet-deep), var(--scarlet))", border: "none", borderRadius: 10, fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500, color: "#fff", cursor: loading || !allMet || !oldPassword ? "not-allowed" : "pointer", opacity: loading || !allMet || !oldPassword ? 0.5 : 1, boxShadow: "0 4px 16px rgba(192,57,43,0.2)" }}
                  >
                    {loading ? (
                      <span style={{ display: "inline-block", width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                    ) : "Update Password"}
                  </motion.button>
                </form>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}