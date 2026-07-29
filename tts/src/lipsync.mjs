export const neutralMouth = Object.freeze({
  height: 0,
  width: 128,
  upturn: 128,
  jawOpen: 0,
  upperTeethVisible: 0,
  lowerTeethVisible: 0,
  tonguePosition: 128,
  lipTension: 0,
});

export function mouthCueAtMilliseconds(lipsync, milliseconds) {
  const cues = lipsync?.mouthCues;
  if (!Array.isArray(cues) || cues.length === 0 || milliseconds < cues[0].timeMs) {
    return {
      timeMs: 0,
      mouth: neutralMouth,
      ipa: 0,
      enginePhoneme: 0,
      hints: 0,
      frame: lipsync?.neutralFrame ?? null,
    };
  }
  let low = 0;
  let high = cues.length - 1;
  while (low < high) {
    const middle = Math.ceil((low + high) / 2);
    if (cues[middle].timeMs <= milliseconds) low = middle;
    else high = middle - 1;
  }
  return cues[low];
}

export function mouthActivity(mouth = neutralMouth) {
  const height = Number(mouth.height ?? 0) / 255;
  const jaw = Number(mouth.jawOpen ?? 0) / 255;
  const width = Math.abs(Number(mouth.width ?? 128) - 128) / 127;
  return Math.min(1, Math.max(0, (height + jaw + width) / 2));
}
