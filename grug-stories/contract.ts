export const GRUG_SCENE_KINDS = [
  "paper",
  "omp-choir",
  "theme-seven-edm",
  "t4-drop",
  "job-rain",
  "roycorp",
  "end-card",
  "grug-street",
  "grug-sidewalk-test",
  "grug-sidewalk-bounce",
  "grug-sidewalk-cut-bob",
  "grug-sidewalk-held-bob",
  "grug-sidewalk-four-pose",
  "grug-nursery",
  "grug-fighter",
  "grug-undersea",
  "grug-omp-transform",
  "grug-talking-object",
  "grug-git-walk",
  "grug-omp-discovery",
  "grug-profile-taunt",
  "grug-1800-finale",
  "theme7-job-switch",
  "theme7-folder-workflow",
  "theme7-browser-drop",
  "theme7-tools-workflow",
] as const

export const GRUG_EFFECT_KINDS = [
  "none",
  "holy-choir",
  "edm-rainbow",
  "laser-eyes",
  "job-rain",
  "freeze-frame",
] as const

export const GRUG_CAMERA_KINDS = ["locked", "slow-push", "snap-zoom", "drift"] as const
export const GRUG_ENTRANCE_KINDS = ["none", "pop", "drop", "walk-left", "walk-right"] as const
export const GRUG_IDLE_KINDS = ["still", "bob", "talk-bob", "vibrate", "walk", "keyframe-walk", "bounce-walk", "cut-bob-walk", "held-bob-walk", "four-pose-walk", "enter-settle", "omp-awaken"] as const
export const GRUG_TURN_KINDS = ["none", "snap", "skew"] as const
export const GRUG_PUPPET_ASSETS = ["phone", "pointing", "drawn", "adventure", "talking-png"] as const
export const GRUG_CHARACTER_KINDS = ["baby-grug", "pilot-grug", "scuba-grug", "chad-grug", "moxie", "bloop"] as const
export const GRUG_ADVENTURE_RIG_KINDS = ["crib-bounce", "fighter-bank", "scuba-kick", "omp-transform", "sidekick-hover"] as const

export type GrugSceneKind = (typeof GRUG_SCENE_KINDS)[number]
export type GrugEffectKind = (typeof GRUG_EFFECT_KINDS)[number]
export type GrugCameraKind = (typeof GRUG_CAMERA_KINDS)[number]
export type GrugEntranceKind = (typeof GRUG_ENTRANCE_KINDS)[number]
export type GrugIdleKind = (typeof GRUG_IDLE_KINDS)[number]
export type GrugTurnKind = (typeof GRUG_TURN_KINDS)[number]
export type GrugPuppetAsset = (typeof GRUG_PUPPET_ASSETS)[number]
export type GrugCharacterKind = (typeof GRUG_CHARACTER_KINDS)[number]
export type GrugAdventureRigKind = (typeof GRUG_ADVENTURE_RIG_KINDS)[number]

export interface GrugTalkingPngDirection {
  source: string
  width: number
  mouth: {
    left: number
    top: number
    width: number
    rotate: number
  }
}

export interface GrugPuppetDirection {
  asset: GrugPuppetAsset
  x: number
  y: number
  scale: number
  facing: "left" | "right"
  entrance: GrugEntranceKind
  idle: GrugIdleKind
  turn: GrugTurnKind
  mouth: boolean
  character?: GrugCharacterKind
  rig?: GrugAdventureRigKind
  talkingPng?: GrugTalkingPngDirection
}

export interface GrugCameraDirection {
  kind: GrugCameraKind
  fromScale: number
  toScale: number
  focusX: number
  focusY: number
  startProgress: number
  endProgress: number
}

export interface GrugVoiceDirection {
  name: string
  pitch?: number
  speed?: number
}

export interface GrugStoryBeat {
  id: string
  narration: string
  caption: string
  captionChunks?: string[]
  voice?: GrugVoiceDirection
  scene: GrugSceneKind
  effect: GrugEffectKind
  minimumFrames: number
  holdFrames: number
  puppet?: GrugPuppetDirection
  camera: GrugCameraDirection
}

export interface GrugStoryScript {
  schema: "grug.story/v1"
  id: string
  title: string
  prompt: string
  fps: 60
  width: 1920 | 1280
  height: 1080 | 720
  voice: GrugVoiceDirection
  leadInFrames: number
  gapFrames: number
  tailFrames: number
  soundtrackVolume: number
  beats: GrugStoryBeat[]
}

export interface RetroMouthShape {
  height: number
  width: number
  upturn: number
  jawOpen: number
  upperTeethVisible: number
  lowerTeethVisible: number
  tonguePosition: number
  lipTension: number
}

export interface RetroMouthCue {
  timeMs: number
  mouth: RetroMouthShape
  ipa: number
  enginePhoneme: number
  hints: number
  frame: string | null
}

export interface RetroLipSyncManifest {
  schema: "retro-voice-engine.lipsync.v2"
  timebase: string
  voice: string
  text: string
  durationMs: number
  neutralFrame?: string | null
  mouthCues: RetroMouthCue[]
}

export interface PreparedGrugStoryBeat extends GrugStoryBeat {
  startFrame: number
  durationInFrames: number
  narrationFrames: number
  audioPath: string
  lipsync: RetroLipSyncManifest
}

export type PreparedGrugStoryProps = {
  schema: "grug.story-render/v1"
  id: string
  title: string
  prompt: string
  fps: 60
  width: 1920 | 1280
  height: 1080 | 720
  durationInFrames: number
  soundtrackPath: string
  soundtrackVolume: number
  t4ClipPath?: string
  beats: PreparedGrugStoryBeat[]
} & Record<string, unknown>

const kebab = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const finite = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value)
const integer = (value: unknown): value is number => finite(value) && Number.isInteger(value)
const normalizedSpeech = (value: string): string => value.trim().replace(/\s+/g, " ")
const oneOf = <T extends readonly string[]>(value: unknown, choices: T): value is T[number] =>
  typeof value === "string" && choices.includes(value)

const fail = (message: string): never => {
  throw new Error(`Invalid Grug Story: ${message}`)
}

const assertVoiceDirection = (voice: GrugVoiceDirection | undefined, label: string): void => {
  const resolved = voice ?? fail(`${label} voice name is required`)
  if (!resolved.name.trim()) fail(`${label} voice name is required`)
  if (resolved.pitch !== undefined && (!integer(resolved.pitch) || resolved.pitch < 0 || resolved.pitch > 65535)) fail(`${label} voice pitch must be an integer from 0 through 65535`)
  if (resolved.speed !== undefined && (!integer(resolved.speed) || resolved.speed < 1 || resolved.speed > 1000)) fail(`${label} voice speed must be an integer from 1 through 1000`)
}

export function assertGrugStoryScript(value: unknown): asserts value is GrugStoryScript {
  if (!value || typeof value !== "object") fail("root must be an object")
  const script = value as GrugStoryScript
  if (script.schema !== "grug.story/v1") fail("unsupported schema")
  if (!kebab.test(script.id)) fail("id must be lowercase kebab-case")
  if (!script.title?.trim() || !script.prompt?.trim()) fail("title and prompt are required")
  const supportedFormat = script.fps === 60 && (
    (script.width === 1920 && script.height === 1080) ||
    (script.width === 1280 && script.height === 720)
  )
  if (!supportedFormat) fail("format must be 1920x1080 or 1280x720 at 60 fps")
  assertVoiceDirection(script.voice, "default")
  for (const [name, amount] of [["leadInFrames", script.leadInFrames], ["gapFrames", script.gapFrames], ["tailFrames", script.tailFrames]] as const) {
    if (!integer(amount) || amount < 0) fail(`${name} must be a non-negative integer`)
  }
  if (!finite(script.soundtrackVolume) || script.soundtrackVolume < 0 || script.soundtrackVolume > 1) fail("soundtrackVolume must be from 0 through 1")
  if (!Array.isArray(script.beats) || script.beats.length < 2) fail("at least two beats are required")
  if (new Set(script.beats.map(({ id }) => id)).size !== script.beats.length) fail("beat ids must be unique")

  for (const [index, beat] of script.beats.entries()) {
    const label = beat.id || `#${index + 1}`
    if (!kebab.test(beat.id)) fail(`beat '${label}' id must be lowercase kebab-case`)
    if (!beat.narration?.trim() || !beat.caption?.trim()) fail(`beat '${label}' needs narration and caption`)
    if (beat.voice !== undefined) assertVoiceDirection(beat.voice, `beat '${label}'`)
    if (beat.captionChunks !== undefined) {
      if (!Array.isArray(beat.captionChunks) || beat.captionChunks.length === 0) fail(`beat '${label}' captionChunks must be a non-empty array`)
      if (beat.captionChunks.some((chunk) => !chunk.trim() || chunk.trim().split(/\s+/).length > 5)) fail(`beat '${label}' caption chunks must contain one through five words`)
      if (normalizedSpeech(beat.captionChunks.join(" ")) !== normalizedSpeech(beat.narration)) fail(`beat '${label}' caption chunks must reproduce narration in order`)
    }
    if (!oneOf(beat.scene, GRUG_SCENE_KINDS)) fail(`beat '${label}' has unknown scene`)
    if (!oneOf(beat.effect, GRUG_EFFECT_KINDS)) fail(`beat '${label}' has unknown effect`)
    if (!integer(beat.minimumFrames) || beat.minimumFrames < 30) fail(`beat '${label}' minimumFrames must be at least 30`)
    if (!integer(beat.holdFrames) || beat.holdFrames < 0) fail(`beat '${label}' holdFrames must be non-negative`)
    const camera = beat.camera
    if (!camera || !oneOf(camera.kind, GRUG_CAMERA_KINDS)) fail(`beat '${label}' needs a known camera direction`)
    if (![camera.fromScale, camera.toScale].every((amount) => finite(amount) && amount >= 1 && amount <= 3)) fail(`beat '${label}' camera scales must be from 1 through 3`)
    if (![camera.focusX, camera.focusY, camera.startProgress, camera.endProgress].every((amount) => finite(amount) && amount >= 0 && amount <= 1)) fail(`beat '${label}' camera focus and progress must be normalized`)
    if (camera.startProgress >= camera.endProgress) fail(`beat '${label}' camera timing must move forward`)
    if (camera.kind === "slow-push" && beat.minimumFrames < 90) fail(`beat '${label}' slow push needs at least 90 frames`)

    if (beat.puppet) {
      if (!oneOf(beat.puppet.asset, GRUG_PUPPET_ASSETS)) fail(`beat '${label}' has unknown puppet asset`)
      if (beat.puppet.character !== undefined && !oneOf(beat.puppet.character, GRUG_CHARACTER_KINDS)) fail(`beat '${label}' has unknown character profile`)
      if (beat.puppet.rig !== undefined && !oneOf(beat.puppet.rig, GRUG_ADVENTURE_RIG_KINDS)) fail(`beat '${label}' has unknown adventure rig`)
      if (beat.puppet.asset === "adventure" && (!beat.puppet.character || !beat.puppet.rig)) fail(`beat '${label}' adventure puppet needs character and rig`)
      if (beat.puppet.asset === "talking-png") {
        const talkingPng = beat.puppet.talkingPng ?? fail(`beat '${label}' talking PNG puppet needs image and mouth geometry`)
        if (!/^grug-stories\/[a-z0-9][a-z0-9./_-]*\.png$/.test(talkingPng.source) || talkingPng.source.includes("..")) fail(`beat '${label}' talking PNG source must be a safe public PNG path`)
        if (!finite(talkingPng.width) || talkingPng.width < 32 || talkingPng.width > 1600) fail(`beat '${label}' talking PNG width must be from 32 through 1600 pixels`)
        if (![talkingPng.mouth.left, talkingPng.mouth.top].every((amount) => finite(amount) && amount >= 0 && amount <= 1)) fail(`beat '${label}' talking PNG mouth position must be normalized`)
        if (!finite(talkingPng.mouth.width) || talkingPng.mouth.width <= 0 || talkingPng.mouth.width > 1) fail(`beat '${label}' talking PNG mouth width must be normalized`)
        if (!finite(talkingPng.mouth.rotate) || talkingPng.mouth.rotate < -45 || talkingPng.mouth.rotate > 45) fail(`beat '${label}' talking PNG mouth rotation must be from -45 through 45 degrees`)
      } else if (beat.puppet.talkingPng !== undefined) {
        fail(`beat '${label}' talking PNG geometry requires the talking-png asset`)
      }
      if (!oneOf(beat.puppet.entrance, GRUG_ENTRANCE_KINDS)) fail(`beat '${label}' has unknown puppet entrance`)
      if (!oneOf(beat.puppet.idle, GRUG_IDLE_KINDS)) fail(`beat '${label}' has unknown puppet idle motion`)
      if (!oneOf(beat.puppet.turn, GRUG_TURN_KINDS)) fail(`beat '${label}' has unknown puppet turn`)
      if (!finite(beat.puppet.x) || !finite(beat.puppet.y) || !finite(beat.puppet.scale) || beat.puppet.scale <= 0 || beat.puppet.scale > 3) fail(`beat '${label}' has invalid puppet geometry`)
      if (!oneOf(beat.puppet.facing, ["left", "right"] as const)) fail(`beat '${label}' has invalid puppet facing`)
      if (beat.puppet.turn === "skew" && beat.minimumFrames < 60) fail(`beat '${label}' skew turn needs at least 60 frames`)
    }
  }
}

export const compileGrugStoryTimeline = (
  script: GrugStoryScript,
  speech: readonly { durationMs: number }[],
): { durationInFrames: number; beats: Array<{ startFrame: number; durationInFrames: number; narrationFrames: number }> } => {
  if (speech.length !== script.beats.length) fail("speech result count must match beat count")
  let cursor = script.leadInFrames
  const beats = script.beats.map((beat, index) => {
    const durationMs = speech[index]?.durationMs
    if (!finite(durationMs) || durationMs <= 0) fail(`beat '${beat.id}' speech duration must be positive`)
    const narrationFrames = Math.max(1, Math.ceil(durationMs * script.fps / 1000))
    const durationInFrames = Math.max(beat.minimumFrames, narrationFrames + beat.holdFrames)
    const prepared = { startFrame: cursor, durationInFrames, narrationFrames }
    cursor += durationInFrames + script.gapFrames
    return prepared
  })
  return {
    beats,
    durationInFrames: cursor - script.gapFrames + script.tailFrames,
  }
}
