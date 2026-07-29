import { execFileSync } from "node:child_process"
import { createHash } from "node:crypto"
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { chromaKeyBmpToPng } from "../grug-stories/alpha-mouth"
import { writeGrugStorySoundtrack } from "../grug-stories/audio"
import {
  assertGrugStoryScript,
  compileGrugStoryTimeline,
  type GrugStoryScript,
  type PreparedGrugStoryBeat,
  type PreparedGrugStoryProps,
  type RetroLipSyncManifest,
} from "../grug-stories/contract"

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const scriptArgument = process.argv.slice(2).find((argument) => !argument.startsWith("-"))
const scriptPath = path.resolve(scriptArgument ?? path.join(repoRoot, "grug-stories/scripts/gorge-finds-omp-theme7.json"))
const renderRequested = process.argv.includes("--render")
const retroBaseUrl = (process.env.RETRO_VOICE_URL ?? "http://127.0.0.1:4874").replace(/\/$/, "")

interface RetroRenderResponse {
  id: string
  voice: string
  audioUrl: string
  frameCount: number
  lipsync: RetroLipSyncManifest
}

const fetchJson = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(url, init)
  if (!response.ok) throw new Error(`Retro Voice request failed: ${response.status} ${await response.text()}`)
  return response.json() as Promise<T>
}

const fetchFile = async (url: string, destination: string): Promise<void> => {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Retro Voice asset failed: ${response.status} ${url}`)
  writeFileSync(destination, Buffer.from(await response.arrayBuffer()))
}

const fetchBuffer = async (url: string): Promise<Buffer> => {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Retro Voice asset failed: ${response.status} ${url}`)
  return Buffer.from(await response.arrayBuffer())
}

const publicRelative = (absolutePath: string): string => path.relative(path.join(repoRoot, "public"), absolutePath).replaceAll("\\", "/")
const sourceText = readFileSync(scriptPath, "utf8")
const parsed: unknown = JSON.parse(sourceText)
assertGrugStoryScript(parsed)
const script: GrugStoryScript = parsed

const main = async (): Promise<void> => {
await fetchJson(`${retroBaseUrl}/api/voices`)
const publicDir = path.join(repoRoot, "public/grug-stories/generated", script.id)
mkdirSync(publicDir, { recursive: true })

const renderedSpeech: RetroRenderResponse[] = []
for (const [index, beat] of script.beats.entries()) {
  const voice = beat.voice ?? script.voice
  console.log(`[grug] voice ${index + 1}/${script.beats.length}: ${beat.id}`)
  renderedSpeech.push(await fetchJson<RetroRenderResponse>(`${retroBaseUrl}/api/render`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      voice: voice.name,
      text: beat.narration,
      pitch: voice.pitch,
      speed: voice.speed,
    }),
  }))
}

const timeline = compileGrugStoryTimeline(script, renderedSpeech.map(({ lipsync }) => ({ durationMs: lipsync.durationMs })))
const beats: PreparedGrugStoryBeat[] = []
for (const [index, beat] of script.beats.entries()) {
  const speech = renderedSpeech[index]
  const timing = timeline.beats[index]
  const beatDirectory = path.join(publicDir, String(index + 1).padStart(2, "0"))
  const mouthDirectory = path.join(beatDirectory, "mouth")
  mkdirSync(mouthDirectory, { recursive: true })
  const audioPath = path.join(beatDirectory, "speech.wav")
  await fetchFile(`${retroBaseUrl}${speech.audioUrl}`, audioPath)

  const assetPaths = new Map<string, string>()
  const rewriteFrame = async (sourcePath: string | null | undefined): Promise<string | null> => {
    if (!sourcePath) return null
    const cached = assetPaths.get(sourcePath)
    if (cached) return cached
    const destination = path.join(mouthDirectory, `${path.parse(sourcePath).name}.png`)
    writeFileSync(destination, chromaKeyBmpToPng(await fetchBuffer(`${retroBaseUrl}${sourcePath}`)))
    const relative = publicRelative(destination)
    assetPaths.set(sourcePath, relative)
    return relative
  }

  const lipsync: RetroLipSyncManifest = {
    ...speech.lipsync,
    neutralFrame: await rewriteFrame(speech.lipsync.neutralFrame),
    mouthCues: await Promise.all(speech.lipsync.mouthCues.map(async (cue) => ({
      ...cue,
      frame: await rewriteFrame(cue.frame),
    }))),
  }
  beats.push({
    ...beat,
    ...timing,
    audioPath: publicRelative(audioPath),
    lipsync,
  })
}

const soundtrackPath = path.join(publicDir, "soundtrack.wav")
writeGrugStorySoundtrack(soundtrackPath, timeline.durationInFrames, script.fps, beats)

let t4ClipPath: string | undefined
if (script.beats.some(({ scene }) => scene === "t4-drop")) {
  const sourceClip = path.join(repoRoot, "source-clips/t4-code-drag-drop.mp4")
  if (!existsSync(sourceClip)) throw new Error(`T4 drop scene requires ${sourceClip}`)
  const destinationClip = path.join(publicDir, "t4-code-drag-drop.mp4")
  copyFileSync(sourceClip, destinationClip)
  t4ClipPath = publicRelative(destinationClip)
}

const props: PreparedGrugStoryProps = {
  schema: "grug.story-render/v1",
  id: script.id,
  title: script.title,
  prompt: script.prompt,
  fps: script.fps,
  width: script.width,
  height: script.height,
  durationInFrames: timeline.durationInFrames,
  soundtrackPath: publicRelative(soundtrackPath),
  soundtrackVolume: script.soundtrackVolume,
  t4ClipPath,
  beats,
}
const propsPath = path.join(publicDir, "render-props.json")
writeFileSync(propsPath, `${JSON.stringify(props, null, 2)}\n`)
writeFileSync(path.join(publicDir, "provenance.json"), `${JSON.stringify({
  schema: "grug.story-provenance/v1",
  generatedAt: new Date().toISOString(),
  sourceScript: path.relative(repoRoot, scriptPath).replaceAll("\\", "/"),
  sourceSha256: createHash("sha256").update(sourceText).digest("hex"),
  retroVoiceUrl: retroBaseUrl,
  voice: script.voice,
  beatVoices: Object.fromEntries(script.beats.map((beat) => [beat.id, beat.voice ?? script.voice])),
  truthTier: "narrative-diagram",
  publicationStatus: "local-concept-only-not-rights-cleared",
}, null, 2)}\n`)

console.log(`[grug] prepared ${script.id}: ${timeline.durationInFrames} frames / ${(timeline.durationInFrames / script.fps).toFixed(2)}s`)
console.log(`[grug] props: ${path.relative(repoRoot, propsPath)}`)

if (renderRequested) {
  const outputPath = path.join(repoRoot, "out", `${script.id}.mp4`)
  execFileSync(process.execPath, [
    path.join(repoRoot, "node_modules/@remotion/cli/remotion-cli.js"),
    "render",
    "src/index.ts",
    script.id.startsWith("gorge-") ? "GorgeStory60" : "GrugStory60",
    outputPath,
    `--props=${propsPath}`,
    "--config=remotion.config.ts",
    "--codec=h264",
    "--crf=16",
  ], { cwd: repoRoot, stdio: "inherit" })
  console.log(`[grug] video: ${path.relative(repoRoot, outputPath)}`)
}
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.stack ?? error.message : error)
  process.exitCode = 1
})
