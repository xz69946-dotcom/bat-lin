import React from "react";
import {
  AbsoluteFill,
  interpolate,
  interpolateColors,
  random,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Sub, TruthCard } from "../components/TruthCard";
import { CLAMP, theme } from "../theme";
import { scene } from "../timeline";

const DUR = scene.expansion;
const CENTER = { x: 1340, y: 470 };
const COLS = 7;
const ROWS = 5;
const GAP = 150;

// 对数螺旋：一个两臂的小星系
const spiral = (r: number) => {
  let d = "";
  for (const arm of [0, Math.PI]) {
    for (let i = 0; i <= 24; i++) {
      const k = i / 24;
      const a = arm + k * Math.PI * 1.6;
      const rr = r * (0.15 + k * 0.85);
      d += `${i === 0 ? "M" : "L"} ${(Math.cos(a) * rr).toFixed(1)} ${(Math.sin(a) * rr * 0.55).toFixed(1)} `;
    }
  }
  return d;
};

const GALAXIES = new Array(COLS * ROWS).fill(0).map((_, i) => {
  const c = (i % COLS) - (COLS - 1) / 2;
  const r = Math.floor(i / COLS) - (ROWS - 1) / 2;
  return {
    gx: c + (random(`gx-${i}`) - 0.5) * 0.35,
    gy: r + (random(`gy-${i}`) - 0.5) * 0.35,
    size: 14 + random(`gs-${i}`) * 10,
    tilt: random(`gt-${i}`) * 180,
    home: c === 0 && r === 0,
  };
});

const DOTS = new Array(11).fill(0).map((_, i) => {
  const d = 0.08 + (i / 10) * 0.88;
  return { d, v: Math.min(0.98, d * 0.92 + (random(`hd-${i}`) - 0.5) * 0.12) };
});
const CHART = { x: 1300, y: 760, w: 470, h: 200 };

// 真理 01：宇宙在膨胀。星系网格整体伸展，远处的星系退行更快、光谱更红
export const C2Expansion: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const scale = interpolate(t, [0.5, 11.5], [0.72, 1.45], { ...CLAMP, easing: theme.ease.inOut });
  const arrows = interpolate(t, [4, 5.2], [0, 1], { ...CLAMP, easing: theme.ease.out });
  const chartIn = interpolate(t, [5.6, 6.4], [0, 1], { ...CLAMP, easing: theme.ease.out });
  const fit = interpolate(t, [8.6, 10], [0, 1], { ...CLAMP, easing: theme.ease.inOut });

  return (
    <AbsoluteFill>
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        <defs>
          <marker id="ex-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={theme.color.ink} />
          </marker>
          <linearGradient id="ex-fade" x1="0" x2="1">
            <stop offset="0" stopColor="#fff" stopOpacity={0} />
            <stop offset="0.14" stopColor="#fff" stopOpacity={1} />
          </linearGradient>
          <mask id="ex-mask">
            <rect x={860} y={0} width={1060} height={1080} fill="url(#ex-fade)" />
          </mask>
        </defs>
        <g mask="url(#ex-mask)">
          {/* 空间网格：随尺度因子一起伸展 */}
          {new Array(COLS + 4).fill(0).map((_, i) => {
            const x = CENTER.x + (i - (COLS + 3) / 2) * GAP * scale;
            return (
              <line key={`v${i}`} x1={x} y1={-20} x2={x} y2={1100} stroke={theme.color.faint} strokeWidth={1} />
            );
          })}
          {new Array(ROWS + 4).fill(0).map((_, i) => {
            const y = CENTER.y + (i - (ROWS + 3) / 2) * GAP * scale;
            return (
              <line key={`h${i}`} x1={860} y1={y} x2={1940} y2={y} stroke={theme.color.faint} strokeWidth={1} />
            );
          })}
          {GALAXIES.map((g, i) => {
            const x = CENTER.x + g.gx * GAP * scale;
            const y = CENTER.y + g.gy * GAP * scale;
            const dist = Math.hypot(g.gx, g.gy);
            const red = interpolate(dist * scale, [0, 3.8], [0, 1], CLAMP);
            const color = g.home
              ? theme.color.starHot
              : interpolateColors(red, [0, 0.5, 1], [theme.color.star, theme.color.starHot, theme.color.sun]);
            const ax = g.gx / (dist || 1);
            const ay = g.gy / (dist || 1);
            const len = dist * 34 * arrows * scale;
            return (
              <g key={i}>
                {!g.home && len > 2 && (
                  <line
                    x1={x + ax * (g.size + 6)}
                    y1={y + ay * (g.size + 6)}
                    x2={x + ax * (g.size + 6 + len)}
                    y2={y + ay * (g.size + 6 + len)}
                    stroke={theme.color.ink}
                    strokeOpacity={0.55}
                    strokeWidth={theme.stroke.hair}
                    markerEnd="url(#ex-arrow)"
                  />
                )}
                <circle cx={x} cy={y} r={g.size * 0.9} fill={color} opacity={0.12} />
                <path
                  d={spiral(g.size)}
                  fill="none"
                  stroke={color}
                  strokeWidth={theme.stroke.hair + 0.5}
                  strokeLinecap="round"
                  transform={`translate(${x} ${y}) rotate(${g.tilt + frame * 0.6})`}
                />
                <circle cx={x} cy={y} r={2.6} fill={theme.color.starHot} />
                {g.home && (
                  <g>
                    <circle cx={x} cy={y} r={g.size + 12} fill="none" stroke={theme.color.star} strokeWidth={theme.stroke.thin} />
                    <text
                      x={x}
                      y={y - g.size - 24}
                      textAnchor="middle"
                      fill={theme.color.star}
                      fontFamily={theme.font.body}
                      fontSize={24}
                    >
                      银河系
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </g>
        {/* 哈勃图 */}
        <g opacity={chartIn} transform={`translate(0 ${(1 - chartIn) * 20})`}>
          <rect
            x={CHART.x - 40}
            y={CHART.y - CHART.h - 40}
            width={CHART.w + 80}
            height={CHART.h + 96}
            rx={10}
            fill="rgba(3,4,10,0.72)"
            stroke={theme.color.faint}
          />
          <line x1={CHART.x} y1={CHART.y} x2={CHART.x + CHART.w} y2={CHART.y} stroke={theme.color.muted} strokeWidth={theme.stroke.hair} />
          <line x1={CHART.x} y1={CHART.y} x2={CHART.x} y2={CHART.y - CHART.h} stroke={theme.color.muted} strokeWidth={theme.stroke.hair} />
          <text x={CHART.x + CHART.w} y={CHART.y + 32} textAnchor="end" fill={theme.color.muted} fontFamily={theme.font.body} fontSize={22}>
            距离 d
          </text>
          <text x={CHART.x + 12} y={CHART.y - CHART.h + 4} fill={theme.color.muted} fontFamily={theme.font.body} fontSize={22}>
            退行速度 v
          </text>
          {DOTS.map((p, i) => {
            const k = interpolate(t, [6.2 + i * 0.18, 6.6 + i * 0.18], [0, 1], CLAMP);
            return (
              <circle
                key={i}
                cx={CHART.x + p.d * CHART.w}
                cy={CHART.y - p.v * CHART.h}
                r={5 * k}
                fill={interpolateColors(p.d, [0, 1], [theme.color.star, theme.color.sun])}
              />
            );
          })}
          <line
            x1={CHART.x}
            y1={CHART.y}
            x2={CHART.x + CHART.w * fit}
            y2={CHART.y - CHART.h * 0.92 * fit}
            stroke={theme.color.star}
            strokeWidth={theme.stroke.thin}
          />
          <text
            x={CHART.x + CHART.w - 8}
            y={CHART.y - CHART.h + 50}
            textAnchor="end"
            fill={theme.color.star}
            fontFamily={theme.font.mono}
            fontSize={22}
            opacity={fit}
          >
            H₀ ≈ 67–73 km/s/Mpc
          </text>
        </g>
      </svg>
      <TruthCard
        no="01"
        title="宇宙在膨胀"
        equation={
          <>
            v = H<Sub>0</Sub> · d
          </>
        }
        facts={["越远的星系，远离我们越快", "不是星系在飞，是空间本身在伸展", "哈勃–勒梅特定律（1927 / 1929）"]}
        factTimes={[3.2, 4.6, 7.2]}
        duration={DUR}
      />
    </AbsoluteFill>
  );
};
