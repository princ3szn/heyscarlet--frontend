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
  "--void": "#030303",
  "--surface": "#0A0A0A",
  "--surface-2": "#121212",
  "--card-bg": "rgba(18,18,18,0.95)",
  "--sidebar-bg": "#060606",
  "--topbar-bg": "rgba(3,3,3,0.85)",
  "--border": "rgba(255,255,255,0.15)", // Increased from 0.07
  "--border-subtle": "rgba(255,255,255,0.08)",
  "--input-bg": "rgba(255,255,255,0.06)",
  "--input-border": "rgba(255,255,255,0.25)", // Increased heavily for input pop
  "--text-primary": "#FFFFFF", 
  "--text-muted": "#A3A3A3", 
  "--text-dim": "#737373",
  "--text-faint": "#404040",
  "--scarlet": "#C0392B", 
  "--scarlet-deep": "#8B1A1A",
  "--scarlet-glow": "rgba(192,57,43,0.15)",
  "--msg-user-bg": "rgba(192,57,43,0.12)",
  "--msg-user-border": "rgba(192,57,43,0.25)",
  "--hover-bg": "rgba(255,255,255,0.08)",
};

// HIGH CONTRAST LIGHT MODE
const LIGHT_VARS: Record<string, string> = {
  "--void": "#FAFAFA",
  "--surface": "#F0F0F0",
  "--surface-2": "#E8E8E8",
  "--card-bg": "rgba(255,255,255,0.95)",
  "--sidebar-bg": "#F4F4F4",
  "--topbar-bg": "rgba(250,250,250,0.9)",
  "--border": "rgba(0,0,0,0.18)", // Increased
  "--border-subtle": "rgba(0,0,0,0.1)",
  "--input-bg": "rgba(0,0,0,0.04)",
  "--input-border": "rgba(0,0,0,0.28)", // Darker borders for light mode inputs
  "--text-primary": "#0A0A0A", 
  "--text-muted": "#555555", 
  "--text-dim": "#777777",
  "--text-faint": "#AAAAAA",
  "--scarlet": "#C0392B",
  "--scarlet-deep": "#8B1A1A",
  "--scarlet-glow": "rgba(192,57,43,0.08)",
  "--msg-user-bg": "rgba(192,57,43,0.06)",
  "--msg-user-border": "rgba(192,57,43,0.2)",
  "--hover-bg": "rgba(0,0,0,0.06)",
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