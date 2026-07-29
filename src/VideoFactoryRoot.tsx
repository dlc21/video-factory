import React from "react"
import { Composition } from "remotion"
import type { PreparedGrugStoryProps } from "../grug-stories/contract"
import { GorgeStoryScene, GrugStoryScene } from "./gorge/GrugStoryScene"
import {
  THEME7_SHOWPIECE_FRAMES,
  Theme7InteractionShowpieceScene,
} from "./gorge/Theme7InteractionScenes"

const defaultProps: PreparedGrugStoryProps = {
  schema: "grug.story-render/v1",
  id: "gorge-story-preview",
  title: "Gorge Story Preview",
  prompt: "Run npm run prepare, then pass the generated render props to Remotion Studio.",
  fps: 60,
  width: 1920,
  height: 1080,
  durationInFrames: 600,
  soundtrackPath: "",
  soundtrackVolume: 0,
  beats: [],
}

export const VideoFactoryRoot: React.FC = () => (
  <>
    <Composition
      id="GrugStory60"
      component={GrugStoryScene}
      durationInFrames={defaultProps.durationInFrames}
      fps={defaultProps.fps}
      width={defaultProps.width}
      height={defaultProps.height}
      defaultProps={defaultProps}
      calculateMetadata={({ props }) => ({
        durationInFrames: props.durationInFrames,
        fps: props.fps,
        width: props.width,
        height: props.height,
      })}
    />
    <Composition
      id="GorgeStory60"
      component={GorgeStoryScene}
      durationInFrames={defaultProps.durationInFrames}
      fps={defaultProps.fps}
      width={defaultProps.width}
      height={defaultProps.height}
      defaultProps={defaultProps}
      calculateMetadata={({ props }) => ({
        durationInFrames: props.durationInFrames,
        fps: props.fps,
        width: props.width,
        height: props.height,
      })}
    />
    <Composition
      id="Theme7Showpiece60"
      component={Theme7InteractionShowpieceScene}
      durationInFrames={THEME7_SHOWPIECE_FRAMES}
      fps={60}
      width={1280}
      height={720}
    />
  </>
)
