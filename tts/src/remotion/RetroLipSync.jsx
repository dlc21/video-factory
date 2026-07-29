import React from "react";
import {AbsoluteFill, Audio, Img, useCurrentFrame, useVideoConfig} from "remotion";
import {mouthActivity, mouthCueAtMilliseconds} from "../lipsync.mjs";

export const OriginalSapiMouth = ({src, style}) => (
  <Img
    src={src}
    style={{
      display: "block",
      aspectRatio: "65 / 55",
      objectFit: "fill",
      imageRendering: "pixelated",
      ...style,
    }}
  />
);

export const RetroLipSync = ({
  audioSrc,
  lipsync,
  characterSrc,
  characterStyle,
  mouthStyle = {position: "absolute", width: "44%", left: "28%", top: "48%"},
  mouthFrameSrc = (cue) => cue.frame,
  background = "#18202b",
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const cue = mouthCueAtMilliseconds(lipsync, frame * 1000 / fps);
  const activity = mouthActivity(cue.mouth);
  const wobble = Math.sin(frame * 0.7) * activity * 2.2;
  const frameSrc = mouthFrameSrc(cue, lipsync);
  return (
    <AbsoluteFill style={{background, alignItems: "center", justifyContent: "center"}}>
      <Audio src={audioSrc} />
      <div style={{position: "relative", width: "64%", transform: `translateY(${-activity * 8}px) rotate(${wobble}deg) scale(${1 + activity * 0.018})`, ...characterStyle}}>
        {characterSrc ? <Img src={characterSrc} style={{display: "block", width: "100%"}} /> : null}
        <OriginalSapiMouth src={frameSrc} style={mouthStyle} />
      </div>
    </AbsoluteFill>
  );
};
