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
  const scale = interpolate(frame, [0, 240], [1.08, 1], CLAMP)
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: NIGHT }}>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 44%, #24303b, #080a10 72%)" }} />
      <div style={{
        position: "absolute",
        left: 230,
        top: 42,
        width: 995,
        height: 626,
        border: "3px solid rgba(247,239,220,.16)",
        borderRadius: 10,
        overflow: "hidden",
        boxShadow: "0 34px 90px rgba(0,0,0,.62)",
        transform: `perspective(1200px) rotateY(-8deg) scale(${scale})`,
        transformOrigin: "62% 50%",
      }}>
        <Img src={staticFile("grug-stories/gorge-v3/generic-terminal.png")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(8,10,16,.72), transparent 36% 78%, rgba(8,10,16,.38))" }} />
    </AbsoluteFill>
  )
}

const OmpDiscovery: React.FC = () => {
  const frame = useCurrentFrame()
  const reveal = interpolate(frame, [0, 44], [0.25, 1], CLAMP)
  const mark = interpolate(frame, [54, 92], [0, 1], CLAMP)
  const sweep = interpolate(frame, [82, 122], [-420, 1_420], CLAMP)
  const glow = interpolate(frame, [88, 114, 150], [0, 0.72, 0.42], CLAMP)
  const energy = interpolate(frame, [104, 120, 156, 220], [0, 1, 0.65, 0], CLAMP)
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: OMP_BRAND.night }}>
      <AbsoluteFill style={{ opacity: reveal, background: `radial-gradient(ellipse at 72% 46%, rgba(155,77,255,.25), ${OMP_BRAND.night} 62%)` }} />
      <OmpScreenPlaceholder />
      <AbsoluteFill style={{ opacity: energy * 0.62, background: `radial-gradient(circle at 22% 52%, rgba(247,239,220,.38), rgba(237,74,191,.24) 16%, rgba(155,77,255,.18) 32%, transparent 58%)`, mixBlendMode: "screen" }} />
      <div style={{
        position: "absolute",
        right: 72,
        top: 66,
        width: 760,
        height: 570,
        borderRadius: 22,
        overflow: "hidden",
        border: "3px solid rgba(247,239,220,.14)",
        boxShadow: "0 30px 80px rgba(0,0,0,.58)",
        transform: "perspective(1100px) rotateY(-7deg)",
      }}>
        <Img src={staticFile(OMP_BRAND.terminalCapturePath)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <AbsoluteFill style={{ background: "linear-gradient(120deg, rgba(247,239,220,.1), transparent 26% 78%, rgba(90,216,230,.12))" }} />
      </div>
      <div style={{
        position: "absolute",
        left: sweep,
        top: -120,
        width: 180,
        height: 980,
        opacity: 0.26,
        background: "linear-gradient(90deg, transparent, rgba(90,216,230,.72), transparent)",
        filter: "blur(16px)",
        transform: "rotate(12deg)",
      }} />
      <div style={{
        position: "absolute",
        left: 116,
        top: 210,
        width: 280,
        height: 280,
        borderRadius: "50%",
        opacity: glow,
        background: "radial-gradient(circle, rgba(247,239,220,.34), rgba(155,77,255,.32) 36%, transparent 72%)",
        filter: "blur(12px)",
      }} />
      <Img src={staticFile(OMP_BRAND.markPath)} style={{
        position: "absolute",
        left: 238,
        top: 424,
        width: 116,
        height: 116,
        opacity: mark,
        transform: `scale(${interpolate(mark, [0, 1], [.72, 1], CLAMP)})`,
        filter: `drop-shadow(-8px 0 22px ${MAGENTA}) drop-shadow(8px 0 22px ${CYAN})`,
      }} />
    </AbsoluteFill>
  )
}

const OmpScreenPlaceholder: React.FC = () => (
  <div style={{
    position: "absolute",
    left: 82,
    top: 112,
    width: 430,
    height: 330,
    border: "4px dashed rgba(247,239,220,.42)",
    borderRadius: 16,
    background: "linear-gradient(135deg,#111827,#080a10)",
    boxShadow: "0 0 38px rgba(90,216,230,.2)",
    display: "grid",
    placeItems: "center",
  }}>
    <Img src={staticFile(OMP_BRAND.markPath)} style={{ width: 132, height: 132, opacity: 0.72, filter: `drop-shadow(0 0 24px ${CYAN})` }} />
  </div>
)
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
