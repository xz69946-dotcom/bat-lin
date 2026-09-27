import React from "react";
import { interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { Camera, Glow, SceneShell } from "../components/SceneShell";
import { PoemLine } from "../components/PoemLine";
import { CLAMP, theme } from "../theme";

const BASE_Y = 1140;

// 近处的竹更粗、更暗；远处的竹更细、更淡
const STALKS = [
  { x: 180, h: 1000, w: 30, depth: 0 },
  { x: 560, h: 880, w: 20, depth: 1 },
  { x: 760, h: 1180, w: 36, depth: 0 },
  { x: 980, h: 960, w: 18, depth: 1 },
  { x: 1180, h: 1240, w: 40, depth: 0 },
  { x: 1450, h: 900, w: 22, depth: 1 },
  { x: 1680, h: 1120, w: 32, depth: 0 },
].map((s, i) => ({ ...s, phase: random(`stalk-${i}`) * Math.PI * 2 }));

const STREAKS = new Array(22).fill(0).map((_, i) => ({
  y: 120 + random(`wind-y-${i}`) * 820,
  len: 120 + random(`wind-l-${i}`) * 260,
  speed: 55 + random(`wind-s-${i}`) * 45,
  offset: random(`wind-o-${i}`) * 2600,
}));

// 风力：2.5s 起风，7s 风停；停后按阻尼振荡回弹
const wind = (t: number, phase: number) => {
  if (t < 7) {
    const env = interpolate(t, [2.4, 5], [0, 1], {
      ...CLAMP,
      easing: theme.ease.inOut,
    });
    return env * (1 + 0.14 * Math.sin(t * 4.2 + phase));
  }
  const k = t - 7;
  const atRelease = 1 + 0.14 * Math.sin(7 * 4.2 + phase);
  return atRelease * Math.exp(-k * 1.05) * Math.cos(k * Math.PI * 1.25);
};

const quad = (
  p0: number[],
  p1: number[],
  p2: number[],
  k: number,
): { x: number; y: number; angle: number } => {
  const mt = 1 - k;
  const x = mt * mt * p0[0] + 2 * mt * k * p1[0] + k * k * p2[0];
  const y = mt * mt * p0[1] + 2 * mt * k * p1[1] + k * k * p2[1];
  const dx = 2 * mt * (p1[0] - p0[0]) + 2 * k * (p2[0] - p1[0]);
  const dy = 2 * mt * (p1[1] - p0[1]) + 2 * k * (p2[1] - p1[1]);
  return { x, y, angle: Math.atan2(dy, dx) };
};

const Stalk: React.FC<{ s: (typeof STALKS)[number]; t: number }> = ({ s, t }) => {
  const bend = wind(t, s.phase) * 260 * (s.h / 1240) * (s.depth ? 0.8 : 1);
  const p0 = [s.x, BASE_Y];
  const p1 = [s.x, BASE_Y - s.h * 0.55];
  const p2 = [s.x + bend, BASE_Y - s.h + Math.abs(bend) * 0.22];
  const color = s.depth ? "#1B2233" : "#07090E";
  const nodeColor = s.depth ? "#28324A" : "#141A26";
  const tip = quad(p0, p1, p2, 1);
  return (
    <g>
      <path
        d={`M ${p0[0]} ${p0[1]} Q ${p1[0]} ${p1[1]} ${p2[0]} ${p2[1]}`}
        stroke={color}
        strokeWidth={s.w}
        strokeLinecap="round"
        fill="none"
      />
      {[0.14, 0.26, 0.38, 0.5, 0.62, 0.73, 0.83, 0.92].map((k) => {
        const p = quad(p0, p1, p2, k);
        const nx = Math.cos(p.angle + Math.PI / 2);
        const ny = Math.sin(p.angle + Math.PI / 2);
        const half = s.w / 2 + 3;
        return (
          <line
            key={k}
            x1={p.x - nx * half}
            y1={p.y - ny * half}
            x2={p.x + nx * half}
            y2={p.y + ny * half}
            stroke={nodeColor}
            strokeWidth={5}
            strokeLinecap="round"
          />
        );
      })}
      {/* 竹叶 */}
      {[-0.9, -0.3, 0.4, 1.0].map((a, i) => {
        const flutter = Math.sin(t * 6 + s.phase + i) * 0.12 * (0.3 + Math.abs(wind(t, s.phase)));
        const deg = ((tip.angle + Math.PI / 2 + a * 0.9 + flutter) * 180) / Math.PI;
        const size = s.w * 3.6;
        return (
          <path
            key={i}
            d={`M 0 0 Q ${size * 0.3} ${-size * 0.18} ${size} 0 Q ${size * 0.3} ${size * 0.18} 0 0 Z`}
            fill={color}
            transform={`translate(${tip.x} ${tip.y}) rotate(${deg - 90 + (a < 0 ? 180 : 0)})`}
          />
        );
      })}
    </g>
  );
};

// 03 竹：风来时弯腰，风过后挺立
export const S4Bamboo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const gust = interpolate(t, [2.4, 4, 6.4, 7.4], [0, 1, 1, 0], CLAMP);
  const moon = interpolate(t, [0, 8, 10], [0.75, 0.75, 1], CLAMP);

  return (
    <SceneShell
      chapter={{ no: "03", name: "竹" }}
      background={`linear-gradient(180deg, #0B1120 0%, ${theme.color.bg} 100%)`}
    >
      <Camera from={1} to={1.05} origin="50% 100%">
        <Glow x={1260} y={360} r={520} opacity={0.35 * moon} />
        <div
          style={{
            position: "absolute",
            left: 1260 - 190,
            top: 360 - 190,
            width: 380,
            height: 380,
            borderRadius: "50%",
            background: `radial-gradient(circle at 45% 40%, ${theme.color.lightHot} 0%, ${theme.color.light} 70%, #E09A3A 100%)`,
            opacity: moon,
          }}
        />
        <svg width={1920} height={1080} style={{ position: "absolute" }}>
          {STREAKS.map((w, i) => {
            const x = ((w.offset + frame * w.speed) % 2600) - 400;
            return (
              <line
                key={i}
                x1={x}
                y1={w.y}
                x2={x + w.len}
                y2={w.y - w.len * 0.06}
                stroke={theme.color.ink}
                strokeWidth={theme.stroke.hair}
                strokeLinecap="round"
                opacity={0.22 * gust}
              />
            );
          })}
          {STALKS.filter((s) => s.depth === 1).map((s) => (
            <Stalk key={s.x} s={s} t={t} />
          ))}
          {STALKS.filter((s) => s.depth === 0).map((s) => (
            <Stalk key={s.x} s={s} t={t} />
          ))}
        </svg>
      </Camera>
      <AbsoluteShade />
      <PoemLine text="风来时，竹会弯腰" start={2.6} end={12.6} y={640} />
      <PoemLine
        text="风过后，依然挺立"
        en="It bows to the wind, then rises again."
        start={8.2}
        end={12.8}
        y={790}
        highlight="依然挺立"
      />
    </SceneShell>
  );
};

// 底部压暗，保证诗句可读
const AbsoluteShade: React.FC = () => (
  <div
    style={{
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      height: 560,
      background: "linear-gradient(180deg, rgba(6,7,11,0) 0%, rgba(6,7,11,0.75) 100%)",
    }}
  />
);
