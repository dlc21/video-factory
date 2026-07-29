import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import { assertGrugStoryScript, type GrugStoryScript } from "./contract"

const load = (): GrugStoryScript => {
  const value: unknown = JSON.parse(readFileSync(new URL("./scripts/gorge-finds-omp-theme7.json", import.meta.url), "utf8"))
  assertGrugStoryScript(value)
  return value
}

describe("final Gorge theme7 film", () => {
  it("names the product and artifact with lowercase theme7", () => {
    const script = load()
    expect(script.id).toBe("gorge-finds-omp-theme7")
    expect(JSON.stringify(script)).not.toMatch(/theme-seven|Theme Seven|theme seven|Theme7/)
  })

  it("replaces the repeated folder loop with three observable product interactions", () => {
    const scenes = load().beats.map((beat) => beat.scene)
    expect(scenes).toContain("theme7-job-switch")
    expect(scenes).toContain("theme7-folder-workflow")
    expect(scenes).toContain("theme7-tools-workflow")
    expect(scenes.filter((scene) => scene === "theme7-folder-workflow")).toHaveLength(1)
    expect(scenes).toContain("theme7-browser-drop")
    expect(scenes).not.toContain("t4-drop")
    expect(scenes).not.toContain("theme-seven-edm")
  })

  it("keeps every hard-cut caption chunk at five words or fewer", () => {
    for (const beat of load().beats) {
      for (const chunk of beat.captionChunks ?? []) expect(chunk.trim().split(/\s+/).length).toBeLessThanOrEqual(5)
    }
  })
})
