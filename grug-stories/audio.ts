import { writeFileSync } from "node:fs"
import type { PreparedGrugStoryBeat } from "./contract"

const SAMPLE_RATE = 48_000
const CHANNELS = 2
const BITS_PER_SAMPLE = 16

const clamp = (value: number): number => Math.max(-1, Math.min(1, value))
const oscillator = (frequency: number, time: number): number => Math.sin(Math.PI * 2 * frequency * time)
const saw = (frequency: number, time: number): number => 2 * ((time * frequency) % 1) - 1
const pulse = (time: number, interval: number, decay: number): number => {
  const phase = ((time % interval) + interval) % interval
  return Math.exp(-phase * decay)
}

const choir = (localTime: number, duration: number): number => {
  const attack = Math.min(1, localTime / 0.9)
  const release = Math.min(1, Math.max(0, duration - localTime) / 0.7)
  const breath = 0.82 + oscillator(0.33, localTime) * 0.18
  return [130.81, 164.81, 196, 261.63].reduce((sum, frequency, index) =>
    sum + oscillator(frequency, localTime + index * 0.013) * (0.22 - index * 0.025), 0) * attack * release * breath
}

const edm = (localTime: number): number => {
  const beat = 60 / 145
  const beatPhase = ((localTime % beat) + beat) % beat
  const kick = oscillator(49 + 70 * Math.exp(-beatPhase * 24), localTime) * pulse(localTime, beat, 18) * 0.9
  const snarePhase = ((localTime - beat) % (beat * 2) + beat * 2) % (beat * 2)
  const snare = (Math.sin(localTime * 11_311) + Math.sin(localTime * 7_919)) * 0.18 * Math.exp(-snarePhase * 23)
  const bass = saw(65.41, localTime) * 0.17 + saw(98, localTime) * 0.08
  const sparkle = oscillator(523.25, localTime) * pulse(localTime, beat / 2, 13) * 0.12
  return kick + snare + bass + sparkle
}

const laser = (localTime: number, duration: number): number => {
  const progress = Math.min(1, localTime / Math.max(0.1, duration))
  const envelope = Math.sin(Math.PI * progress)
  return (oscillator(360 + progress * 1_400, localTime) + oscillator(480 + progress * 1_900, localTime)) * envelope * 0.28
}

const impact = (localTime: number): number => {
  if (localTime < 0 || localTime > 1.2) return 0
  return oscillator(48, localTime) * Math.exp(-localTime * 6) * 0.85 + Math.sin(localTime * 19_991) * Math.exp(-localTime * 18) * 0.25
}

export const writeGrugStorySoundtrack = (
  outPath: string,
  durationInFrames: number,
  fps: number,
  beats: readonly PreparedGrugStoryBeat[],
): void => {
  const durationSeconds = durationInFrames / fps
  const sampleCount = Math.ceil(durationSeconds * SAMPLE_RATE)
  const dataBytes = sampleCount * CHANNELS * BITS_PER_SAMPLE / 8
  const wav = Buffer.allocUnsafe(44 + dataBytes)
  wav.write("RIFF", 0)
  wav.writeUInt32LE(36 + dataBytes, 4)
  wav.write("WAVE", 8)
  wav.write("fmt ", 12)
  wav.writeUInt32LE(16, 16)
  wav.writeUInt16LE(1, 20)
  wav.writeUInt16LE(CHANNELS, 22)
  wav.writeUInt32LE(SAMPLE_RATE, 24)
  wav.writeUInt32LE(SAMPLE_RATE * CHANNELS * BITS_PER_SAMPLE / 8, 28)
  wav.writeUInt16LE(CHANNELS * BITS_PER_SAMPLE / 8, 32)
  wav.writeUInt16LE(BITS_PER_SAMPLE, 34)
  wav.write("data", 36)
  wav.writeUInt32LE(dataBytes, 40)

  const beatWindows = beats.map((beat) => ({
    beat,
    start: beat.startFrame / fps,
    end: (beat.startFrame + beat.durationInFrames) / fps,
  }))
  let beatIndex = 0
  let offset = 44
  for (let index = 0; index < sampleCount; index += 1) {
    const time = index / SAMPLE_RATE
    let sample = oscillator(55, time) * 0.035 + oscillator(82.41, time) * 0.02
    while (beatIndex < beatWindows.length && time >= beatWindows[beatIndex].end) beatIndex += 1
    const beatWindow = beatWindows[beatIndex]
    const beat = beatWindow && time >= beatWindow.start ? beatWindow.beat : undefined
    if (beat) {
      const localTime = time - beat.startFrame / fps
      const beatDuration = beat.durationInFrames / fps
      if (beat.effect === "holy-choir") sample += choir(localTime, beatDuration) * 0.48
      if (beat.effect === "edm-rainbow" || beat.scene === "theme-seven-edm") sample += edm(localTime) * 0.54
      if (beat.effect === "laser-eyes") sample += laser(localTime, beatDuration) * 0.36
      if (beat.effect === "job-rain") sample += edm(localTime) * 0.23
      if (beat.effect === "freeze-frame") sample += impact(localTime) * 0.7
    }
    const left = Math.round(clamp(sample * 0.65) * 32767)
    const right = Math.round(clamp(sample * 0.63 + oscillator(0.21, time) * 0.006) * 32767)
    wav.writeInt16LE(left, offset)
    wav.writeInt16LE(right, offset + 2)
    offset += 4
  }
  writeFileSync(outPath, wav)
}
