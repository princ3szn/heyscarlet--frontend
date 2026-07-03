"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TheLemniscate } from "@/components/ui/TheLemniscate";

const SUGGESTED_PROMPTS = [
  "I keep starting things and not finishing them. Help me understand why.",
  "I have an idea I've been sitting on for two years. I don't know how to start.",
  "I feel stuck between where I am and where I want to be. Walk me through it.",
  "There's a hard conversation I've been avoiding. Prepare me for it.",
  "I know exactly what I need to do today, but I'm doing everything else. Why?",
  "I feel like I'm running out of time to be who I thought I'd be.",
  "I am exhausted, but I haven't actually accomplished anything. Dissect this.",
  "I keep making the same mistake, expecting it to hurt less. Talk to me.",
  "I have a decision to make, but I'm waiting for someone else to make it for me."
];

interface WelcomeStateProps {
  onPrompt: (text: string) => void;
  firstName?: string;
}

export function WelcomeState({ onPrompt, firstName }: WelcomeStateProps) {
  const [greeting, setGreeting] = useState("Good to see you");
  const [activePrompt, setActivePrompt] = useState("");

  useEffect(() => {
    // Time-based greeting
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");

    // Pick a random prompt on client mount to avoid hydration mismatch
    const randomIndex = Math.floor(Math.random() * SUGGESTED_PROMPTS.length);
    setActivePrompt(SUGGESTED_PROMPTS[randomIndex]);
  }, []);

  const headingText = firstName ? `${greeting}, ${firstName}.` : `${greeting}.`;

  return (
    <div style={{
      flex: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 24px",
      textAlign: "center",
    }}>

      {/* Premium Lemniscate Reveal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85, filter: "blur(8px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
        style={{ marginBottom: 48 }}
      >
        <motion.div
          animate={{
            y: [0, -10, 0],
            filter: [
              "drop-shadow(0 0 16px var(--scarlet-glow))",
              "drop-shadow(0 0 32px var(--scarlet-glow))",
              "drop-shadow(0 0 16px var(--scarlet-glow))",
            ],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          <TheLemniscate width={72} height={42} style={{ color: "var(--scarlet)" }} />
        </motion.div>
      </motion.div>

      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ delay: 0.3, duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <div style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 36, fontWeight: 300,
          color: "var(--text-primary)",
          lineHeight: 1.2, marginBottom: 16,
          letterSpacing: "-0.01em"
        }}>
          {headingText}
        </div>
        <div style={{
          fontSize: 14, color: "var(--text-dim)",
          lineHeight: 1.7, maxWidth: 420,
          margin: "0 auto 56px", fontWeight: 300,
          fontFamily: "'DM Sans', sans-serif",
        }}>
          The room is quiet. What have you been deferring?
        </div>
      </motion.div>

      {/* Single Random Prompt Card */}
      <AnimatePresence>
        {activePrompt && (
          <motion.button
            initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ delay: 0.7, duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
            onClick={() => onPrompt(activePrompt)}
            whileHover={{ 
              borderColor: "var(--scarlet)", 
              backgroundColor: "var(--msg-user-bg)", 
              color: "var(--text-primary)",
              scale: 1.02
            }}
            whileTap={{ scale: 0.98 }}
            style={{
              background: "var(--surface-2)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 16, padding: "24px 32px",
              cursor: "pointer", textAlign: "center",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 14, color: "var(--text-muted)",
              lineHeight: 1.6, transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
              maxWidth: 480, width: "100%",
              boxShadow: "0 12px 32px rgba(0,0,0,0.12)"
            }}
          >
            <span style={{ 
              display: "block", fontSize: 10, letterSpacing: "0.15em", 
              textTransform: "uppercase", color: "var(--scarlet)", 
              marginBottom: 12, opacity: 0.8, fontWeight: 500
            }}>
              Observation
            </span>
            <span style={{ fontStyle: "italic" }}>"{activePrompt}"</span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
