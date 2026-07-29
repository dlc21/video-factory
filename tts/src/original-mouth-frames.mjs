import {execFile} from "node:child_process";
import {mkdir, readFile, writeFile} from "node:fs/promises";
import path from "node:path";
import {promisify} from "node:util";
import {fileURLToPath} from "node:url";

const execFileAsync = promisify(execFile);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const renderer = path.join(root, "original-mouth.exe");

const controls = [
  "height",
  "width",
  "upturn",
  "jawOpen",
  "upperTeethVisible",
  "lowerTeethVisible",
  "tonguePosition",
  "lipTension",
];

const neutralMouth = {
  height: 0,
  width: 128,
  upturn: 128,
  jawOpen: 0,
  upperTeethVisible: 0,
  lowerTeethVisible: 0,
  tonguePosition: 128,
  lipTension: 0,
};

function valuesFor(mouth) {
  return controls.map((name) => {
    const value = Number(mouth?.[name] ?? neutralMouth[name]);
    if (!Number.isInteger(value) || value < 0 || value > 255) throw new Error(`Invalid mouth control ${name}`);
    return value;
  });
}

function frameName(mouth, gender) {
  return `${gender}-${valuesFor(mouth).join("-")}.bmp`;
}

export async function renderOriginalMouthFrames({lipsyncPath, framesDir, gender, framePrefix = ""}) {
  if (gender !== "male" && gender !== "female") throw new Error("gender must be male or female");
  const lipsync = JSON.parse(await readFile(lipsyncPath, "utf8"));
  if (!Array.isArray(lipsync.mouthCues)) throw new Error("Lip-sync file has no mouth cues");
  await mkdir(framesDir, {recursive: true});

  const mouths = [neutralMouth, ...lipsync.mouthCues.map((cue) => cue.mouth)];
  const unique = new Map(mouths.map((mouth) => [frameName(mouth, gender), mouth]));
  await Promise.all([...unique].map(async ([name, mouth]) => {
    await execFileAsync(renderer, [
      "--output", path.join(framesDir, name),
      "--gender", gender,
      "--mouth", valuesFor(mouth).join(","),
      "--width", "130",
      "--height", "110",
    ], {windowsHide: true});
  }));

  const withFrames = {
    ...lipsync,
    mouthRenderer: {
      id: "microsoft-sapi4-ttsapp-gdi",
      source: "native/vendor/mttsappd.cpp:PaintMouth",
      width: 130,
      height: 110,
      gender,
    },
    neutralFrame: `${framePrefix}${frameName(neutralMouth, gender)}`,
    mouthCues: lipsync.mouthCues.map((cue) => ({
      ...cue,
      frame: `${framePrefix}${frameName(cue.mouth, gender)}`,
    })),
  };
  await writeFile(lipsyncPath, `${JSON.stringify(withFrames, null, 2)}\n`, "utf8");
  return {lipsync: withFrames, frameCount: unique.size};
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [lipsyncPath, framesDir, gender = "male", framePrefix = ""] = process.argv.slice(2);
  if (!lipsyncPath || !framesDir) {
    console.error("Usage: original-mouth-frames LIPSYNC.json FRAMES_DIR male|female [FRAME_PREFIX]");
    process.exit(2);
  }
  const result = await renderOriginalMouthFrames({lipsyncPath, framesDir, gender, framePrefix});
  console.log(JSON.stringify({frameCount: result.frameCount, lipsyncPath, framesDir}));
}
