import React from "react";
import { interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { BEAT, SPOT } from "../timeline";
import { CLAMP, theme } from "../theme";
import { Inscription } from "./Inscription";

const MOON = { x: SPOT.moon.x, y: SPOT.moon.y - 30, r: 150 };
const REGION = { x: MOON.x - 1700, y: -300, w: 3400, h: 1800 };

const CLOUDS = new Array(9).fill(0).map((_, i) => {
  const a = (i / 9) * Math.PI * 2 + random(`cl-a-${i}`) * 0.5;
  const d = 240 + random(`cl-d-${i}`) * 280;
  return {
    x: MOON.x + Math.cos(a) * d * 1.3,
    y: MOON.y + Math.sin(a) * d * 0.7,
    rx: 220 + random(`cl-rx-${i}`) * 260,
    ry: 70 + random(`cl-ry-${i}`) * 70,
    v: (random(`cl-v-${i}`) - 0.5) * 10,
    o: 0.28 + random(`cl-o-${i}`) * 0.25,
  };
});

// 烘云托月：只染月亮周围的天和云，月亮本身是一块从未落墨的纸
export const MoonSvg: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const wash = interpolate(t, [BEAT.moon, BEAT.moon + 9], [0, 1], { ...CLAMP, easing: theme.ease.inOut });
  const clouds = interpolate(t, [BEAT.moon + 2, BEAT.moon + 10], [0, 1], { ...CLAMP, easing: theme.ease.inOut });

  return (
    <g>
      <defs>
        <radialGradient id="mn-falloff" gradientUnits="userSpaceOnUse" cx={MOON.x} cy={MOON.y} r={1150}>
          <stop offset="0" stopColor="#fff" />
          <stop offset="0.55" stopColor="#fff" stopOpacity={0.8} />
          <stop offset="1" stopColor="#fff" stopOpacity={0} />
        </radialGradient>
        <radialGradient id="mn-hole" gradientUnits="userSpaceOnUse" cx={MOON.x} cy={MOON.y} r={MOON.r + 26}>
          <stop offset="0" stopColor="#000" />
          <stop offset={MOON.r / (MOON.r + 26)} stopColor="#000" />
          <stop offset="1" stopColor="#000" stopOpacity={0} />
        </radialGradient>
        <mask id="mn-mask" maskUnits="userSpaceOnUse" x={REGION.x} y={REGION.y} width={REGION.w} height={REGION.h}>
          <rect x={REGION.x} y={REGION.y} width={REGION.w} height={REGION.h} fill="url(#mn-falloff)" />
          <circle cx={MOON.x} cy={MOON.y} r={MOON.r + 26} fill="url(#mn-hole)" />
        </mask>
      </defs>
      <g mask="url(#mn-mask)">
        <rect x={REGION.x} y={REGION.y} width={REGION.w} height={REGION.h} fill={theme.color.inkLight} opacity={0.42 * wash} />
        <g filter="url(#lb-cloud)" opacity={clouds}>
          {CLOUDS.map((c, i) => (
            <ellipse key={i} cx={c.x + t * c.v} cy={c.y} rx={c.rx} ry={c.ry} fill={theme.color.inkMid} opacity={c.o} />
          ))}
        </g>
      </g>
    </g>
  );
};

export const MoonText: React.FC = () => (
  <Inscription
    x={MOON.x - 520}
    y={-140}
    columns={["烘云托月：", "月亮一笔未画，", "是云，把它让了出来。"]}
    start={BEAT.moon + 5}
  />
);
