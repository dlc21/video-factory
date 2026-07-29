import React from "react"
import {
  AbsoluteFill,
  Img,
  OffthreadVideo,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion"
import type { GrugSceneKind } from "../../grug-stories/contract"
import { OMP_BRAND } from "./OmpBrand"
import {
  Theme7BrowserDropScene,
  Theme7FolderWorkflowScene,
  Theme7JobSwitchScene,
  Theme7ToolsWorkflowScene,
} from "./Theme7InteractionScenes"

const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const
const NIGHT = "#080a10"
const INK = "#15130f"
const PAPER = "#f7efdc"
const CYAN = "#5ad8e6"
const MAGENTA = "#ed4abf"
const VIOLET = "#9b4dff"

const OpeningTerminal: React.FC = () => {
  const frame = useCurrentFrame()
  const words = [
    { text: "MONEY", x: 188, y: 122, color: "#ffd84d", from: -90 },
    { text: "WAMMEN", x: 650, y: 184, color: MAGENTA, from: 100 },
    { text: "HAVE FUN", x: 244, y: 430, color: CYAN, from: -120 },
    { text: "GET RICH", x: 704, y: 486, color: PAPER, from: 130 },
  ]
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: NIGHT }}>
      <AbsoluteFill style={{ opacity: .34, background: `repeating-conic-gradient(from ${frame * .05}deg at 50% 50%,${VIOLET} 0 8deg,${NIGHT} 8deg 24deg,${MAGENTA} 24deg 31deg,${NIGHT} 31deg 48deg)` }} />
      {words.map((word, index) => {
        const entry = interpolate(frame, [index * 18, index * 18 + 34], [word.from, 0], CLAMP)
        const pulse = 1 + Math.sin((frame + index * 17) / 13) * .025
        return (
          <div key={word.text} style={{
            position: "absolute",
            left: word.x,
            top: word.y,
            color: word.color,
            fontFamily: "Impact, Arial Black, sans-serif",
            fontSize: 82,
            letterSpacing: 2,
            WebkitTextStroke: `3px ${INK}`,
            paintOrder: "stroke fill",
            textShadow: `10px 12px 0 ${INK}`,
            transform: `translateX(${entry}px) rotate(${index % 2 ? 2 : -2}deg) scale(${pulse})`,
          }}>{word.text}</div>
        )
      })}
    </AbsoluteFill>
  )
}

const OmpDiscovery: React.FC = () => {
  const frame = useCurrentFrame()
  const reveal = interpolate(frame, [0, 28], [0, 1], CLAMP)
  const scale = interpolate(frame, [0, 260], [1.02, 1.105], CLAMP)
  const badge = interpolate(frame, [22, 50], [28, 0], CLAMP)
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: NIGHT }}>
      <Img
        src={staticFile("grug-stories/gorge-v4/theme7-actual-omp.png")}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity: reveal,
          transform: `scale(${scale})`,
          transformOrigin: "36% 45%",
        }}
      />
      <AbsoluteFill style={{ boxShadow: "inset 0 0 90px rgba(0,0,0,.58)" }} />
      <div style={{
        position: "absolute",
        right: 70,
        top: 72,
        padding: "12px 18px",
        border: `2px solid ${CYAN}`,
        borderRadius: 999,
        background: "rgba(8,10,16,.9)",
        boxShadow: "0 14px 34px rgba(0,0,0,.55)",
        color: PAPER,
        fontFamily: "Inter, Arial, sans-serif",
        fontSize: 18,
        fontWeight: 900,
        letterSpacing: 1.6,
        transform: `translateY(${badge}px)`,
      }}>
        <span style={{ color: CYAN }}>REAL OMP</span>
        <span style={{ color: "#73798a", margin: "0 10px" }}>//</span>
        RUNNING IN THE ACTUAL THEME7 TERMINAL
      </div>
    </AbsoluteFill>
  )
}

const ThemeSevenFolders: React.FC = () => {
  const frame = useCurrentFrame()
  const drift = Math.sin(frame * 0.025) * 12
  const colors = [CYAN, MAGENTA, VIOLET, "#ffdb4d"]
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "linear-gradient(135deg,#10131c,#24213c 56%,#172d36)" }}>
      <div style={{ position: "absolute", right: 42, top: 78, width: 530, height: 470, border: `5px solid ${PAPER}`, borderRadius: 16, overflow: "hidden", opacity: 0.9, boxShadow: `0 0 36px ${CYAN}55` }}>
        <Img src={staticFile("grug-stories/theme-seven/git-repository-screenshot.png")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      <AbsoluteFill style={{ opacity: 0.22, background: "radial-gradient(circle at 62% 40%,#5ad8e6,transparent 44%)" }} />
      {colors.map((color, index) => {
        const entry = interpolate(frame, [index * 12, index * 12 + 34], [250, 0], CLAMP)
        return (
          <div key={color} style={{
            position: "absolute",
            left: 300 + index * 150,
            top: 160 + index * 72 + drift * (index % 2 ? -1 : 1),
            width: 520,
            height: 320,
            border: `6px solid ${INK}`,
            borderRadius: 22,
            background: `linear-gradient(150deg, ${color}, rgba(16,19,28,.96) 42%)`,
            boxShadow: `18px 22px 0 ${INK}, 0 0 46px ${color}44`,
            transform: `translateX(${entry}px) rotate(${index * 2 - 3}deg)`,
          }}>
            <div style={{ position: "absolute", left: 28, top: -42, width: 178, height: 48, border: `6px solid ${INK}`, borderBottom: 0, borderRadius: "16px 16px 0 0", background: color }} />
            <div style={{ position: "absolute", inset: 34, border: "2px solid rgba(247,239,220,.2)", borderRadius: 14 }} />
          </div>
        )
      })}
    </AbsoluteFill>
  )
}

const ProfilePunch: React.FC = () => {
  const frame = useCurrentFrame()
  const scale = interpolate(frame, [0, 46, 100], [.74, 1.04, 1], CLAMP)
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: NIGHT }}>
      <AbsoluteFill style={{ background: "linear-gradient(120deg,#080a10 0 42%,rgba(237,74,191,.24) 42% 48%,#111827 48%)" }} />
      <div style={{ position: "absolute", left: 432, top: 62, width: 500, height: 500, padding: 16, border: `8px solid ${INK}`, background: PAPER, boxShadow: `30px 32px 0 ${MAGENTA}, 58px 58px 0 rgba(90,216,230,.38)`, transform: `rotate(-3deg) scale(${scale})` }}>
        <Img src={staticFile("grug-stories/gorge-profile/gorge-profile-picture.png")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
    </AbsoluteFill>
  )
}

const BrowserDrop: React.FC<{ clipPath?: string }> = ({ clipPath }) => (
  <AbsoluteFill style={{ overflow: "hidden", background: NIGHT }}>
    <div style={{ position: "absolute", inset: 24, border: `4px solid ${CYAN}`, borderRadius: 24, overflow: "hidden", boxShadow: "0 0 54px rgba(90,216,230,.34)" }}>
      {clipPath ? <OffthreadVideo src={staticFile(clipPath)} volume={0} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : null}
    </div>
  </AbsoluteFill>
)

const GorgeFinale: React.FC = () => {
  const frame = useCurrentFrame()
  const entry = interpolate(frame, [0, 30], [160, 0], CLAMP)
  return (
    <AbsoluteFill style={{ overflow: "hidden", display: "grid", placeItems: "center", background: OMP_BRAND.night }}>
      <AbsoluteFill style={{ opacity: .24, background: `repeating-conic-gradient(from ${frame * .08}deg at 50% 50%,${MAGENTA} 0 7deg,${NIGHT} 7deg 18deg,${CYAN} 18deg 25deg,${NIGHT} 25deg 36deg)` }} />
      <Img src={staticFile(OMP_BRAND.markPath)} style={{ position: "absolute", top: 88, width: 128, height: 128, filter: `drop-shadow(0 0 28px ${VIOLET})` }} />
      <div style={{
        position: "relative",
        marginTop: 128,
        padding: "28px 54px 34px",
        border: `8px solid ${PAPER}`,
        borderRadius: 20,
        background: OMP_BRAND.gradient,
        boxShadow: `18px 20px 0 ${INK}, 0 0 54px rgba(155,77,255,.56)`,
        color: PAPER,
        fontFamily: "Consolas, monospace",
        fontSize: 72,
        fontWeight: 900,
        letterSpacing: 2,
        WebkitTextStroke: `3px ${INK}`,
        paintOrder: "stroke fill",
        transform: `translateY(${entry}px) rotate(-1deg)`,
      }}>1-800-GORGE-OMP</div>
    </AbsoluteFill>
  )
}

export const GorgeRevisionPlate: React.FC<{ scene: GrugSceneKind; t4ClipPath?: string }> = ({ scene, t4ClipPath }) => {
  if (scene === "grug-git-walk") return <OpeningTerminal />
  if (scene === "grug-omp-discovery") return <OmpDiscovery />
  if (scene === "theme-seven-edm") return <ThemeSevenFolders />
  if (scene === "grug-profile-taunt") return <ProfilePunch />
  if (scene === "t4-drop") return <BrowserDrop clipPath={t4ClipPath} />
  if (scene === "theme7-job-switch") return <Theme7JobSwitchScene />
  if (scene === "theme7-folder-workflow") return <Theme7FolderWorkflowScene />
  if (scene === "theme7-tools-workflow") return <Theme7ToolsWorkflowScene />
  if (scene === "theme7-browser-drop") return <Theme7BrowserDropScene />
  if (scene === "grug-1800-finale") return <GorgeFinale />
  return <OpeningTerminal />
}
