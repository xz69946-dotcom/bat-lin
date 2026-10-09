import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { BEAT, SPOT } from "../timeline";
import { CLAMP, theme } from "../theme";
import { Inscription } from "./Inscription";

const SEAL = { x: SPOT.seal.x + 230, y: SPOT.seal.y + 120, s: 112 };

// 落款与钤印：「丙午秋 · 火火写」，盖一方白文印「火火」
export const SealSvg: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const k = interpolate(t, [BEAT.stamp - 0.18, BEAT.stamp], [0, 1], { ...CLAMP, easing: theme.ease.in });
  if (k <= 0) return null;
  // 印泥落纸后向外微微渗开
  const bleed = interpolate(t, [BEAT.stamp, BEAT.stamp + 1.5], [0, 1], { ...CLAMP, easing: theme.ease.out });
  const scale = 1.35 - 0.35 * k;
  const half = SEAL.s / 2;
  return (
    <g transform={`translate(${SEAL.x} ${SEAL.y}) scale(${scale})`} opacity={k}>
      <rect x={-half - 4 * bleed} y={-half - 4 * bleed} width={SEAL.s + 8 * bleed} height={SEAL.s + 8 * bleed} fill={theme.color.vermilion} opacity={0.18 * bleed} filter="url(#lb-rough)" />
      <g filter="url(#lb-rough)">
        <rect x={-half} y={-half} width={SEAL.s} height={SEAL.s} rx={6} fill={theme.color.vermilion} />
        <rect x={-half + 8} y={-half + 8} width={SEAL.s - 16} height={SEAL.s - 16} rx={3} fill="none" stroke={theme.color.paper} strokeWidth={3} opacity={0.9} />
        {["火", "火"].map((ch, i) => (
          <text
            key={i}
            x={0}
            y={-half + 50 + i * 44}
            textAnchor="middle"
            fontFamily={theme.font.serif}
            fontWeight={700}
            fontSize={44}
            fill={theme.color.paper}
          >
            {ch}
          </text>
        ))}
      </g>
    </g>
  );
};

export const ColophonText: React.FC = () => (
  <Inscription x={SEAL.x + 64} y={SPOT.seal.y - 290} columns={["丙午秋", "火火 写"]} size={44} start={BEAT.colophon} />
);
