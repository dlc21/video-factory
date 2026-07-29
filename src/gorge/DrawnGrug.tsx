import React from "react"
import { Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion"
import type { GrugIdleKind, GrugPuppetDirection, PreparedGrugStoryBeat, RetroMouthCue } from "../../grug-stories/contract"
import { getGorgeWalkState } from "./GorgeMotion"

export const GRUG_SKIN_COLOR = "#c78f67"
const OUTLINE = "#2a1712"

const mouthCueAtMilliseconds = (beat: PreparedGrugStoryBeat, milliseconds: number): RetroMouthCue | null => {
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

type HeldWalkPose = {
  bob: number
  lean: number
  leftSwing: number
  leftLift: number
  rightSwing: number
  rightLift: number
}

const HELD_WALK_POSES: readonly HeldWalkPose[] = [
  { bob: 0, lean: -5, leftSwing: -27, leftLift: 0, rightSwing: 24, rightLift: 17 },
  { bob: -23, lean: -2, leftSwing: -7, leftLift: 13, rightSwing: 8, rightLift: 5 },
  { bob: -4, lean: 5, leftSwing: 25, leftLift: 18, rightSwing: -27, rightLift: 0 },
  { bob: -17, lean: 2, leftSwing: 8, leftLift: 5, rightSwing: -7, rightLift: 13 },
]

const StickLeg: React.FC<{ x: number; phase: number; swing?: number; lift?: number }> = ({ x, phase, swing: heldSwing, lift: heldLift }) => {
  const swing = heldSwing ?? Math.sin(phase) * 24
  const lift = heldLift ?? Math.max(0, Math.sin(phase)) * 18
  return (
    <div style={{
      position: "absolute",
      left: x,
      top: 252 - lift,
      width: 8,
      height: 116,
      borderRadius: 10,
      background: OUTLINE,
      transformOrigin: "50% 0",
      transform: `rotate(${swing}deg)`,
    }}>
      <div style={{
        position: "absolute",
        left: -2,
        bottom: -2,
        width: 48,
        height: 8,
        borderRadius: 10,
        background: OUTLINE,
      }} />
    </div>
  )
}

const hashBeatId = (id: string): number => {
  let h = 2166136261
  for (let i = 0; i < id.length; i++) {
    h = Math.imul(h ^ id.charCodeAt(i), 16777619)
  }
  return Math.abs(h)
}

const nextLcg = (seed: number): number => (seed * 1664525 + 1013904223) % 4294967296

const getDeterministicBlink = (beatId: string, frame: number): number => {
  let seed = hashBeatId(beatId || "default-beat")
  let currentFrame = 35 + (seed % 40)

  for (let i = 0; i < 30; i++) {
    seed = nextLcg(seed)
    const duration = 5 + (seed % 3)
    const isDouble = (seed % 100) < 28

    if (frame >= currentFrame && frame <= currentFrame + duration) {
      return interpolate(
        frame,
        [currentFrame, currentFrame + 2, currentFrame + duration - 2, currentFrame + duration],
        [1, 0.08, 0.08, 1],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
      )
    }

    currentFrame += duration
    if (isDouble) {
      seed = nextLcg(seed)
      const gap = 6 + (seed % 6)
      currentFrame += gap
      seed = nextLcg(seed)
      const duration2 = 5 + (seed % 2)
      if (frame >= currentFrame && frame <= currentFrame + duration2) {
        return interpolate(
          frame,
          [currentFrame, currentFrame + 2, currentFrame + duration2 - 2, currentFrame + duration2],
          [1, 0.08, 0.08, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        )
      }
      currentFrame += duration2
    }

    seed = nextLcg(seed)
    const interGap = 80 + (seed % 140)
    currentFrame += interGap
    if (currentFrame > frame + 200) break
  }

  return 1
}

const getDeterministicGaze = (
  beatId: string,
  idle: GrugIdleKind,
  frame: number,
  entryDuration: number
): { gazeX: number; gazeY: number } => {
  if (idle === "enter-settle") {
    if (frame < entryDuration - 10) {
      return { gazeX: 3, gazeY: 0 }
    }
    const settleProgress = interpolate(frame, [entryDuration - 10, entryDuration + 5], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
    const baseGazeX = interpolate(settleProgress, [0, 1], [3, 0])

    let seed = hashBeatId(beatId + "-gaze")
    seed = nextLcg(seed)
    const glanceFrame = entryDuration + 40 + (seed % 30)
    const glanceDuration = 35 + (seed % 25)

    if (frame >= glanceFrame && frame <= glanceFrame + glanceDuration) {
      const sub = interpolate(
        frame,
        [glanceFrame, glanceFrame + 5, glanceFrame + glanceDuration - 5, glanceFrame + glanceDuration],
        [0, 1, 1, 0],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
      )
      return { gazeX: baseGazeX - sub * 3, gazeY: -sub * 1 }
    }

    return { gazeX: baseGazeX, gazeY: 0 }
  }

  if (idle === "omp-awaken") {
    let seed = hashBeatId(beatId + "-awaken-gaze")
    const glanceFrame = 80 + (seed % 40)
    const glanceDuration = 40 + (seed % 30)

    if (frame >= glanceFrame && frame <= glanceFrame + glanceDuration) {
      const sub = interpolate(
        frame,
        [glanceFrame, glanceFrame + 5, glanceFrame + glanceDuration - 5, glanceFrame + glanceDuration],
        [0, 1, 1, 0],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
      )
      return {
        gazeX: 4 - sub * 4,
        gazeY: 2 - sub * 2,
      }
    }

    return { gazeX: 4, gazeY: 2 }
  }

  let seed = hashBeatId(beatId + "-general-gaze")
  let currentFrame = 20 + (seed % 30)
  let currentGaze = { gazeX: 0, gazeY: 0 }

  const OFFSETS = [
    { gazeX: 0, gazeY: 0 },
    { gazeX: -3, gazeY: 0 },
    { gazeX: 0, gazeY: 0 },
    { gazeX: 3, gazeY: 1 },
    { gazeX: 0, gazeY: 0 },
    { gazeX: -2, gazeY: -1 },
    { gazeX: 0, gazeY: 0 },
  ]

  for (let i = 0; i < 15; i++) {
    seed = nextLcg(seed)
    const dwell = 50 + (seed % 70)
    const nextOffset = OFFSETS[seed % OFFSETS.length]

    if (frame >= currentFrame && frame < currentFrame + dwell) {
      const saccadeStart = currentFrame + dwell - 5
      if (frame >= saccadeStart) {
        const p = (frame - saccadeStart) / 5
        const pSmooth = p * p * (3 - 2 * p)
        seed = nextLcg(seed)
        const futureOffset = OFFSETS[seed % OFFSETS.length]
        return {
          gazeX: currentGaze.gazeX + (futureOffset.gazeX - currentGaze.gazeX) * pSmooth,
          gazeY: currentGaze.gazeY + (futureOffset.gazeY - currentGaze.gazeY) * pSmooth,
        }
      }
      return nextOffset
    }

    currentGaze = nextOffset
    currentFrame += dwell
    if (currentFrame > frame + 150) break
  }

  return { gazeX: 0, gazeY: 0 }
}

export const DrawnGrug: React.FC<{
  direction: GrugPuppetDirection
  beat: PreparedGrugStoryBeat
  phaseAlignedStop?: boolean
}> = ({ direction, beat, phaseAlignedStop = false }) => {
  const frame = useCurrentFrame()
  const { fps, width } = useVideoConfig()
  const smoothWalking = direction.idle === "walk"
  const hardWalking = direction.idle === "keyframe-walk"
  const bounceWalking = direction.idle === "bounce-walk"
  const cutBobWalking = direction.idle === "cut-bob-walk"
  const heldBobWalking = direction.idle === "held-bob-walk"
  const fourPoseWalking = direction.idle === "four-pose-walk"
  const enterSettle = direction.idle === "enter-settle"
  const ompAwaken = direction.idle === "omp-awaken"

  const rawEntryDuration = Math.round(beat.durationInFrames * 0.35)
  const gorgeWalkState = phaseAlignedStop && enterSettle
    ? getGorgeWalkState(rawEntryDuration, frame)
    : null
  const entryDuration = gorgeWalkState?.stopFrame ?? rawEntryDuration
  const isEntryWalk = enterSettle ? (gorgeWalkState?.walking ?? frame < entryDuration) : false
  const walking = smoothWalking || hardWalking || bounceWalking || cutBobWalking || heldBobWalking || fourPoseWalking || isEntryWalk
  const phase = gorgeWalkState?.phase ?? frame * 0.18
  const bouncePhase = frame * Math.PI / 6
  const heldBobUp = Math.floor(frame / Math.round(fps * 1.5)) % 2 === 1
  const heldFrame = Math.floor(frame / 8) * 8
  const heldPose = HELD_WALK_POSES[Math.floor(frame / 8) % HELD_WALK_POSES.length]
  const travelFrame = hardWalking ? heldFrame : frame

  let travelX: number
  if (enterSettle) {
    const targetX = direction.x
    const startX = -250
    if (frame < entryDuration) {
      const p = interpolate(frame, [0, entryDuration], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
      const easeOut = 1 - Math.pow(1 - p, 3)
      travelX = startX + (targetX - startX) * easeOut
    } else {
      const t = frame - entryDuration
      const dampedX = Math.sin(t * 0.4) * 6 * Math.exp(-t * 0.12)
      travelX = targetX + dampedX
    }
  } else if (walking) {
    travelX = interpolate(travelFrame, [0, Math.max(1, beat.durationInFrames - 1)], [-250, width + 90], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  } else {
    travelX = direction.x
  }

  const legActivity = phaseAlignedStop && enterSettle
    ? 1
    : enterSettle
      ? interpolate(frame, [entryDuration - 5, entryDuration + 10], [1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : 1

  let bob: number
  if (enterSettle) {
    if (frame < entryDuration) {
      bob = Math.abs(Math.sin(phase)) * -8
    } else {
      const t = frame - entryDuration
      bob = Math.sin(t * 0.35) * 8 * Math.exp(-t * 0.12)
    }
  } else if (ompAwaken) {
    bob = -4 + Math.sin(frame * 0.08) * 3
  } else if (hardWalking || fourPoseWalking) {
    bob = heldPose.bob
  } else if (heldBobWalking) {
    bob = heldBobUp ? -26 : 0
  } else if (cutBobWalking) {
    bob = frame % 2 === 0 ? 0 : -26
  } else if (bounceWalking) {
    bob = -Math.abs(Math.sin(bouncePhase)) * 22
  } else if (smoothWalking) {
    bob = Math.abs(Math.sin(phase)) * -8
  } else {
    bob = Math.sin(frame * 0.06) * 3
  }

  const stoppedGorge = phaseAlignedStop && enterSettle && !isEntryWalk
  const leftSwingRaw = hardWalking || fourPoseWalking ? heldPose.leftSwing : cutBobWalking || heldBobWalking ? -9 : bounceWalking ? -9 + Math.sin(bouncePhase) * 5 : smoothWalking || isEntryWalk ? Math.sin(phase) * 24 : stoppedGorge ? 0 : undefined
  const leftLiftRaw = hardWalking || fourPoseWalking ? heldPose.leftLift : cutBobWalking || heldBobWalking ? 0 : bounceWalking ? Math.max(0, Math.sin(bouncePhase)) * 5 : smoothWalking || isEntryWalk ? Math.max(0, Math.sin(phase)) * 18 : stoppedGorge ? 0 : undefined
  const rightSwingRaw = hardWalking || fourPoseWalking ? heldPose.rightSwing : cutBobWalking || heldBobWalking ? 9 : bounceWalking ? 9 - Math.sin(bouncePhase) * 5 : smoothWalking || isEntryWalk ? -Math.sin(phase) * 24 : stoppedGorge ? 0 : undefined
  const rightLiftRaw = hardWalking || fourPoseWalking ? heldPose.rightLift : cutBobWalking || heldBobWalking ? 0 : bounceWalking ? Math.max(0, -Math.sin(bouncePhase)) * 5 : smoothWalking || isEntryWalk ? Math.max(0, -Math.sin(phase)) * 18 : stoppedGorge ? 0 : undefined

  const leftSwing = leftSwingRaw !== undefined ? leftSwingRaw * legActivity : undefined
  const leftLift = leftLiftRaw !== undefined ? leftLiftRaw * legActivity : undefined
  const rightSwing = rightSwingRaw !== undefined ? rightSwingRaw * legActivity : undefined
  const rightLift = rightLiftRaw !== undefined ? rightLiftRaw * legActivity : undefined

  const cue = frame <= beat.narrationFrames ? mouthCueAtMilliseconds(beat, (frame * 1000) / fps) : null
  const mouthPath = cue?.frame ?? beat.lipsync.neutralFrame ?? null
  const blink = getDeterministicBlink(beat.id, frame)
  const { gazeX, gazeY } = getDeterministicGaze(beat.id, direction.idle, frame, entryDuration)
  const facing = direction.facing === "left" ? -1 : 1

  const awakenLean = interpolate(frame, [0, 35, 60], [0, 14, 10], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  })
  const lean = ompAwaken ? awakenLean : fourPoseWalking ? heldPose.lean : 0

  const eyeScaleX = ompAwaken ? 1.15 : 1
  const eyeScaleY = ompAwaken ? 1.2 * blink : blink

  return (
    <div style={{
      position: "absolute",
      left: travelX,
      top: direction.y + bob,
      width: 250,
      height: 410,
      transformOrigin: "50% 80%",
      transform: `rotate(${lean}deg) scale(${direction.scale}) scaleX(${facing})`,
      filter: "drop-shadow(12px 16px 0 rgba(42,23,18,.16))",
    }}>
      <StickLeg x={68} phase={phase} swing={leftSwing} lift={leftLift} />
      <StickLeg x={166} phase={phase + Math.PI} swing={rightSwing} lift={rightLift} />
      <div style={{
        position: "absolute",
        left: 14,
        top: 4,
        width: 222,
        height: 286,
        border: `8px solid ${OUTLINE}`,
        borderRadius: "48% 52% 43% 57% / 40% 43% 57% 60%",
        background: GRUG_SKIN_COLOR,
      }}>
        <div style={{ position: "absolute", left: 43, top: 62, width: 38, height: 47, border: `6px solid ${OUTLINE}`, borderRadius: "50%", background: "white", transform: `scale(${eyeScaleX}, ${eyeScaleY})` }}>
          <div style={{ position: "absolute", left: 13 + gazeX, top: 15 + gazeY, width: 11, height: 15, borderRadius: "50%", background: OUTLINE }} />
        </div>
        <div style={{ position: "absolute", right: 43, top: 62, width: 38, height: 47, border: `6px solid ${OUTLINE}`, borderRadius: "50%", background: "white", transform: `scale(${eyeScaleX}, ${eyeScaleY})` }}>
          <div style={{ position: "absolute", left: 13 + gazeX, top: 15 + gazeY, width: 11, height: 15, borderRadius: "50%", background: OUTLINE }} />
        </div>
        <div style={{ position: "absolute", left: 102, top: 96, width: 11, height: 23, borderRadius: 8, background: OUTLINE }} />
        {mouthPath ? <Img src={staticFile(mouthPath)} style={{ position: "absolute", left: 38, top: 116, width: 130, height: 110, imageRendering: "pixelated" }} /> : null}
      </div>
      <div style={{ position: "absolute", left: 1, top: 186, width: 72, height: 8, borderRadius: 8, background: OUTLINE, transform: `rotate(${hardWalking || fourPoseWalking ? -18 + heldPose.rightSwing * 0.48 : cutBobWalking || heldBobWalking ? 8 : bounceWalking ? 5 + Math.sin(bouncePhase) * 4 : smoothWalking || isEntryWalk ? -16 + Math.sin(phase + Math.PI) * 13 : 8}deg)`, transformOrigin: "100% 50%" }} />
      <div style={{ position: "absolute", right: 1, top: 186, width: 72, height: 8, borderRadius: 8, background: OUTLINE, transform: `rotate(${hardWalking || fourPoseWalking ? 18 + heldPose.leftSwing * 0.48 : cutBobWalking || heldBobWalking ? -8 : bounceWalking ? -5 - Math.sin(bouncePhase) * 4 : smoothWalking || isEntryWalk ? 16 + Math.sin(phase) * 13 : -8}deg)`, transformOrigin: "0 50%" }} />
    </div>
  )
}
