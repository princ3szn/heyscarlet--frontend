"use client";

import { motion } from "framer-motion";


const springTransition = {
  type: "spring" as const,
  stiffness: 300,
  damping: 30,
  mass: 1,
};

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={springTransition}
      style={{ height: "100%", width: "100%" }}
    >
      {children}
    </motion.div>
  );
}