"use client";

import { motion } from "framer-motion";
import { TheLemniscate } from "@/components/ui/TheLemniscate";

export default function Loading() {
  return (
    <div style={{ 
      height: "100vh", 
      width: "100vw", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center",
      background: "var(--void)",
      flexDirection: "column",
      gap: 20
    }}>
      {/* Pulsating Scarlet logo */}
      <motion.div
        animate={{ 
          scale: [0.95, 1.05, 0.95], 
          opacity: [0.5, 1, 0.5],
          filter: [
            "drop-shadow(0 0 10px rgba(192,57,43,0.3))",
            "drop-shadow(0 0 30px rgba(192,57,43,0.6))",
            "drop-shadow(0 0 10px rgba(192,57,43,0.3))"
          ]
        }}
        transition={{ 
          duration: 2.5, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <TheLemniscate width={60} height={36} style={{ color: "var(--scarlet)" }} />
      </motion.div>
      
      {/* Loading text */}
      <motion.div
        animate={{ opacity: [0.3, 0.8, 0.3] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 12,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "var(--text-dim)"
        }}
      >
        Connecting
      </motion.div>
    </div>
  );
}