import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import { assertGrugStoryScript, compileGrugStoryTimeline, type GrugStoryScript } from "./contract"
import { getGorgeWalkState } from "../src/gorge/GorgeMotion"

const loadScript = (name: string): GrugStoryScript => {
  const parsed: unknown = JSON.parse(readFileSync(new URL(`./scripts/${name}`, import.meta.url), "utf8"))
  assertGrugStoryScript(parsed)
  return parsed
}

describe("Gorge v3 additive film contract", () => {
  it("keeps the accepted Grug v2 script while adding a distinct Gorge script", () => {
    const grug = loadScript("grug-finds-omp-theme-seven.json")
    const gorge = loadScript("gorge-finds-omp-theme-seven.json")
    expect(grug.id).toBe("grug-finds-omp-theme-seven")
    expect(gorge.id).toBe("gorge-finds-omp-theme-seven")
    expect(gorge.title).toContain("Gorge")
  })

  it("names the potato Gorge and limits every timed caption to five spoken words", () => {
    const gorge = loadScript("gorge-finds-omp-theme-seven.json")
    const spokenCopy = [gorge.title, gorge.prompt, ...gorge.beats.flatMap((beat) => [beat.narration, beat.caption])].join(" ")
    expect(spokenCopy).not.toMatch(/\bGrug\b/)
    expect(spokenCopy).toMatch(/\bGorge\b/)

    for (const beat of gorge.beats) {
      expect(beat.captionChunks).toBeDefined()
      expect(beat.captionChunks?.join(" ").replace(/\s+/g, " ").trim()).toBe(beat.narration.replace(/\s+/g, " ").trim())
      for (const chunk of beat.captionChunks ?? []) {
        const wordCount = chunk.trim().split(/\s+/).length
        expect(wordCount).toBeGreaterThanOrEqual(1)
        expect(wordCount).toBeLessThanOrEqual(5)
      }
    }
  })

  it("places every clip directly against the next clip without black timeline gaps", () => {
    const gorge = loadScript("gorge-finds-omp-theme-seven.json")
    expect([gorge.leadInFrames, gorge.gapFrames, gorge.tailFrames]).toEqual([0, 0, 0])
    const timeline = compileGrugStoryTimeline(gorge, gorge.beats.map(() => ({ durationMs: 1_000 })))
    expect(timeline.beats[0].startFrame).toBe(0)
    for (let index = 1; index < timeline.beats.length; index++) {
      const previous = timeline.beats[index - 1]
      expect(timeline.beats[index].startFrame).toBe(previous.startFrame + previous.durationInFrames)
    }
    const last = timeline.beats.at(-1)
    expect(last && last.startFrame + last.durationInFrames).toBe(timeline.durationInFrames)
  })

  it("lands Gorge on a planted walk-cycle phase and holds it after stopping", () => {
    const initial = getGorgeWalkState(138, 0)
    const beforeStop = getGorgeWalkState(138, initial.stopFrame - 1)
    const atStop = getGorgeWalkState(138, initial.stopFrame)
    const longAfterStop = getGorgeWalkState(138, initial.stopFrame + 240)

    expect(beforeStop.walking).toBe(true)
    expect(atStop.walking).toBe(false)
    expect(Math.sin(atStop.phase)).toBeCloseTo(0, 10)
    expect(longAfterStop.phase).toBe(atStop.phase)
  })
})
