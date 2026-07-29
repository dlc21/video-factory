#!/usr/bin/env node
import {spawnSync} from "node:child_process";
import {mkdirSync, writeFileSync} from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {renderOriginalMouthFrames} from "./original-mouth-frames.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const native = path.join(root, "retro-sapi4.exe");
const [command, ...argv] = process.argv.slice(2);

const fail = (message) => {
  console.error(message);
  process.exit(2);
};

const parse = (args) => {
  const values = new Map();
  for (let index = 0; index < args.length; index += 2) {
    const key = args[index];
    const value = args[index + 1];
    if (!key?.startsWith("--") || value === undefined) fail(`Invalid argument: ${key ?? "<missing>"}`);
    values.set(key.slice(2), value);
  }
  return values;
};

const runNative = (args) => {
  const result = spawnSync(native, args, {encoding: "utf8", windowsHide: true, maxBuffer: 1024 * 1024});
  if (result.status !== 0) {
    if (result.stdout) process.stdout.write(result.stdout);
    if (result.stderr) process.stderr.write(result.stderr);
    process.exit(result.status ?? 2);
  }
  return result.stdout;
};

if (command === "voices") {
  process.stdout.write(runNative(["--list"]));
  process.exit(0);
}
if (command !== "render") {
  fail("Usage: retro-voice voices | retro-voice render --voice NAME (--text TEXT | --text-file FILE) --out BASENAME [--pitch N] [--speed N] [--frame-prefix PATH]");
}

const options = parse(argv);
const voice = options.get("voice");
const outputBase = options.get("out");
const inlineText = options.get("text");
let textFile = options.get("text-file");
if (!voice || !outputBase || Boolean(inlineText) === Boolean(textFile)) {
  fail("render requires --voice, --out, and exactly one of --text or --text-file");
}
const inventory = JSON.parse(runNative(["--list"]));
const voiceInfo = inventory.voices.find((candidate) => candidate.name === voice);
if (!voiceInfo) fail(`Voice not found: ${voice}`);
const absoluteBase = path.resolve(outputBase);
mkdirSync(path.dirname(absoluteBase), {recursive: true});
if (inlineText) {
  textFile = `${absoluteBase}.txt`;
  writeFileSync(textFile, inlineText, "utf8");
} else {
  textFile = path.resolve(textFile);
}
const cuesPath = `${absoluteBase}.lipsync.json`;
const framesDir = `${absoluteBase}.frames`;
const nativeArgs = [
  "--voice", voice,
  "--text-file", textFile,
  "--wav", `${absoluteBase}.wav`,
  "--cues", cuesPath,
];
if (options.has("pitch")) nativeArgs.push("--pitch", options.get("pitch"));
if (options.has("speed")) nativeArgs.push("--speed", options.get("speed"));
const rendered = JSON.parse(runNative(nativeArgs));
const framePrefix = options.get("frame-prefix") ?? `${path.basename(absoluteBase)}.frames/`;
const {frameCount} = await renderOriginalMouthFrames({
  lipsyncPath: cuesPath,
  framesDir,
  gender: voiceInfo.gender === 1 ? "female" : "male",
  framePrefix,
});
process.stdout.write(`${JSON.stringify({...rendered, frames: framesDir, frameCount})}\n`);
