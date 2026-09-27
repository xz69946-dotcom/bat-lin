import React from "react";
import { interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { Camera, SceneShell } from "../components/SceneShell";
import { PoemLine } from "../components/PoemLine";
import { CLAMP, theme } from "../theme";

const CRACK_X = 1420;

// 一条自上而下的锯齿裂缝
const CRACK = new Array(20).fill(0).map((_, i) => ({
  x: CRACK_X + (random(`crack-${i}`) - 0.5) * 90,
  y: -40 + i * 62,
}));
const crackD = CRACK.map((p, i) => `${i === 0 ? "M" : "L"}${p.x} ${p.y}`).join(
  " ",
);
const crackLength = CRACK.reduce(
  (acc, p, i) =>
    i === 0 ? 0 : acc + Math.hypot(p.x - CRACK[i - 1].x, p.y - CRACK[i - 1].y),
  0,
);
const crackPts = CRACK.map((p) => `${p.x},${p.y}`).join(" ");
const LEFT_POLY = `-400,-40 ${crackPts} -400,1200`;
const RIGHT_POLY = `2400,-40 ${crackPts} 2400,1200`;

const STRATA = new Array(16).fill(0).map((_, i) => {
  const y = 40 + i * 66 + random(`strata-${i}`) * 20;
  const amp = 4 + random(`strata-a-${i}`) * 10;
  let d = `M -400 ${y}`;
  for (let x = -400; x <= 2400; x += 80) {
    d += ` L ${x} ${y + Math.sin(x / 190 + i) * amp}`;
  }
  return d;
});

const Wall: React.FC = () => (
  <g>
    <rect x={-400} y={-40} width={2800} height={1240} fill="url(#wall)" />
    {STRATA.map((d, i) => (
      <path
        key={i}
        d={d}
        stroke={theme.color.muted}
        strokeOpacity={0.08 + (i % 3) * 0.03}
        strokeWidth={theme.stroke.hair}
        fill="none"
      />
    ))}
  </g>
);

// 01 裂隙：厚重的墙上裂开一道缝，光从缝里涌出
export const S2Crack: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const gap = interpolate(t, [4, 7, 12, 14], [0, 26, 60, 180], {
    ...CLAMP,
    easing: theme.ease.inOut,
  });
  const draw = interpolate(t, [1.2, 3.8], [crackLength, 0], {
    ...CLAMP,
    easing: theme.ease.inOut,
  });
  const rays = interpolate(t, [4.5, 8, 14], [0, 0.55, 0.9], CLAMP);

  return (
    <SceneShell chapter={{ no: "01", name: "裂隙" }}>
      <Camera from={1.02} to={1.08} origin={`${CRACK_X}px 540px`}>
        <svg width={1920} height={1080} style={{ position: "absolute" }}>
          <defs>
            <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#1A2130" />
              <stop offset="1" stopColor="#0B0F18" />
            </linearGradient>
            <radialGradient id="behind" cx={CRACK_X} cy={540} r={900} gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor={theme.color.lightHot} />
              <stop offset="0.25" stopColor={theme.color.light} />
              <stop offset="1" stopColor="#6B3A10" />
            </radialGradient>
            <linearGradient id="rayL" x1="1" y1="0" x2="0" y2="0">
              <stop offset="0" stopColor={theme.color.light} stopOpacity={0.6} />
              <stop offset="1" stopColor={theme.color.light} stopOpacity={0} />
            </linearGradient>
            <clipPath id="leftHalf">
              <polygon points={LEFT_POLY} />
            </clipPath>
            <clipPath id="rightHalf">
              <polygon points={RIGHT_POLY} />
            </clipPath>
            <filter id="crackGlow" x="-50%" y="-10%" width="200%" height="120%">
              <feGaussianBlur stdDeviation={10} />
            </filter>
          </defs>
          {/* 墙后的光 */}
          <rect x={0} y={0} width={1920} height={1080} fill="url(#behind)" />
          {/* 墙的左右两半，沿裂缝分开 */}
          <g clipPath="url(#leftHalf)" transform={`translate(${-gap} 0)`}>
            <Wall />
          </g>
          <g clipPath="url(#rightHalf)" transform={`translate(${gap * 0.4} 0)`}>
            <Wall />
          </g>
          {/* 裂缝本身：先作为金线生长 */}
          <g opacity={interpolate(t, [5, 8], [1, 0], CLAMP)}>
            <path
              d={crackD}
              stroke={theme.color.light}
              strokeWidth={14}
              fill="none"
              filter="url(#crackGlow)"
              strokeDasharray={crackLength}
              strokeDashoffset={draw}
            />
            <path
              d={crackD}
              stroke={theme.color.lightHot}
              strokeWidth={theme.stroke.thin}
              fill="none"
              strokeLinejoin="round"
              strokeDasharray={crackLength}
              strokeDashoffset={draw}
            />
          </g>
          {/* 从缝隙向左漫出的光束 */}
          <g opacity={rays}>
            {[-260, -120, 0, 140, 300].map((dy, i) => (
              <polygon
                key={i}
                points={`${CRACK_X - gap},${540 + dy - 30} ${CRACK_X - gap},${540 + dy + 30} ${-200},${540 + dy * 2.6 + 160} ${-200},${540 + dy * 2.6 - 160}`}
                fill="url(#rayL)"
                opacity={0.22 + (i % 2) * 0.12}
              />
            ))}
          </g>
        </svg>
      </Camera>
      <PoemLine text="黑暗很厚" start={3.4} end={12.6} y={330} />
      <PoemLine
        text="但光，总能找到缝隙"
        en="Darkness is thick — yet light always finds a way through."
        start={6.4}
        end={12.8}
        y={480}
        highlight="光"
      />
    </SceneShell>
  );
};
