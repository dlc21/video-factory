import {execFile} from "node:child_process";
import {createServer} from "node:http";
import {mkdir, readFile, writeFile} from "node:fs/promises";
import path from "node:path";
import {randomUUID} from "node:crypto";
import {promisify} from "node:util";
import {fileURLToPath} from "node:url";
import {renderOriginalMouthFrames} from "./original-mouth-frames.mjs";

const execFileAsync = promisify(execFile);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const generatedRoot = path.join(root, "generated");
const nativeRenderer = path.join(root, "retro-sapi4.exe");
const port = Number(process.env.PORT || 4874);
const contentTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".mjs", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".wav", "audio/wav"],
  [".bmp", "image/bmp"],
]);

let voiceInventory;
async function voices() {
  if (!voiceInventory) {
    voiceInventory = execFileAsync(nativeRenderer, ["--list"], {windowsHide: true, maxBuffer: 1024 * 1024})
      .then(({stdout}) => JSON.parse(stdout));
  }
  return voiceInventory;
}

function sendJson(response, status, value) {
  response.writeHead(status, {"content-type": "application/json; charset=utf-8", "cache-control": "no-store"});
  response.end(`${JSON.stringify(value)}\n`);
}

async function requestJson(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > 64 * 1024) throw new Error("Request is too large");
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

async function renderSpeech(request, response) {
  const body = await requestJson(request);
  const inventory = await voices();
  const voice = inventory.voices.find((candidate) => candidate.name === body.voice);
  if (!voice) throw new Error("Select an installed SAPI 4 voice");
  const text = typeof body.text === "string" ? body.text.trim() : "";
  if (!text || text.length > 10000) throw new Error("Text must contain 1 to 10,000 characters");
  const pitch = body.pitch === "" || body.pitch == null ? null : Number(body.pitch);
  const speed = body.speed === "" || body.speed == null ? null : Number(body.speed);
  if (pitch !== null && (!Number.isInteger(pitch) || pitch < 0 || pitch > 65535)) throw new Error("Pitch must be 0 through 65535");
  if (speed !== null && (!Number.isInteger(speed) || speed < 1 || speed > 1000)) throw new Error("Speed must be 1 through 1000");

  const id = randomUUID();
  const outputDir = path.join(generatedRoot, id);
  const framesDir = path.join(outputDir, "mouth");
  const textPath = path.join(outputDir, "speech.txt");
  const wavPath = path.join(outputDir, "speech.wav");
  const cuesPath = path.join(outputDir, "speech.lipsync.json");
  await mkdir(outputDir, {recursive: true});
  await writeFile(textPath, `${text}\n`, "utf8");
  const args = ["--voice", voice.name, "--text-file", textPath, "--wav", wavPath, "--cues", cuesPath];
  if (pitch !== null) args.push("--pitch", String(pitch));
  if (speed !== null) args.push("--speed", String(speed));
  await execFileAsync(nativeRenderer, args, {windowsHide: true, timeout: 120000, maxBuffer: 1024 * 1024});
  const gender = voice.gender === 1 ? "female" : "male";
  const framePrefix = `/generated/${id}/mouth/`;
  const {lipsync, frameCount} = await renderOriginalMouthFrames({lipsyncPath: cuesPath, framesDir, gender, framePrefix});
  sendJson(response, 200, {
    id,
    voice: voice.name,
    audioUrl: `/generated/${id}/speech.wav`,
    cuesUrl: `/generated/${id}/speech.lipsync.json`,
    frameCount,
    lipsync,
  });
}

function safeStaticPath(pathname) {
  if (pathname === "/") return path.join(root, "preview/index.html");
  if (pathname === "/src/lipsync.mjs") return path.join(root, "src/lipsync.mjs");
  if (pathname === "/samples/stadium.wav") return path.join(root, "samples/stadium.wav");
  if (pathname === "/samples/stadium.lipsync.json") return path.join(root, "samples/stadium.lipsync.json");
  const allowedPrefixes = [
    ["/samples/stadium.frames/", path.join(root, "samples/stadium.frames")],
    ["/generated/", generatedRoot],
  ];
  for (const [prefix, base] of allowedPrefixes) {
    if (!pathname.startsWith(prefix)) continue;
    const relative = decodeURIComponent(pathname.slice(prefix.length));
    const candidate = path.resolve(base, relative);
    if (candidate === base || candidate.startsWith(`${base}${path.sep}`)) return candidate;
  }
  return null;
}

await mkdir(generatedRoot, {recursive: true});
const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${request.headers.host}`);
    if (request.method === "GET" && url.pathname === "/api/voices") {
      sendJson(response, 200, await voices());
      return;
    }
    if (request.method === "POST" && url.pathname === "/api/render") {
      await renderSpeech(request, response);
      return;
    }
    if (request.method !== "GET") {
      sendJson(response, 405, {error: "Method not allowed"});
      return;
    }
    const filePath = safeStaticPath(url.pathname);
    if (!filePath) {
      response.writeHead(404).end("Not found");
      return;
    }
    const body = await readFile(filePath);
    const type = contentTypes.get(path.extname(filePath).toLowerCase()) || "application/octet-stream";
    const headers = {
      "content-type": type,
      "cache-control": "no-store",
      "accept-ranges": "bytes",
    };
    const range = /^bytes=(\d+)-(\d*)$/.exec(request.headers.range ?? "");
    if (range) {
      const start = Number(range[1]);
      const end = range[2] ? Math.min(Number(range[2]), body.length - 1) : body.length - 1;
      if (start > end || start >= body.length) {
        response.writeHead(416, {...headers, "content-range": `bytes */${body.length}`}).end();
        return;
      }
      const partial = body.subarray(start, end + 1);
      response.writeHead(206, {
        ...headers,
        "content-length": partial.length,
        "content-range": `bytes ${start}-${end}/${body.length}`,
      }).end(partial);
      return;
    }
    response.writeHead(200, {...headers, "content-length": body.length}).end(body);
  } catch (error) {
    sendJson(response, 400, {error: error instanceof Error ? error.message : String(error)});
  }
});
server.listen(port, "127.0.0.1", () => console.log(`Retro Voice Engine: http://127.0.0.1:${port}`));
