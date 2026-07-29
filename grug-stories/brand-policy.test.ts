import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import { OMP_BRAND } from "../src/gorge/OmpBrand"
import { AdventureSubtitle } from "../src/gorge/GrugAdventure"

const ROOT_DIR = path.resolve(__dirname, "..")

function scanDirectory(dirPath: string, fileCallback: (filePath: string) => void) {
  if (!fs.existsSync(dirPath)) return
  const entries = fs.readdirSync(dirPath, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".git" || entry.name === "out" || entry.name === "dist" || entry.name === ".remotion") {
        continue
      }
      scanDirectory(fullPath, fileCallback)
    } else if (entry.isFile()) {
      fileCallback(fullPath)
    }
  }
}

describe("Grug OMP Brand & Active Asset Policy", () => {
  it("prohibits active references to legacy orange OMP assets and identifiers across Grug source and asset ledgers", () => {
    const prohibitedPatterns = [
      /omp-icon\.png/i,
      /omp-icon-source\.svg/i,
      /OMP_ORANGE/i,
      /#f97316/i,
      /249\s*,\s*115\s*,\s*22/i,
    ]

    const targetsToScan = [
      path.join(ROOT_DIR, "grug-stories"),
      path.join(ROOT_DIR, "src", "gorge"),
      path.join(ROOT_DIR, "public", "grug-stories"),
    ]

    const allowedProvenanceFile = path.normalize(path.join(ROOT_DIR, "grug-stories", "asset-sources.json"))

    const violations: string[] = []

    for (const target of targetsToScan) {
      scanDirectory(target, (filePath) => {
        if (filePath.endsWith(".test.ts") || filePath.endsWith(".test.tsx")) {
          return
        }

        const normalizedFile = path.normalize(filePath)
        const isAllowedProvenance = normalizedFile === allowedProvenanceFile

        const content = fs.readFileSync(filePath, "utf-8")

        for (const pattern of prohibitedPatterns) {
          if (pattern.test(content)) {
            if (isAllowedProvenance) {
              const isNarrowProvenanceRecord =
                content.includes("prohibited-superseded") &&
                content.includes("asset-menagerie-prohibited-omp-icon")
              if (isNarrowProvenanceRecord) {
                if (pattern.source.includes("OMP_ORANGE") || pattern.source.includes("#f97316") || pattern.source.includes("249")) {
                  violations.push(`Allowed provenance file ${filePath} contained unapproved color match: ${pattern.source}`)
                }
                continue
              }
            }
            violations.push(`Prohibited reference ${pattern.source} found in ${path.relative(ROOT_DIR, filePath)}`)
          }
        }
      })
    }

    expect(violations).toEqual([])
  })

  it("asserts OMP_BRAND points to canonical favicon and terminal screenshot with official colors", () => {
    expect(OMP_BRAND.markPath).toBe("grug-stories/omp-brand/favicon.svg")
    expect(OMP_BRAND.terminalCapturePath).toBe("grug-stories/omp-brand/WindowsTerminal_9GUXF8Nwy3.png")
    expect(OMP_BRAND.night).toBe("#0f0a14")
    expect(OMP_BRAND.magenta).toBe("#ed4abf")
    expect(OMP_BRAND.violet).toBe("#9b4dff")
    expect(OMP_BRAND.cyan).toBe("#5ad8e6")
    expect(OMP_BRAND.gradient).toBe("linear-gradient(135deg, #ed4abf 0%, #9b4dff 50%, #5ad8e6 100%)")

    const publicFaviconPath = path.join(ROOT_DIR, "public", OMP_BRAND.markPath)
    const publicTerminalPath = path.join(ROOT_DIR, "public", OMP_BRAND.terminalCapturePath)

    expect(fs.existsSync(publicFaviconPath)).toBe(true)
    expect(fs.existsSync(publicTerminalPath)).toBe(true)
  })

  it("asserts AdventureSubtitle has no progress bar or background box caption chrome via structural and style inspection", () => {
    const subtitleString = AdventureSubtitle.toString()
    expect(subtitleString).toContain('background: "transparent"')
    expect(subtitleString).not.toMatch(/background:\s*["'](?!transparent["'])/)
    expect(subtitleString).not.toContain("backgroundColor:")
    expect(subtitleString).not.toContain("timelineProgress")
    expect(subtitleString).not.toContain("#f97316")
    expect(subtitleString).not.toContain("borderRadius")
    expect(subtitleString).not.toContain("border:")
  })
})
