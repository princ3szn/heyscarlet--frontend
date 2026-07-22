"use client";

import { motion } from "framer-motion";
import { TheLemniscate } from "@/components/ui/TheLemniscate";

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = "Entering the room..." }: LoadingScreenProps) {
  return (
    <div style={{
      position: "fixed", inset: 0,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      height: "100dvh", width: "100vw",
      background: "var(--void)",
      zIndex: 9999,
    }}>
      <motion.div
        animate={{ opacity: [0.4, 1, 0.4], scale: [0.96, 1.02, 0.96] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
      >
        <TheLemniscate width={64} height={36} style={{ color: "var(--scarlet)" }} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        style={{
          marginTop: 20,
          fontFamily: "'Cormorant Garamond', serif",
          fontStyle: "italic",
          fontSize: 16,
          fontWeight: 300,
          color: "var(--text-muted)",
          letterSpacing: "0.02em",
        }}
      >
        {message}
      </motion.div>
    </div>
  );
}