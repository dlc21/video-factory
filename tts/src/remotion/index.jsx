import React from "react";
import {Composition, registerRoot, staticFile} from "remotion";
import lipsync from "../../samples/stadium.lipsync.json";
import {RetroLipSync} from "./RetroLipSync.jsx";

const face = `data:image/svg+xml,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600">
  <ellipse cx="300" cy="300" rx="235" ry="265" fill="rgb(199,143,103)" stroke="#171411" stroke-width="16"/>
  <ellipse cx="225" cy="245" rx="25" ry="38" fill="#151311"/>
  <ellipse cx="375" cy="245" rx="25" ry="38" fill="#151311"/>
</svg>`)} `;

const StadiumComposition = () => (
  <RetroLipSync
    audioSrc={staticFile("stadium.wav")}
    lipsync={lipsync}
    mouthFrameSrc={(cue, manifest) => staticFile(`stadium.frames/${(cue.frame || manifest.neutralFrame).split("/").at(-1)}`)}
    characterSrc={face}
    background="#18202b"
    mouthStyle={{position: "absolute", width: "40%", left: "30%", top: "49%"}}
  />
);

const Root = () => (
  <Composition
    id="RetroStadium"
    component={StadiumComposition}
    durationInFrames={211}
    fps={30}
    width={1080}
    height={1080}
  />
);

registerRoot(Root);
