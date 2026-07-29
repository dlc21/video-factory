const WALK_PHASE_RADIANS_PER_FRAME = 0.18
const TAU = Math.PI * 2

export type GorgeWalkState = {
  stopFrame: number
  phase: number
  walking: boolean
}

export const getGorgeWalkState = (rawStopFrame: number, frame: number): GorgeWalkState => {
  const cycleFrames = TAU / WALK_PHASE_RADIANS_PER_FRAME
  const stopFrame = Math.max(1, Math.round(rawStopFrame / cycleFrames) * Math.round(cycleFrames))
  const stopCycle = Math.round((stopFrame * WALK_PHASE_RADIANS_PER_FRAME) / TAU)
  const walking = frame < stopFrame
  return {
    stopFrame,
    phase: walking ? frame * WALK_PHASE_RADIANS_PER_FRAME : stopCycle * TAU,
    walking,
  }
}
