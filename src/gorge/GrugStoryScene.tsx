import React from "react"
import {
  AbsoluteFill,
  Audio,
  Img,
  OffthreadVideo,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion"
import type { GrugSceneKind, PreparedGrugStoryBeat, PreparedGrugStoryProps } from "../../grug-stories/contract"
import { CameraRig, CaptionCard, EffectOverlay, PuppetActor, palette } from "./GrugMolecules"
import { AdventurePlate, AdventureSubtitle } from "./GrugAdventure"
import {
  Grug1800FinalePlate,
  GrugGitWalkPlate,
  GrugOmpDiscoveryPlate,
  GrugProfileTauntPlate,
} from "./GrugOmpThemeSevenPlates"
import { OMP_BRAND } from "./OmpBrand"
import { GorgeRevisionPlate } from "./GorgeRevisionPlates"

const { PAPER, INK, CYAN, PINK, YELLOW } = palette

const PaperPlate: React.FC = () => {
  const frame = useCurrentFrame()
  const playhead = 220 + frame % 250 * 4.8
  return (
    <AbsoluteFill style={{ background: PAPER, color: INK, fontFamily: "Arial, sans-serif" }}>
      <AbsoluteFill style={{ opacity: 0.15, backgroundImage: "linear-gradient(#15130f 2px, transparent 2px), linear-gradient(90deg, #15130f 2px, transparent 2px)", backgroundSize: "72px 72px" }} />
      <div style={{ position: "absolute", left: 80, top: 70, fontFamily: "Arial Black, Arial", fontSize: 35, letterSpacing: 2 }}>GRUG EDIT SUITE 2004 PRO MAX</div>
      <div style={{ position: "absolute", left: 84, top: 145, width: 960, height: 570, border: `10px solid ${INK}`, borderRadius: 26, background: "#23232b", boxShadow: `18px 22px 0 ${INK}`, overflow: "hidden" }}>
        <div style={{ display: "flex", gap: 16, padding: 22, borderBottom: `7px solid ${INK}`, background: "#f7f3e7" }}>
          {["FILE", "EDIT", "KEYFRAME", "PANIC"].map((label) => <div key={label} style={{ padding: "8px 14px", border: `4px solid ${INK}`, borderRadius: 9, background: label === "PANIC" ? PINK : "white", fontWeight: 900 }}>{label}</div>)}
        </div>
        <div style={{ height: 290, background: "radial-gradient(circle at 50% 45%, #524e68, #191921)", display: "grid", placeItems: "center", color: "white", fontSize: 62, fontWeight: 1000 }}>FRAME {String(frame).padStart(5, "0")}</div>
        <div style={{ position: "relative", height: 190, padding: 18, background: "#ded8c8" }}>
          {[PINK, CYAN, YELLOW].map((color, index) => <div key={color} style={{ position: "relative", marginBottom: 13, height: 42, border: `4px solid ${INK}`, borderRadius: 8, background: INK }}><div style={{ width: `${48 + index * 17}%`, height: "100%", background: color }} /></div>)}
          <div style={{ position: "absolute", left: playhead, top: 8, width: 7, height: 176, background: "white", boxShadow: `0 0 0 4px ${INK}` }} />
        </div>
      </div>
    </AbsoluteFill>
  )
}

const TerminalCapture: React.FC<{ style: React.CSSProperties }> = ({ style }) => (
  <div style={{
    ...style,
    position: "relative",
    overflow: "hidden",
    border: "2px solid rgba(247,239,220,.18)",
    borderRadius: 8,
    background: OMP_BRAND.night,
    boxShadow: "0 16px 40px rgba(0,0,0,.42)",
  }}>
    <Img
      src={staticFile(OMP_BRAND.terminalCapturePath)}
      style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }}
    />
  </div>
)

const OmpPlate: React.FC = () => (
  <AbsoluteFill style={{ display: "grid", placeItems: "center", overflow: "hidden", background: OMP_BRAND.night }}>
    <TerminalCapture style={{ width: 1_088, aspectRatio: "995 / 626" }} />
  </AbsoluteFill>
)

const WorkspacePlate: React.FC<{ jobs?: boolean }> = ({ jobs = false }) => {
  const frame = useCurrentFrame()
  return (
    <AbsoluteFill style={{ background: "linear-gradient(135deg, #171a25, #24213c 54%, #172d36)", color: "white", fontFamily: "Arial, sans-serif" }}>
      <div style={{ position: "absolute", inset: 30, border: "3px solid rgba(255,255,255,.2)", borderRadius: 28, overflow: "hidden", boxShadow: "0 26px 100px rgba(0,0,0,.5)" }}>
        <div style={{ height: 74, display: "flex", alignItems: "center", gap: 18, padding: "0 24px", background: "rgba(12,13,19,.9)", borderBottom: "2px solid rgba(255,255,255,.14)" }}>
          <div style={{ width: 24, height: 24, borderRadius: 99, background: PINK }} /><div style={{ width: 24, height: 24, borderRadius: 99, background: YELLOW }} /><div style={{ width: 24, height: 24, borderRadius: 99, background: CYAN }} />
          <div style={{ fontFamily: "Arial Black, Arial", fontSize: 26, marginLeft: 22 }}>THEME SEVEN · JOB HARNESS</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "220px minmax(0, 1fr) 700px", height: 916 }}>
          <div style={{ padding: 24, borderRight: "2px solid rgba(255,255,255,.12)", background: "rgba(9,10,16,.58)" }}>
            {["JOBS", "FILES", "GIT", "BROWSER", "RECIPES"].map((label, index) => <div key={label} style={{ padding: "17px 18px", marginBottom: 12, borderRadius: 12, background: index === 0 ? "rgba(101,228,255,.2)" : "rgba(255,255,255,.06)", color: index === 0 ? CYAN : "#d7d8e3", fontWeight: 900, fontSize: 25 }}>{label}</div>)}
          </div>
          <div style={{ padding: 28, display: "grid", gridTemplateColumns: jobs ? "1fr 1fr" : "1fr", gap: 22 }}>
            {(jobs ? ["OMP FILM", "T4 CODE", "ROY RESEARCH", "RENDER REVIEW"] : ["CURRENT JOB · GRUG STORY"]).map((label, index) => <div key={label} style={{ border: "2px solid rgba(255,255,255,.16)", borderRadius: 21, padding: 28, background: `linear-gradient(150deg, rgba(${index % 2 ? "255,78,186" : "101,228,255"},.14), rgba(10,10,18,.82))`, boxShadow: "0 18px 40px rgba(0,0,0,.3)" }}>
              <div style={{ fontFamily: "Arial Black, Arial", color: index % 2 ? PINK : CYAN, fontSize: 27 }}>{label}</div>
              <div style={{ marginTop: 26, fontFamily: "Consolas, monospace", fontSize: 23, color: "#d9dae5", lineHeight: 1.6 }}>&gt; agent working<br />&gt; evidence retained<br />&gt; mouth synchronized<br /><span style={{ color: YELLOW }}>&gt; {frame % (45 + index * 7) < 30 ? "rendering..." : "review ready"}</span></div>
            </div>)}
          </div>
          <div style={{ borderLeft: "2px solid rgba(255,255,255,.12)", padding: 16, display: "grid", alignContent: "start", background: "rgba(6,8,14,.64)" }}>
            <TerminalCapture style={{ width: "100%", aspectRatio: "995 / 626" }} />
          </div>
        </div>
      </div>
    </AbsoluteFill>
  )
}

const T4DropPlate: React.FC<{ clipPath?: string }> = ({ clipPath }) => (
  <AbsoluteFill style={{ background: "#10131c", padding: 46 }}>
    <div style={{ position: "relative", width: "100%", height: "100%", border: `7px solid ${CYAN}`, borderRadius: 28, overflow: "hidden", boxShadow: `0 0 0 12px ${INK}, 0 0 90px rgba(101,228,255,.48)` }}>
      {clipPath ? <OffthreadVideo src={staticFile(clipPath)} volume={0} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <AbsoluteFill style={{ display: "grid", placeItems: "center", color: "white", fontFamily: "Arial Black, Arial", fontSize: 52 }}>T4 CLIP NOT PREPARED</AbsoluteFill>}
    </div>
    <div style={{ position: "absolute", top: 68, left: 78, padding: "12px 22px", border: `6px solid ${INK}`, borderRadius: 14, background: YELLOW, color: INK, fontFamily: "Arial Black, Arial", fontSize: 30 }}>REAL THEME SEVEN INTERACTION</div>
  </AbsoluteFill>
)

const RoyCorpPlate: React.FC = () => {
  const frame = useCurrentFrame()
  const fields = ["NAME: GRUG", "CURRENT JOB: MANY", "W2: TOO LARGE", "OPINION: STRONG"]
  return (
    <AbsoluteFill style={{ background: "#d7e7ff", color: INK, fontFamily: "Arial, sans-serif" }}>
      <div style={{ position: "absolute", left: 78, top: 58, fontFamily: "Arial Black, Arial", fontSize: 76 }}>ROYCORP.NET</div>
      <div style={{ position: "absolute", left: 80, top: 165, width: 1_030, height: 760, border: `9px solid ${INK}`, borderRadius: 24, background: "white", boxShadow: `20px 24px 0 ${INK}`, padding: 36 }}>
        <div style={{ fontFamily: "Arial Black, Arial", fontSize: 41, marginBottom: 28 }}>EMPLOYMENT APPLICATION</div>
        {fields.map((field, index) => <div key={field} style={{ marginBottom: 22, padding: "19px 22px", border: `5px solid ${INK}`, borderRadius: 12, background: index === 2 ? YELLOW : "#f7f7f7", fontSize: 29, fontWeight: 900 }}>{field}{frame > 40 + index * 28 ? " ✓" : ""}</div>)}
        <div style={{ display: "inline-block", marginTop: 12, padding: "18px 34px", border: `6px solid ${INK}`, borderRadius: 14, background: PINK, color: "white", fontFamily: "Arial Black, Arial", fontSize: 34 }}>SUBMIT AND BECOME FOUNDER</div>
      </div>
    </AbsoluteFill>
  )
}

const StreetPlate: React.FC = () => {
  const frame = useCurrentFrame()
  const cloudOffset = frame * 0.18
  return (
    <AbsoluteFill style={{ background: "#cfe8ef", color: INK, fontFamily: "Arial, sans-serif" }}>
      <div style={{ position: "absolute", left: `${12 + cloudOffset % 95}%`, top: 78, width: 180, height: 52, borderRadius: 50, background: "rgba(255,255,255,.78)" }} />
      <div style={{ position: "absolute", left: `${55 + cloudOffset * 0.6 % 70}%`, top: 142, width: 128, height: 38, borderRadius: 50, background: "rgba(255,255,255,.62)" }} />
      <div style={{ position: "absolute", inset: "330px 0 0", background: "#b8d39d", borderTop: `6px solid ${INK}` }} />
      <div style={{ position: "absolute", left: "7%", bottom: 170, width: 250, height: 220, border: `7px solid ${INK}`, background: "#f5d9b8" }}>
        <div style={{ position: "absolute", left: 82, bottom: 0, width: 74, height: 126, border: `6px solid ${INK}`, background: "#c87f5e" }} />
        <div style={{ position: "absolute", left: 22, top: 42, width: 55, height: 55, border: `6px solid ${INK}`, background: "#bde7f3" }} />
        <div style={{ position: "absolute", right: 22, top: 42, width: 55, height: 55, border: `6px solid ${INK}`, background: "#bde7f3" }} />
        <div style={{ position: "absolute", left: -24, top: -86, width: 292, height: 100, border: `7px solid ${INK}`, background: "#d95e59", clipPath: "polygon(50% 0, 100% 100%, 0 100%)" }} />
      </div>
      <div style={{ position: "absolute", right: "10%", bottom: 175, width: 28, height: 195, border: `6px solid ${INK}`, background: "#8d5b3e" }} />
      <div style={{ position: "absolute", right: "5.5%", bottom: 315, width: 150, height: 150, border: `7px solid ${INK}`, borderRadius: "48% 52% 45% 55%", background: "#6ea66b" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 176, borderTop: `7px solid ${INK}`, background: "#ddd8cc" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 67, height: 7, background: "rgba(42,23,18,.26)" }} />
    </AbsoluteFill>
  )
}

const SidewalkTestPlate: React.FC = () => {
  const frame = useCurrentFrame()
  const heldFrame = Math.floor(frame / 8) * 8
  const panelShift = -((heldFrame * 3) % 320)
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#d7cf9d", color: "#182018", fontFamily: "\"Courier New\", monospace" }}>
      <div style={{ position: "absolute", inset: "0 0 265px", background: "#d7cf9d" }}>
        {Array.from({ length: 7 }, (_, index) => (
          <div key={index} style={{
            position: "absolute",
            left: panelShift + index * 320,
            top: 0,
            width: 316,
            height: "100%",
            borderRight: "4px solid #817b5f",
            background: index % 2 ? "#d2ca95" : "#ded6a5",
          }}>
            <div style={{ position: "absolute", left: 42, top: 190, width: 154, height: 92, border: "8px solid #182018", background: "#f2eee0", display: "grid", placeItems: "center", fontSize: 19, fontWeight: 900, textAlign: "center" }}>WALK<br />THIS WAY →</div>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 399, height: 34, background: "repeating-linear-gradient(135deg,#171b16 0 28px,#f0cf3c 28px 56px)", borderTop: "7px solid #171b16", borderBottom: "7px solid #171b16" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 287, background: "#aaa99c", borderTop: "6px solid #182018" }}>
        {Array.from({ length: 8 }, (_, index) => <div key={index} style={{ position: "absolute", left: panelShift + index * 250, top: 0, width: 6, height: "100%", background: "#7d7d73", transform: "skewX(-16deg)" }} />)}
        <div style={{ position: "absolute", left: 0, right: 0, top: 118, height: 5, background: "#87877e" }} />
      </div>
      <div style={{ position: "absolute", left: 28, top: 24, padding: "12px 18px", border: "5px solid #182018", background: "#eef0df", boxShadow: "8px 8px 0 #182018", fontSize: 25, fontWeight: 900 }}>CITY OF GRUG · PEDESTRIAN DYNAMICS LAB</div>
      <div style={{ position: "absolute", right: 28, top: 25, padding: "12px 18px", border: "5px solid #a72727", color: "#a72727", background: "#f1e8cb", fontSize: 25, fontWeight: 900, transform: "rotate(2deg)" }}>NO TWEENING</div>
      <div style={{ position: "absolute", right: 30, bottom: 26, fontSize: 21, fontWeight: 900 }}>POSE {String(Math.floor(frame / 8) % 4 + 1).padStart(2, "0")} / 04 · HOLD 08F</div>
      <AbsoluteFill style={{ pointerEvents: "none", opacity: 0.1, background: "repeating-linear-gradient(0deg,transparent 0 3px,#111 3px 4px)" }} />
    </AbsoluteFill>
  )
}

const SidewalkBouncePlate: React.FC<{ mode?: "sine" | "cut" | "held" | "four" }> = ({ mode = "sine" }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const heldBobUp = Math.floor(frame / Math.round(fps * 1.5)) % 2 === 1
  const travel = -((frame * 2) % 280)
  const cycleFrame = frame % 12
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#83cadc", color: "#20192d", fontFamily: "Arial Black, Arial, sans-serif" }}>
      <div style={{ position: "absolute", left: `${12 + frame * 0.04 % 105}%`, top: 80, width: 190, height: 50, borderRadius: 50, background: "#f7f1df", boxShadow: "7px 8px 0 rgba(32,25,45,.18)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 250, height: 330 }}>
        {Array.from({ length: 8 }, (_, index) => (
          <div key={index} style={{
            position: "absolute",
            left: travel + index * 280,
            bottom: 0,
            width: 230,
            height: 170 + index % 3 * 56,
            border: "7px solid #20192d",
            background: ["#e46f78", "#f1c34f", "#7a76c9"][index % 3],
            boxShadow: "10px 11px 0 rgba(32,25,45,.18)",
          }}>
            <div style={{ position: "absolute", left: 36, top: 48, width: 48, height: 58, border: "6px solid #20192d", background: "#d9f2ee" }} />
            <div style={{ position: "absolute", right: 36, top: 48, width: 48, height: 58, border: "6px solid #20192d", background: "#d9f2ee" }} />
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 260, borderTop: "8px solid #20192d", background: "#d9d1c1" }}>
        {Array.from({ length: 8 }, (_, index) => <div key={index} style={{ position: "absolute", left: travel + index * 210, top: 0, width: 7, height: "100%", background: "#9e978b", transform: "skewX(-13deg)" }} />)}
        <div style={{ position: "absolute", left: 0, right: 0, top: 112, height: 7, background: "#a9a296" }} />
      </div>
      <div style={{ position: "absolute", left: 27, top: 24, padding: "12px 18px", border: "6px solid #20192d", background: "#f7f1df", boxShadow: "8px 8px 0 #20192d", fontSize: 24 }}>{mode === "four" ? "WALK CYCLE E · FOUR-POSE LEAN" : mode === "held" ? "WALK CYCLE D · EASY TWO-POSITION BOB" : mode === "cut" ? "WALK CYCLE C · TWO-POSITION CUT BOB" : "WALK CYCLE B · FULL-RATE BOUNCE"}</div>
      <div style={{ position: "absolute", right: 27, top: 24, padding: "12px 18px", border: "6px solid #20192d", background: "#72e4a0", boxShadow: "8px 8px 0 #20192d", fontSize: 23 }}>{mode === "four" ? `POSE ${Math.floor(frame / 8) % 4 + 1} / 4 · HOLD 8F` : mode === "held" ? `60 FPS · ${heldBobUp ? "UP" : "DOWN"} · HOLD 1.5S` : mode === "cut" ? `60 FPS · ${frame % 2 === 0 ? "DOWN" : "UP"} · 26PX` : `60 FPS · LOOP ${String(cycleFrame).padStart(2, "0")} / 12`}</div>
    </AbsoluteFill>
  )
}

const BounceSubtitle: React.FC<{ text: string }> = ({ text }) => (
  <div style={{ position: "absolute", zIndex: 30, left: 28, bottom: 24, maxWidth: "72%", padding: "12px 18px", border: "6px solid #20192d", background: "#f7f1df", boxShadow: "8px 8px 0 #20192d", color: "#20192d", fontFamily: "Arial Black, Arial, sans-serif", fontSize: 25, lineHeight: 1.05 }}>{text}</div>
)

const TestSubtitle: React.FC<{ text: string }> = ({ text }) => (
  <div style={{
    position: "absolute",
    zIndex: 30,
    left: 28,
    bottom: 24,
    maxWidth: "67%",
    padding: "11px 16px",
    border: "5px solid #182018",
    background: "#eef0df",
    boxShadow: "7px 7px 0 #182018",
    color: "#182018",
    fontFamily: "\"Courier New\", monospace",
    fontSize: 25,
    fontWeight: 900,
    lineHeight: 1.08,
  }}>{text}</div>
)

const CalmSubtitle: React.FC<{ text: string }> = ({ text }) => (
  <div style={{
    position: "absolute",
    zIndex: 30,
    left: "50%",
    bottom: 28,
    maxWidth: "82%",
    transform: "translateX(-50%)",
    padding: "11px 20px 13px",
    border: `3px solid ${INK}`,
    borderRadius: 12,
    background: "rgba(250,247,238,.94)",
    boxShadow: "5px 6px 0 rgba(42,23,18,.18)",
    color: INK,
    textAlign: "center",
    fontFamily: "Arial, sans-serif",
    fontSize: 28,
    fontWeight: 800,
    lineHeight: 1.1,
  }}>{text}</div>
)

const EndCardPlate: React.FC = () => (
  <AbsoluteFill style={{ background: INK, color: PAPER, display: "grid", placeItems: "center", fontFamily: "Arial, sans-serif" }}>
    <div style={{ width: 1_580 }}>
      <div style={{ color: CYAN, fontFamily: "Arial Black, Arial", fontSize: 41, letterSpacing: 6 }}>A GRUG STORY</div>
      <div style={{ marginTop: 16, fontFamily: "Arial Black, Arial", fontSize: 103, lineHeight: 0.95, letterSpacing: -5 }}>HOW GRUG FOUND OMP,<br /><span style={{ color: PINK }}>THEN FOUND THEME SEVEN</span></div>
      <div style={{ marginTop: 48, display: "flex", gap: 20 }}>
        {["PROMPT", "VOICE", "MOUTH", "CAMERA", "FILM"].map((label, index) => <div key={label} style={{ padding: "14px 18px", border: `4px solid ${index % 2 ? PINK : CYAN}`, borderRadius: 10, fontFamily: "Arial Black, Arial", fontSize: 25 }}>{label}</div>)}
      </div>
      <div style={{ marginTop: 34, color: "#aaa8b2", fontSize: 24 }}>NARRATIVE COMEDY · PRODUCT PIXELS IDENTIFIED IN-FRAME · LOCAL CONCEPT CUT</div>
    </div>
  </AbsoluteFill>
)

const ScenePlate: React.FC<{ scene: GrugSceneKind; t4ClipPath?: string; storyVersion?: "grug-v2" | "gorge-v3" }> = ({ scene, t4ClipPath, storyVersion = "grug-v2" }) => {
  if (storyVersion === "gorge-v3") return <GorgeRevisionPlate scene={scene} t4ClipPath={t4ClipPath} />
  if (scene === "omp-choir") return <OmpPlate />
  if (scene === "theme-seven-edm") return <WorkspacePlate />
  if (scene === "t4-drop") return <T4DropPlate clipPath={t4ClipPath} />
  if (scene === "job-rain") return <WorkspacePlate jobs />
  if (scene === "roycorp") return <RoyCorpPlate />
  if (scene === "end-card") return <EndCardPlate />
  if (scene === "grug-street") return <StreetPlate />
  if (scene === "grug-sidewalk-test") return <SidewalkTestPlate />
  if (scene === "grug-sidewalk-bounce") return <SidewalkBouncePlate />
  if (scene === "grug-sidewalk-cut-bob") return <SidewalkBouncePlate mode="cut" />
  if (scene === "grug-sidewalk-held-bob") return <SidewalkBouncePlate mode="held" />
  if (scene === "grug-sidewalk-four-pose") return <SidewalkBouncePlate mode="four" />
  if (scene === "grug-git-walk") return <GrugGitWalkPlate />
  if (scene === "grug-omp-discovery") return <GrugOmpDiscoveryPlate />
  if (scene === "grug-profile-taunt") return <GrugProfileTauntPlate />
  if (scene === "grug-1800-finale") return <Grug1800FinalePlate />
  if (scene === "grug-nursery" || scene === "grug-fighter" || scene === "grug-undersea" || scene === "grug-omp-transform" || scene === "grug-talking-object") return <AdventurePlate scene={scene} />
  return <PaperPlate />
}

const Beat: React.FC<{
  beat: PreparedGrugStoryBeat
  t4ClipPath?: string
  storyVersion?: "grug-v2" | "gorge-v3"
}> = ({ beat, t4ClipPath, storyVersion = "grug-v2" }) => (
  <AbsoluteFill>
    <CameraRig direction={beat.camera} durationInFrames={beat.durationInFrames}>
      <ScenePlate scene={beat.scene} t4ClipPath={t4ClipPath} storyVersion={storyVersion} />
      {beat.puppet ? <PuppetActor direction={beat.puppet} beat={beat} characterVersion={storyVersion} /> : null}
    </CameraRig>
    <EffectOverlay effect={beat.effect} />
    {storyVersion === "gorge-v3"
      ? <AdventureSubtitle beat={beat} />
      : beat.scene === "grug-street"
        ? <CalmSubtitle text={beat.caption} />
        : beat.scene === "grug-sidewalk-test"
          ? <TestSubtitle text={beat.caption} />
          : beat.scene === "grug-sidewalk-bounce" || beat.scene === "grug-sidewalk-cut-bob" || beat.scene === "grug-sidewalk-held-bob" || beat.scene === "grug-sidewalk-four-pose"
            ? <BounceSubtitle text={beat.caption} />
            : beat.scene === "grug-nursery" || beat.scene === "grug-fighter" || beat.scene === "grug-undersea" || beat.scene === "grug-omp-transform" || beat.scene === "grug-talking-object" || beat.scene === "grug-git-walk" || beat.scene === "grug-omp-discovery" || beat.scene === "grug-profile-taunt" || beat.scene === "grug-1800-finale"
              ? <AdventureSubtitle beat={beat} />
              : <CaptionCard text={beat.caption} accent={beat.scene === "theme-seven-edm" ? CYAN : beat.scene === "roycorp" ? PINK : YELLOW} />}
    <Audio src={staticFile(beat.audioPath)} />
  </AbsoluteFill>
)

export const GrugStoryScene: React.FC<PreparedGrugStoryProps & {
  storyVersion?: "grug-v2" | "gorge-v3"
}> = ({ storyVersion = "grug-v2", ...props }) => (
  <AbsoluteFill style={{ background: INK }}>
    {props.soundtrackPath ? <Audio src={staticFile(props.soundtrackPath)} volume={props.soundtrackVolume} /> : null}
    {props.beats.map((beat) => (
      <Sequence key={beat.id} from={beat.startFrame} durationInFrames={beat.durationInFrames} premountFor={60}>
        <Beat beat={beat} t4ClipPath={props.t4ClipPath} storyVersion={storyVersion} />
      </Sequence>
    ))}
  </AbsoluteFill>
)

export const GorgeStoryScene: React.FC<PreparedGrugStoryProps> = (props) => (
  <GrugStoryScene {...props} storyVersion="gorge-v3" />
)
