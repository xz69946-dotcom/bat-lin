import React from "react";
import {
  interpolate,
  random,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Glow, SceneShell } from "../components/SceneShell";
import { PoemLine } from "../components/PoemLine";
import { CLAMP, theme } from "../theme";

const GROUND = 300;
const SEED = { x: 820, y: 390 };

type Root = { d: string; len: number; start: number; width: number };

// 确定性地生成根系：一条主根 + 沿途分出的侧根
const makeRoot = (
  x: number,
  y: number,
  angle: number,
  steps: number,
  seed: string,
  start: number,
  width: number,
  out: Root[],
  depth: number,
) => {
  let d = `M ${x} ${y}`;
  let len = 0;
  let a = angle;
  let cx = x;
  let cy = y;
  for (let i = 0; i < steps; i++) {
    a += (random(`${seed}-${i}`) - 0.5) * 0.5;
    // 始终向下
    a = Math.max(0.35, Math.min(Math.PI - 0.35, a));
    const step = 34 - depth * 6;
    const nx = cx + Math.cos(a) * step;
    const ny = Math.min(cy + Math.sin(a) * step, 830);
    len += Math.hypot(nx - cx, ny - cy);
    d += ` L ${nx.toFixed(1)} ${ny.toFixed(1)}`;
    if (depth < 2 && i > 1 && i % 3 === 1) {
      const side = random(`${seed}-side-${i}`) > 0.5 ? 1 : -1;
      makeRoot(
        nx,
        ny,
        Math.PI / 2 + side * (0.9 + random(`${seed}-b-${i}`) * 0.5),
        Math.floor(steps * 0.55),
        `${seed}-${i}`,
        start + (len / 34) * 0.12,
        width * 0.6,
        out,
        depth + 1,
      );
    }
    cx = nx;
    cy = ny;
  }
  out.push({ d, len, start, width });
};

const ROOTS: Root[] = [];
makeRoot(SEED.x, SEED.y + 8, Math.PI / 2, 14, "main", 1.6, 5.5, ROOTS, 0);
makeRoot(SEED.x - 6, SEED.y + 6, Math.PI / 2 + 0.7, 11, "left", 2.1, 4, ROOTS, 1);
makeRoot(SEED.x + 6, SEED.y + 6, Math.PI / 2 - 0.7, 11, "right", 2.3, 4, ROOTS, 1);
makeRoot(SEED.x + 4, SEED.y + 10, Math.PI / 2 - 0.25, 12, "mid", 2.8, 3.5, ROOTS, 1);

const SOIL_DOTS = new Array(90).fill(0).map((_, i) => ({
  x: random(`soil-x-${i}`) * 1920,
  y: GROUND + 30 + random(`soil-y-${i}`) * 760,
  r: 1 + random(`soil-r-${i}`) * 2.5,
}));

const STEM = `M ${SEED.x} ${SEED.y - 8} C ${SEED.x - 14} ${GROUND + 40}, ${SEED.x + 18} ${GROUND - 40}, ${SEED.x + 4} ${GROUND - 170}`;
const STEM_LEN = 270;
const TOP = { x: SEED.x + 4, y: GROUND - 170 };

// 04 根：向下扎进黑暗，向上长成光
export const S5Roots: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const leaves = spring({
    frame: frame - 7.4 * fps,
    fps,
    config: { damping: 14, stiffness: 70 },
  });
  const sky = interpolate(t, [5.5, 9], [0.25, 1], CLAMP);
  const burst = interpolate(t, [6.2, 7.4], [0, 1], {
    ...CLAMP,
    easing: theme.ease.out,
  });

  return (
    <SceneShell chapter={{ no: "04", name: "根" }} vignette={0.5}>
      {/* 地上：天光 */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: GROUND,
          background: `linear-gradient(180deg, #1C1A1F 0%, #0E0D12 100%)`,
        }}
      />
      <Glow x={SEED.x} y={-120} r={620} opacity={0.5 * sky} />
      {/* 地下：土壤 */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: GROUND,
          bottom: 0,
          background: `linear-gradient(180deg, #1E1812 0%, ${theme.color.soil} 35%, #050506 100%)`,
        }}
      />
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        {SOIL_DOTS.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={p.r} fill="#3A2E22" opacity={0.5} />
        ))}
        <line
          x1={0}
          y1={GROUND}
          x2={1920}
          y2={GROUND}
          stroke="#4A3B2B"
          strokeWidth={theme.stroke.thin}
        />
        {ROOTS.map((r, i) => (
          <path
            key={i}
            d={r.d}
            stroke={theme.color.light}
            strokeWidth={r.width}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            opacity={0.85}
            strokeDasharray={r.len}
            strokeDashoffset={interpolate(
              t,
              [r.start, r.start + (r.len / 34) * 0.16 + 0.4],
              [r.len, 0],
              { ...CLAMP, easing: theme.ease.out },
            )}
          />
        ))}
        {/* 破土瞬间的光环 */}
        <ellipse
          cx={SEED.x}
          cy={GROUND}
          rx={20 + burst * 260}
          ry={4 + burst * 26}
          fill="none"
          stroke={theme.color.lightHot}
          strokeWidth={theme.stroke.thin}
          opacity={(1 - burst) * (t > 6.2 ? 1 : 0)}
        />
        {/* 嫩茎 */}
        <path
          d={STEM}
          stroke="#E9D59A"
          strokeWidth={7}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={STEM_LEN}
          strokeDashoffset={interpolate(t, [4.6, 7.4], [STEM_LEN, 0], {
            ...CLAMP,
            easing: theme.ease.inOut,
          })}
        />
        {[-1, 1].map((side) => (
          <path
            key={side}
            d="M 0 0 C 30 -40, 90 -40, 120 -10 C 80 10, 30 12, 0 0 Z"
            fill={theme.color.light}
            transform={`translate(${TOP.x} ${TOP.y + 18}) scale(${side * leaves} ${leaves}) rotate(${-18})`}
          />
        ))}
        {/* 种子 */}
        <ellipse
          cx={SEED.x}
          cy={SEED.y}
          rx={18}
          ry={12}
          fill={theme.color.light}
          opacity={interpolate(t, [0.6, 1.4], [0, 1], CLAMP)}
        />
      </svg>
      <Glow
        x={SEED.x}
        y={SEED.y}
        r={70 + 14 * Math.sin(frame / 8)}
        opacity={interpolate(t, [0.6, 1.4], [0, 0.6], CLAMP)}
      />
      <PoemLine text="向下，扎进黑暗" start={2.4} end={12.6} y={860} x={140} />
      <PoemLine
        text="向上，长成光"
        start={8.2}
        end={12.8}
        y={140}
        x={1780}
        align="right"
        highlight="光"
      />
    </SceneShell>
  );
};
