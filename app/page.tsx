"use client";

import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { TheLemniscate } from "@/components/ui/TheLemniscate";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const textContainer: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.2 } }
};

const textItem: Variants = {
  hidden: { opacity: 0, y: 15, filter: "blur(4px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { type: "spring", stiffness: 300, damping: 24 } }
};

// The 6 Personas
const LANDING_PERSONAS = [
  { id: "boss", name: "The Boss", tagline: "Clinical · Results-driven", accent: "#E63946", description: "Clinical, results-driven. Detects excuses and demands output." },
  { id: "mother", name: "The Mother", tagline: "Warm · Loving · Unyielding", accent: "#F4A261", description: "Warm, loving, and Nigerian in her warmth. Believes in you completely, but will not watch you play small." },
  { id: "friend", name: "The Friend", tagline: "Non-judgmental · Logical", accent: "#2A9D8F", description: "Non-judgmental. Holds the mess with you, then helps you find the logic in it." },
  { id: "father", name: "The Father", tagline: "Quiet · Proud · Protective", accent: "#4361EE", description: "Quiet, proud, protective. Capable of the one sentence that stings because it is true." },
  { id: "sage", name: "The Sage", tagline: "Wise · Unhurried", accent: "#2DC653", description: "Wise, unhurried. Speaks from a long view. Reframes problems rather than attacking them." },
  { id: "coach", name: "The Coach", tagline: "Strategic · Structured", accent: "#7209B8", description: "Strategic, structured. Focused on skill-building, growth, and the next right step." }
];

export default function LandingPage() {
  return (
    <div style={{ background: "var(--void)", color: "var(--text-primary)", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", transition: "background 0.35s", overflowX: "hidden", position: "relative" }}>
      
      {/* Dynamic Background Grid & Ambient Glows */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none",
        backgroundImage: `linear-gradient(var(--border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)`,
        backgroundSize: "40px 40px",
        maskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 0%, transparent 100%)",
        WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 0%, transparent 100%)",
      }} />
      <div style={{
        position: "absolute", top: "-20%", right: "-10%", width: 800, height: 800,
        background: "radial-gradient(circle at center, var(--scarlet-glow) 0%, transparent 60%)",
        filter: "blur(60px)", mixBlendMode: "var(--glow-blend)" as "normal", zIndex: 0, pointerEvents: "none"
      }} />

      {/* Navbar */}
      <nav style={{ position: "relative", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "24px 32px", maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <TheLemniscate width={36} height={22} style={{ color: "var(--text-primary)" }} />
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, letterSpacing: "0.02em" }}>
            Hey<span style={{ color: "var(--scarlet)" }}>Scarlet</span>
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div style={{ display: "none", gap: 32, fontSize: 14, color: "var(--text-muted)" }} className="md:flex">
            <a href="#personas" style={{ textDecoration: "none", color: "var(--text-muted)", transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = "var(--text-primary)"} onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}>The 6 Personas</a>
            <a href="#interface" style={{ textDecoration: "none", color: "var(--text-muted)", transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = "var(--text-primary)"} onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}>The Interface</a>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <ThemeToggle />
            <Link href="/auth" style={{ textDecoration: "none" }}>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={{
                padding: "10px 20px", fontSize: 13, fontWeight: 500, background: "var(--surface)",
                border: "1px solid var(--border)", borderRadius: 8, color: "var(--text-primary)", cursor: "pointer"
              }}>
                Sign In
              </motion.button>
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <main style={{ position: "relative", zIndex: 10, maxWidth: 1280, margin: "0 auto", padding: "80px 32px 120px", display: "flex", flexWrap: "wrap", alignItems: "center", gap: 40, minHeight: "85vh" }}>
        
        {/* Left Column: Typography */}
        <div style={{ flex: "1 1 500px", paddingTop: 40 }}>
          
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }} style={{
            fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(3rem, 6vw, 4.5rem)", fontWeight: 300, lineHeight: 1.1, marginBottom: 24
          }}>
            Close the gap between thinking <br className="hidden md:block" />
            and <span style={{ position: "relative", display: "inline-block", color: "#fff", whiteSpace: "nowrap" }}>
              <span style={{ position: "absolute", inset: "-2px -8px", background: "var(--scarlet)", zIndex: -1, transform: "rotate(-2deg)", borderRadius: 4 }}></span>
              <span style={{ fontStyle: "italic", fontWeight: 500, padding: "0 4px" }}>actually doing.</span>
            </span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} style={{
            fontSize: "clamp(1.1rem, 2vw, 1.25rem)", color: "var(--text-muted)", maxWidth: 520, lineHeight: 1.7, marginBottom: 40, fontWeight: 300
          }}>
            No task lists. No habit trackers. Just an abstract, adaptive AI system containing 6 distinct personas engineered to pull you out of your own way.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}>
            <Link href="/auth" style={{ textDecoration: "none" }}>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={{
                padding: "16px 36px", background: "linear-gradient(135deg, var(--scarlet-deep), var(--scarlet))",
                color: "#fff", fontWeight: 500, borderRadius: 12, fontSize: 14, textTransform: "uppercase", letterSpacing: "0.06em",
                border: "none", cursor: "pointer", boxShadow: "0 8px 32px var(--scarlet-glow)"
              }}>
                Start the Work
              </motion.button>
            </Link>
          </motion.div>
        </div>

        {/* Right Column: Abstract Constellation */}
        <div style={{ flex: "1 1 500px", position: "relative", height: 500, display: "flex", alignItems: "center", justifyContent: "center" }}>
          
          {/* Handwritten Note */}
          <motion.div initial={{ opacity: 0, rotate: -10 }} animate={{ opacity: 1, rotate: 6 }} transition={{ duration: 1, delay: 0.8 }} style={{
            position: "absolute", top: -20, right: "5%", zIndex: 30, display: "flex", flexDirection: "column", alignItems: "flex-end"
          }}>
            <span style={{ fontFamily: "'Caveat', cursive", fontSize: 28, color: "#F59E0B" }}>6 personas, 1 core</span>
            <svg width="48" height="48" fill="none" stroke="#F59E0B" viewBox="0 0 24 24" style={{ transform: "rotate(135deg)" }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </motion.div>

          {/* Handwritten Note */}
          <motion.div initial={{ opacity: 0, rotate: -10 }} animate={{ opacity: 1, rotate: 6 }} transition={{ duration: 1, delay: 0.8 }} style={{
            position: "absolute", top: -20, right: "5%", zIndex: 30, display: "flex", flexDirection: "column", alignItems: "flex-end"
          }}>
            <span style={{ fontFamily: "'Caveat', cursive", fontSize: 28, color: "#F59E0B" }}>6 personas, 1 core</span>
            <svg width="48" height="48" fill="none" stroke="#F59E0B" viewBox="0 0 24 24" style={{ transform: "rotate(135deg)" }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </motion.div>

          {/* SVG Connecting Lines - Curved, Organic Neural-Net Paths */}
          <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", opacity: 0.2 }} viewBox="0 0 500 500" preserveAspectRatio="none">
            {/* 1. The Boss (top: 10%, left: 15%) */}
            <path d="M250,250 Q100,180 75,50" stroke="var(--text-primary)" strokeWidth="1" fill="none" strokeDasharray="4 4" />
            {/* 2. The Mother (top: 5%, right: 15%) */}
            <path d="M250,250 Q280,50 425,25" stroke="var(--text-primary)" strokeWidth="1" fill="none" strokeDasharray="4 4" />
            {/* 3. The Friend (bottom: 20%, right: 10%) */}
            <path d="M250,250 Q400,250 450,400" stroke="var(--text-primary)" strokeWidth="1" fill="none" strokeDasharray="4 4" />
            {/* 4. The Father (bottom: 10%, left: 15%) */}
            <path d="M250,250 Q250,400 75,450" stroke="var(--text-primary)" strokeWidth="1" fill="none" strokeDasharray="4 4" />
            {/* 5. The Sage (top: 40%, left: 5%) */}
            <path d="M250,250 Q150,100 25,200" stroke="var(--text-primary)" strokeWidth="1" fill="none" strokeDasharray="4 4" />
            {/* 6. The Coach (bottom: 45%, right: 5%) */}
            <path d="M250,250 Q350,400 475,275" stroke="var(--text-primary)" strokeWidth="1" fill="none" strokeDasharray="4 4" />
          </svg>

          {/* Core (HeyScarlet) */}
          <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} style={{
            position: "absolute", zIndex: 10, width: 140, height: 140, borderRadius: "50%",
            background: "var(--card-bg)", border: "1px solid var(--scarlet)",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 40px var(--scarlet-glow)", backdropFilter: "blur(12px)"
          }}>
            <TheLemniscate width={48} height={28} style={{ color: "var(--scarlet)", marginBottom: 8 }} />
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 16, color: "var(--text-primary)" }}>HeyScarlet</span>
          </motion.div>

          {/* The 6 Personas Floating Nodes */}
          {LANDING_PERSONAS.map((p, i) => {
            const positions = [
              { top: "10%", left: "15%", delay: 0 },
              { top: "5%", right: "15%", delay: 1 },
              { bottom: "20%", right: "10%", delay: 2 },
              { bottom: "10%", left: "15%", delay: 0.5 },
              { top: "40%", left: "5%", delay: 1.5 },
              { bottom: "45%", right: "5%", delay: 2.5 }
            ];
            const pos = positions[i];

            return (
              <motion.div key={p.id} animate={{ y: [0, i % 2 === 0 ? -15 : 15, 0] }} transition={{ duration: 7 + i, repeat: Infinity, ease: "easeInOut", delay: pos.delay }} style={{
                position: "absolute", ...pos, zIndex: 20
              }}>
                <div style={{
                  padding: "10px 16px", background: "var(--card-bg)", border: "1px solid var(--border)",
                  borderRadius: 16, display: "flex", alignItems: "center", gap: 10, backdropFilter: "blur(8px)",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.1)"
                }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: p.accent, boxShadow: `0 0 10px ${p.accent}` }}></div>
                  <span style={{ fontSize: 13, fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, color: "var(--text-primary)" }}>{p.name}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </main>

      {/* AGITATION SECTION */}
      <section style={{ position: "relative", zIndex: 10, background: "var(--surface)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", padding: "120px 32px", textAlign: "center" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2.5rem, 4vw, 3.5rem)", fontWeight: 300, marginBottom: 24, lineHeight: 1.2 }}>
            To-do lists are <em style={{ color: "var(--text-faint)" }}>cemeteries</em><br /> for good ideas.
          </h2>
          <p style={{ fontSize: "1.1rem", color: "var(--text-muted)", lineHeight: 1.8, fontWeight: 300 }}>
            You don&apos;t lack ambition. You lack friction. The problem isn&apos;t knowing what to do—it&apos;s the massive, silent gap between knowing and doing. Scarlet sits in that gap, actively pulling you across it.
          </p>
        </div>
      </section>

      {/* THE 6 PERSONAS GRID */}
      <section id="personas" style={{ position: "relative", zIndex: 10, maxWidth: 1280, margin: "0 auto", padding: "120px 32px" }}>
        <div style={{ marginBottom: 60 }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "3rem", fontWeight: 300, marginBottom: 16 }}>Choose your friction.</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "1.1rem" }}>Six distinct personas. One shared memory. Switch instantly based on what you need.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24 }}>
          {LANDING_PERSONAS.map((p) => (
            <motion.div key={p.id} whileHover={{ y: -8, borderColor: p.accent }} transition={{ type: "spring", stiffness: 300, damping: 20 }} style={{
              padding: 32, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 24,
              transition: "border-color 0.3s", position: "relative", overflow: "hidden"
            }}>
              <div style={{ position: "absolute", top: 0, right: 0, background: `${p.accent}20`, color: p.accent, fontSize: 10, padding: "4px 12px", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600, borderBottomLeftRadius: 12 }}>
                Premium
              </div>
              
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: `${p.accent}15`, border: `1px solid ${p.accent}40`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: p.accent }}></div>
              </div>
              <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, marginBottom: 8, color: "var(--text-primary)" }}>{p.name}</h3>
              <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: p.accent, marginBottom: 16, fontWeight: 600 }}>{p.tagline}</p>
              <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.6 }}>{p.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* THE INTERFACE (Demo Section) */}
      <section id="interface" style={{ position: "relative", zIndex: 10, padding: "80px 32px 120px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "3rem", fontWeight: 300, marginBottom: 16 }}>Scarlet remembers.</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "1.1rem" }}>Context is everything. Scarlet retains your history to call you out on your own patterns.</p>
          </div>

          {/* Mock Interface Wrapper */}
          <div style={{ background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: 20, boxShadow: "0 24px 80px rgba(0,0,0,0.2)", overflow: "hidden" }}>
            
            {/* Window Header */}
            <div style={{ height: 48, background: "var(--surface)", borderBottom: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", padding: "0 20px" }}>
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#FF5F56" }}></div>
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#FFBD2E" }}></div>
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#27C93F" }}></div>
              </div>
              <div style={{ flex: 1, textAlign: "center", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-faint)" }}>HeyScarlet UI</div>
            </div>

            {/* Chat Area Mock */}
            <div style={{ padding: "40px 32px", display: "flex", flexDirection: "column", gap: 32 }}>
              
              {/* User Msg */}
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "12px 16px", borderRadius: 16, borderTopRightRadius: 4, fontSize: 14, color: "var(--text-primary)", maxWidth: "80%" }}>
                  I&apos;ve been putting off writing this landing page copy for three weeks.
                </div>
              </div>

              {/* Scarlet Msg */}
              <div style={{ display: "flex", gap: 16 }}>
                <div style={{ flexShrink: 0, marginTop: 4 }}>
                  <div style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--scarlet)" }}>
                    <TheLemniscate width={24} height={16} style={{ filter: "drop-shadow(0 0 8px var(--scarlet-glow))" }} />
                  </div>
                </div>
                <div style={{ fontSize: 14, color: "var(--text-primary)", lineHeight: 1.7, maxWidth: "85%" }}>
                  I know. We talked about this last Tuesday. <br/><br/>
                  You told me you had the structure mapped out on Notion. So the issue isn&apos;t clarity. Are you waiting for permission, or are you just afraid it won&apos;t convert? <br/><br/>
                  <strong style={{ fontWeight: 600, color: "var(--scarlet)" }}>Open the doc. Give me the first headline. Now.</strong>
                </div>
              </div>

              {/* Input Bar Mock */}
              <div style={{ marginTop: 20 }}>
                <div style={{ background: "var(--surface)", border: "1px solid var(--input-border)", borderRadius: 16, padding: "12px 14px", display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ fontSize: 15, color: "var(--text-faint)", fontStyle: "italic" }}>What have you been deferring?</div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, background: "transparent", border: "none", borderRadius: 8, padding: "6px 10px", fontSize: 11, color: "var(--text-muted)" }}>
                      <div style={{ color: "var(--scarlet)" }}><TheLemniscate width={16} height={10} /></div>
                      Scarlet
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
                    </div>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--surface-2)", color: "var(--text-faint)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRE-FOOTER CTA */}
      <div style={{ padding: "120px 32px", borderTop: "1px solid var(--border-subtle)", background: "var(--surface)", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", bottom: 0, width: "100%", height: "50%", background: "radial-gradient(ellipse at bottom, var(--scarlet-glow) 0%, transparent 60%)", pointerEvents: "none" }}></div>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(3rem, 5vw, 4.5rem)", fontWeight: 300, marginBottom: 40, zIndex: 10 }}>The room is open.</h2>
        
        <Link href="/auth" style={{ textDecoration: "none", zIndex: 10 }}>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={{ type: "spring", stiffness: 400, damping: 25 }} style={{
            padding: "18px 40px", background: "var(--scarlet)", color: "#fff", borderRadius: 14,
            border: "none", cursor: "pointer", boxShadow: "0 8px 32px var(--scarlet-glow)",
          }}>
            <motion.div variants={textContainer} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }} style={{ display: "flex", gap: 6, fontSize: 14, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              {["C", "O", "M", "M", "I", "T", "\u00A0", "T", "O", "\u00A0", "I", "T"].map((char, index) => (
                <motion.span key={index} variants={textItem}>{char}</motion.span>
              ))}
            </motion.div>
          </motion.button>
        </Link>
      </div>

      {/* FAT FOOTER */}
      <footer style={{ background: "var(--void)", borderTop: "1px solid var(--border)", paddingTop: 80, paddingBottom: 40, position: "relative", overflow: "hidden" }}>
        
        {/* FIX: Massive watermark pushed to strictly background (z-index: 0) and slightly brighter */}
        <div style={{ position: "absolute", bottom: "-5%", left: 0, right: 0, fontSize: "18vw", fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, color: "var(--text-primary)", opacity: 0.04, lineHeight: 1, textAlign: "center", pointerEvents: "none", userSelect: "none", zIndex: 0 }}>
          SCARLET
        </div>

        {/* FIX: Foreground content pulled forward to "pop" heavily over the watermark (z-index: 10) */}
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px", position: "relative", zIndex: 10 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 48, marginBottom: 80 }}>
            
            {/* Brand Col */}
            <div style={{ gridColumn: "span 2" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
                <TheLemniscate width={32} height={20} style={{ color: "var(--scarlet)", filter: "drop-shadow(0 0 10px var(--scarlet-glow))" }} />
                <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, letterSpacing: "0.02em", color: "var(--text-primary)" }}>
                  Hey<span style={{ color: "var(--scarlet)" }}>Scarlet</span>
                </span>
              </div>
              <p style={{ color: "var(--text-muted)", fontSize: 14, lineHeight: 1.8, maxWidth: 320, marginBottom: 24, fontWeight: 500 }}>
                An abstract, adaptive AI system engineered to pull you out of your own way. We build tools for the gap between thinking and doing.
              </p>
              <div style={{ display: "flex", gap: 16 }}>
                <a href="https://instagram.com/heyscarletai" target="_blank" rel="noreferrer" style={{ color: "var(--text-primary)", transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = "var(--scarlet)"} onMouseLeave={e => e.currentTarget.style.color = "var(--text-primary)"}>
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </a>
                <a href="https://x.com/heyscarletai" target="_blank" rel="noreferrer" style={{ color: "var(--text-primary)", transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = "var(--scarlet)"} onMouseLeave={e => e.currentTarget.style.color = "var(--text-primary)"}>
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
                <a href="https://linkedin.com/company/heyscarletai" target="_blank" rel="noreferrer" style={{ color: "var(--text-primary)", transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = "var(--scarlet)"} onMouseLeave={e => e.currentTarget.style.color = "var(--text-primary)"}>
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z"/></svg>
                </a>
              </div>
            </div>

            {/* Links */}
            <div>
              <h4 style={{ color: "var(--text-primary)", fontSize: 13, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 20 }}>Product</h4>
              <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 12 }}>
                <li><a href="#personas" style={{ color: "var(--text-muted)", fontSize: 14, textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = "var(--scarlet)"} onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}>The 6 Personas</a></li>
                <li><a href="#interface" style={{ color: "var(--text-muted)", fontSize: 14, textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = "var(--scarlet)"} onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}>The Interface</a></li>
              </ul>
            </div>
            <div>
              <h4 style={{ color: "var(--text-primary)", fontSize: 13, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 20 }}>Company</h4>
              <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 12 }}>
                <li><a href="#" style={{ color: "var(--text-muted)", fontSize: 14, textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = "var(--scarlet)"} onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}>About Us</a></li>
                <li><a href="#" style={{ color: "var(--text-muted)", fontSize: 14, textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = "var(--scarlet)"} onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}>Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 style={{ color: "var(--text-primary)", fontSize: 13, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 20 }}>Legal</h4>
              <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 12 }}>
                <li><a href="#" style={{ color: "var(--text-muted)", fontSize: 14, textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = "var(--scarlet)"} onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}>Privacy Policy</a></li>
                <li><a href="#" style={{ color: "var(--text-muted)", fontSize: 14, textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = "var(--scarlet)"} onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}>Terms of Service</a></li>
              </ul>
            </div>

          </div>

          <div style={{ paddingTop: 32, borderTop: "1px solid var(--border-subtle)", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
            <p style={{ fontSize: 13, color: "var(--text-faint)", fontWeight: 500 }}>&copy; 2026 Kitiya Republic Limited. All rights reserved.</p>
            <p style={{ fontSize: 13, color: "var(--text-faint)", fontWeight: 500 }}>Designed for the gap.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}