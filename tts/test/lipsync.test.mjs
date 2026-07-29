import assert from "node:assert/strict";
import {execFile} from "node:child_process";
import {mkdtemp, readFile, rm, writeFile} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {promisify} from "node:util";
import {mouthCueAtMilliseconds, neutralMouth} from "../src/lipsync.mjs";
import {renderOriginalMouthFrames} from "../src/original-mouth-frames.mjs";

const execFileAsync = promisify(execFile);
const nativeRenderer = path.resolve("retro-sapi4.exe");

const lipsync = {
  neutralFrame: "/mouth/neutral.bmp",
  mouthCues: [
    {timeMs: 100, mouth: {...neutralMouth, jawOpen: 10}, enginePhoneme: 1, frame: "/mouth/a.bmp"},
    {timeMs: 250, mouth: {...neutralMouth, jawOpen: 80}, enginePhoneme: 2, frame: "/mouth/b.bmp"},
    {timeMs: 500, mouth: {...neutralMouth, jawOpen: 160}, enginePhoneme: 3, frame: "/mouth/c.bmp"},
  ],
};

test("selects the original callback frame at or before playback time", () => {
  assert.equal(mouthCueAtMilliseconds(lipsync, 99).frame, "/mouth/neutral.bmp");
  assert.equal(mouthCueAtMilliseconds(lipsync, 100).frame, "/mouth/a.bmp");
  assert.equal(mouthCueAtMilliseconds(lipsync, 499).frame, "/mouth/b.bmp");
  assert.equal(mouthCueAtMilliseconds(lipsync, 500).frame, "/mouth/c.bmp");
  assert.equal(mouthCueAtMilliseconds(lipsync, 900).frame, "/mouth/c.bmp");
});

test("renders deduplicated 130 by 110 bitmaps with the original GDI renderer", async () => {
  const temp = await mkdtemp(path.join(os.tmpdir(), "retro-mouth-"));
  try {
    const manifestPath = path.join(temp, "speech.json");
    const framesDir = path.join(temp, "mouth");
    const open = {...neutralMouth, height: 200, width: 180, jawOpen: 220, tonguePosition: 20};
    await writeFile(manifestPath, JSON.stringify({durationMs: 500, mouthCues: [
      {timeMs: 100, mouth: open},
      {timeMs: 250, mouth: open},
    ]}));
    const result = await renderOriginalMouthFrames({
      lipsyncPath: manifestPath,
      framesDir,
      gender: "male",
      framePrefix: "/mouth/",
    });
    assert.equal(result.frameCount, 2, "neutral and repeated open mouth should produce two files");
    assert.equal(result.lipsync.mouthCues[0].frame, result.lipsync.mouthCues[1].frame);
    assert.equal(result.lipsync.mouthRenderer.id, "microsoft-sapi4-ttsapp-gdi");
    const bitmap = await readFile(path.join(framesDir, path.basename(result.lipsync.mouthCues[0].frame)));
    assert.equal(bitmap.toString("ascii", 0, 2), "BM");
    assert.equal(bitmap.readInt32LE(18), 130);
    assert.equal(bitmap.readInt32LE(22), -110);
  } finally {
    await rm(temp, {recursive: true, force: true});
  }
});

test("captures visual callbacks at their real audio positions instead of buffer bursts", async () => {
  const temp = await mkdtemp(path.join(os.tmpdir(), "retro-timing-"));
  try {
    const textPath = path.join(temp, "speech.txt");
    const wavPath = path.join(temp, "speech.wav");
    const cuesPath = path.join(temp, "speech.json");
    await writeFile(textPath, "Testing one two three synchronized mouth positions.", "utf8");
    const startedAt = performance.now();
    await execFileAsync(nativeRenderer, [
      "--voice", "Mike in Stadium",
      "--text-file", textPath,
      "--wav", wavPath,
      "--cues", cuesPath,
    ], {windowsHide: true, timeout: 30000});
    const elapsed = performance.now() - startedAt;
    const manifest = JSON.parse(await readFile(cuesPath, "utf8"));
    const times = manifest.mouthCues.map((cue) => cue.timeMs);
    const uniqueTimes = new Set(times);
    assert.equal(manifest.timebase, "sapi4-audio-position-milliseconds");
    assert.ok(times.every((time, index) => index === 0 || time >= times[index - 1]));
    assert.ok(uniqueTimes.size >= manifest.mouthCues.length * 0.75, "callbacks were collapsed into audio-buffer bursts");
    assert.ok(elapsed >= manifest.durationMs - 250, "file rendering was not paced like the original live application");
  } finally {
    await rm(temp, {recursive: true, force: true});
  }
});
