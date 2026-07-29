import React from "react"
import { AbsoluteFill, Easing, Sequence, interpolate, useCurrentFrame } from "remotion"
import { Bot, Files, FolderGit2, GitBranch, Globe2, GripVertical, TerminalSquare } from "lucide-react"

const INK = "#07090e"
const RAIL = "#10141d"
const PANEL = "#151a25"
const LINE = "#30384a"
const PAPER = "#f7efdc"
const MUTED = "#929bb0"
const CYAN = "#5ad8e6"
const MAGENTA = "#ed4abf"
const VIOLET = "#9b4dff"
const GOLD = "#ffd84d"

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const

const Shell: React.FC<{ children: React.ReactNode; activeJob: string; status: string }> = ({ children, activeJob, status }) => (
  <AbsoluteFill style={{ background: INK, color: PAPER, fontFamily: "Inter, Arial, sans-serif", padding: 26 }}>
    <div style={{ position: "absolute", inset: 26, display: "flex", overflow: "hidden", border: `2px solid ${LINE}`, borderRadius: 22, background: PANEL, boxShadow: "0 26px 80px rgba(0,0,0,.5)" }}>
      <aside style={{ width: 256, flexShrink: 0, borderRight: `2px solid ${LINE}`, background: RAIL, padding: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, paddingBottom: 16, borderBottom: `1px solid ${LINE}` }}>
          <div style={{ width: 38, height: 38, borderRadius: 11, display: "grid", placeItems: "center", color: INK, background: `linear-gradient(135deg,${CYAN},${VIOLET})`, fontWeight: 1000 }}>7</div>
          <div><div style={{ fontSize: 20, fontWeight: 900 }}>theme7</div><div style={{ color: MUTED, fontSize: 11 }}>job harness</div></div>
        </div>
        <div style={{ marginTop: 18, color: MUTED, fontSize: 10, fontWeight: 800, letterSpacing: 2 }}>JOBS</div>
        {["gorge-fan-page", "ship-theme7", "make-more-money"].map((job, index) => {
          const active = job === activeJob
          return <div key={job} style={{ marginTop: 8, padding: "11px 10px", border: `1px solid ${active ? CYAN : LINE}`, borderRadius: 10, background: active ? "rgba(90,216,230,.10)" : INK, display: "flex", gap: 9, alignItems: "center", boxShadow: active ? `0 0 18px ${CYAN}24` : undefined }}>
            <FolderGit2 size={15} color={active ? CYAN : MUTED} />
            <span style={{ fontSize: 12, fontWeight: active ? 800 : 500 }}>{job}</span>
            <span style={{ marginLeft: "auto", color: [MAGENTA, CYAN, GOLD][index], fontSize: 10 }}>●</span>
          </div>
        })}
        <div style={{ marginTop: 20, color: MUTED, fontSize: 10, fontWeight: 800, letterSpacing: 2 }}>ADD TO JOB</div>
        {[[TerminalSquare, "Agent terminal"], [Files, "Files"], [GitBranch, "Git"], [Globe2, "Browser"]].map(([Icon, label]) => {
          const ToolIcon = Icon as React.ComponentType<{ size?: number; color?: string }>
          return <div key={label as string} style={{ marginTop: 7, padding: "9px 10px", display: "flex", gap: 9, alignItems: "center", border: `1px solid ${LINE}`, borderRadius: 8, background: INK, fontSize: 11 }}><GripVertical size={13} color={MUTED} /><ToolIcon size={14} color={MUTED} />{label as string}</div>
        })}
      </aside>
      <main style={{ minWidth: 0, flex: 1, display: "flex", flexDirection: "column" }}>
        <header style={{ height: 56, flexShrink: 0, padding: "0 18px", display: "flex", alignItems: "center", gap: 10, borderBottom: `2px solid ${LINE}`, background: RAIL }}>
          <FolderGit2 size={17} color={CYAN} /><strong style={{ fontSize: 14 }}>{activeJob}</strong>
          <div style={{ marginLeft: "auto", padding: "6px 11px", border: `1px solid ${LINE}`, borderRadius: 999, color: CYAN, fontSize: 10, fontWeight: 800 }}>{status}</div>
        </header>
        <div style={{ minHeight: 0, flex: 1, position: "relative" }}>{children}</div>
      </main>
    </div>
  </AbsoluteFill>
)

const Cursor: React.FC<{ x: number; y: number; down?: boolean }> = ({ x, y, down }) => (
  <div style={{ position: "absolute", zIndex: 100, left: x, top: y, width: 23, height: 31, transform: `scale(${down ? .86 : 1})`, filter: "drop-shadow(0 3px 3px rgba(0,0,0,.7))" }}>
    <svg viewBox="0 0 24 32"><path d="M2 1 22 20l-9 1 5 9-5 2-5-9-6 7Z" fill={PAPER} stroke={INK} strokeWidth="2" /></svg>
  </div>
)

const PaneHeader: React.FC<{ icon: React.ReactNode; title: string }> = ({ icon, title }) => <div style={{ height: 34, flexShrink: 0, borderBottom: `1px solid ${LINE}`, background: RAIL, display: "flex", alignItems: "center", gap: 8, padding: "0 11px", color: MUTED, fontSize: 10, fontWeight: 900, letterSpacing: 1.2 }}>{icon}{title.toUpperCase()}</div>

const TerminalPane: React.FC<{ job: string }> = ({ job }) => <div style={{ height: "100%", display: "flex", flexDirection: "column", background: INK }}><PaneHeader icon={<TerminalSquare size={13} />} title="Agent terminal" /><div style={{ padding: 20, fontFamily: "Consolas, monospace", fontSize: 14, lineHeight: 1.75, color: MUTED }}><div><span style={{ color: CYAN }}>OMP</span> <span style={{ color: MAGENTA }}>›</span> {job}</div><div style={{ color: PAPER, marginTop: 10 }}>Gorge make beautiful thing.</div><div style={{ color: GOLD }}>Working in ordinary folder...</div><div style={{ color: CYAN }}>✓ files saved</div></div></div>

export const Theme7JobSwitchScene: React.FC = () => {
  const frame = useCurrentFrame()
  const phase = frame < 150 ? 0 : frame < 315 ? 1 : 2
  const jobs = ["gorge-fan-page", "ship-theme7", "make-more-money"]
  const job = jobs[phase]
  const targetY = [154, 201, 249][phase]
  const x = interpolate(frame % 165, [0, 60], [760, 150], { ...clamp, easing: Easing.inOut(Easing.cubic) })
  const y = interpolate(frame % 165, [0, 60], [350, targetY], { ...clamp, easing: Easing.inOut(Easing.cubic) })
  return <Shell activeJob={job} status="JOB SWITCHED">
    <div style={{ position: "absolute", inset: 14, display: "grid", gridTemplateColumns: "1fr .7fr", gap: 8 }}>
      <div style={{ minWidth: 0, overflow: "hidden", border: `1px solid ${LINE}`, borderRadius: 10 }}><TerminalPane job={job} /></div>
      <div style={{ minWidth: 0, overflow: "hidden", border: `1px solid ${LINE}`, borderRadius: 10, background: INK }}><PaneHeader icon={<Files size={13} />} title="Files" /><div style={{ padding: 16, fontFamily: "Consolas, monospace", color: MUTED, fontSize: 12, lineHeight: 2 }}>{["README.md", "index.html", "gorge.png", "theme.css"].map((file, index) => <div key={file} style={{ color: index === phase ? PAPER : MUTED }}>{index === phase ? "●" : "○"} {file}</div>)}</div></div>
    </div>
    <Cursor x={x} y={y} down={(frame % 165) > 58 && (frame % 165) < 72} />
  </Shell>
}

export const Theme7FolderWorkflowScene: React.FC<{ showFolderFlare?: boolean }> = ({ showFolderFlare = true }) => {
  const frame = useCurrentFrame()
  const flare = showFolderFlare ? interpolate(frame, [0, 18, 95, 125], [0, 1, 1, 0], clamp) : 0
  const step = frame < 140 ? 0 : frame < 270 ? 1 : 2
  const cursorX = interpolate(frame, [110, 190, 300, 390], [830, 430, 660, 910], { ...clamp, easing: Easing.inOut(Easing.cubic) })
  const cursorY = interpolate(frame, [110, 190, 300, 390], [480, 250, 190, 390], { ...clamp, easing: Easing.inOut(Easing.cubic) })
  return <Shell activeJob="gorge-fan-page" status={["OMP RUNNING", "FILES OPEN", "GIT CLEAN"][step]}>
    <div style={{ position: "absolute", inset: 14, display: "grid", gridTemplateColumns: step === 0 ? "1fr" : "1fr 1fr", gridTemplateRows: step < 2 ? "1fr" : "1fr .55fr", gap: 8, transition: "none" }}>
      <div style={{ minWidth: 0, minHeight: 0, overflow: "hidden", border: `1px solid ${LINE}`, borderRadius: 10, gridRow: step === 0 ? "1" : "1 / 3" }}><TerminalPane job="gorge-fan-page" /></div>
      {step >= 1 ? <div style={{ minWidth: 0, minHeight: 0, overflow: "hidden", border: `1px solid ${LINE}`, borderRadius: 10, background: INK }}><PaneHeader icon={<Files size={13} />} title="Files" /><div style={{ padding: 14, color: MUTED, fontFamily: "Consolas, monospace", fontSize: 12, lineHeight: 1.8 }}>▾ gorge-fan-page<br />&nbsp;&nbsp;├─ index.html<br />&nbsp;&nbsp;├─ gorge.png<br />&nbsp;&nbsp;└─ theme.css</div></div> : null}
      {step >= 2 ? <div style={{ minWidth: 0, minHeight: 0, overflow: "hidden", border: `1px solid ${LINE}`, borderRadius: 10, background: INK }}><PaneHeader icon={<GitBranch size={13} />} title="Git" /><div style={{ padding: 14, fontSize: 12, color: CYAN }}>✓ 3 files committed<br /><span style={{ color: MUTED }}>main · clean</span></div></div> : null}
    </div>
    <Cursor x={cursorX} y={cursorY} />
    <AbsoluteFill style={{ opacity: flare, pointerEvents: "none", background: "rgba(7,9,14,.72)", display: "grid", placeItems: "center" }}>
      <div style={{ position: "relative", width: 760, height: 390 }}>
        {[CYAN, MAGENTA, VIOLET, GOLD].map((color, index) => <div key={color} style={{ position: "absolute", left: index * 130, top: index * 48, width: 420, height: 250, border: `5px solid ${INK}`, borderRadius: 18, background: `linear-gradient(145deg,${color},#10141d 42%)`, boxShadow: `14px 16px 0 ${INK},0 0 28px ${color}55`, transform: `rotate(${index * 2 - 3}deg)` }}><div style={{ position: "absolute", left: 25, top: -32, width: 130, height: 35, border: `5px solid ${INK}`, borderBottom: 0, borderRadius: "12px 12px 0 0", background: color }} /></div>)}
      </div>
    </AbsoluteFill>
  </Shell>
}

const GorgeFanPage: React.FC<{ reveal: number }> = ({ reveal }) => (
  <div style={{ height: "100%", opacity: reveal, color: "#00ff66", background: "#02000c", backgroundImage: "radial-gradient(#fff 1px,transparent 1px)", backgroundSize: "18px 18px", fontFamily: "Comic Sans MS, cursive", overflow: "hidden", textAlign: "center" }}>
    <div style={{ padding: "8px 12px", color: "#fff", background: "linear-gradient(90deg,#ff00cc,#3300ff,#00ccff)", fontSize: 13 }}>★ WELCOME TO GORGE'S AWESOME HOME PAGE ★</div>
    <div style={{ display: "grid", gridTemplateColumns: ".65fr 1fr", gap: 18, alignItems: "center", padding: 18 }}>
      <div style={{ fontSize: 82, filter: "drop-shadow(6px 6px 0 #ff00cc)" }}>🥔</div>
      <div><div style={{ color: "#ffff00", fontSize: 28, fontWeight: 900, textShadow: "3px 3px #ff00cc" }}>GORGECITIES</div><div style={{ marginTop: 8, color: "#00ffff", fontSize: 15 }}>Gorge love OMP.<br />Gorge make web site.</div><div style={{ marginTop: 12, color: "#ff66ff", fontSize: 12 }}>BEST VIEWED IN NETSCAPE</div></div>
    </div>
    <div style={{ margin: "0 20px", padding: 9, border: "3px ridge #ffff00", color: "#fff", fontSize: 12 }}>UNDER CONSTRUCTION 🚧 · SIGN MY GUESTBOOK · EMAIL GORGE</div>
    <div style={{ marginTop: 10, color: "#ffff00", fontFamily: "monospace", fontSize: 11 }}>VISITOR #0000007</div>
  </div>
)
export const Theme7ToolsWorkflowScene: React.FC = () => <Theme7FolderWorkflowScene showFolderFlare={false} />

export const Theme7BrowserDropScene: React.FC = () => {
  const frame = useCurrentFrame()
  const lift = 50
  const drop = 155
  const dragging = frame >= lift && frame < drop
  const t = interpolate(frame, [lift, drop], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) })
  const cursorX = frame < lift ? interpolate(frame, [0, lift], [790, 147], clamp) : interpolate(t, [0, 1], [147, 995], clamp)
  const cursorY = frame < lift ? interpolate(frame, [0, lift], [470, 471], clamp) : interpolate(t, [0, 1], [471, 318], clamp)
  const reveal = interpolate(frame, [drop, drop + 28], [0, 1], clamp)
  return <Shell activeJob="gorge-fan-page" status={frame < drop ? "1 PANE" : "BROWSER · RIGHT SPLIT"}>
    <div style={{ position: "absolute", inset: 14, display: "flex", overflow: "hidden", border: `1px solid ${LINE}`, borderRadius: 10 }}>
      <div style={{ width: frame < drop ? "100%" : "48%", minWidth: 0 }}><TerminalPane job="gorge-fan-page" /></div>
      {frame >= drop ? <><div style={{ width: 6, background: LINE }} /><div style={{ minWidth: 0, flex: 1, display: "flex", flexDirection: "column", background: INK }}><PaneHeader icon={<Globe2 size={13} />} title="Browser · index.html" /><GorgeFanPage reveal={reveal} /></div></> : null}
      {dragging ? <div style={{ position: "absolute", right: 0, top: 0, width: "50%", height: "100%", border: `4px solid ${CYAN}`, background: "rgba(90,216,230,.18)" }} /> : null}
    </div>
    {dragging ? <div style={{ position: "absolute", zIndex: 90, left: cursorX + 18, top: cursorY + 18, width: 190, padding: 13, display: "flex", alignItems: "center", gap: 10, border: `2px solid ${CYAN}`, borderRadius: 10, background: INK, boxShadow: "0 14px 30px rgba(0,0,0,.65)", fontSize: 13 }}><GripVertical size={16} color={MUTED} /><Globe2 size={18} color={CYAN} /><strong>Browser</strong></div> : null}
    <Cursor x={cursorX} y={cursorY} down={dragging} />
  </Shell>
}

const Intro: React.FC = () => {
  const frame = useCurrentFrame()
  const enter = interpolate(frame, [0, 30], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) })
  return <AbsoluteFill style={{ background: INK, color: PAPER, display: "grid", placeItems: "center", fontFamily: "Inter, Arial, sans-serif" }}><div style={{ opacity: enter, transform: `translateY(${(1 - enter) * 30}px)`, textAlign: "center" }}><div style={{ color: CYAN, fontSize: 22, fontWeight: 900, letterSpacing: 5 }}>THEME7</div><div style={{ marginTop: 20, fontSize: 70, lineHeight: 1, fontWeight: 900 }}>One folder.<br />Every tool it needs.</div></div></AbsoluteFill>
}

const Outro: React.FC = () => <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 45%,${VIOLET}44,${INK} 55%)`, color: PAPER, display: "grid", placeItems: "center", fontFamily: "Inter, Arial, sans-serif", textAlign: "center" }}><div><div style={{ fontSize: 92, fontWeight: 1000, letterSpacing: -5 }}>theme7</div><div style={{ marginTop: 14, color: CYAN, fontSize: 26, fontWeight: 800 }}>the job harness</div><div style={{ marginTop: 30, display: "flex", gap: 13, justifyContent: "center" }}>{[[Bot,"OMP"],[Files,"FILES"],[GitBranch,"GIT"],[Globe2,"BROWSER"]].map(([Icon,label]) => { const I = Icon as React.ComponentType<{size?:number}>; return <div key={label as string} style={{ padding: "12px 16px", border: `1px solid ${LINE}`, borderRadius: 10, background: PANEL, display: "flex", gap: 9, alignItems: "center", fontSize: 13 }}><I size={16}/>{label as string}</div> })}</div></div></AbsoluteFill>

export const THEME7_SHOWPIECE_FRAMES = 1380

export const Theme7InteractionShowpieceScene: React.FC = () => (
  <AbsoluteFill style={{ background: INK }}>
    <Sequence durationInFrames={120}><Intro /></Sequence>
    <Sequence from={120} durationInFrames={420}><Theme7JobSwitchScene /></Sequence>
    <Sequence from={540} durationInFrames={420}><Theme7FolderWorkflowScene /></Sequence>
    <Sequence from={960} durationInFrames={300}><Theme7BrowserDropScene /></Sequence>
    <Sequence from={1260} durationInFrames={120}><Outro /></Sequence>
  </AbsoluteFill>
)
