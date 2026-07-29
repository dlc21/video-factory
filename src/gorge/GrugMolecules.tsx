import React from "react"
import {
  AbsoluteFill,
  Img,
  interpolate,
  random,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion"
import type {
  GrugCameraDirection,
  GrugEffectKind,
  GrugPuppetDirection,
  PreparedGrugStoryBeat,
  RetroLipSyncManifest,
  RetroMouthCue,
} from "../../grug-stories/contract"
import { DrawnGrug } from "./DrawnGrug"
import { AdventureActor } from "./GrugAdventure"

const PAPER = "#f7efdc"
const INK = "#15130f"
const CYAN = "#65e4ff"
const PINK = "#ff4eba"
const YELLOW = "#ffdb4d"

const cueAtMilliseconds = (lipsync: RetroLipSyncManifest, milliseconds: number): RetroMouthCue | null => {
  const cues = lipsync.mouthCues
  if (cues.length === 0 || milliseconds < cues[0].timeMs) return null
  let low = 0
  let high = cues.length - 1
  while (low < high) {
    const middle = Math.ceil((low + high) / 2)
    if (cues[middle].timeMs <= milliseconds) low = middle
    else high = middle - 1
  }
  return cues[low]
}

export const CameraRig: React.FC<{
  direction: GrugCameraDirection
  durationInFrames: number
  children: React.ReactNode
}> = ({ direction, durationInFrames, children }) => {
  const frame = useCurrentFrame()
  const start = direction.startProgress * durationInFrames
  const end = direction.endProgress * durationInFrames
  let progress = interpolate(frame, [start, end], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
  if (direction.kind === "snap-zoom") progress = spring({ frame: Math.max(0, frame - start), fps: 60, config: { damping: 12, stiffness: 190, mass: 0.7 } })
  if (direction.kind === "locked") progress = 0
  const scale = interpolate(progress, [0, 1], [direction.fromScale, direction.toScale])
  const driftX = direction.kind === "drift" ? Math.sin(frame / 49) * 18 : 0
  const driftY = direction.kind === "drift" ? Math.cos(frame / 61) * 12 : 0
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill style={{
        transformOrigin: `${direction.focusX * 100}% ${direction.focusY * 100}%`,
        transform: `translate(${driftX}px, ${driftY}px) scale(${scale})`,
      }}>
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  )
}

const entranceTransform = (direction: GrugPuppetDirection, frame: number): { x: number; y: number; scale: number } => {
  const progress = spring({ frame, fps: 60, config: { damping: 12, stiffness: 155, mass: 0.85 } })
  if (direction.entrance === "pop") return { x: 0, y: 0, scale: progress }
  if (direction.entrance === "drop") return { x: 0, y: interpolate(progress, [0, 1], [-860, 0]), scale: 1 }
  if (direction.entrance === "walk-left") return { x: interpolate(progress, [0, 1], [-980, 0]), y: Math.sin(frame * 0.8) * 14 * (1 - progress), scale: 1 }
  if (direction.entrance === "walk-right") return { x: interpolate(progress, [0, 1], [980, 0]), y: Math.sin(frame * 0.8) * 14 * (1 - progress), scale: 1 }
  return { x: 0, y: 0, scale: 1 }
}

const turnTransform = (direction: GrugPuppetDirection, frame: number, durationInFrames: number): { scaleX: number; skewX: number } => {
  const targetFacing = direction.facing === "left" ? 1 : -1
  if (direction.turn === "none") return { scaleX: targetFacing, skewX: 0 }
  const turnStart = durationInFrames * 0.34
  const progress = interpolate(frame, [turnStart, turnStart + (direction.turn === "snap" ? 8 : 38)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  })
  if (direction.turn === "snap") return { scaleX: progress < 0.5 ? -targetFacing : targetFacing, skewX: 0 }
  const squash = Math.cos(progress * Math.PI)
  return { scaleX: squash * targetFacing, skewX: Math.sin(progress * Math.PI) * 13 * targetFacing }
}

const mouthGeometry: Record<"phone" | "pointing", React.CSSProperties> = {
  phone: { width: "15%", left: "72.2%", top: "55.5%" },
  pointing: { width: "13%", left: "7.1%", top: "68.4%" },
}

const puppetWidth: Record<"phone" | "pointing", number> = {
  phone: 1_020,
  pointing: 1_100,
}

const puppetSource: Record<"phone" | "pointing", string> = {
  phone: "grug-stories/asset-menagerie/characters/soyjak-phone-cutout.png",
  pointing: "grug-stories/asset-menagerie/characters/two-soyjaks-pointing-cutout.png",
}

export const AlphaMouth: React.FC<{
  beat: PreparedGrugStoryBeat
  left: number
  top: number
  width: number
  rotate: number
}> = ({ beat, left, top, width, rotate }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const cue = frame <= beat.narrationFrames ? cueAtMilliseconds(beat.lipsync, frame * 1000 / fps) : null
  const mouthPath = cue?.frame ?? beat.lipsync.neutralFrame ?? null
  if (!mouthPath) return null
  return <Img src={staticFile(mouthPath)} style={{
    position: "absolute",
    left: `${left * 100}%`,
    top: `${top * 100}%`,
    width: `${width * 100}%`,
    aspectRatio: "65 / 55",
    objectFit: "fill",
    imageRendering: "pixelated",
    transform: `rotate(${rotate}deg)`,
    transformOrigin: "50% 50%",
  }} />
}

export const TalkingPngActor: React.FC<{
  direction: GrugPuppetDirection
  beat: PreparedGrugStoryBeat
}> = ({ direction, beat }) => {
  const frame = useCurrentFrame()
  const talkingPng = direction.talkingPng
  if (!talkingPng) return null
  const entrance = entranceTransform(direction, frame)
  const turn = turnTransform(direction, frame, beat.durationInFrames)
  const idleY = direction.idle === "still" ? 0 : direction.idle === "vibrate" ? Math.sin(frame * 2.9) * 5 : Math.sin(frame * 0.17) * 9
  const idleRotation = direction.idle === "vibrate" ? Math.sin(frame * 3.7) * 1.3 : Math.sin(frame * 0.09) * 0.7
  return <div style={{
    position: "absolute",
    left: direction.x,
    top: direction.y,
    width: talkingPng.width,
    transformOrigin: "50% 80%",
    transform: `translate(${entrance.x}px, ${entrance.y + idleY}px) rotate(${idleRotation}deg) skewX(${turn.skewX}deg) scaleX(${turn.scaleX}) scale(${direction.scale * entrance.scale})`,
    filter: "drop-shadow(18px 22px 0 rgba(21,19,15,.3))",
  }}>
    <Img src={staticFile(talkingPng.source)} style={{ display: "block", width: "100%", height: "auto" }} />
    {direction.mouth ? <AlphaMouth beat={beat} {...talkingPng.mouth} /> : null}
  </div>
}

export const PuppetActor: React.FC<{
  direction: GrugPuppetDirection
  beat: PreparedGrugStoryBeat
  characterVersion?: "grug-v2" | "gorge-v3"
}> = ({ direction, beat, characterVersion = "grug-v2" }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  if (direction.asset === "adventure") {
    if (direction.rig !== "omp-transform") return <AdventureActor direction={direction} beat={beat} />
    const chadOpacity = interpolate(frame, [50, 82], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    const potatoDirection: GrugPuppetDirection = {
      ...direction,
      asset: "drawn",
      x: direction.x + 65,
      y: direction.y + 20,
      scale: direction.scale * 0.96,
      entrance: "none",
      idle: "still",
      turn: "none",
    }
    return <>
      <div style={{ opacity: 1 - chadOpacity }}><DrawnGrug direction={potatoDirection} beat={beat} phaseAlignedStop={characterVersion === "gorge-v3"} /></div>
      <div style={{ opacity: chadOpacity }}><AdventureActor direction={direction} beat={beat} /></div>
    </>
  }
  if (direction.asset === "drawn") return <DrawnGrug direction={direction} beat={beat} phaseAlignedStop={characterVersion === "gorge-v3"} />
  if (direction.asset === "talking-png") return <TalkingPngActor direction={direction} beat={beat} />
  const entrance = entranceTransform(direction, frame)
  const turn = turnTransform(direction, frame, beat.durationInFrames)
  const talking = frame <= beat.narrationFrames
  const cue = talking ? cueAtMilliseconds(beat.lipsync, frame * 1000 / fps) : null
  const mouthPath = cue?.frame ?? beat.lipsync.neutralFrame ?? null
  const activity = cue ? Math.min(1, Math.max(0, (cue.mouth.height + cue.mouth.jawOpen + Math.abs(cue.mouth.width - 128)) / 510)) : 0
  const idleY = direction.idle === "still" ? 0 : direction.idle === "vibrate" ? Math.sin(frame * 2.9) * 5 : Math.sin(frame * 0.17) * (direction.idle === "talk-bob" ? 8 + activity * 10 : 7)
  const idleRotation = direction.idle === "vibrate" ? Math.sin(frame * 3.7) * 1.3 : Math.sin(frame * 0.09) * 0.7
  const baseWidth = puppetWidth[direction.asset]

  return (
    <div style={{
      position: "absolute",
      left: direction.x,
      top: direction.y,
      width: baseWidth,
      transformOrigin: "50% 80%",
      transform: `translate(${entrance.x}px, ${entrance.y + idleY}px) rotate(${idleRotation}deg) skewX(${turn.skewX}deg) scaleX(${turn.scaleX}) scale(${direction.scale * entrance.scale})`,
      filter: "drop-shadow(20px 24px 0 rgba(21,19,15,.28))",
    }}>
      <Img src={staticFile(puppetSource[direction.asset])} style={{ display: "block", width: "100%" }} />
      {direction.mouth && mouthPath ? (
        <Img src={staticFile(mouthPath)} style={{
          position: "absolute",
          aspectRatio: "65 / 55",
          objectFit: "fill",
          imageRendering: "pixelated",
          mixBlendMode: "multiply",
          ...mouthGeometry[direction.asset],
        }} />
      ) : null}
    </div>
  )
}

const HolyChoir: React.FC = () => {
  const frame = useCurrentFrame()
  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "screen", opacity: interpolate(frame, [0, 35], [0, 0.82], { extrapolateRight: "clamp" }) }}>
      <div style={{ position: "absolute", left: "50%", top: "45%", width: 1_400, height: 1_400, transform: `translate(-50%, -50%) rotate(${frame * 0.22}deg)`, background: "repeating-conic-gradient(from 0deg, rgba(255,245,179,.9) 0 4deg, transparent 4deg 12deg)", borderRadius: "50%" }} />
      {Array.from({ length: 24 }, (_, index) => (
        <div key={index} style={{ position: "absolute", left: `${8 + random(`star-x-${index}`) * 84}%`, top: `${5 + random(`star-y-${index}`) * 80}%`, fontSize: 26 + random(`star-size-${index}`) * 42, color: YELLOW, transform: `rotate(${frame * (index % 2 ? 0.7 : -0.5)}deg)` }}>✦</div>
      ))}
    </AbsoluteFill>
  )
}

const EdmRainbow: React.FC = () => {
  const frame = useCurrentFrame()
  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "screen", opacity: 0.72 }}>
      <AbsoluteFill style={{ background: `conic-gradient(from ${frame * 1.8}deg at 50% 50%, ${PINK}, ${CYAN}, ${YELLOW}, #8d6bff, ${PINK})`, opacity: 0.43 }} />
      {Array.from({ length: 18 }, (_, index) => {
        const x = random(`edm-x-${index}`) * 1_920
        const fall = (frame * (7 + index % 5) + random(`edm-y-${index}`) * 1_080) % 1_300 - 120
        return <div key={index} style={{ position: "absolute", left: x, top: fall, width: 14 + index % 4 * 7, height: 80 + index % 3 * 44, background: index % 2 ? CYAN : PINK, transform: `rotate(${index * 17}deg)`, boxShadow: `0 0 30px ${index % 2 ? CYAN : PINK}` }} />
      })}
    </AbsoluteFill>
  )
}

const LaserEyes: React.FC = () => {
  const frame = useCurrentFrame()
  const reveal = spring({ frame, fps: 60, config: { damping: 9, stiffness: 200 } })
  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "screen", opacity: reveal }}>
      {[0, 1].map((index) => <div key={index} style={{ position: "absolute", left: 1_245 + index * 112, top: 390 + index * 8, width: 1_100, height: 22, transformOrigin: "0 50%", transform: `rotate(${(-9 + index * 4) + Math.sin(frame * 0.12) * 2}deg) scaleX(${reveal})`, background: "linear-gradient(90deg, white, #ff3567 18%, transparent)", boxShadow: "0 0 34px #ff1e55, 0 0 70px #ff1e55" }} />)}
    </AbsoluteFill>
  )
}

const JobRain: React.FC = () => {
  const frame = useCurrentFrame()
  const labels = ["RESEARCH", "FIX", "TEST", "RENDER", "REVIEW", "SHIP"]
  return (
    <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden" }}>
      {Array.from({ length: 20 }, (_, index) => {
        const left = random(`job-x-${index}`) * 1_700
        const top = (frame * (5 + index % 6) + random(`job-y-${index}`) * 1_200) % 1_420 - 220
        return (
          <div key={index} style={{ position: "absolute", left, top, width: 230, padding: "15px 18px", border: `5px solid ${INK}`, borderRadius: 15, background: index % 3 === 0 ? YELLOW : index % 3 === 1 ? CYAN : PINK, boxShadow: `10px 12px 0 ${INK}`, fontFamily: "Arial Black, Arial", fontWeight: 900, fontSize: 25, transform: `rotate(${-8 + index % 7 * 3}deg)` }}>
            JOB {String(index + 1).padStart(2, "0")}<br /><span style={{ fontSize: 17 }}>{labels[index % labels.length]}</span>
          </div>
        )
      })}
    </AbsoluteFill>
  )
}

const FreezeFrame: React.FC = () => {
  const frame = useCurrentFrame()
  const impact = spring({ frame, fps: 60, config: { damping: 8, stiffness: 260, mass: 0.55 } })
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ background: "white", opacity: interpolate(frame, [0, 3, 12], [0.9, 0.1, 0], { extrapolateRight: "clamp" }) }} />
      <div style={{ position: "absolute", right: 90, top: 86, border: `12px solid ${INK}`, background: YELLOW, color: INK, padding: "18px 28px", fontFamily: "Arial Black, Arial", fontSize: 44, transform: `rotate(7deg) scale(${impact})`, boxShadow: `13px 16px 0 ${INK}` }}>EDITORIAL DECISION</div>
    </AbsoluteFill>
  )
}

export const EffectOverlay: React.FC<{ effect: GrugEffectKind }> = ({ effect }) => {
  if (effect === "holy-choir") return <HolyChoir />
  if (effect === "edm-rainbow") return <EdmRainbow />
  if (effect === "laser-eyes") return <><EdmRainbow /><LaserEyes /></>
  if (effect === "job-rain") return <JobRain />
  if (effect === "freeze-frame") return <FreezeFrame />
  return null
}

export const CaptionCard: React.FC<{ text: string; accent?: string }> = ({ text, accent = YELLOW }) => (
  <div style={{
    position: "absolute",
    zIndex: 30,
    left: "50%",
    bottom: 46,
    minWidth: 820,
    maxWidth: 1_650,
    padding: "18px 34px 21px",
    transform: "translateX(-50%)",
    border: `9px solid ${INK}`,
    borderRadius: 22,
    background: accent,
    boxShadow: `14px 17px 0 ${INK}`,
    color: INK,
    textAlign: "center",
    fontFamily: "Arial Black, Arial, sans-serif",
    fontSize: text.length > 30 ? 45 : 57,
    fontWeight: 1000,
    lineHeight: 1,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  }}>{text}</div>
)

export const palette = { PAPER, INK, CYAN, PINK, YELLOW }
