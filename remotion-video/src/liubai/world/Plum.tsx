import React from "react";
import { interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BEAT } from "../timeline";
import { CLAMP, theme } from "../theme";
import { Inscription } from "./Inscription";

type P = [number, number];
type Branch = { pts: P[]; w0: number; w1: number; start: number; dur: number };

// 梅枝：主干自右上斜入画面，折而向左下（「横斜」），再分出几根小枝
const BRANCHES: Branch[] = [
  { pts: [[5080, 40], [4960, 150], [4800, 250], [4640, 320], [4470, 420], [4300, 470], [4130, 560], [3960, 600], [3790, 690]], w0: 34, w1: 5, start: 0, dur: 4.2 },
  { pts: [[4640, 320], [4560, 230], [4480, 170], [4390, 120]], w0: 14, w1: 3, start: 1.8, dur: 1.8 },
  { pts: [[4300, 470], [4320, 560], [4300, 650], [4260, 760]], w0: 12, w1: 3, start: 2.6, dur: 1.8 },
  { pts: [[3960, 600], [3900, 520], [3850, 450], [3820, 420]], w0: 10, w1: 2.5, start: 3.4, dur: 1.4 },
  { pts: [[4800, 250], [4860, 340], [4890, 430], [4900, 470]], w0: 11, w1: 2.5, start: 2.2, dur: 1.4 },
];

// Catmull-Rom 平滑后重新采样
const smooth = (pts: P[], step = 8): P[] => {
  const out: P[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const segLen = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
    const n = Math.max(2, Math.round(segLen / step));
    for (let k = 0; k < n; k++) {
      const t = k / n;
      const t2 = t * t;
      const t3 = t2 * t;
      const f = (a: number, b: number, c: number, d: number) =>
        0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
};

const DENSE = BRANCHES.map((b) => smooth(b.pts));

// 按生长进度生成「笔触」多边形：笔锋由粗到细，末端收尖
const strokePolygon = (pts: P[], w0: number, w1: number, p: number, seed: number) => {
  const n = Math.max(2, Math.floor(pts.length * p));
  const left: P[] = [];
  const right: P[] = [];
  for (let i = 0; i < n; i++) {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(pts.length - 1, i + 1)];
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const len = Math.hypot(dx, dy) || 1;
    const k = i / (pts.length - 1);
    const tip = Math.min(1, (n - 1 - i) / 4);
    const w = (w0 + (w1 - w0) * k) * (0.85 + 0.15 * Math.sin(i * 0.7 + seed)) * (0.35 + 0.65 * tip);
    left.push([pts[i][0] - (dy / len) * w * 0.5, pts[i][1] + (dx / len) * w * 0.5]);
    right.push([pts[i][0] + (dy / len) * w * 0.5, pts[i][1] - (dx / len) * w * 0.5]);
  }
  return `M ${[...left, ...right.reverse()].map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(" L ")} Z`;
};

const FLOWER_SPOTS: { x: number; y: number; r: number; bud?: boolean }[] = [
  { x: 4700, y: 300, r: 16 },
  { x: 4520, y: 205, r: 13 },
  { x: 4400, y: 128, r: 11, bud: true },
  { x: 4560, y: 372, r: 15 },
  { x: 4375, y: 452, r: 14 },
  { x: 4315, y: 590, r: 13 },
  { x: 4268, y: 745, r: 9, bud: true },
  { x: 4180, y: 520, r: 16 },
  { x: 4040, y: 615, r: 14 },
  { x: 3890, y: 505, r: 12 },
  { x: 3830, y: 428, r: 8, bud: true },
  { x: 3860, y: 650, r: 13 },
  { x: 4880, y: 390, r: 13 },
  { x: 4905, y: 470, r: 8, bud: true },
  { x: 4980, y: 140, r: 12 },
];
const FLOWERS = FLOWER_SPOTS.map((f) => ({ ...f, delay: 4 + random(`fl-${f.x}`) * 3.2, rot: random(`fr-${f.x}`) * 72 }));

const PETALS = new Array(7).fill(0).map((_, i) => {
  const src = FLOWERS[(i * 3) % FLOWERS.length];
  return { x: src.x, y: src.y, start: 8.5 + i * 1.1, sway: random(`pt-s-${i}`) * Math.PI * 2, speed: 32 + random(`pt-v-${i}`) * 22 };
});

const Flower: React.FC<{ r: number; rot: number }> = ({ r, rot }) => (
  <g transform={`rotate(${rot})`}>
    {[0, 1, 2, 3, 4].map((k) => {
      const a = (k / 5) * Math.PI * 2;
      return <circle key={k} cx={Math.cos(a) * r * 0.72} cy={Math.sin(a) * r * 0.72} r={r * 0.62} fill={theme.color.vermilion} opacity={0.88} />;
    })}
    <circle r={r * 0.32} fill="#E9C9A0" />
    {[0, 1, 2, 3, 4, 5].map((k) => {
      const a = (k / 6) * Math.PI * 2 + 0.3;
      return (
        <line key={k} x1={0} y1={0} x2={Math.cos(a) * r * 0.75} y2={Math.sin(a) * r * 0.75} stroke={theme.color.ink} strokeWidth={1.2} opacity={0.7} />
      );
    })}
  </g>
);

// 梅：枝干以干笔写出（带飞白），朱砂点出花朵，花瓣零星飘落
export const PlumSvg: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const local = t - BEAT.plum;

  return (
    <g>
      {BRANCHES.map((b, i) => {
        const p = interpolate(local, [b.start, b.start + b.dur], [0, 1], { ...CLAMP, easing: theme.ease.inOut });
        if (p <= 0.02) return null;
        const d = strokePolygon(DENSE[i], b.w0, b.w1, p, i);
        return (
          <g key={i}>
            <path d={d} fill={theme.color.ink} opacity={0.55} filter="url(#lb-rough)" />
            <path d={d} fill={theme.color.ink} opacity={0.9} filter="url(#lb-dry)" />
          </g>
        );
      })}
      <g filter="url(#lb-rough)">
        {FLOWERS.map((f, i) => {
          const s = spring({ frame: frame - (BEAT.plum + f.delay) * fps, fps, config: { damping: 14, stiffness: 120 } });
          if (s <= 0.01) return null;
          return (
            <g key={i} transform={`translate(${f.x} ${f.y}) scale(${s})`}>
              {f.bud ? <circle r={f.r * 0.7} fill={theme.color.vermilion} opacity={0.9} /> : <Flower r={f.r} rot={f.rot} />}
            </g>
          );
        })}
      </g>
      {PETALS.map((p, i) => {
        const k = local - p.start;
        if (k < 0 || k > 12) return null;
        const x = p.x - k * 14 + Math.sin(k * 1.4 + p.sway) * 26;
        const y = p.y + k * p.speed;
        return (
          <ellipse
            key={i}
            cx={x}
            cy={y}
            rx={7}
            ry={4.5}
            transform={`rotate(${k * 70 + i * 40} ${x} ${y})`}
            fill={theme.color.vermilion}
            opacity={0.85 * interpolate(k, [0, 0.4, 10, 12], [0, 1, 1, 0])}
          />
        );
      })}
    </g>
  );
};

export const PlumText: React.FC = () => (
  <>
    <Inscription x={3760} y={210} columns={["疏影横斜水清浅"]} signature="林逋" start={BEAT.plum + 6} />
    <Inscription x={3460} y={330} columns={["暗香浮动月黄昏"]} start={BEAT.plum + 12} />
  </>
);
