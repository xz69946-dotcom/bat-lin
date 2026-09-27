import React from "react";
import {
  interpolate,
  interpolateColors,
  random,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Glow, SceneShell } from "../components/SceneShell";
import { PoemLine } from "../components/PoemLine";
import { CLAMP, theme } from "../theme";

const HORIZON = 720;
const SUN_R = 150;

const SHIMMER = new Array(26).fill(0).map((_, i) => ({
  y: HORIZON + 18 + i * 13 + random(`sh-y-${i}`) * 6,
  w: 60 + random(`sh-w-${i}`) * 180,
  phase: random(`sh-p-${i}`) * Math.PI * 2,
}));

// 终 · 破晓：太阳从地平线升起，「光韧」回到画面
export const S9Dawn: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const dawn = interpolate(t, [0.5, 7], [0, 1], { ...CLAMP, easing: theme.ease.inOut });
  const skyTop = interpolateColors(dawn, [0, 1], [theme.color.bg, "#1A1D33"]);
  const skyMid = interpolateColors(dawn, [0, 1], ["#0B0E18", "#6A4A5A"]);
  const skyLow = interpolateColors(dawn, [0, 1], ["#10121C", "#E08A4E"]);
  const sunY = interpolate(t, [0.8, 7.5], [HORIZON + SUN_R + 20, HORIZON + 20], {
    ...CLAMP,
    easing: theme.ease.out,
  });
  const titleIn = spring({
    frame: frame - 5.4 * fps,
    fps,
    config: { damping: 200 },
    durationInFrames: 1.8 * fps,
  });
  const end = interpolate(t, [12, 13.8], [0, 1], { ...CLAMP, easing: theme.ease.inOut });
  const rays = interpolate(t, [3.5, 6], [0, 1], { ...CLAMP, easing: theme.ease.out });

  return (
    <SceneShell
      background={`linear-gradient(180deg, ${skyTop} 0%, ${skyMid} 45%, ${skyLow} ${(HORIZON / 1080) * 100}%, #07080D ${(HORIZON / 1080) * 100}%, #07080D 100%)`}
      vignette={0.5}
    >
      <Glow x={960} y={sunY} r={700} opacity={0.5 * dawn} />
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        <defs>
          <clipPath id="dawn-sky">
            <rect x={0} y={0} width={1920} height={HORIZON} />
          </clipPath>
          <radialGradient id="dawn-sun" cx="50%" cy="45%" r="55%">
            <stop offset="0" stopColor={theme.color.lightHot} />
            <stop offset="0.7" stopColor={theme.color.light} />
            <stop offset="1" stopColor="#F29A45" />
          </radialGradient>
        </defs>
        <g clipPath="url(#dawn-sky)">
          {new Array(28).fill(0).map((_, i) => {
            const a = (i / 28) * Math.PI * 2 + t * 0.04;
            const r1 = SUN_R + 30;
            const r2 = SUN_R + 30 + 900 * rays;
            return (
              <line
                key={i}
                x1={960 + Math.cos(a) * r1}
                y1={sunY + Math.sin(a) * r1}
                x2={960 + Math.cos(a) * r2}
                y2={sunY + Math.sin(a) * r2}
                stroke={theme.color.light}
                strokeWidth={theme.stroke.hair}
                opacity={0.25}
              />
            );
          })}
          <circle cx={960} cy={sunY} r={SUN_R} fill="url(#dawn-sun)" />
        </g>
        <line x1={0} y1={HORIZON} x2={1920} y2={HORIZON} stroke={theme.color.light} strokeOpacity={0.5 * dawn} strokeWidth={theme.stroke.hair} />
        {/* 水面倒影 */}
        {SHIMMER.map((s, i) => {
          const w = s.w * (0.6 + 0.4 * Math.sin(frame / 10 + s.phase)) * (1 - i / 34);
          return (
            <line
              key={i}
              x1={960 - w / 2}
              y1={s.y}
              x2={960 + w / 2}
              y2={s.y}
              stroke={theme.color.light}
              strokeWidth={3}
              strokeLinecap="round"
              opacity={dawn * (0.8 - i * 0.025)}
            />
          );
        })}
      </svg>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 120,
          textAlign: "center",
          fontFamily: theme.font.serif,
          fontWeight: 700,
          fontSize: 200,
          lineHeight: 1.2,
          color: theme.color.ink,
          opacity: titleIn,
          filter: `blur(${(1 - titleIn) * 18}px)`,
          letterSpacing: interpolate(titleIn, [0, 1], [180, 60]),
          // 抵消末字后的字距，保证视觉居中
          paddingLeft: interpolate(titleIn, [0, 1], [180, 60]),
          textShadow: "0 0 50px rgba(255,195,90,0.35)",
        }}
      >
        <span style={{ color: theme.color.light }}>光</span>韧
      </div>
      <PoemLine
        text="愿你如光：可以弯折，永不熄灭"
        en="May you be like light — bent, yet never broken."
        start={7.6}
        end={20}
        y={400}
        align="center"
        size={theme.font.tagline}
        enColor={theme.color.inkSoft}
        highlight="永不熄灭"
      />
      <div style={{ position: "absolute", inset: 0, backgroundColor: theme.color.bg, opacity: end }} />
    </SceneShell>
  );
};
