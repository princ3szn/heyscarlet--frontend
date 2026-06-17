import type { Metadata } from "next";
import { AuthProvider } from "@/lib/AuthProvider";
import { ThemeProvider } from "@/lib/ThemeContext";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export const metadata: Metadata = {
  title: "HeyScarlet",
  description: "Your AI Companion",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" style={{
      "--void": "#050505",
      "--surface": "#0A0A0A",
      "--surface-2": "#111111",
      "--sidebar-bg": "#080808",
      "--topbar-bg": "rgba(6,6,6,0.9)",
      "--border": "rgba(255,255,255,0.07)",
      "--border-subtle": "rgba(255,255,255,0.04)",
      "--input-bg": "rgba(255,255,255,0.04)",
      "--input-border": "rgba(255,255,255,0.1)",
      "--text-primary": "#E8E0D5",
      "--text-muted": "#888888",
      "--text-dim": "#555555",
      "--text-faint": "#2E2E2E",
      "--scarlet": "#C0392B",
      "--scarlet-deep": "#8B1A1A",
      "--hover-bg": "rgba(255,255,255,0.03)",
    } as React.CSSProperties}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&family=DM+Sans:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
        <style>{`
          *, *::before, *::after { box-sizing: border-box; }
          html, body {
            height: 100%;
            background: var(--void);
            color: var(--text-primary);
            font-family: 'DM Sans', sans-serif;
            -webkit-font-smoothing: antialiased;
            transition: background 0.35s, color 0.35s;
          }
        `}</style>
      </head>
      <body>
        <ThemeProvider>
          <AuthProvider>
            <ThemeToggle />
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}