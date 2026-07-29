import {copyFile, cp, mkdir} from "node:fs/promises";
import path from "node:path";
import {fileURLToPath} from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = path.join(root, "public");
await mkdir(publicDir, {recursive: true});
await copyFile(path.join(root, "samples/stadium.wav"), path.join(publicDir, "stadium.wav"));
await cp(path.join(root, "samples/stadium.frames"), path.join(publicDir, "stadium.frames"), {recursive: true, force: true});
console.log("Prepared original SAPI 4 mouth frames for Remotion.");
