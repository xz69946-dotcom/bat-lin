import {
  AbsoluteFill,
  CalculateMetadataFunction,
  Composition,
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { theme, video } from "./theme";

type Props = {};

const calculateMetadata: CalculateMetadataFunction<Props> = () => {
  return {};
};

export const MyComposition = () => {
  return (
    <Composition
      id="MyComp"
      component={MyComponent}
      durationInFrames={video.durationInSeconds * video.fps}
      fps={video.fps}
      width={video.width}
      height={video.height}
      calculateMetadata={calculateMetadata}
    />
  );
};

const RING_RADIUS = 220;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;

export const MyComponent: React.FC<Props> = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      name="Scene"
      style={{
        backgroundColor: theme.color.background,
        justifyContent: "center",
        alignItems: "center",
        fontFamily: theme.font.family,
      }}
    >
      <svg
        width={RING_RADIUS * 2 + theme.stroke * 2}
        height={RING_RADIUS * 2 + theme.stroke * 2}
        style={{
          position: "absolute",
          rotate: "-90deg",
          scale: interpolate(frame, [1.6 * fps, 2.6 * fps], [1, 1.9], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: theme.ease.inOut,
          }),
          opacity: interpolate(frame, [1.6 * fps, 2.6 * fps], [1, 0.25], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: theme.ease.inOut,
          }),
        }}
      >
        <circle
          cx={RING_RADIUS + theme.stroke}
          cy={RING_RADIUS + theme.stroke}
          r={RING_RADIUS}
          fill="none"
          stroke={theme.color.accent}
          strokeWidth={theme.stroke}
          strokeLinecap="round"
          strokeDasharray={RING_LENGTH}
          strokeDashoffset={interpolate(
            frame,
            [0.2 * fps, 1.6 * fps],
            [RING_LENGTH, 0],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: theme.ease.out,
            },
          )}
        />
      </svg>
      <Interactive.Div
        name="Title"
        style={{
          color: theme.color.ink,
          fontSize: theme.font.headline,
          fontWeight: 700,
          opacity: interpolate(frame, [2 * fps, 2.8 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: theme.ease.out,
          }),
          translate: interpolate(
            frame,
            [2 * fps, 2.8 * fps],
            ["0px 40px", "0px 0px"],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: theme.ease.out,
            },
          ),
        }}
      >
        你好，小林
      </Interactive.Div>
      <Interactive.Div
        name="Subtitle"
        style={{
          position: "absolute",
          top: 640,
          color: theme.color.muted,
          fontSize: theme.font.body,
          opacity: interpolate(frame, [2.6 * fps, 3.4 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: theme.ease.out,
          }),
        }}
      >
        Remotion 项目已就绪
      </Interactive.Div>
    </AbsoluteFill>
  );
};
