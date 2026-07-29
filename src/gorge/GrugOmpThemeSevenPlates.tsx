import React from "react"
import {
  AbsoluteFill,
  Img,
  interpolate,
  random,
  staticFile,
  useCurrentFrame,
} from "remotion"
import { palette } from "./GrugMolecules"
import { OMP_BRAND } from "./OmpBrand"

const { PAPER, INK, CYAN, PINK, YELLOW } = palette

const assets = {
  gitRepository: "grug-stories/theme-seven/git-repository-screenshot.png",
  gorgeProfile: "grug-stories/gorge-profile/gorge-profile-picture.png",
  laptop: "grug-stories/asset-menagerie/props/tech/laptop.png",
} as const

const colors = {
  NIGHT: "#080a10",
  NIGHT_BLUE: "#111827",
  NIGHT_20: "rgba(8,10,16,.2)",
  NIGHT_42: "rgba(8,10,16,.42)",
  NIGHT_68: "rgba(8,10,16,.68)",
  INK_38: "rgba(21,19,15,.38)",
  PAPER_08: "rgba(247,239,220,.08)",
  PAPER_16: "rgba(247,239,220,.16)",
  PAPER_56: "rgba(247,239,220,.56)",
  CYAN_38: "rgba(101,228,255,.38)",
  PINK_28: "rgba(255,78,186,.28)",
  OMP_NIGHT_38: "rgba(15,10,20,.38)",
  OMP_NIGHT_72: "rgba(15,10,20,.72)",
  OMP_NIGHT_94: "rgba(15,10,20,.94)",
  OMP_MAGENTA_16: "rgba(237,74,191,.16)",
  OMP_MAGENTA_38: "rgba(237,74,191,.38)",
  OMP_VIOLET_18: "rgba(155,77,255,.18)",
  OMP_VIOLET_48: "rgba(155,77,255,.48)",
  OMP_CYAN_18: "rgba(90,216,230,.18)",
  OMP_CYAN_42: "rgba(90,216,230,.42)",
  OMP_CYAN_72: "rgba(90,216,230,.72)",
  TRANSPARENT: "transparent",
} as const

const type = {
  display: "Arial Black, Arial, sans-serif",
  body: "Arial, sans-serif",
  mono: "Consolas, Courier New, monospace",
} as const

const spacing = {
  XS: 4,
  SM: 8,
  MD: 16,
  LG: 24,
  XL: 32,
  XXL: 48,
} as const

const radii = {
  SMALL: 8,
  MEDIUM: 16,
  LARGE: 24,
  PILL: 999,
} as const

const CLAMP = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const

const pulseAt = (frame: number, start: number): number => interpolate(
  frame,
  [start, start + 5, start + 14],
  [0, 1, 0],
  CLAMP,
)

export const GrugGitWalkPlate: React.FC = () => (
  <AbsoluteFill style={{ overflow: "hidden", background: colors.NIGHT }}>
    <Img
      src={staticFile(assets.gitRepository)}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        filter: "brightness(.82) saturate(.84) contrast(1.06)",
      }}
    />
    <AbsoluteFill style={{
      background: `linear-gradient(90deg, ${colors.NIGHT_42} 0%, ${colors.NIGHT_20} 30%, ${colors.TRANSPARENT} 68%), linear-gradient(0deg, ${colors.NIGHT_68} 0%, ${colors.TRANSPARENT} 38%)`,
    }} />
    <AbsoluteFill style={{
      pointerEvents: "none",
      opacity: 0.08,
      background: `repeating-linear-gradient(0deg, ${colors.TRANSPARENT} 0 ${spacing.XS - 1}px, ${PAPER} ${spacing.XS}px)`,
    }} />
  </AbsoluteFill>
)

const BRAND_ENERGY_COLORS = [
  OMP_BRAND.magenta,
  OMP_BRAND.violet,
  OMP_BRAND.cyan,
] as const

const DISCOVERY_SPIKES = Array.from({ length: 19 }, (_, index) => ({
  left: 20 + random(`omp-discovery-spike-x-${index}`) * 410,
  width: 10 + random(`omp-discovery-spike-width-${index}`) * 22,
  height: 120 + random(`omp-discovery-spike-height-${index}`) * 260,
  rotation: -18 + random(`omp-discovery-spike-rotation-${index}`) * 36,
  delay: Math.floor(random(`omp-discovery-spike-delay-${index}`) * 14),
  phase: random(`omp-discovery-spike-phase-${index}`) * Math.PI * 2,
  color: BRAND_ENERGY_COLORS[index % BRAND_ENERGY_COLORS.length],
}))

const DISCOVERY_PARTICLES = Array.from({ length: 34 }, (_, index) => ({
  left: 44 + random(`omp-discovery-particle-x-${index}`) * 390,
  offset: random(`omp-discovery-particle-offset-${index}`) * 460,
  delay: Math.floor(random(`omp-discovery-particle-delay-${index}`) * 52),
  speed: 2.8 + random(`omp-discovery-particle-speed-${index}`) * 4.2,
  size: 5 + random(`omp-discovery-particle-size-${index}`) * 10,
  drift: 8 + random(`omp-discovery-particle-drift-${index}`) * 22,
  phase: random(`omp-discovery-particle-phase-${index}`) * Math.PI * 2,
  color: BRAND_ENERGY_COLORS[index % BRAND_ENERGY_COLORS.length],
}))

const PROP_TRAIL_LAGS = [0.12, 0.25, 0.38] as const

const OmpEnergyAura: React.FC<{
  frame: number
  energy: number
  burst: number
  rim: number
  lean: number
}> = ({ frame, energy, burst, rim, lean }) => {
  const elapsed = Math.max(0, frame - 118)
  const auraFlicker = 0.9 + Math.sin(frame * 0.54) * 0.1

  return (
    <AbsoluteFill style={{ zIndex: 2, pointerEvents: "none", overflow: "hidden" }}>
      <div style={{
        position: "absolute",
        left: -126,
        top: 102,
        width: 680,
        height: 548,
        borderRadius: "50%",
        opacity: energy * auraFlicker,
        background: `radial-gradient(ellipse, ${colors.PAPER_16} 0%, ${colors.OMP_CYAN_42} 17%, ${colors.OMP_VIOLET_48} 36%, ${colors.OMP_MAGENTA_16} 54%, ${colors.TRANSPARENT} 74%)`,
        filter: `blur(${spacing.SM}px)`,
        transform: `scale(${0.82 + energy * 0.18 + burst * 0.08})`,
      }} />
      <div style={{
        position: "absolute",
        left: -74 + lean * 28,
        top: 132,
        width: 442,
        height: 486,
        borderRadius: "46% 54% 48% 52%",
        borderTop: `${spacing.SM}px solid ${OMP_BRAND.magenta}`,
        borderRight: `${spacing.MD}px solid ${OMP_BRAND.cyan}`,
        borderBottom: `${spacing.XS}px solid ${OMP_BRAND.violet}`,
        opacity: Math.min(1, rim * 0.76 + energy * 0.44),
        boxShadow: `inset -${spacing.MD}px 0 ${spacing.XL}px ${colors.OMP_CYAN_42}, ${spacing.LG}px 0 ${spacing.XL}px ${colors.OMP_CYAN_72}, 0 0 ${spacing.XXL}px ${colors.OMP_VIOLET_48}`,
        filter: `drop-shadow(0 0 ${spacing.MD}px ${OMP_BRAND.magenta})`,
        transform: `scale(${0.86 + energy * 0.14}) rotate(${-6 + lean * 10 + Math.sin(frame * 0.22)}deg)`,
      }} />
      {DISCOVERY_SPIKES.map((spike, index) => {
        const growth = interpolate(frame, [118 + spike.delay, 126 + spike.delay], [0, 1], CLAMP)
        const flicker = 0.84 + Math.sin(frame * 0.42 + spike.phase) * 0.16
        return (
          <div
            key={`energy-spike-${index}`}
            style={{
              position: "absolute",
              left: spike.left,
              bottom: 92,
              width: spike.width,
              height: spike.height,
              opacity: energy * growth * flicker * 0.82,
              background: `linear-gradient(180deg, ${colors.TRANSPARENT}, ${spike.color} 34%, ${PAPER})`,
              clipPath: "polygon(50% 0, 100% 100%, 0 100%)",
              filter: `drop-shadow(0 0 ${spacing.MD}px ${spike.color})`,
              transformOrigin: "50% 100%",
              transform: `translateY(${(1 - growth) * 96}px) rotate(${spike.rotation}deg) scaleY(${growth * flicker})`,
            }}
          />
        )
      })}
      {BRAND_ENERGY_COLORS.map((color, index) => {
        const hasStarted = frame >= 122 - index * 4
        const ringProgress = hasStarted ? ((elapsed + index * 18) % 58) / 58 : 0
        return (
          <div
            key={`energy-ring-${color}`}
            style={{
              position: "absolute",
              left: 234,
              top: 520 - ringProgress * 242,
              width: 136 + ringProgress * 318,
              height: 46 + ringProgress * 86,
              border: `${spacing.XS}px solid ${color}`,
              borderRadius: "50%",
              opacity: hasStarted ? energy * Math.sin(ringProgress * Math.PI) * 0.86 : 0,
              boxShadow: `0 0 ${spacing.MD}px ${color}, inset 0 0 ${spacing.SM}px ${color}`,
              transform: `translate(-50%, -50%) rotate(${-9 + index * 9}deg)`,
            }}
          />
        )
      })}
      {DISCOVERY_PARTICLES.map((particle, index) => {
        const particleFrame = Math.max(0, elapsed - particle.delay)
        const travel = (particleFrame * particle.speed + particle.offset) % 460
        const life = particleFrame > 0 ? 1 - travel / 460 : 0
        const drift = Math.sin(frame * 0.12 + particle.phase) * particle.drift
        return (
          <div
            key={`energy-particle-${index}`}
            style={{
              position: "absolute",
              left: particle.left + drift,
              top: 612 - travel,
              width: particle.size,
              height: particle.size,
              opacity: energy * life,
              background: particle.color,
              boxShadow: `0 0 ${spacing.MD}px ${particle.color}`,
              clipPath: "polygon(50% 0, 100% 50%, 50% 100%, 0 50%)",
              transform: `rotate(${frame * (index % 2 === 0 ? 2.4 : -2.8)}deg)`,
            }}
          />
        )
      })}
      <AbsoluteFill style={{
        opacity: burst * 0.72,
        background: `radial-gradient(circle at 19% 52%, ${PAPER} 0%, ${OMP_BRAND.cyan} 8%, ${colors.OMP_VIOLET_48} 24%, ${colors.TRANSPARENT} 48%)`,
        mixBlendMode: "screen",
      }} />
    </AbsoluteFill>
  )
}

export const GrugOmpDiscoveryPlate: React.FC = () => {
  const frame = useCurrentFrame()
  const roomReveal = interpolate(frame, [0, 42], [0.34, 1], CLAMP)
  const terminalPower = interpolate(frame, [8, 28], [0, 1], CLAMP)
  const acquisition = interpolate(frame, [38, 112], [0, 1], CLAMP)
  const characterLight = interpolate(frame, [18, 112], [0.08, 0.78], CLAMP)
  const leanIn = interpolate(frame, [24, 76], [0, 1], CLAMP)
  const characterLightX = interpolate(leanIn, [0, 1], [13, 19], CLAMP)
  const energy = interpolate(frame, [116, 121, 138], [0, 1, 0.86], CLAMP)
  const burst = pulseAt(frame, 118)
  const screenScale = interpolate(frame, [0, 72], [1.08, 1], CLAMP)
  const propLeft = interpolate(acquisition, [0, 0.42, 1], [926, 706, 222], CLAMP)
  const propTop = interpolate(acquisition, [0, 0.42, 1], [270, 238, 322], CLAMP)
  const propScale = interpolate(acquisition, [0, 0.42, 1], [0.42, 0.58, 0.92], CLAMP)
  const propRotation = interpolate(acquisition, [0, 0.42, 1], [-8, 6, -3], CLAMP)
  const propGlow = 16 + acquisition * 28 + burst * 38

  return (
    <AbsoluteFill style={{
      overflow: "hidden",
      background: OMP_BRAND.night,
      fontFamily: type.body,
    }}>
      <AbsoluteFill style={{
        opacity: roomReveal,
        background: `linear-gradient(112deg, ${colors.OMP_NIGHT_94} 0 24%, ${colors.OMP_NIGHT_38} 46%, ${colors.TRANSPARENT} 67%), radial-gradient(ellipse at 80% 41%, ${colors.OMP_MAGENTA_38} 0%, ${colors.OMP_VIOLET_18} 28%, ${OMP_BRAND.night} 68%)`,
      }} />
      <div style={{
        position: "absolute",
        left: -96,
        top: 38,
        width: 726,
        height: 128,
        background: `linear-gradient(90deg, ${colors.OMP_NIGHT_94}, ${colors.PAPER_08}, ${colors.TRANSPARENT})`,
        transform: "rotate(-11deg)",
        transformOrigin: "0 50%",
      }} />
      <div style={{
        position: "absolute",
        right: -118,
        top: -126,
        width: 476,
        height: 884,
        borderLeft: `${spacing.SM}px solid ${colors.PAPER_08}`,
        background: `linear-gradient(90deg, ${colors.OMP_NIGHT_72}, ${OMP_BRAND.night})`,
        transform: "skewX(-9deg)",
      }} />
      <div style={{
        position: "absolute",
        left: -76,
        right: -62,
        bottom: -84,
        height: 288,
        opacity: 0.58,
        background: `repeating-linear-gradient(102deg, ${colors.PAPER_08} 0 ${spacing.XS}px, ${colors.TRANSPARENT} ${spacing.XS}px ${spacing.XXL}px), linear-gradient(180deg, ${colors.OMP_NIGHT_38}, ${colors.OMP_NIGHT_94})`,
        clipPath: "polygon(16% 0, 100% 0, 100% 100%, 0 100%)",
        transform: "rotate(-2deg)",
      }} />
      <AbsoluteFill style={{
        zIndex: 1,
        opacity: characterLight,
        background: `radial-gradient(ellipse 530px 420px at ${characterLightX}% 53%, ${colors.OMP_CYAN_42} 0%, ${colors.OMP_VIOLET_18} 35%, ${colors.TRANSPARENT} 74%)`,
      }} />
      <OmpEnergyAura frame={frame} energy={energy} burst={burst} rim={characterLight} lean={leanIn} />
      <div style={{
        position: "absolute",
        zIndex: 4,
        left: 650,
        top: 74,
        width: 620,
        height: 580,
        transformOrigin: "64% 47%",
        transform: `perspective(1000px) translateX(${(1 - leanIn) * 24}px) rotateY(-7deg) rotateZ(-2.5deg) scale(${screenScale})`,
      }}>
        <Img
          src={staticFile(assets.laptop)}
          style={{
            position: "absolute",
            left: 22,
            top: 0,
            width: 580,
            height: 580,
            objectFit: "contain",
            opacity: 0.9,
            filter: `brightness(.56) saturate(.45) contrast(1.16) drop-shadow(0 ${spacing.XL}px ${spacing.XL}px ${colors.INK_38}) drop-shadow(0 0 ${spacing.XL}px ${colors.OMP_VIOLET_48})`,
          }}
        />
        <div style={{
          position: "absolute",
          left: 102,
          top: 129,
          width: 420,
          height: 275,
          overflow: "hidden",
          border: `${spacing.XS}px solid ${colors.PAPER_16}`,
          borderRadius: radii.MEDIUM,
          opacity: terminalPower,
          background: OMP_BRAND.night,
          boxShadow: `0 0 ${spacing.XL}px ${colors.OMP_MAGENTA_38}, 0 0 ${spacing.XXL}px ${colors.OMP_CYAN_42}`,
        }}>
          <Img
            src={staticFile(OMP_BRAND.terminalCapturePath)}
            style={{
              display: "block",
              width: "100%",
              height: "100%",
              objectFit: "cover",
              filter: "contrast(1.08) brightness(1.02)",
            }}
          />
          <AbsoluteFill style={{
            opacity: 0.12,
            background: OMP_BRAND.gradient,
            mixBlendMode: "screen",
          }} />
          <AbsoluteFill style={{
            background: `linear-gradient(118deg, ${colors.PAPER_16}, ${colors.TRANSPARENT} 22% 78%, ${colors.OMP_CYAN_18})`,
          }} />
        </div>
      </div>
      <div style={{
        position: "absolute",
        zIndex: 5,
        left: 286,
        top: 282,
        width: 686,
        height: 116,
        opacity: interpolate(acquisition, [0, 0.14, 0.82, 1], [0, 0.46, 0.3, 0], CLAMP),
        background: `linear-gradient(90deg, ${colors.TRANSPARENT}, ${colors.OMP_MAGENTA_38}, ${colors.OMP_CYAN_42})`,
        clipPath: "polygon(0 48%, 100% 0, 100% 100%)",
        filter: `blur(${spacing.MD}px)`,
        transform: "rotate(-5deg)",
      }} />
      {PROP_TRAIL_LAGS.map((lag, index) => {
        const trailProgress = Math.max(0, (acquisition - lag) / (1 - lag))
        const trailLeft = interpolate(trailProgress, [0, 0.42, 1], [926, 706, 222], CLAMP)
        const trailTop = interpolate(trailProgress, [0, 0.42, 1], [270, 238, 322], CLAMP)
        const trailScale = interpolate(trailProgress, [0, 1], [0.42, 0.92], CLAMP)
        const trailOpacity = interpolate(acquisition, [lag, lag + 0.16, 1], [0, 0.2, 0], CLAMP)
        return (
          <Img
            key={`omp-mark-trail-${index}`}
            src={staticFile(OMP_BRAND.markPath)}
            style={{
              position: "absolute",
              zIndex: 6,
              left: trailLeft,
              top: trailTop,
              width: 152,
              height: 152,
              objectFit: "contain",
              opacity: trailOpacity,
              transform: `scale(${trailScale})`,
              filter: `blur(${spacing.XS}px) drop-shadow(0 0 ${spacing.LG}px ${BRAND_ENERGY_COLORS[index]})`,
            }}
          />
        )
      })}
      <Img
        src={staticFile(OMP_BRAND.markPath)}
        style={{
          position: "absolute",
          zIndex: 7,
          left: propLeft,
          top: propTop,
          width: 152,
          height: 152,
          objectFit: "contain",
          opacity: terminalPower,
          transform: `rotate(${propRotation}deg) scale(${propScale + burst * 0.08})`,
          filter: `drop-shadow(-${spacing.SM}px 0 ${propGlow}px ${OMP_BRAND.magenta}) drop-shadow(0 0 ${propGlow + spacing.SM}px ${OMP_BRAND.violet}) drop-shadow(${spacing.SM}px 0 ${propGlow}px ${OMP_BRAND.cyan})`,
        }}
      />
      <AbsoluteFill style={{
        zIndex: 8,
        pointerEvents: "none",
        background: `linear-gradient(180deg, ${colors.TRANSPARENT} 68%, ${colors.OMP_NIGHT_72} 86%, ${colors.OMP_NIGHT_94} 100%)`,
      }} />
      <AbsoluteFill style={{
        zIndex: 9,
        pointerEvents: "none",
        opacity: 0.055,
        background: `repeating-linear-gradient(0deg, ${colors.TRANSPARENT} 0 ${spacing.XS - 1}px, ${OMP_BRAND.cyan} ${spacing.XS}px)`,
      }} />
    </AbsoluteFill>
  )
}

const PROFILE_PUNCH_FRAMES = [54, 108] as const
const PROFILE_ZOOM_LEVELS = [0.88, 1.04, 1.2] as const

export const GrugProfileTauntPlate: React.FC = () => {
  const frame = useCurrentFrame()
  const entryX = interpolate(frame, [0, 46], [430, 0], CLAMP)
  const rotation = interpolate(frame, [0, 170], [12, -4], CLAMP)
  const zoomStage = frame < PROFILE_PUNCH_FRAMES[0]
    ? 0
    : frame < PROFILE_PUNCH_FRAMES[1]
      ? 1
      : 2
  const profileScale = PROFILE_ZOOM_LEVELS[zoomStage]

  return (
    <AbsoluteFill style={{ overflow: "hidden", background: colors.NIGHT, color: PAPER, fontFamily: type.display }}>
      <AbsoluteFill style={{
        background: `linear-gradient(120deg, ${colors.NIGHT} 0 42%, ${colors.PINK_28} 42% 48%, ${colors.NIGHT_BLUE} 48% 100%)`,
      }} />
      <div style={{
        position: "absolute",
        left: 28,
        top: 38,
        width: 430,
        height: 116,
        border: `${spacing.SM}px solid ${PAPER}`,
        background: PINK,
        color: INK,
        padding: `${spacing.MD}px ${spacing.LG}px`,
        boxShadow: `${spacing.MD}px ${spacing.MD}px 0 ${CYAN}`,
        fontSize: 39,
        lineHeight: 0.96,
        letterSpacing: 1,
      }}>
        AUTHENTIC<br />PROFILE PICTURE
      </div>
      <div style={{
        position: "absolute",
        left: 520,
        top: -170,
        width: 760,
        height: 760,
        borderRadius: radii.PILL,
        opacity: 0.22,
        background: `repeating-conic-gradient(from 10deg, ${YELLOW} 0 5deg, ${colors.TRANSPARENT} 5deg 14deg)`,
      }} />
      <div style={{
        position: "absolute",
        left: 650,
        top: 84,
        width: 468,
        height: 468,
        padding: spacing.MD,
        border: `${spacing.SM}px solid ${INK}`,
        background: PAPER,
        boxShadow: `${spacing.XL}px ${spacing.XL}px 0 ${PINK}, ${spacing.XXL}px ${spacing.XXL}px 0 ${colors.CYAN_38}`,
        transformOrigin: "50% 50%",
        transform: `translateX(${entryX}px) rotate(${rotation}deg) scale(${profileScale})`,
      }}>
        <Img
          src={staticFile(assets.gorgeProfile)}
          style={{
            display: "block",
            width: "100%",
            height: "100%",
            objectFit: "cover",
            border: `${spacing.XS}px solid ${INK}`,
          }}
        />
      </div>
      <AbsoluteFill style={{
        pointerEvents: "none",
        background: `linear-gradient(0deg, ${colors.NIGHT_68} 0%, ${colors.TRANSPARENT} 28%)`,
      }} />
    </AbsoluteFill>
  )
}

const ctaEntry = (frame: number, delay: number): number => interpolate(
  frame,
  [delay, delay + 20],
  [0, 1],
  CLAMP,
)

const HORIZONTAL_BULBS = Array.from({ length: 18 }, (_, index) => 42 + index * 70)
const VERTICAL_BULBS = Array.from({ length: 8 }, (_, index) => 78 + index * 76)

const MarqueeBulbs: React.FC = () => {
  const frame = useCurrentFrame()
  const activePhase = Math.floor(frame / 8) % 2

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {HORIZONTAL_BULBS.map((left, index) => {
        const color = (index + activePhase) % 2 === 0 ? OMP_BRAND.magenta : OMP_BRAND.cyan
        return (
          <React.Fragment key={`horizontal-${index}`}>
            <div style={{ position: "absolute", left, top: spacing.MD, width: spacing.MD, height: spacing.MD, borderRadius: radii.PILL, background: color, boxShadow: `0 0 ${spacing.MD}px ${color}` }} />
            <div style={{ position: "absolute", left, bottom: spacing.MD, width: spacing.MD, height: spacing.MD, borderRadius: radii.PILL, background: color, boxShadow: `0 0 ${spacing.MD}px ${color}` }} />
          </React.Fragment>
        )
      })}
      {VERTICAL_BULBS.map((top, index) => {
        const color = (index + activePhase) % 2 === 0 ? OMP_BRAND.violet : OMP_BRAND.magenta
        return (
          <React.Fragment key={`vertical-${index}`}>
            <div style={{ position: "absolute", left: spacing.MD, top, width: spacing.MD, height: spacing.MD, borderRadius: radii.PILL, background: color, boxShadow: `0 0 ${spacing.MD}px ${color}` }} />
            <div style={{ position: "absolute", right: spacing.MD, top, width: spacing.MD, height: spacing.MD, borderRadius: radii.PILL, background: color, boxShadow: `0 0 ${spacing.MD}px ${color}` }} />
          </React.Fragment>
        )
      })}
    </AbsoluteFill>
  )
}

export const Grug1800FinalePlate: React.FC = () => {
  const frame = useCurrentFrame()
  const phoneEntry = ctaEntry(frame, 0)
  const firstEntry = ctaEntry(frame, 10)
  const secondEntry = ctaEntry(frame, 22)
  const thirdEntry = ctaEntry(frame, 34)

  return (
    <AbsoluteFill style={{
      overflow: "hidden",
      background: OMP_BRAND.night,
      color: PAPER,
      fontFamily: type.display,
    }}>
      <AbsoluteFill style={{
        opacity: 0.3,
        background: `repeating-conic-gradient(from -18deg at 68% 42%, ${OMP_BRAND.magenta} 0 8deg, ${OMP_BRAND.night} 8deg 17deg, ${OMP_BRAND.cyan} 17deg 24deg, ${OMP_BRAND.night} 24deg 34deg)`,
      }} />
      <div style={{
        position: "absolute",
        inset: spacing.XL,
        border: `${spacing.SM}px solid ${PAPER}`,
        boxShadow: `inset 0 0 0 ${spacing.SM}px ${OMP_BRAND.violet}, 0 0 ${spacing.XL}px ${colors.OMP_MAGENTA_38}`,
      }} />
      <Img
        src={staticFile(OMP_BRAND.markPath)}
        style={{
          position: "absolute",
          zIndex: 2,
          left: 250,
          top: 46,
          width: 76,
          height: 76,
          objectFit: "contain",
          opacity: phoneEntry,
          transform: `scale(${interpolate(phoneEntry, [0, 1], [0.62, 1])}) rotate(-4deg)`,
          filter: `drop-shadow(0 0 ${spacing.LG}px ${OMP_BRAND.cyan})`,
        }}
      />
      <div style={{
        position: "absolute",
        zIndex: 2,
        left: 340,
        top: 44,
        width: 860,
        boxSizing: "border-box",
        padding: `${spacing.SM}px ${spacing.LG}px ${spacing.MD}px`,
        border: `${spacing.SM}px solid ${INK}`,
        borderRadius: radii.MEDIUM,
        background: OMP_BRAND.gradient,
        boxShadow: `${spacing.MD}px ${spacing.MD}px 0 ${OMP_BRAND.cyan}, 0 0 ${spacing.XL}px ${colors.OMP_VIOLET_48}`,
        color: PAPER,
        textAlign: "center",
        fontFamily: type.mono,
        fontSize: 56,
        fontWeight: 900,
        lineHeight: 1,
        letterSpacing: 2,
        whiteSpace: "nowrap",
        WebkitTextStroke: `3px ${INK}`,
        paintOrder: "stroke fill",
        transform: `translateY(${interpolate(phoneEntry, [0, 1], [-112, 0])}px) rotate(-1deg)`,
      }}>
        1-800-GRUG-OMP
      </div>
      <div style={{
        position: "absolute",
        left: 330,
        top: 152,
        width: 875,
        boxSizing: "border-box",
        padding: `${spacing.SM}px ${spacing.LG}px ${spacing.MD}px`,
        border: `${spacing.SM}px solid ${INK}`,
        background: YELLOW,
        boxShadow: `${spacing.MD}px ${spacing.MD}px 0 ${OMP_BRAND.magenta}`,
        color: INK,
        textAlign: "center",
        fontSize: 66,
        lineHeight: 1,
        letterSpacing: -1,
        transform: `translateX(${interpolate(firstEntry, [0, 1], [520, 0])}px) rotate(-2deg)`,
      }}>
        BE LIKE GRUG
      </div>
      <div style={{
        position: "absolute",
        left: 442,
        top: 286,
        width: 660,
        boxSizing: "border-box",
        padding: `${spacing.SM}px ${spacing.LG}px ${spacing.MD}px`,
        border: `${spacing.SM}px solid ${INK}`,
        borderRadius: radii.MEDIUM,
        background: OMP_BRAND.cyan,
        boxShadow: `${spacing.MD}px ${spacing.MD}px 0 ${OMP_BRAND.violet}`,
        color: INK,
        textAlign: "center",
        fontSize: 78,
        lineHeight: 1,
        letterSpacing: 2,
        transform: `translateX(${interpolate(secondEntry, [0, 1], [560, 0])}px) rotate(1deg)`,
      }}>
        USE OMP
      </div>
      <div style={{
        position: "absolute",
        left: 340,
        top: 430,
        width: 860,
        boxSizing: "border-box",
        padding: `${spacing.MD}px ${spacing.LG}px ${spacing.LG}px`,
        border: `${spacing.SM}px solid ${PAPER}`,
        background: OMP_BRAND.magenta,
        boxShadow: `${spacing.MD}px ${spacing.MD}px 0 ${OMP_BRAND.cyan}`,
        color: PAPER,
        textAlign: "center",
        fontSize: 52,
        lineHeight: 1,
        letterSpacing: 1,
        transform: `translateX(${interpolate(thirdEntry, [0, 1], [600, 0])}px) rotate(-1deg)`,
      }}>
        GET THEME SEVEN
      </div>
      <MarqueeBulbs />
      <AbsoluteFill style={{
        pointerEvents: "none",
        opacity: 0.06,
        background: `repeating-linear-gradient(0deg, ${colors.TRANSPARENT} 0 ${spacing.XS - 1}px, ${PAPER} ${spacing.XS}px)`,
      }} />
    </AbsoluteFill>
  )
}
