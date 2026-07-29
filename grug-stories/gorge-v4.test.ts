import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import { assertGrugStoryScript, type GrugStoryScript } from "./contract"

const load = (): GrugStoryScript => {
  const value: unknown = JSON.parse(readFileSync(new URL("./scripts/gorge-v4-finds-omp-theme-seven.json", import.meta.url), "utf8"))
  assertGrugStoryScript(value)
  return value
}

describe("Gorge v4 direction", () => {
  it("keeps the idiot line, drops the separate idiot beat, and says the requested wammen joke", () => {
    const script = load()
    expect(script.beats.some((beat) => beat.id === "fucking-idiot-here")).toBe(false)
    expect(script.beats.at(-1)?.narration).toContain("fucking dumbass")
    expect(script.beats[0].narration).toContain("Money. Wammen.")
  })

  it("uses lowercase theme7 as one word everywhere in the new narration and captions", () => {
    const script = load()
    const text = script.beats.filter((beat) => beat.id !== "gorge-simple-worker").flatMap((beat) => [beat.narration, beat.caption, ...(beat.captionChunks ?? [])]).join(" ")
    expect(text).toContain("theme7")
    expect(text).not.toMatch(/Theme Seven|theme seven|Theme7/)
  })

  it("keeps every caption chunk at five words or fewer", () => {
    for (const beat of load().beats) {
      for (const chunk of beat.captionChunks ?? []) expect(chunk.trim().split(/\s+/).length).toBeLessThanOrEqual(5)
    }
  })
})
