import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { CLAMP, theme } from "../theme";

// 镜头：整场缓慢推近，给每个场景一个呼吸般的运动节奏
export const Camera: React.FC<{
  children: React.ReactNode;
  from?: number;
  to?: number;
  origin?: string;
}> = ({ children, from = 1, to = 1.05, origin = "50% 50%" }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill
      style={{
        transformOrigin: origin,
        scale: interpolate(frame, [0, durationInFrames], [from, to], CLAMP),
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

// 章节标记：左上角一条金线 + 编号 + 章名
const ChapterMark: React.FC<{ no: string; name: string }> = ({ no, name }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const opacity = interpolate(
    frame,
    [1.1 * fps, 1.8 * fps, durationInFrames - 1.5 * fps, durationInFrames - 1 * fps],
    [0, 1, 1, 0],
    CLAMP,
  );
  return (
    <div
      style={{
        position: "absolute",
        left: 120,
        top: 96,
        display: "flex",
        alignItems: "center",
        gap: 22,
        opacity,
      }}
    >
      <div
        style={{
          height: 2,
          backgroundColor: theme.color.light,
          width: interpolate(frame, [1.1 * fps, 2.1 * fps], [0, 64], {
            ...CLAMP,
            easing: theme.ease.out,
          }),
        }}
      />
      <div
        style={{
          fontFamily: theme.font.latin,
          fontStyle: "italic",
          fontSize: theme.font.label + 6,
          color: theme.color.light,
        }}
      >
        {no}
      </div>
      <div
        style={{
          fontFamily: theme.font.serif,
          fontSize: theme.font.label,
          letterSpacing: 10,
          color: theme.color.ink,
        }}
      >
        {name}
      </div>
    </div>
  );
};

export const SceneShell: React.FC<{
  children: React.ReactNode;
  background?: string;
  chapter?: { no: string; name: string };
  vignette?: number;
}> = ({ children, background = theme.color.bg, chapter, vignette = 0.6 }) => {
  return (
    <AbsoluteFill style={{ background, overflow: "hidden" }}>
      {children}
      <AbsoluteFill
        style={{
          pointerEvents: "none",
          background: `radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,${vignette}) 100%)`,
        }}
      />
      {chapter ? <ChapterMark no={chapter.no} name={chapter.name} /> : null}
    </AbsoluteFill>
  );
};

// 柔光点：一个径向渐变的光斑
export const Glow: React.FC<{
  x: number;
  y: number;
  r: number;
  color?: string;
  opacity?: number;
}> = ({ x, y, r, color = theme.color.light, opacity = 1 }) => (
  <div
    style={{
      position: "absolute",
      left: x - r,
      top: y - r,
      width: r * 2,
      height: r * 2,
      borderRadius: "50%",
      opacity,
      background: `radial-gradient(circle, ${color} 0%, ${color}55 30%, ${color}00 70%)`,
    }}
  />
);
