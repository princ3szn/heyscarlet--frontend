"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "dark" | "light";

interface ThemeContextValue {
  theme: Theme;
  toggle: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark",
  toggle: () => {},
  isDark: true,
});

// HIGH CONTRAST DARK MODE
const DARK_VARS: Record<string, string> = {
  "--void": "#020202",
  "--surface": "#0A0A0A",
  "--surface-2": "#121212",
  "--card-bg": "rgba(18,18,18,0.95)",
  "--sidebar-bg": "#060606",
  "--topbar-bg": "rgba(2,2,2,0.85)",
  "--border": "rgba(255,255,255,0.12)", 
  "--border-subtle": "rgba(255,255,255,0.06)",
  "--input-bg": "rgba(255,255,255,0.04)",
  "--input-border": "rgba(255,255,255,0.2)", 
  "--text-primary": "#FFFFFF", 
  "--text-muted": "#A3A3A3", 
  "--text-dim": "#737373",
  "--text-faint": "#52525B",
  "--scarlet": "#C0392B", 
  "--scarlet-deep": "#8B1A1A",
  "--scarlet-glow": "rgba(192,57,43,0.2)", 
  "--msg-user-bg": "rgba(192,57,43,0.12)",
  "--msg-user-border": "rgba(192,57,43,0.25)",
  "--hover-bg": "rgba(255,255,255,0.08)",
  "--glow-blend": "screen", 
};

// MAXIMUM CONTRAST LIGHT MODE
const LIGHT_VARS: Record<string, string> = {
  "--void": "#FFFFFF",
  "--surface": "#F7F7F8",
  "--surface-2": "#EFEFEF",
  "--card-bg": "rgba(255,255,255,0.98)",
  "--sidebar-bg": "#FAFAFA",
  "--topbar-bg": "rgba(255,255,255,0.9)",
  "--border": "rgba(0,0,0,0.15)",
  "--border-subtle": "rgba(0,0,0,0.12)", // Deepened for better field definition
  "--input-bg": "#FFFFFF",
  "--input-border": "rgba(0,0,0,0.25)", 
  "--text-primary": "#000000", // Pure black for main titles
  "--text-muted": "#18181B",  // Near black (zinc-900)
  "--text-dim": "#27272A",    // Very dark gray (zinc-800) to combat thin font weights
  "--text-faint": "#52525B",  // Deep gray (zinc-600) for placeholders & tiny text
  "--scarlet": "#E63946", 
  "--scarlet-deep": "#C0392B",
  "--scarlet-glow": "rgba(230,57,70,0.25)", 
  "--msg-user-bg": "rgba(230,57,70,0.12)",  
  "--msg-user-border": "rgba(230,57,70,0.35)", 
  "--hover-bg": "rgba(0,0,0,0.06)",
  "--glow-blend": "multiply", 
};

function applyVars(vars: Record<string, string>) {
  const html = document.documentElement;
  Object.entries(vars).forEach(([k, v]) => html.style.setProperty(k, v));
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("hs_theme") as Theme | null;
      if (saved === "light" || saved === "dark") {
        setTheme(saved);
        applyVars(saved === "light" ? LIGHT_VARS : DARK_VARS);
        return;
      }
    } catch {}
    applyVars(DARK_VARS);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    applyVars(theme === "light" ? LIGHT_VARS : DARK_VARS);
    try { localStorage.setItem("hs_theme", theme); } catch {}
  }, [theme]);

  function toggle() {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  }

  return (
    <ThemeContext.Provider value={{ theme, toggle, isDark: theme === "dark" }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
