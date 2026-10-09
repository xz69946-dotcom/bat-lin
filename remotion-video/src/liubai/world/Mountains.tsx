import React from "react";
import { interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { BEAT } from "../timeline";
import { CLAMP, theme } from "../theme";
import { Inscription } from "./Inscription";

type Peak = [x: number, h: number, w: number];
type Layer = { base: number; peaks: Peak[]; color: string; opacity: number; filter: string; seed: number };

const X0 = 6300;
const X1 = 9450;

// 远、中、近三层山：越远越淡、越模糊
const LAYERS: Layer[] = [
  {
    base: 640,
    peaks: [[9050, 210, 260], [8450, 270, 300], [7850, 200, 240], [7200, 150, 280], [6700, 90, 260]],
    color: theme.color.inkLight,
    opacity: 0.38,
    filter: "url(#lb-soft)",
    seed: 1,
  },
  {
    base: 730,
    peaks: [[8820, 300, 220], [8200, 360, 260], [7600, 250, 230], [7000, 170, 240], [6550, 70, 200]],
    color: theme.color.inkMid,
    opacity: 0.62,
    filter: "url(#lb-rough)",
    seed: 2,
  },
  {
    base: 830,
    peaks: [[9180, 250, 180], [8620, 330, 200], [8020, 430, 210], [7450, 270, 190], [6950, 130, 200]],
    color: theme.color.ink,
    opacity: 0.88,
    filter: "url(#lb-rough)",
    seed: 3,
  },
];

// 两端的山势收平
const taper = (x: number) => Math.min(1, Math.max(0, (x - X0) / 500), Math.max(0, (X1 - x) / 400));

const ridgeY = (layer: Layer, x: number) => {
  const h = taper(x) * layer.peaks.reduce((acc, [px, ph, pw]) => acc + ph * Math.exp(-(((x - px) / pw) ** 2)), 0);
  const s = layer.seed;
  const noise = 10 * Math.sin(x / 41 + s) + 6 * Math.sin(x / 17 + s * 2) + 3 * Math.sin(x / 7 + s * 3);
  return layer.base - h - noise * Math.min(1, h / 60);
};

const ridgePath = (layer: Layer) => {
  let d = `M ${X0} ${layer.base + 500}`;
  for (let x = X0; x <= X1; x += 10) d += ` L ${x} ${ridgeY(layer, x).toFixed(1)}`;
  return `${d} L ${X1} ${layer.base + 500} Z`;
};
const PATHS = LAYERS.map(ridgePath);

// 点苔：近山山脊上的墨点
const MOSS = new Array(60)
  .fill(0)
  .map((_, i) => {
    const x = X0 + 300 + random(`moss-x-${i}`) * (X1 - X0 - 500);
    const near = LAYERS[2];
    const height = near.base - ridgeY(near, x);
    return { x, y: ridgeY(near, x) + 4 + random(`moss-y-${i}`) * 10, r: 3 + random(`moss-r-${i}`) * 4, height };
  })
  .filter((m) => m.height > 140);

const MIST = [
  { y: 690, rx: 1100, ry: 46, x: 8300, v: 6 },
  { y: 780, rx: 1300, ry: 60, x: 7600, v: -5 },
  { y: 880, rx: 1500, ry: 90, x: 8100, v: 4 },
];

// 远山：自右向左一层层「画」出来，山脚隐入云雾
export const MountainsSvg: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const edge = interpolate(t, [BEAT.mountains, BEAT.mountains + 9], [X1 + 100, X0 - 300], {
    ...CLAMP,
    easing: theme.ease.inOut,
  });
  const mossIn = interpolate(t, [BEAT.mountains + 7, BEAT.mountains + 10], [0, 1], CLAMP);

  return (
    <g>
      <defs>
        <linearGradient id="mt-reveal-g" gradientUnits="userSpaceOnUse" x1={edge} y1={0} x2={edge + 320} y2={0}>
          <stop offset="0" stopColor="#000" />
          <stop offset="1" stopColor="#fff" />
        </linearGradient>
        <mask id="mt-reveal" maskUnits="userSpaceOnUse" x={X0 - 400} y={-300} width={X1 - X0 + 800} height={1800}>
          <rect x={X0 - 400} y={-300} width={X1 - X0 + 800} height={1800} fill="url(#mt-reveal-g)" />
        </mask>
        <linearGradient id="mt-ends-g" gradientUnits="userSpaceOnUse" x1={X0} y1={0} x2={X1} y2={0}>
          <stop offset="0" stopColor="#000" />
          <stop offset={500 / (X1 - X0)} stopColor="#fff" />
          <stop offset={1 - 350 / (X1 - X0)} stopColor="#fff" />
          <stop offset="1" stopColor="#000" />
        </linearGradient>
        <mask id="mt-ends" maskUnits="userSpaceOnUse" x={X0 - 400} y={-300} width={X1 - X0 + 800} height={1800}>
          <rect x={X0 - 400} y={-300} width={X1 - X0 + 800} height={1800} fill="url(#mt-ends-g)" />
        </mask>
        {LAYERS.map((l, i) => (
          <linearGradient key={i} id={`mt-fade-${i}`} gradientUnits="userSpaceOnUse" x1={0} y1={l.base - 420} x2={0} y2={l.base + 120}>
            <stop offset="0" stopColor="#fff" />
            <stop offset="0.55" stopColor="#fff" stopOpacity={0.85} />
            <stop offset="1" stopColor="#fff" stopOpacity={0} />
          </linearGradient>
        ))}
        {LAYERS.map((l, i) => (
          <mask key={i} id={`mt-fade-m-${i}`} maskUnits="userSpaceOnUse" x={X0 - 100} y={-300} width={X1 - X0 + 200} height={1800}>
            <rect x={X0 - 100} y={-300} width={X1 - X0 + 200} height={1800} fill={`url(#mt-fade-${i})`} />
          </mask>
        ))}
      </defs>
      <g mask="url(#mt-reveal)">
        <g mask="url(#mt-ends)">
        {LAYERS.map((l, i) => (
          <g key={i} mask={`url(#mt-fade-m-${i})`}>
            <path d={PATHS[i]} fill={l.color} opacity={l.opacity} filter={l.filter} />
          </g>
        ))}
        </g>
        <g opacity={mossIn} filter="url(#lb-rough)">
          {MOSS.map((m, i) => (
            <ellipse key={i} cx={m.x} cy={m.y} rx={m.r * 1.3} ry={m.r} fill={theme.color.ink} />
          ))}
        </g>
      </g>
      {/* 山脚的云雾，缓缓流动 */}
      <g filter="url(#lb-cloud)" opacity={interpolate(t, [BEAT.mountains + 2, BEAT.mountains + 8], [0, 1], CLAMP)}>
        {MIST.map((m, i) => (
          <ellipse key={i} cx={m.x + t * m.v} cy={m.y} rx={m.rx} ry={m.ry} fill={theme.color.paper} opacity={0.92} />
        ))}
      </g>
    </g>
  );
};

export const MountainsText: React.FC = () => (
  <Inscription x={7660} y={190} columns={["山画七分，", "三分交给云。"]} start={BEAT.mountains + 6} />
);
