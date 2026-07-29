import React from "react"
import { AbsoluteFill, Img, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion"

const INK = "#07070b"
const PAPER = "#f7efdc"
const CYAN = "#5ad8e6"
const MAGENTA = "#ed4abf"
const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const
const CAPTURE_ROOT = "grug-stories/gorge-v4"

type CaptureName =
  | "theme7-actual-ship-job.png"
  | "theme7-actual-omp.png"
  | "theme7-actual-jobs.png"
  | "theme7-actual-browser.png"

const ActualProductShot: React.FC<{
  asset: CaptureName
  duration: number
  label: string
  fromScale?: number
  toScale?: number
  origin?: string
  fromX?: number
  toX?: number
}> = ({ asset, duration, label, fromScale = 1, toScale = 1.055, origin = "50% 50%", fromX = 0, toX = 0 }) => {
  const frame = useCurrentFrame()
  const opacity = interpolate(frame, [0, 12, Math.max(13, duration - 12), duration], [0, 1, 1, 0], CLAMP)
  const scale = interpolate(frame, [0, duration], [fromScale, toScale], CLAMP)
  const x = interpolate(frame, [0, duration], [fromX, toX], CLAMP)
  const labelIn = interpolate(frame, [10, 28], [18, 0], CLAMP)

  return (
    <AbsoluteFill style={{ overflow: "hidden", background: INK, opacity }}>
      <Img
        src={staticFile(`${CAPTURE_ROOT}/${asset}`)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `translateX(${x}px) scale(${scale})`,
          transformOrigin: origin,
        }}
      />
      <AbsoluteFill style={{ pointerEvents: "none", boxShadow: "inset 0 0 90px rgba(0,0,0,.62)" }} />
      <div style={{
        position: "absolute",
        left: 72,
        top: 72,
        padding: "10px 16px",
        border: "1px solid rgba(90,216,230,.68)",
        borderRadius: 999,
        background: "rgba(7,7,11,.88)",
        boxShadow: "0 10px 30px rgba(0,0,0,.5)",
        color: PAPER,
        fontFamily: "Inter, Arial, sans-serif",
        fontSize: 17,
        fontWeight: 900,
        letterSpacing: 1.4,
        transform: `translateY(${labelIn}px)`,
      }}>
        <span style={{ color: CYAN }}>ACTUAL THEME7</span>
        <span style={{ color: "#757b88", margin: "0 10px" }}>//</span>
        {label}
      </div>
    </AbsoluteFill>
  )
}

const JobSwitchMontage: React.FC = () => (
  <AbsoluteFill style={{ background: INK }}>
    <Sequence from={0} durationInFrames={150}>
      <ActualProductShot asset="theme7-actual-ship-job.png" duration={150} label="JOB: SHIP-THEME7" origin="50% 22%" toScale={1.07} />
    </Sequence>
    <Sequence from={132} durationInFrames={162}>
      <ActualProductShot asset="theme7-actual-jobs.png" duration={162} label="JOB: GORGE-FAN-PAGE" origin="22% 24%" fromScale={1.04} toScale={1.1} />
    </Sequence>
    <Sequence from={276} durationInFrames={720}>
      <ActualProductShot asset="theme7-actual-omp.png" duration={720} label="JOB: MAKE-MORE-MONEY" origin="36% 45%" fromScale={1.01} toScale={1.075} />
    </Sequence>
  </AbsoluteFill>
)

export const Theme7JobSwitchScene: React.FC = () => <JobSwitchMontage />

export const Theme7FolderWorkflowScene: React.FC<{ showFolderFlare?: boolean }> = () => (
  <AbsoluteFill style={{ background: INK }}>
    <Sequence from={0} durationInFrames={132}>
      <ActualProductShot asset="theme7-actual-jobs.png" duration={132} label="ONE JOB, ONE FOLDER" origin="78% 30%" fromScale={1.01} toScale={1.1} />
    </Sequence>
    <Sequence from={114} durationInFrames={132}>
      <ActualProductShot asset="theme7-actual-ship-job.png" duration={132} label="ORDINARY FILES STAY VISIBLE" origin="79% 25%" fromScale={1.02} toScale={1.12} fromX={0} toX={-18} />
    </Sequence>
    <Sequence from={228} durationInFrames={720}>
      <ActualProductShot asset="theme7-actual-omp.png" duration={720} label="OMP RUNS IN THAT FOLDER" origin="33% 48%" fromScale={1.01} toScale={1.09} />
    </Sequence>
  </AbsoluteFill>
)

export const Theme7ToolsWorkflowScene: React.FC = () => (
  <AbsoluteFill style={{ background: INK }}>
    <Sequence from={0} durationInFrames={138}>
      <ActualProductShot asset="theme7-actual-omp.png" duration={138} label="USE REAL OMP" origin="34% 42%" fromScale={1.02} toScale={1.11} />
    </Sequence>
    <Sequence from={120} durationInFrames={138}>
      <ActualProductShot asset="theme7-actual-jobs.png" duration={138} label="CREATE FILES" origin="83% 38%" fromScale={1.02} toScale={1.13} fromX={0} toX={-24} />
    </Sequence>
    <Sequence from={240} durationInFrames={720}>
      <ActualProductShot asset="theme7-actual-browser.png" duration={720} label="GIT + PREVIEW + SHIP" origin="86% 42%" fromScale={1.01} toScale={1.11} fromX={0} toX={-28} />
    </Sequence>
  </AbsoluteFill>
)

export const Theme7BrowserDropScene: React.FC = () => (
  <AbsoluteFill style={{ background: INK }}>
    <Sequence from={0} durationInFrames={126}>
      <ActualProductShot asset="theme7-actual-jobs.png" duration={126} label="ADD THE BROWSER PANE" origin="19% 30%" fromScale={1.02} toScale={1.12} />
    </Sequence>
    <Sequence from={108} durationInFrames={720}>
      <ActualProductShot asset="theme7-actual-browser.png" duration={720} label="WORK WHERE BRAIN CAN SEE IT" origin="86% 42%" fromScale={1.01} toScale={1.14} fromX={0} toX={-32} />
    </Sequence>
  </AbsoluteFill>
)

const Intro: React.FC = () => {
  const frame = useCurrentFrame()
  const rise = interpolate(frame, [0, 28], [42, 0], CLAMP)
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 48%,rgba(237,74,191,.22),${INK} 58%)`, display: "grid", placeItems: "center", color: PAPER, fontFamily: "Inter, Arial, sans-serif" }}>
      <div style={{ textAlign: "center", transform: `translateY(${rise}px)` }}>
        <div style={{ fontSize: 96, fontWeight: 1000, letterSpacing: -6 }}>Theme7</div>
        <div style={{ marginTop: 14, color: CYAN, fontSize: 24, fontWeight: 900, letterSpacing: 4 }}>THE ACTUAL PRODUCT</div>
      </div>
    </AbsoluteFill>
  )
}

const Outro: React.FC = () => (
  <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 45%,rgba(90,216,230,.22),${INK} 58%)`, color: PAPER, display: "grid", placeItems: "center", fontFamily: "Inter, Arial, sans-serif", textAlign: "center" }}>
    <div>
      <div style={{ fontSize: 90, fontWeight: 1000, letterSpacing: -5 }}>Theme7</div>
      <div style={{ marginTop: 14, color: MAGENTA, fontSize: 27, fontWeight: 900 }}>real OMP · real folders · visible jobs</div>
    </div>
  </AbsoluteFill>
)

export const THEME7_SHOWPIECE_FRAMES = 1380

export const Theme7InteractionShowpieceScene: React.FC = () => (
  <AbsoluteFill style={{ background: INK }}>
    <Sequence from={0} durationInFrames={90}><Intro /></Sequence>
    <Sequence from={90} durationInFrames={330}><Theme7JobSwitchScene /></Sequence>
    <Sequence from={420} durationInFrames={300}><Theme7FolderWorkflowScene /></Sequence>
    <Sequence from={720} durationInFrames={300}><Theme7ToolsWorkflowScene /></Sequence>
    <Sequence from={1020} durationInFrames={270}><Theme7BrowserDropScene /></Sequence>
    <Sequence from={1290} durationInFrames={90}><Outro /></Sequence>
  </AbsoluteFill>
)
