import type { Metadata, Viewport } from "next";
import { AuthProvider } from "@/lib/AuthProvider";
import { ThemeProvider } from "@/lib/ThemeContext";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import NextTopLoader from "nextjs-toploader";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "HeyScarlet",
  description: "Your AI Companion",
};

// FIX: This strictly prevents iOS Safari from zooming in on input taps
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('hs_theme');
                  if (!theme) {
                    theme = 'dark';
                    localStorage.setItem('hs_theme', 'dark');
                  }
                  document.documentElement.setAttribute('data-theme', theme);
                } catch (e) {}
              })();
            `,
          }}
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&family=DM+Sans:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider>
          <AuthProvider>
            <NextTopLoader 
              color="var(--scarlet)" 
              initialPosition={0.08} 
              crawlSpeed={200} 
              height={3} 
              crawl={true} 
              showSpinner={false} 
              easing="ease" 
              speed={200} 
              shadow="0 0 10px var(--scarlet),0 0 5px var(--scarlet)" 
            />
            <ThemeToggle />
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
