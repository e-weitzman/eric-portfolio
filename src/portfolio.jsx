import { useState, useEffect, useRef } from "react";

// ── AI Chat ──────────────────────────────────────────────────────────────────
function useAIChat() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const send = async (userText) => {
    const next = [...messages, { role: "user", content: userText }];
    setMessages(next);
    setLoading(true);
    try {
      const res = await fetch("api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `You are an AI assistant on Eric Weitzman's cybersecurity portfolio website. Here is Eric's background:

IDENTITY: Eric Weitzman — Cybersecurity professional and CS/Cybersecurity student at Kean University (graduating May 2026). Based in New Jersey, United States.

CERTIFICATIONS: CompTIA Security+, CompTIA Network+, CompTIA Linux+, CompTIA A+, Certified Ethical Hacker (CEH), CEH Practical, CC (Certified in Cybersecurity).

EXPERIENCE:
- Media Analyst at Allied Universal (Aug 2025–Jan 2026): Contractor with Citizens Financial Group's Physical Security Investigation team.
- Corporate Security & Resilience Intern at Citizens Financial Group (May–Aug 2025, Johnston RI): Worked with digital forensics, cyber SOC analysts, tactical cyber threat intelligence, physical security investigations, and advanced practices. Used Splunk Enterprise Cloud, Splunk SOAR, CrowdStrike Falcon, Microsoft Purview, Nuix, Netskope.
- Student Tutor at County College of Morris (Oct 2023–May 2024): CS1/2, Python, Architectures, Assembly, Data Structures, Linux, Software Engineering, Routing.

EDUCATION: Kean University B.S. Computer Science - Cybersecurity (2024–2026); County College of Morris A.S. Information Technology (2019–2024).

TOP SKILLS: SOC 1, Digital Forensics, Cyber Threat Hunting, Splunk, CrowdStrike, incident response.

EMAIL: weitzman430@gmail.com
LINKEDIN: linkedin.com/in/weitzmaneric

Answer questions about Eric warmly, professionally, and concisely (2-4 sentences). Speak as though you know him well. If asked technical cybersecurity questions, answer from Eric's perspective and expertise level.`,
          messages: next,
        }),
      });
      const data = await res.json();
      const reply = data.content?.map(b => b.text || "").join("") || "ERROR: No response";
      setMessages([...next, { role: "assistant", content: reply }]);
    } catch {
      setMessages([...next, { role: "assistant", content: "CONNECTION_ERROR: Unable to reach endpoint." }]);
    }
    setLoading(false);
  };
  return { messages, loading, send };
}

// ── Matrix Rain ───────────────────────────────────────────────────────────────
function MatrixRain() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener("resize", resize);
    const cols = Math.floor(canvas.width / 18);
    const drops = Array(cols).fill(1);
    const chars = "アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789ABCDEF!@#$%^&*";
    const draw = () => {
      ctx.fillStyle = "rgba(0,0,0,0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = "14px monospace";
      drops.forEach((y, i) => {
        const ch = chars[Math.floor(Math.random() * chars.length)];
        const x = i * 18;
        const alpha = Math.random() > 0.95 ? 1 : 0.15;
        ctx.fillStyle = `rgba(0,255,65,${alpha})`;
        ctx.fillText(ch, x, y * 18);
        if (y * 18 > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      });
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.18 }} />;
}

// ── Typing Effect ─────────────────────────────────────────────────────────────
function TypeIn({ text, speed = 35, delay = 0, style = {} }) {
  const [shown, setShown] = useState("");
  const [started, setStarted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  useEffect(() => {
    if (!started) return;
    if (shown.length >= text.length) return;
    const t = setTimeout(() => setShown(text.slice(0, shown.length + 1)), speed);
    return () => clearTimeout(t);
  }, [shown, started, text, speed]);
  return <span style={style}>{shown}<span style={{ opacity: shown.length < text.length ? 1 : 0, animation: "blink 1s infinite" }}>█</span></span>;
}

// ── Scanline overlay ──────────────────────────────────────────────────────────
function Scanlines() {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 999, pointerEvents: "none",
      background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)",
    }} />
  );
}

// ── Data ──────────────────────────────────────────────────────────────────────
const CERTS = [
  { id: "SEC+", name: "CompTIA Security+", color: "#00ff41" },
  { id: "NET+", name: "CompTIA Network+", color: "#00d4ff" },
  { id: "LNX+", name: "CompTIA Linux+", color: "#ffcc00" },
  { id: "A+",   name: "CompTIA A+", color: "#ff6b35" },
  { id: "CEH",  name: "Certified Ethical Hacker", color: "#ff3355" },
  { id: "CEH-P",name: "CEH Practical", color: "#cc00ff" },
  { id: "CC",   name: "CC (Certified in Cybersecurity)", color: "#00ffcc" },
];

const SKILLS = [
  { name: "Splunk Enterprise/SOAR", pct: 85, cat: "SIEM" },
  { name: "CrowdStrike Falcon", pct: 82, cat: "EDR" },
  { name: "Digital Forensics", pct: 80, cat: "DFIR" },
  { name: "Cyber Threat Hunting", pct: 78, cat: "CTH" },
  { name: "Microsoft Purview", pct: 75, cat: "DLP" },
  { name: "Nuix / Netskope", pct: 72, cat: "TOOLS" },
  { name: "Incident Response", pct: 88, cat: "IR" },
  { name: "Network Analysis", pct: 80, cat: "NET" },
];

const EXPERIENCE = [
  {
    role: "Media Analyst",
    org: "Allied Universal",
    period: "Aug 2025 – Jan 2026",
    loc: "United States",
    desc: "Contractor embedded with Citizens Financial Group's Physical Security Investigation team, supporting security operations and threat analysis.",
    tags: ["Physical Security", "Investigations", "Threat Analysis"],
    color: "#00d4ff",
  },
  {
    role: "Corporate Security & Resilience Intern",
    org: "Citizens Financial Group",
    period: "May 2025 – Aug 2025",
    loc: "Johnston, Rhode Island",
    desc: "Rotated through digital forensics, cyber SOC, tactical cyber threat intelligence, physical security, and advanced practices teams. Hands-on with enterprise security tooling.",
    tags: ["Splunk", "CrowdStrike", "Purview", "Nuix", "Netskope", "SOAR", "DFIR", "SOC"],
    color: "#00ff41",
  },
  {
    role: "Student Tutor",
    org: "County College of Morris",
    period: "Oct 2023 – May 2024",
    loc: "New Jersey",
    desc: "Tutored CS1/2, Python, Computer Architectures, Assembly, Data Structures, Linux, Software Engineering, and Routing.",
    tags: ["Python", "Linux", "Assembly", "Data Structures", "Networking"],
    color: "#ffcc00",
  },
];

const EDUCATION = [
  { deg: "B.S. Computer Science — Cybersecurity", school: "Kean University", period: "2024 – 2026", note: "Expected graduation May 2026" },
  { deg: "A.S. Information Technology", school: "County College of Morris", period: "2019 – 2024", note: "Graduated May 2024" },
];

// ── Terminal prompt line ───────────────────────────────────────────────────────
function Prompt({ children, delay = 0 }) {
  return (
    <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem", fontFamily: "monospace", fontSize: "0.9rem" }}>
      <span style={{ color: "#00ff41", flexShrink: 0 }}>eric@portfolio:~$</span>
      <TypeIn text={children} delay={delay} style={{ color: "#e0e0e0" }} />
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Portfolio() {
  const [page, setPage] = useState("home");
  const [chatOpen, setChatOpen] = useState(false);
  const [input, setInput] = useState("");
  const { messages, loading, send } = useAIChat();
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  const submit = () => { if (!input.trim()) return; send(input.trim()); setInput(""); };

  const nav = ["home", "about", "experience", "certs", "contact"];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Orbitron:wght@400;700;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #000; font-family: 'Share Tech Mono', monospace; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes glitch {
          0%,100%{text-shadow:2px 0 #ff0055,-2px 0 #00ffcc}
          25%{text-shadow:-2px 0 #ff0055,2px 0 #00ffcc}
          50%{text-shadow:2px 2px #ff0055,-2px -2px #00ffcc}
          75%{text-shadow:-2px 2px #ff0055,2px -2px #00ffcc}
        }
        @keyframes pulse { 0%,100%{box-shadow:0 0 8px rgba(0,255,65,.4)} 50%{box-shadow:0 0 20px rgba(0,255,65,.8)} }
        @keyframes scanIn { from{clip-path:inset(0 100% 0 0)} to{clip-path:inset(0 0% 0 0)} }
        .glitch:hover { animation: glitch 0.3s infinite; }
        .page-in { animation: fadeIn 0.4s ease forwards; }
        .cert-card:hover { background: rgba(0,255,65,0.06) !important; border-color: rgba(0,255,65,0.4) !important; transform: translateX(4px); transition: all 0.2s; }
        .exp-card:hover { border-left-width: 4px !important; background: rgba(0,255,65,0.03) !important; transition: all 0.2s; }
        .nav-btn:hover { color: #00ff41 !important; border-color: rgba(0,255,65,0.4) !important; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #000; }
        ::-webkit-scrollbar-thumb { background: #00ff41; }
        input::placeholder { color: #1a5c27; }
        input:focus { border-color: #00ff41 !important; box-shadow: 0 0 8px rgba(0,255,65,.3); }
      `}</style>
      <Scanlines />

      <div style={{ background: "#000", color: "#e0e0e0", minHeight: "100vh", fontFamily: "'Share Tech Mono', monospace", position: "relative" }}>

        {/* NAV */}
        <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "rgba(0,0,0,0.95)", borderBottom: "1px solid rgba(0,255,65,0.2)", padding: "0.75rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontFamily: "'Orbitron', monospace", fontWeight: 900, fontSize: "1rem", color: "#00ff41", letterSpacing: "3px" }}>
            EW<span style={{ color: "#00d4ff" }}>_SEC</span>
          </div>
          <div style={{ display: "flex", gap: "0.25rem" }}>
            {nav.map(n => (
              <button key={n} className="nav-btn" onClick={() => setPage(n)} style={{ background: "transparent", border: `1px solid ${page === n ? "rgba(0,255,65,0.5)" : "transparent"}`, color: page === n ? "#00ff41" : "#4a7a55", padding: "0.4rem 0.9rem", cursor: "pointer", fontSize: "0.78rem", fontFamily: "'Share Tech Mono', monospace", letterSpacing: "1px", textTransform: "uppercase", transition: "all 0.2s" }}>
                {n}
              </button>
            ))}
          </div>
          <div style={{ fontSize: "0.72rem", color: "#1a5c27" }}>
            <span style={{ color: "#00ff41" }}>●</span> ONLINE
          </div>
        </nav>

        {/* HOME */}
        {page === "home" && (
          <div style={{ minHeight: "100vh", position: "relative", overflow: "hidden", display: "flex", alignItems: "center", padding: "2rem" }}>
            <MatrixRain />
            <div className="page-in" style={{ position: "relative", zIndex: 2, maxWidth: "900px", margin: "0 auto", width: "100%" }}>

              {/* Terminal window */}
              <div style={{ background: "rgba(0,0,0,0.92)", border: "1px solid rgba(0,255,65,0.3)", borderRadius: "4px", overflow: "hidden", boxShadow: "0 0 40px rgba(0,255,65,0.15)" }}>
                {/* Window bar */}
                <div style={{ background: "#0a0a0a", borderBottom: "1px solid rgba(0,255,65,0.2)", padding: "0.5rem 1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#ff3355" }} />
                  <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#ffcc00" }} />
                  <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#00ff41" }} />
                  <span style={{ marginLeft: "0.75rem", fontSize: "0.72rem", color: "#2a5c3a", letterSpacing: "2px" }}>TERMINAL — eric@portfolio</span>
                </div>
                <div style={{ padding: "2rem 2.5rem" }}>
                  <Prompt delay={0}>whoami</Prompt>
                  <div style={{ marginBottom: "1.5rem", paddingLeft: "0.5rem" }}>
                    <div style={{ fontFamily: "'Orbitron', monospace", fontWeight: 900, fontSize: "clamp(2rem,5vw,3.8rem)", color: "#00ff41", lineHeight: 1.1, letterSpacing: "-1px", marginBottom: "0.5rem" }}>
                      ERIC WEITZMAN
                    </div>
                    <div style={{ fontSize: "0.95rem", color: "#00d4ff", letterSpacing: "3px", marginBottom: "0.25rem" }}>
                      CYBERSECURITY PROFESSIONAL
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "#4a7a55" }}>
                      CS/Cybersecurity Student @ Kean University '26 · NJ, USA
                    </div>
                  </div>

                  <Prompt delay={800}>cat summary.txt</Prompt>
                  <div style={{ marginBottom: "1.5rem", borderLeft: "2px solid rgba(0,255,65,0.2)", paddingLeft: "1rem", color: "#94a3b8", fontSize: "0.88rem", lineHeight: 1.8 }}>
                    <TypeIn text="Dependable, detail-oriented cybersecurity professional committed to pursuing a career in information technology. Specialized in incident response, digital forensics, and SOC operations. Quick learner eager to serve the community with hands-on expertise." delay={1000} speed={18} />
                  </div>

                  <Prompt delay={2000}>ls ./certifications/</Prompt>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", paddingLeft: "0.5rem", marginBottom: "1.5rem" }}>
                    {CERTS.map((c, i) => (
                      <span key={c.id} style={{ background: `${c.color}15`, border: `1px solid ${c.color}44`, color: c.color, padding: "0.2rem 0.65rem", fontSize: "0.75rem", letterSpacing: "1px", borderRadius: "2px", animation: `fadeIn 0.3s ease ${2200 + i * 100}ms both` }}>
                        {c.id}
                      </span>
                    ))}
                  </div>

                  <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                    <button onClick={() => setPage("experience")} style={{ background: "transparent", border: "1px solid #00ff41", color: "#00ff41", padding: "0.65rem 1.5rem", cursor: "pointer", fontSize: "0.82rem", fontFamily: "'Share Tech Mono', monospace", letterSpacing: "2px", textTransform: "uppercase", animation: "pulse 2s infinite" }}>
                      ./view_experience
                    </button>
                    <a href="mailto:weitzman430@gmail.com" style={{ textDecoration: "none" }}>
                      <button style={{ background: "transparent", border: "1px solid rgba(0,212,255,0.5)", color: "#00d4ff", padding: "0.65rem 1.5rem", cursor: "pointer", fontSize: "0.82rem", fontFamily: "'Share Tech Mono', monospace", letterSpacing: "2px", textTransform: "uppercase" }}>
                        ./contact.sh
                      </button>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ABOUT */}
        {page === "about" && (
          <div className="page-in" style={{ maxWidth: "1000px", margin: "0 auto", padding: "6rem 2rem 3rem" }}>
            <div style={{ fontSize: "0.72rem", color: "#1a5c27", letterSpacing: "2px", marginBottom: "0.5rem" }}>{/* ABOUT */}</div>
            <h2 style={{ fontFamily: "'Orbitron', monospace", fontWeight: 900, fontSize: "2rem", color: "#00ff41", letterSpacing: "2px", marginBottom: "2.5rem" }}>SYSTEM_PROFILE</h2>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
              {/* Bio */}
              <div style={{ background: "rgba(0,255,65,0.03)", border: "1px solid rgba(0,255,65,0.15)", padding: "1.75rem" }}>
                <div style={{ color: "#00ff41", fontSize: "0.72rem", letterSpacing: "2px", marginBottom: "1rem" }}>OPERATOR_BIO</div>
                <p style={{ color: "#94a3b8", lineHeight: 1.9, fontSize: "0.88rem" }}>
                  Cybersecurity professional with hands-on enterprise experience across digital forensics, SOC operations, and cyber threat intelligence. Currently completing a B.S. in Computer Science — Cybersecurity at Kean University while building real-world expertise through internships with Citizens Financial Group.
                </p>
              </div>

              {/* Skills */}
              <div style={{ background: "rgba(0,255,65,0.03)", border: "1px solid rgba(0,255,65,0.15)", padding: "1.75rem" }}>
                <div style={{ color: "#00ff41", fontSize: "0.72rem", letterSpacing: "2px", marginBottom: "1rem" }}>CORE_CAPABILITIES</div>
                {SKILLS.map((s, i) => (
                  <div key={s.name} style={{ marginBottom: "0.85rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", marginBottom: "0.3rem" }}>
                      <span style={{ color: "#c0c0c0" }}>{s.name}</span>
                      <span style={{ color: "#00ff41" }}>{s.pct}%</span>
                    </div>
                    <div style={{ background: "rgba(255,255,255,0.05)", height: "3px" }}>
                      <div style={{ height: "3px", background: i % 3 === 0 ? "#00ff41" : i % 3 === 1 ? "#00d4ff" : "#ffcc00", width: `${s.pct}%`, transition: "width 1s ease" }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Tools */}
              <div style={{ background: "rgba(0,255,65,0.03)", border: "1px solid rgba(0,255,65,0.15)", padding: "1.75rem" }}>
                <div style={{ color: "#00ff41", fontSize: "0.72rem", letterSpacing: "2px", marginBottom: "1rem" }}>TOOLSET</div>
                {[
                  ["SIEM", "Splunk Enterprise Cloud, Splunk SOAR"],
                  ["EDR", "CrowdStrike Falcon"],
                  ["FORENSICS", "Nuix, Microsoft Purview"],
                  ["NETWORK", "Netskope, Routing/Switching"],
                  ["OS", "Linux, Windows Server"],
                  ["LANGUAGES", "Python, Assembly, C"],
                ].map(([cat, tools]) => (
                  <div key={cat} style={{ marginBottom: "0.75rem", display: "flex", gap: "0.75rem" }}>
                    <span style={{ color: "#00ff41", fontSize: "0.7rem", minWidth: "80px", letterSpacing: "1px", paddingTop: "1px" }}>[{cat}]</span>
                    <span style={{ color: "#64748b", fontSize: "0.82rem", lineHeight: 1.5 }}>{tools}</span>
                  </div>
                ))}
              </div>

              {/* Education */}
              <div style={{ background: "rgba(0,255,65,0.03)", border: "1px solid rgba(0,255,65,0.15)", padding: "1.75rem" }}>
                <div style={{ color: "#00ff41", fontSize: "0.72rem", letterSpacing: "2px", marginBottom: "1rem" }}>EDUCATION_LOG</div>
                {EDUCATION.map(e => (
                  <div key={e.school} style={{ marginBottom: "1.25rem", paddingLeft: "0.75rem", borderLeft: "2px solid rgba(0,255,65,0.3)" }}>
                    <div style={{ color: "#e0e0e0", fontWeight: 700, fontSize: "0.88rem", marginBottom: "0.2rem" }}>{e.deg}</div>
                    <div style={{ color: "#00d4ff", fontSize: "0.8rem" }}>{e.school}</div>
                    <div style={{ color: "#4a7a55", fontSize: "0.75rem" }}>{e.period} · {e.note}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* EXPERIENCE */}
        {page === "experience" && (
          <div className="page-in" style={{ maxWidth: "900px", margin: "0 auto", padding: "6rem 2rem 3rem" }}>
            <div style={{ fontSize: "0.72rem", color: "#1a5c27", letterSpacing: "2px", marginBottom: "0.5rem" }}>{/* WORK HISTORY */}</div>
            <h2 style={{ fontFamily: "'Orbitron', monospace", fontWeight: 900, fontSize: "2rem", color: "#00ff41", letterSpacing: "2px", marginBottom: "2.5rem" }}>MISSION_LOG</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {EXPERIENCE.map((e, i) => (
                <div key={e.org + e.role} className="exp-card" style={{ borderLeft: `2px solid ${e.color}`, paddingLeft: "1.5rem", paddingTop: "1rem", paddingBottom: "1rem", background: "rgba(0,0,0,0.4)" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.5rem" }}>
                    <div>
                      <div style={{ fontFamily: "'Orbitron', monospace", color: e.color, fontWeight: 700, fontSize: "0.95rem", letterSpacing: "1px" }}>{e.role}</div>
                      <div style={{ color: "#e0e0e0", fontSize: "0.88rem", marginTop: "0.2rem" }}>{e.org}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ color: "#4a7a55", fontSize: "0.75rem", letterSpacing: "1px" }}>{e.period}</div>
                      <div style={{ color: "#2a4a3a", fontSize: "0.72rem" }}>{e.loc}</div>
                    </div>
                  </div>
                  <p style={{ color: "#94a3b8", fontSize: "0.85rem", lineHeight: 1.8, marginBottom: "0.75rem" }}>{e.desc}</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                    {e.tags.map(t => (
                      <span key={t} style={{ background: `${e.color}12`, border: `1px solid ${e.color}33`, color: e.color, padding: "0.15rem 0.55rem", fontSize: "0.7rem", letterSpacing: "0.5px" }}>{t}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CERTS */}
        {page === "certs" && (
          <div className="page-in" style={{ maxWidth: "900px", margin: "0 auto", padding: "6rem 2rem 3rem" }}>
            <div style={{ fontSize: "0.72rem", color: "#1a5c27", letterSpacing: "2px", marginBottom: "0.5rem" }}>{/* CREDENTIALS */}</div>
            <h2 style={{ fontFamily: "'Orbitron', monospace", fontWeight: 900, fontSize: "2rem", color: "#00ff41", letterSpacing: "2px", marginBottom: "2.5rem" }}>CERTIFICATIONS</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1rem" }}>
              {CERTS.map((c, i) => (
                <div key={c.id} className="cert-card" style={{ background: "rgba(0,0,0,0.5)", border: `1px solid ${c.color}22`, padding: "1.5rem", cursor: "default", animation: `fadeIn 0.35s ease ${i * 80}ms both` }}>
                  <div style={{ fontFamily: "'Orbitron', monospace", color: c.color, fontWeight: 900, fontSize: "1.4rem", letterSpacing: "3px", marginBottom: "0.5rem" }}>{c.id}</div>
                  <div style={{ color: "#e0e0e0", fontSize: "0.85rem", lineHeight: 1.5 }}>{c.name}</div>
                  <div style={{ marginTop: "1rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: c.color, boxShadow: `0 0 6px ${c.color}` }} />
                    <span style={{ color: c.color, fontSize: "0.7rem", letterSpacing: "1px" }}>VERIFIED</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Top Skills callout */}
            <div style={{ marginTop: "2.5rem", background: "rgba(0,255,65,0.03)", border: "1px solid rgba(0,255,65,0.15)", padding: "1.5rem" }}>
              <div style={{ color: "#00ff41", fontSize: "0.72rem", letterSpacing: "2px", marginBottom: "1rem" }}>TOP_SKILLS</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
                {["SOC 1 Operations", "Digital Forensics", "Cyber Threat Hunting", "Incident Response", "SIEM/SOAR", "Network Security"].map(s => (
                  <span key={s} style={{ background: "rgba(0,255,65,0.08)", border: "1px solid rgba(0,255,65,0.25)", color: "#00ff41", padding: "0.35rem 0.85rem", fontSize: "0.78rem", letterSpacing: "0.5px" }}>{s}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* CONTACT */}
        {page === "contact" && (
          <div className="page-in" style={{ maxWidth: "700px", margin: "0 auto", padding: "6rem 2rem 3rem" }}>
            <div style={{ fontSize: "0.72rem", color: "#1a5c27", letterSpacing: "2px", marginBottom: "0.5rem" }}>{/* CONTACT */}</div>
            <h2 style={{ fontFamily: "'Orbitron', monospace", fontWeight: 900, fontSize: "2rem", color: "#00ff41", letterSpacing: "2px", marginBottom: "2.5rem" }}>OPEN_CHANNEL</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {[
                { ic: "✉", label: "EMAIL", val: "weitzman430@gmail.com", href: "mailto:weitzman430@gmail.com", color: "#00ff41" },
                { ic: "⬡", label: "LINKEDIN", val: "linkedin.com/in/weitzmaneric", href: "https://www.linkedin.com/in/weitzmaneric", color: "#00d4ff" },
              ].map(c => (
                <a key={c.label} href={c.href} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
                  <div style={{ background: `${c.color}06`, border: `1px solid ${c.color}22`, padding: "1.25rem 1.5rem", display: "flex", alignItems: "center", gap: "1.25rem", cursor: "pointer", transition: "all 0.2s" }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = `${c.color}55`}
                    onMouseLeave={e => e.currentTarget.style.borderColor = `${c.color}22`}>
                    <div style={{ fontFamily: "'Orbitron', monospace", color: c.color, fontSize: "0.7rem", letterSpacing: "2px", minWidth: "80px" }}>[{c.label}]</div>
                    <div style={{ color: "#94a3b8", fontSize: "0.88rem" }}>{c.val}</div>
                  </div>
                </a>
              ))}
            </div>
            <div style={{ marginTop: "2rem", background: "rgba(0,255,65,0.03)", border: "1px solid rgba(0,255,65,0.15)", padding: "1.5rem" }}>
              <div style={{ color: "#4a7a55", fontSize: "0.78rem", lineHeight: 1.8 }}>
                <span style={{ color: "#00ff41" }}>STATUS:</span> Open to cybersecurity roles, internships, and collaborations.<br />
                <span style={{ color: "#00ff41" }}>LOCATION:</span> New Jersey, United States<br />
                <span style={{ color: "#00ff41" }}>AVAILABILITY:</span> Graduating May 2026 · Available immediately for opportunities
              </div>
            </div>
            <div style={{ marginTop: "1.5rem" }}>
              <button onClick={() => setChatOpen(true)} style={{ width: "100%", background: "transparent", border: "1px solid rgba(0,255,65,0.4)", color: "#00ff41", padding: "0.85rem", cursor: "pointer", fontSize: "0.82rem", fontFamily: "'Share Tech Mono', monospace", letterSpacing: "2px", textTransform: "uppercase", animation: "pulse 2s infinite" }}>
                ▶ LAUNCH AI ASSISTANT
              </button>
            </div>
          </div>
        )}

        {/* AI FAB */}
        <button onClick={() => setChatOpen(v => !v)} style={{ position: "fixed", bottom: "2rem", right: "2rem", zIndex: 200, width: "52px", height: "52px", background: "transparent", border: "2px solid #00ff41", color: "#00ff41", fontSize: "1.1rem", cursor: "pointer", fontFamily: "'Share Tech Mono', monospace", animation: "pulse 2s infinite", display: "flex", alignItems: "center", justifyContent: "center" }}
          title="AI Assistant">
          {chatOpen ? "✕" : "AI"}
        </button>

        {/* CHAT */}
        {chatOpen && (
          <div style={{ position: "fixed", bottom: "5.2rem", right: "2rem", zIndex: 199, width: "clamp(290px,90vw,420px)", background: "#000", border: "1px solid rgba(0,255,65,0.35)", boxShadow: "0 0 40px rgba(0,255,65,0.15)", display: "flex", flexDirection: "column", maxHeight: "480px" }}>
            <div style={{ background: "#0a0a0a", borderBottom: "1px solid rgba(0,255,65,0.2)", padding: "0.75rem 1.2rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#00ff41", animation: "pulse 1.5s infinite" }} />
              <span style={{ color: "#00ff41", fontSize: "0.75rem", letterSpacing: "2px" }}>AI_ASSISTANT — ask about eric</span>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem", maxHeight: "320px" }}>
              {messages.length === 0 && (
                <div style={{ color: "#1a5c27", fontSize: "0.8rem", lineHeight: 1.7 }}>
                  <span style={{ color: "#00ff41" }}>SYSTEM:</span> AI assistant initialized.<br />
                  Ask about Eric's experience, certifications, skills, or availability.
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} style={{ display: "flex", gap: "0.5rem", flexDirection: m.role === "user" ? "row-reverse" : "row" }}>
                  <span style={{ color: m.role === "user" ? "#00d4ff" : "#00ff41", fontSize: "0.7rem", minWidth: "40px", paddingTop: "2px", textAlign: m.role === "user" ? "right" : "left" }}>
                    {m.role === "user" ? "YOU>" : "AI>"}
                  </span>
                  <div style={{ background: m.role === "user" ? "rgba(0,212,255,0.06)" : "rgba(0,255,65,0.04)", border: `1px solid ${m.role === "user" ? "rgba(0,212,255,0.2)" : "rgba(0,255,65,0.15)"}`, color: "#c0c0c0", padding: "0.55rem 0.85rem", fontSize: "0.82rem", lineHeight: 1.7, maxWidth: "82%" }}>
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && <div style={{ color: "#1a5c27", fontSize: "0.8rem" }}>AI&gt; <span style={{ animation: "blink 1s infinite" }}>█</span></div>}
              <div ref={endRef} />
            </div>
            <div style={{ display: "flex", gap: "0.5rem", padding: "0.75rem", borderTop: "1px solid rgba(0,255,65,0.15)" }}>
              <input
                style={{ flex: 1, background: "rgba(0,255,65,0.04)", border: "1px solid rgba(0,255,65,0.2)", color: "#e0e0e0", padding: "0.55rem 0.85rem", fontSize: "0.82rem", outline: "none", fontFamily: "'Share Tech Mono', monospace" }}
                placeholder="type query..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && submit()}
              />
              <button onClick={submit} disabled={loading} style={{ background: "transparent", border: "1px solid rgba(0,255,65,0.4)", color: "#00ff41", padding: "0.55rem 1rem", cursor: "pointer", fontFamily: "'Share Tech Mono', monospace", fontSize: "0.8rem", letterSpacing: "1px" }}>
                SEND
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
