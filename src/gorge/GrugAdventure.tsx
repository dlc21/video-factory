import React from "react"
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion"
import type {
  GrugAdventureRigKind,
  GrugCharacterKind,
  GrugPuppetDirection,
  GrugSceneKind,
  PreparedGrugStoryBeat,
  RetroMouthCue,
} from "../../grug-stories/contract"
import { DrawnGrug } from "./DrawnGrug"
import { OMP_BRAND } from "./OmpBrand"

const INK = "#17140f"
const PAPER = "#fff8e7"
const CYAN = "#63e7ff"
const PINK = "#ff55ad"
const YELLOW = "#ffd64d"

export const MENAGERIE_CUTOUTS = {
  "soyjak-phone": "grug-stories/asset-menagerie/characters/soyjak-phone-cutout.png",
  "soyjaks-pointing": "grug-stories/asset-menagerie/characters/two-soyjaks-pointing-cutout.png",
} as const

export const MenagerieCutout: React.FC<{
  asset: keyof typeof MENAGERIE_CUTOUTS
  x: number
  y: number
  width: number
  rotate?: number
  delay?: number
}> = ({ asset, x, y, width, rotate = 0, delay = 0 }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const entrance = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 11, stiffness: 170 } })
  return <Img
    src={staticFile(MENAGERIE_CUTOUTS[asset])}
    style={{
      position: "absolute",
      left: x,
      top: y,
      width,
      height: "auto",
      transformOrigin: "50% 90%",
      transform: `rotate(${rotate}deg) scale(${entrance})`,
      filter: "drop-shadow(12px 16px 0 rgba(23,20,15,.22))",
    }}
  />
}

interface CharacterProfile {
  name: string
  skin: string
  suit: string
  accent: string
  hair: string
  headWidth: number
  headHeight: number
  bodyWidth: number
  bodyHeight: number
  eyeSize: number
}

export const ADVENTURE_CHARACTER_PROFILES: Record<GrugCharacterKind, CharacterProfile> = {
  "baby-grug": { name: "BABY GRUG", skin: "#dca47b", suit: "#fff2ce", accent: "#ff76ab", hair: "#4a3424", headWidth: 178, headHeight: 150, bodyWidth: 96, bodyHeight: 94, eyeSize: 23 },
  "pilot-grug": { name: "ACE GRUG", skin: "#c78f67", suit: "#315d45", accent: "#ffc84c", hair: "#33271d", headWidth: 150, headHeight: 132, bodyWidth: 142, bodyHeight: 150, eyeSize: 17 },
  "scuba-grug": { name: "DEEP GRUG", skin: "#c78f67", suit: "#173c50", accent: "#60e8f4", hair: "#33271d", headWidth: 150, headHeight: 132, bodyWidth: 136, bodyHeight: 146, eyeSize: 17 },
  "chad-grug": { name: "CHAD GRUG", skin: "#c78f67", suit: "#202b44", accent: "#ff4d65", hair: "#3a2c20", headWidth: 178, headHeight: 142, bodyWidth: 238, bodyHeight: 190, eyeSize: 17 },
  moxie: { name: "MOXIE", skin: "#9e78d7", suit: "#f06f45", accent: "#72f4c5", hair: "#31264f", headWidth: 142, headHeight: 126, bodyWidth: 118, bodyHeight: 138, eyeSize: 20 },
  bloop: { name: "BLOOP", skin: "#4ed1b7", suit: "#edb93f", accent: "#7355d9", hair: "#185a61", headWidth: 165, headHeight: 115, bodyWidth: 150, bodyHeight: 120, eyeSize: 24 },
}

interface RigPose {
  y: number
  rotate: number
  scaleX: number
  scaleY: number
  leftArm: number
  rightArm: number
  leftLeg: number
  rightLeg: number
  pose: number
}

const FOUR_POSE: readonly RigPose[] = [
  { y: 0, rotate: -5, scaleX: 1, scaleY: 1, leftArm: -28, rightArm: 24, leftLeg: 24, rightLeg: -18, pose: 1 },
  { y: -22, rotate: -2, scaleX: 1.02, scaleY: 0.98, leftArm: -9, rightArm: 9, leftLeg: 7, rightLeg: 14, pose: 2 },
  { y: -5, rotate: 5, scaleX: 1, scaleY: 1, leftArm: 25, rightArm: -27, leftLeg: -18, rightLeg: 23, pose: 3 },
  { y: -17, rotate: 2, scaleX: 1.02, scaleY: 0.98, leftArm: 8, rightArm: -7, leftLeg: 15, rightLeg: 5, pose: 4 },
]

const rigPose = (rig: GrugAdventureRigKind, frame: number): RigPose => {
  if (rig === "crib-bounce") {
    const pose = FOUR_POSE[Math.floor(frame / 12) % FOUR_POSE.length]
    return { ...pose, y: pose.y * 0.45, rotate: pose.rotate * 0.7, leftArm: pose.leftArm * 0.7, rightArm: pose.rightArm * 0.7 }
  }
  if (rig === "fighter-bank") {
    const bank = Math.sin(frame / 22)
    return { y: Math.sin(frame / 13) * 6, rotate: bank * 10, scaleX: 1, scaleY: 1, leftArm: -34 + bank * 8, rightArm: 34 + bank * 8, leftLeg: 4, rightLeg: -4, pose: Math.floor(frame / 16) % 4 + 1 }
  }
  if (rig === "scuba-kick") {
    const pose = FOUR_POSE[Math.floor(frame / 10) % FOUR_POSE.length]
    return { ...pose, y: Math.sin(frame / 18) * 13, rotate: -7 + Math.sin(frame / 32) * 4, leftArm: -55 + pose.leftArm * 0.35, rightArm: 50 + pose.rightArm * 0.35, leftLeg: pose.leftLeg * 1.7, rightLeg: pose.rightLeg * 1.7 }
  }
  if (rig === "sidekick-hover") {
    return { y: -16 + Math.sin(frame / 12) * 12, rotate: Math.sin(frame / 20) * 6, scaleX: 1, scaleY: 1, leftArm: -48 + Math.sin(frame / 9) * 12, rightArm: 48 - Math.sin(frame / 9) * 12, leftLeg: 12, rightLeg: -12, pose: Math.floor(frame / 12) % 4 + 1 }
  }
  return { y: 0, rotate: 0, scaleX: 1, scaleY: 1, leftArm: -36, rightArm: 36, leftLeg: -8, rightLeg: 8, pose: 1 }
}

const cueAtMilliseconds = (beat: PreparedGrugStoryBeat, milliseconds: number): RetroMouthCue | null => {
  const cues = beat.lipsync.mouthCues
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

const Limb: React.FC<{ x: number; y: number; length: number; width: number; color: string; rotate: number; zIndex?: number }> = ({ x, y, length, width, color, rotate, zIndex = 0 }) => (
  <div style={{ position: "absolute", zIndex, left: x, top: y, width, height: length, border: `5px solid ${INK}`, borderRadius: width, background: color, transformOrigin: `${width / 2}px ${width / 2}px`, transform: `rotate(${rotate}deg)` }} />
)

const CharacterBody: React.FC<{
  profile: CharacterProfile
  kind: GrugCharacterKind
  rig: GrugAdventureRigKind
  pose: RigPose
  transformProgress: number
  mouthOpen: number
}> = ({ profile, kind, rig, pose, transformProgress, mouthOpen }) => {
  const transforming = rig === "omp-transform"
  const growth = transforming ? interpolate(transformProgress, [0, 1], [0.78, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1
  const headWidth = profile.headWidth * growth
  const headHeight = profile.headHeight * growth
  const bodyWidth = profile.bodyWidth * growth
  const bodyHeight = profile.bodyHeight * growth
  const suit = profile.suit
  const accent = profile.accent
  const center = 190
  const headLeft = center - headWidth / 2
  const bodyLeft = center - bodyWidth / 2
  const bodyTop = kind === "baby-grug" ? 211 : 195
  const armWidth = transforming ? interpolate(transformProgress, [0, 1], [25, 55]) : kind === "chad-grug" ? 55 : kind === "baby-grug" ? 20 : 27
  const legWidth = kind === "baby-grug" ? 19 : transforming ? interpolate(transformProgress, [0, 1], [27, 45]) : kind === "chad-grug" ? 45 : 28
  const eyeY = kind === "baby-grug" ? 82 : 78
  const eyeGap = headWidth * 0.21

  return (
    <div style={{ position: "relative", width: 380, height: 450 }}>
      {kind === "scuba-grug" ? <div style={{ position: "absolute", zIndex: -1, left: bodyLeft - 26, top: bodyTop + 20, width: 50, height: 124, border: `6px solid ${INK}`, borderRadius: 24, background: "#f2bd42" }} /> : null}
      <Limb x={bodyLeft + 17} y={bodyTop + bodyHeight - 15} length={kind === "baby-grug" ? 55 : 119} width={legWidth} color={suit} rotate={pose.leftLeg} />
      <Limb x={bodyLeft + bodyWidth - legWidth - 17} y={bodyTop + bodyHeight - 15} length={kind === "baby-grug" ? 55 : 119} width={legWidth} color={suit} rotate={pose.rightLeg} />
      <Limb x={bodyLeft + 8} y={bodyTop + 25} length={kind === "baby-grug" ? 67 : 126} width={armWidth} color={profile.skin} rotate={pose.leftArm} zIndex={2} />
      <Limb x={bodyLeft + bodyWidth - armWidth - 8} y={bodyTop + 25} length={kind === "baby-grug" ? 67 : 126} width={armWidth} color={profile.skin} rotate={pose.rightArm} zIndex={2} />

      <div style={{ position: "absolute", zIndex: 3, left: bodyLeft, top: bodyTop, width: bodyWidth, height: bodyHeight, border: `7px solid ${INK}`, borderRadius: kind === "chad-grug" || transforming ? "46% 46% 30% 30%" : "48% 48% 32% 32%", background: suit, boxShadow: `inset 0 -22px 0 ${accent}` }}>
        {kind === "baby-grug" ? <div style={{ position: "absolute", left: -5, right: -5, bottom: -3, height: 48, border: `6px solid ${INK}`, borderRadius: "45% 45% 35% 35%", background: PAPER }} /> : null}
        {(kind === "pilot-grug" || kind === "moxie") ? <div style={{ position: "absolute", left: "50%", top: 20, width: 24, height: 24, marginLeft: -12, border: `4px solid ${INK}`, borderRadius: "50%", background: accent }} /> : null}
        {kind === "chad-grug" || transforming ? <div style={{ position: "absolute", left: "50%", top: 45, width: 70, height: 18, marginLeft: -35, borderRadius: 10, background: accent, opacity: transforming ? transformProgress : 1 }} /> : null}
      </div>

      <div style={{ position: "absolute", zIndex: 5, left: headLeft, top: 50, width: headWidth, height: headHeight, border: `7px solid ${INK}`, borderRadius: kind === "moxie" ? "45% 55% 50% 42%" : "54% 46% 48% 52%", background: profile.skin, boxShadow: "inset -12px -10px 0 rgba(83,47,29,.13)" }}>
        <div style={{ position: "absolute", left: headWidth / 2 - eyeGap - profile.eyeSize / 2, top: eyeY, width: profile.eyeSize, height: profile.eyeSize + 4, border: `4px solid ${INK}`, borderRadius: "50%", background: PAPER }}><div style={{ position: "absolute", left: 5, top: 6, width: 6, height: 8, borderRadius: "50%", background: INK }} /></div>
        <div style={{ position: "absolute", left: headWidth / 2 + eyeGap - profile.eyeSize / 2, top: eyeY, width: profile.eyeSize, height: profile.eyeSize + 4, border: `4px solid ${INK}`, borderRadius: "50%", background: PAPER }}><div style={{ position: "absolute", left: 5, top: 6, width: 6, height: 8, borderRadius: "50%", background: INK }} /></div>
        <div style={{ position: "absolute", left: "50%", top: 103, width: 34 + mouthOpen * 13, height: 8 + mouthOpen * 24, marginLeft: -(17 + mouthOpen * 6.5), border: `5px solid ${INK}`, borderRadius: "45% 45% 55% 55%", background: mouthOpen > 0.28 ? "#7f263e" : INK }} />
      </div>

      <div style={{ position: "absolute", zIndex: 6, left: headLeft + 15, top: 35, width: headWidth - 30, height: 43, border: `6px solid ${INK}`, borderBottom: 0, borderRadius: "55% 55% 0 0", background: profile.hair }} />
      {kind === "baby-grug" ? <div style={{ position: "absolute", zIndex: 7, left: 189, top: 23, width: 22, height: 35, border: `6px solid ${INK}`, borderRight: 0, borderBottom: 0, borderRadius: "50%", transform: "rotate(24deg)" }} /> : null}
      {kind === "pilot-grug" ? <><div style={{ position: "absolute", zIndex: 8, left: headLeft - 5, top: 55, width: headWidth + 10, height: 66, border: `7px solid ${INK}`, borderRadius: "55% 55% 20% 20%", background: "rgba(255,200,76,.38)" }} /><div style={{ position: "absolute", zIndex: 9, left: center - 35, top: 116, width: 70, height: 14, borderRadius: 7, background: INK }} /></> : null}
      {kind === "scuba-grug" ? <><div style={{ position: "absolute", zIndex: 8, left: headLeft + 16, top: 106, width: headWidth - 32, height: 51, border: `7px solid ${INK}`, borderRadius: 20, background: "rgba(99,231,255,.54)" }} /><div style={{ position: "absolute", zIndex: 7, left: headLeft + headWidth - 5, top: 126, width: 42, height: 13, border: `5px solid ${INK}`, background: CYAN }} /></> : null}
      {kind === "moxie" ? <><div style={{ position: "absolute", zIndex: 4, left: headLeft + headWidth - 6, top: 46, width: 72, height: 72, border: `7px solid ${INK}`, borderRadius: "50%", background: profile.hair }} /><div style={{ position: "absolute", zIndex: 9, left: headLeft - 9, top: 103, width: 27, height: 64, border: `5px solid ${INK}`, borderRadius: 12, background: accent }} /></> : null}
      {kind === "bloop" ? <><div style={{ position: "absolute", zIndex: 7, left: headLeft + 34, top: 18, width: 13, height: 55, border: `4px solid ${INK}`, borderRadius: 8, background: profile.accent, transform: "rotate(-18deg)" }} /><div style={{ position: "absolute", zIndex: 7, left: headLeft + headWidth - 47, top: 18, width: 13, height: 55, border: `4px solid ${INK}`, borderRadius: 8, background: profile.accent, transform: "rotate(18deg)" }} /><div style={{ position: "absolute", zIndex: 8, left: headLeft + 27, top: 4, width: 28, height: 28, border: `5px solid ${INK}`, borderRadius: "50%", background: PINK }} /><div style={{ position: "absolute", zIndex: 8, left: headLeft + headWidth - 55, top: 4, width: 28, height: 28, border: `5px solid ${INK}`, borderRadius: "50%", background: PINK }} /></> : null}
      {(kind === "chad-grug" || transforming) ? <><div style={{ position: "absolute", zIndex: 4, left: bodyLeft - 34, top: bodyTop - 4, width: 85, height: 85, border: `7px solid ${INK}`, borderRadius: "50%", background: profile.skin, opacity: transforming ? transformProgress : 1 }} /><div style={{ position: "absolute", zIndex: 4, right: 380 - bodyLeft - bodyWidth - 34, top: bodyTop - 4, width: 85, height: 85, border: `7px solid ${INK}`, borderRadius: "50%", background: profile.skin, opacity: transforming ? transformProgress : 1 }} /></> : null}
    </div>
  )
}

export const AdventureActor: React.FC<{ direction: GrugPuppetDirection; beat: PreparedGrugStoryBeat }> = ({ direction, beat }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  if (!direction.character || !direction.rig) return null
  const profile = ADVENTURE_CHARACTER_PROFILES[direction.character]
  const pose = rigPose(direction.rig, frame)
  const cue = direction.mouth && frame <= beat.narrationFrames ? cueAtMilliseconds(beat, frame * 1000 / fps) : null
  const mouthOpen = cue ? Math.min(1, Math.max(0.12, (cue.mouth.height + cue.mouth.jawOpen) / 260)) : 0.08
  const entrance = direction.entrance === "pop" ? spring({ frame, fps, config: { damping: 12, stiffness: 180 } }) : 1
  const transformProgress = direction.rig === "omp-transform" ? spring({ frame: Math.max(0, frame - 38), fps, config: { damping: 11, stiffness: 66, mass: 1.2 } }) : 0
  const glow = direction.rig === "omp-transform" ? transformProgress : 0
  const facing = direction.facing === "left" ? -1 : 1
  const chadOpacity = direction.rig === "omp-transform"
    ? interpolate(transformProgress, [0.2, 0.72], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 1

  return (
    <>
      {direction.rig === "omp-transform" ? (
        <div style={{ position: "absolute", inset: 0, opacity: interpolate(transformProgress, [0.25, 0.7], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
          <DrawnGrug
            direction={{
              ...direction,
              asset: "drawn",
              x: direction.x + 65,
              y: direction.y + 64,
              scale: direction.scale * 0.94,
              entrance: "none",
              idle: "still",
            }}
            beat={beat}
          />
        </div>
      ) : null}
      <div style={{ position: "absolute", left: direction.x, top: direction.y + pose.y, width: 380, height: 450, opacity: chadOpacity, transformOrigin: "50% 78%", transform: `rotate(${pose.rotate}deg) scaleX(${facing * pose.scaleX}) scaleY(${pose.scaleY}) scale(${direction.scale * entrance * (1 + transformProgress * 0.1)})`, filter: `drop-shadow(14px 20px 0 rgba(23,20,15,.24)) drop-shadow(0 0 ${glow * 36}px rgba(99,231,255,.9))` }}>
        {direction.rig === "crib-bounce" ? (
          <Img
            src={staticFile("grug-stories/asset-menagerie/props/nursery/crib-transparent.png")}
            style={{
              position: "absolute",
              zIndex: 10,
              left: -70,
              top: 170,
              width: 520,
              height: 520,
              objectFit: "contain",
              filter: "invert(77%) sepia(29%) saturate(1150%) hue-rotate(341deg) brightness(104%) contrast(92%) drop-shadow(10px 14px 0 rgba(23,20,15,.22))",
            }}
          />
        ) : null}
        <CharacterBody profile={profile} kind={direction.character} rig={direction.rig} pose={pose} transformProgress={transformProgress} mouthOpen={mouthOpen} />
        {direction.rig === "fighter-bank" ? <div style={{ position: "absolute", zIndex: 12, left: 137, top: 284, width: 110, height: 110, border: `10px solid ${INK}`, borderRadius: "50%", background: "transparent" }} /> : null}
        {direction.rig === "scuba-kick" ? Array.from({ length: 4 }, (_, index) => <div key={index} style={{ position: "absolute", left: 315 + ((frame * (2 + index)) % 70), top: 170 - ((frame * (3 + index)) % 180), width: 12 + index * 5, height: 12 + index * 5, border: `4px solid ${PAPER}`, borderRadius: "50%", background: "rgba(99,231,255,.24)" }} />) : null}
      </div>
    </>
  )
}

const RASTER_PLATES: Partial<Record<GrugSceneKind, string>> = {
  "grug-nursery": "grug-stories/asset-menagerie/backgrounds/nursery-photo.jpg",
  "grug-fighter": "grug-stories/asset-menagerie/backgrounds/cockpit-photo.jpg",
  "grug-undersea": "grug-stories/asset-menagerie/backgrounds/underwater-photo.jpg",
  "grug-omp-transform": "grug-stories/asset-menagerie/backgrounds/server-room-photo.jpg",
  "grug-talking-object": "grug-stories/asset-menagerie/backgrounds/server-room-photo.jpg",
}

const OfficialOmpProp: React.FC = () => {
  const frame = useCurrentFrame()
  const acquisition = interpolate(frame, [15, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
  const left = interpolate(acquisition, [0, 1], [930, 760])
  const scale = interpolate(acquisition, [0, 1], [0.72, 1])
  return <Img src={staticFile(OMP_BRAND.markPath)} style={{
    position: "absolute",
    left,
    top: 245 + Math.sin(frame / 18) * 7,
    width: 220,
    height: 165,
    objectFit: "contain",
    transform: `scale(${scale})`,
    filter: `drop-shadow(-10px 0 ${10 + acquisition * 12}px ${OMP_BRAND.magenta}) drop-shadow(0 0 ${14 + acquisition * 18}px ${OMP_BRAND.violet}) drop-shadow(10px 0 ${10 + acquisition * 12}px ${OMP_BRAND.cyan})`,
  }} />
}

export const AdventurePlate: React.FC<{ scene: GrugSceneKind }> = ({ scene }) => {
  const source = RASTER_PLATES[scene]
  if (!source) return null
  const objectPosition = scene === "grug-nursery" ? "58% 52%" : "50% 50%"
  const overlay = scene === "grug-undersea"
    ? "linear-gradient(180deg, rgba(4,33,63,.05), rgba(1,18,40,.38))"
    : scene === "grug-fighter"
      ? "linear-gradient(180deg, rgba(59,34,7,.08), rgba(26,13,2,.42))"
      : "linear-gradient(180deg, rgba(7,10,15,.05), rgba(7,10,15,.34))"
  return <AbsoluteFill style={{ overflow: "hidden", background: INK }}>
    <Img src={staticFile(source)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition, transform: "scale(1.04)", filter: "saturate(.88) contrast(1.08) brightness(.82)" }} />
    <AbsoluteFill style={{ background: overlay }} />
    {scene === "grug-omp-transform" ? <OfficialOmpProp /> : null}
  </AbsoluteFill>
}

export const AdventureSubtitle: React.FC<{ beat: PreparedGrugStoryBeat }> = ({ beat }) => {
  const frame = useCurrentFrame()
  const chunks = beat.captionChunks?.length ? beat.captionChunks : [beat.caption]
  if (frame >= beat.narrationFrames) return null
  const framesPerChunk = beat.narrationFrames / chunks.length
  const chunkIndex = Math.min(chunks.length - 1, Math.floor(frame / framesPerChunk))
  const chunkProgress = frame / framesPerChunk - chunkIndex
  const opacity = interpolate(chunkProgress, [0, 0.08, 0.92, 1], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  })
  return <div style={{
    position: "absolute",
    zIndex: 50,
    left: "50%",
    bottom: 28,
    width: 660,
    transform: "translateX(-50%)",
    opacity,
    background: "transparent",
    color: PAPER,
    textAlign: "center",
    fontFamily: "Arial, sans-serif",
    fontSize: 31,
    fontWeight: 800,
    lineHeight: 1.05,
    textTransform: "uppercase",
    WebkitTextStroke: "6px rgba(0,0,0,.96)",
    paintOrder: "stroke fill",
    textShadow: "0 5px 4px rgba(0,0,0,.72)",
  }}>
    {chunks[chunkIndex]}
  </div>
}
