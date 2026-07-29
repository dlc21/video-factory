import { inflateSync } from "node:zlib"
import { describe, expect, it } from "vitest"
import { chromaKeyBmpToPng } from "./alpha-mouth"
import {
  assertGrugStoryScript,
  compileGrugStoryTimeline,
  type GrugIdleKind,
  type GrugStoryScript,
} from "./contract"

const script: GrugStoryScript = {
  schema: "grug.story/v1",
  id: "grug-test-story",
  title: "Grug Test Story",
  prompt: "Grug discovers a machine and reacts with appropriate restraint.",
  fps: 60,
  width: 1920,
  height: 1080,
  voice: { name: "Mike in Stadium", pitch: 120, speed: 180 },
  leadInFrames: 30,
  gapFrames: 12,
  tailFrames: 60,
  soundtrackVolume: 0.2,
  beats: [
    {
      id: "first-beat",
      narration: "Grug sees machine.",
      caption: "GRUG SEES MACHINE",
      scene: "paper",
      effect: "none",
      minimumFrames: 120,
      holdFrames: 24,
      camera: { kind: "slow-push", fromScale: 1, toScale: 1.12, focusX: 0.5, focusY: 0.5, startProgress: 0.1, endProgress: 0.9 },
      puppet: { asset: "phone", x: 1040, y: 120, scale: 0.72, facing: "left", entrance: "walk-right", idle: "talk-bob", turn: "none", mouth: true },
    },
    {
      id: "second-beat",
      narration: "Machine sees Grug.",
      caption: "MACHINE SEES GRUG",
      scene: "end-card",
      effect: "freeze-frame",
      minimumFrames: 90,
      holdFrames: 30,
      camera: { kind: "snap-zoom", fromScale: 1, toScale: 1.3, focusX: 0.5, focusY: 0.45, startProgress: 0.05, endProgress: 0.3 },
    },
  ],
}

const twoPixelMouthBmp = (): Buffer => {
  const bmp = Buffer.alloc(54 + 8)
  bmp.write("BM", 0, "ascii")
  bmp.writeUInt32LE(bmp.length, 2)
  bmp.writeUInt32LE(54, 10)
  bmp.writeUInt32LE(40, 14)
  bmp.writeInt32LE(2, 18)
  bmp.writeInt32LE(-1, 22)
  bmp.writeUInt16LE(1, 26)
  bmp.writeUInt16LE(32, 28)
  Buffer.from([103, 143, 199, 0, 90, 100, 199, 0]).copy(bmp, 54)
  return bmp
}

const inflatedPngScanlines = (png: Buffer): Buffer => {
  const imageData: Buffer[] = []
  for (let cursor = 8; cursor < png.length;) {
    const length = png.readUInt32BE(cursor)
    const type = png.toString("ascii", cursor + 4, cursor + 8)
    if (type === "IDAT") imageData.push(png.subarray(cursor + 8, cursor + 8 + length))
    cursor += 12 + length
  }
  return inflateSync(Buffer.concat(imageData))
}

describe("Grug Story contract", () => {
  it("accepts a directed two-beat story", () => {
    expect(() => assertGrugStoryScript(structuredClone(script))).not.toThrow()
  })

  it("accepts dry per-beat voice personalities", () => {
    const voiced = structuredClone(script)
    voiced.beats[0].voice = { name: "Mary", pitch: 125, speed: 170 }
    voiced.beats[1].voice = { name: "Adult Male #3, American English (TruVoice)", pitch: 118, speed: 195 }
    expect(() => assertGrugStoryScript(voiced)).not.toThrow()
  })

  it("rejects an invalid per-beat voice override", () => {
    const invalid = structuredClone(script)
    invalid.beats[0].voice = { name: "", speed: 0 }
    expect(() => assertGrugStoryScript(invalid)).toThrow(/beat 'first-beat' voice name is required/)
  })

  it("accepts a 720p sixty-frame drawn street scene", () => {
    const calm = structuredClone(script)
    calm.width = 1280
    calm.height = 720
    calm.beats[0].scene = "grug-street"
    calm.beats[0].puppet = {
      asset: "drawn",
      x: 0,
      y: 270,
      scale: 0.72,
      facing: "right",
      entrance: "none",
      idle: "walk",
      turn: "none",
      mouth: true,
    }
    expect(() => assertGrugStoryScript(calm)).not.toThrow()
  })

  it("accepts the held-pose sidewalk-test grammar", () => {
    const held = structuredClone(script)
    held.width = 1280
    held.height = 720
    held.beats[0].scene = "grug-sidewalk-test"
    held.beats[0].puppet = {
      asset: "drawn",
      x: 0,
      y: 260,
      scale: 0.72,
      facing: "right",
      entrance: "none",
      idle: "keyframe-walk",
      turn: "none",
      mouth: true,
    }
    expect(() => assertGrugStoryScript(held)).not.toThrow()
  })

  it("accepts the full-rate bounce sidewalk grammar", () => {
    const bounce = structuredClone(script)
    bounce.width = 1280
    bounce.height = 720
    bounce.beats[0].scene = "grug-sidewalk-bounce"
    bounce.beats[0].puppet = {
      asset: "drawn",
      x: 0,
      y: 260,
      scale: 0.72,
      facing: "right",
      entrance: "none",
      idle: "bounce-walk",
      turn: "none",
      mouth: true,
    }
    expect(() => assertGrugStoryScript(bounce)).not.toThrow()
  })

  it("accepts the binary cut-bob sidewalk grammar", () => {
    const cutBob = structuredClone(script)
    cutBob.width = 1280
    cutBob.height = 720
    cutBob.beats[0].scene = "grug-sidewalk-cut-bob"
    cutBob.beats[0].puppet = {
      asset: "drawn",
      x: 0,
      y: 260,
      scale: 0.72,
      facing: "right",
      entrance: "none",
      idle: "cut-bob-walk",
      turn: "none",
      mouth: true,
    }
    expect(() => assertGrugStoryScript(cutBob)).not.toThrow()
  })

  it("accepts the ninety-frame held-bob sidewalk grammar", () => {
    const heldBob = structuredClone(script)
    heldBob.width = 1280
    heldBob.height = 720
    heldBob.beats[0].scene = "grug-sidewalk-held-bob"
    heldBob.beats[0].puppet = {
      asset: "drawn",
      x: 0,
      y: 260,
      scale: 0.72,
      facing: "right",
      entrance: "none",
      idle: "held-bob-walk",
      turn: "none",
      mouth: true,
    }
    expect(() => assertGrugStoryScript(heldBob)).not.toThrow()
  })

  it("accepts the four-pose leaning sidewalk grammar", () => {
    const fourPose = structuredClone(script)
    fourPose.width = 1280
    fourPose.height = 720
    fourPose.beats[0].scene = "grug-sidewalk-four-pose"
    fourPose.beats[0].puppet = {
      asset: "drawn",
      x: 0,
      y: 260,
      scale: 0.72,
      facing: "right",
      entrance: "none",
      idle: "four-pose-walk",
      turn: "none",
      mouth: true,
    }
    expect(() => assertGrugStoryScript(fourPose)).not.toThrow()
  })

  it("accepts enter-settle and omp-awaken idle kinds", () => {
    for (const idleKind of ["enter-settle", "omp-awaken"] as const) {
      const story = structuredClone(script)
      story.width = 1280
      story.height = 720
      story.beats[0].puppet = {
        asset: "drawn",
        x: 180,
        y: 200,
        scale: 0.8,
        facing: "right",
        entrance: "none",
        idle: idleKind,
        turn: "none",
        mouth: true,
      }
      expect(() => assertGrugStoryScript(story)).not.toThrow()
    }
  })

  it("rejects unknown puppet idle motion", () => {
    const invalid = structuredClone(script)
    invalid.beats[0].puppet = {
      asset: "drawn",
      x: 180,
      y: 200,
      scale: 0.8,
      facing: "right",
      entrance: "none",
      idle: "magic-dance" as unknown as GrugIdleKind,
      turn: "none",
      mouth: true,
    }
    expect(() => assertGrugStoryScript(invalid)).toThrow(/unknown puppet idle motion/)
  })
  it("accepts the four shared grug scene kinds", () => {
    const newSceneKinds = [
      "grug-git-walk",
      "grug-omp-discovery",
      "grug-profile-taunt",
      "grug-1800-finale",
    ] as const

    for (const sceneKind of newSceneKinds) {
      const story = structuredClone(script)
      story.width = 1280
      story.height = 720
      story.beats[0].scene = sceneKind
      expect(() => assertGrugStoryScript(story)).not.toThrow()
    }
  })

  it("accepts reusable adventure rigs across Grug and new characters", () => {
    const adventures = [
      ["baby-grug", "crib-bounce", "grug-nursery"],
      ["pilot-grug", "fighter-bank", "grug-fighter"],
      ["scuba-grug", "scuba-kick", "grug-undersea"],
      ["chad-grug", "omp-transform", "grug-omp-transform"],
      ["moxie", "sidekick-hover", "grug-fighter"],
      ["bloop", "scuba-kick", "grug-undersea"],
    ] as const
    for (const [character, rig, scene] of adventures) {
      const adventure = structuredClone(script)
      adventure.width = 1280
      adventure.height = 720
      adventure.beats[0].scene = scene
      adventure.beats[0].puppet = {
        asset: "adventure",
        character,
        rig,
        x: 430,
        y: 180,
        scale: 0.9,
        facing: "right",
        entrance: "pop",
        idle: "still",
        turn: "none",
        mouth: true,
      }
      expect(() => assertGrugStoryScript(adventure)).not.toThrow()
    }
  })

  it("accepts an arbitrary public PNG with normalized mouth placement", () => {
    const talkingObject = structuredClone(script)
    talkingObject.width = 1280
    talkingObject.height = 720
    talkingObject.beats[0].scene = "grug-talking-object"
    talkingObject.beats[0].puppet = {
      asset: "talking-png",
      talkingPng: {
        source: "grug-stories/props/talking-rock.png",
        width: 340,
        mouth: { left: 0.32, top: 0.42, width: 0.38, rotate: -3 },
      },
      x: 470,
      y: 176,
      scale: 1,
      facing: "left",
      entrance: "pop",
      idle: "talk-bob",
      turn: "none",
      mouth: true,
    }
    expect(() => assertGrugStoryScript(talkingObject)).not.toThrow()
  })

  it("rejects a talking PNG without safe image and mouth geometry", () => {
    const invalid = structuredClone(script)
    invalid.beats[0].puppet = {
      asset: "talking-png",
      x: 470,
      y: 176,
      scale: 1,
      facing: "left",
      entrance: "pop",
      idle: "talk-bob",
      turn: "none",
      mouth: true,
    }
    expect(() => assertGrugStoryScript(invalid)).toThrow(/needs image and mouth geometry/)
  })

  it("turns the exact MS Paint skin fill transparent without erasing lips", () => {
    const png = chromaKeyBmpToPng(twoPixelMouthBmp())
    expect(png.subarray(0, 8)).toEqual(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
    expect([...inflatedPngScanlines(png)]).toEqual([0, 0, 0, 0, 0, 199, 100, 90, 255])
  })

  it("rejects an adventure puppet without a reusable profile and rig", () => {
    const invalid = structuredClone(script)
    invalid.beats[0].puppet = {
      asset: "adventure",
      x: 430,
      y: 180,
      scale: 0.9,
      facing: "right",
      entrance: "pop",
      idle: "still",
      turn: "none",
      mouth: true,
    }
    expect(() => assertGrugStoryScript(invalid)).toThrow(/needs character and rig/)
  })

  it("accepts chronological caption chunks with five words or fewer", () => {
    const chunked = structuredClone(script)
    chunked.beats[0].captionChunks = ["Grug sees", "machine."]
    expect(() => assertGrugStoryScript(chunked)).not.toThrow()
  })

  it("rejects caption chunks longer than five words", () => {
    const invalid = structuredClone(script)
    invalid.beats[0].narration = "Grug sees one very complicated machine."
    invalid.beats[0].captionChunks = ["Grug sees one very complicated machine."]
    expect(() => assertGrugStoryScript(invalid)).toThrow(/one through five words/)
  })

  it("rejects caption chunks outside spoken order", () => {
    const invalid = structuredClone(script)
    invalid.beats[0].captionChunks = ["Machine sees Grug."]
    expect(() => assertGrugStoryScript(invalid)).toThrow(/reproduce narration in order/)
  })

  it("rejects timing that cannot carry a slow comedic push", () => {
    const invalid = structuredClone(script)
    invalid.beats[0].minimumFrames = 60
    expect(() => assertGrugStoryScript(invalid)).toThrow(/slow push needs at least 90 frames/)
  })

  it("rejects ambiguous duplicate beat identities", () => {
    const invalid = structuredClone(script)
    invalid.beats[1].id = invalid.beats[0].id
    expect(() => assertGrugStoryScript(invalid)).toThrow(/beat ids must be unique/)
  })

  it("derives non-overlapping beat windows from measured speech", () => {
    const result = compileGrugStoryTimeline(script, [{ durationMs: 1_000 }, { durationMs: 2_000 }])
    expect(result.beats).toEqual([
      { startFrame: 30, durationInFrames: 120, narrationFrames: 60 },
      { startFrame: 162, durationInFrames: 150, narrationFrames: 120 },
    ])
    expect(result.durationInFrames).toBe(372)
  })

  it("lets measured narration extend a beat without truncating speech", () => {
    const result = compileGrugStoryTimeline(script, [{ durationMs: 4_000 }, { durationMs: 500 }])
    expect(result.beats[0]).toEqual({ startFrame: 30, durationInFrames: 264, narrationFrames: 240 })
    expect(result.beats[1].startFrame).toBe(306)
  })
})
