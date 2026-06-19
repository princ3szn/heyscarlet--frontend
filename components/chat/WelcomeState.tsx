"use client";

import { motion } from "framer-motion";
import { TheLemniscate } from "@/components/ui/TheLemniscate";

const SUGGESTED_PROMPTS = [
  "I keep starting things and not finishing them. Help me understand why.",
  "I have an idea I've been sitting on for two years. I don't know how to start.",
  "I feel stuck between where I am and where I want to be. Walk me through it.",
];

interface WelcomeStateProps {
  onPrompt: (text: string) => void;
}

export function WelcomeState({ onPrompt }: WelcomeStateProps) {
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

      {/* Lemniscate with Dynamic Blend Mode */}
      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: [0.2, 0.8, 0.2, 1] }}
        style={{ marginBottom: 40 }}
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
          style={{ mixBlendMode: "var(--glow-blend)" as any }}
        >
          <TheLemniscate width={100} height={62} style={{ color: "var(--scarlet)" }} />
        </motion.div>
      </motion.div>

      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.9 }}
      >
        <div style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 30, fontWeight: 300,
          color: "var(--text-primary)",
          lineHeight: 1.2, marginBottom: 10,
        }}>
          Where do you want to start?
        </div>
        <div style={{
          fontSize: 13, color: "var(--text-dim)",
          lineHeight: 1.7, maxWidth: 340,
          margin: "0 auto 36px", fontWeight: 300,
          fontFamily: "'DM Sans', sans-serif",
        }}>
          Pick a prompt or write your own below.
        </div>
      </motion.div>

      {/* Suggested prompts - High Contrast */}
      <div style={{
        display: "flex", flexDirection: "column", gap: 10,
        width: "100%", maxWidth: 480,
      }}>
        {SUGGESTED_PROMPTS.map((prompt, i) => (
          <motion.button
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.1, duration: 0.7 }}
            onClick={() => onPrompt(prompt)}
            whileHover={{ borderColor: "var(--scarlet)", backgroundColor: "var(--msg-user-bg)", color: "var(--text-primary)" }}
            whileTap={{ scale: 0.98 }}
            style={{
              background: "var(--input-bg)",
              border: "1px solid var(--input-border)",
              borderRadius: 12, padding: "14px 16px",
              cursor: "pointer", textAlign: "left",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13, color: "var(--text-primary)",
              lineHeight: 1.6, transition: "all 0.2s",
            }}
          >
            {prompt}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
