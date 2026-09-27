import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Camera, Glow, SceneShell } from "../components/SceneShell";
import { PoemLine } from "../components/PoemLine";
import { CLAMP, theme } from "../theme";

type P = [number, number];

const C1: P[] = [
  [820, 270],
  [860, 400],
  [850, 430],
  [840, 470],
  [900, 560],
  [930, 690],
];
const C2: P[] = [
  [1100, 270],
  [1060, 390],
  [1075, 420],
  [1090, 450],
  [1030, 540],
  [1050, 690],
];
const C3: P[] = [
  [850, 430],
  [930, 452],
  [990, 418],
  [1075, 420],
];

const pts = (p: P[]) => p.map(([x, y]) => `${x},${y}`).join(" ");
const toD = (p: P[]) => p.map(([x, y], i) => `${i ? "L" : "M"}${x} ${y}`).join(" ");
const lengthOf = (p: P[]) =>
  p.reduce((a, [x, y], i) => (i ? a + Math.hypot(x - p[i - 1][0], y - p[i - 1][1]) : 0), 0);

// 四块碎片：由三条裂纹切分
const FRAGMENTS: { poly: string; dx: number; dy: number; rot: number }[] = [
  { poly: `640,270 ${pts(C1)} 640,690`, dx: -46, dy: 10, rot: -5 },
  { poly: `${pts(C1.slice(0, 3))} ${pts(C3.slice(1))} ${pts([...C2.slice(0, 3)].reverse())}`, dx: 4, dy: -48, rot: 3 },
  {
    poly: `${pts(C1.slice(2))} ${pts([...C2.slice(2)].reverse())} ${pts([...C3].reverse().slice(1, 3))}`,
    dx: -4,
    dy: 38,
    rot: -2,
  },
  { poly: `1280,270 ${pts(C2)} 1280,690`, dx: 48, dy: 6, rot: 5 },
];

const CRACKS = [C1, C2, C3].map((c) => ({ d: toD(c), len: lengthOf(c) }));

const BOWL =
  "M 700 330 C 700 520, 820 600, 900 610 L 900 640 L 1020 640 L 1020 610 C 1100 600, 1220 520, 1220 330 Z";

const Bowl: React.FC<{ rim: number }> = ({ rim }) => (
  <g>
    <path d={BOWL} fill="url(#ks-body)" />
    <path
      d="M 740 360 C 760 480, 820 560, 880 585"
      stroke="#FFFFFF"
      strokeOpacity={0.08}
      strokeWidth={14}
      strokeLinecap="round"
      fill="none"
    />
    <ellipse cx={960} cy={330} rx={260} ry={38} fill="#0E1016" />
    <ellipse
      cx={960}
      cy={330}
      rx={260}
      ry={38}
      fill="none"
      stroke={theme.color.light}
      strokeOpacity={rim}
      strokeWidth={theme.stroke.thin}
    />
  </g>
);

// 06 金缮：碎过的地方，会以金色愈合
export const S7Kintsugi: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const sep =
    interpolate(t, [3.1, 4.4], [0, 1], { ...CLAMP, easing: theme.ease.out }) -
    interpolate(t, [5.8, 7.4], [0, 1], { ...CLAMP, easing: theme.ease.inOut });
  const hover = Math.sin(frame / 20) * 6;
  const crackLines = interpolate(t, [2.4, 3.1], [1, 0], CLAMP);
  const gold = interpolate(t, [7.2, 9], [1, 0], { ...CLAMP, easing: theme.ease.inOut });
  const goldOn = interpolate(t, [7.2, 7.5], [0, 1], CLAMP);
  const rim = interpolate(t, [8.6, 10], [0, 0.8], CLAMP);

  return (
    <SceneShell
      chapter={{ no: "06", name: "金缮" }}
      background={`radial-gradient(ellipse at 50% 20%, #1E1A18 0%, #0A090C 60%)`}
    >
      <Camera from={1} to={1.07} origin="50% 45%">
        <Glow x={960} y={430} r={520} opacity={interpolate(t, [8, 11], [0, 0.35], CLAMP)} />
        <svg width={1920} height={1080} style={{ position: "absolute" }}>
          <defs>
            <linearGradient id="ks-body" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#3A4050" />
              <stop offset="1" stopColor="#14171F" />
            </linearGradient>
            <filter id="ks-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation={7} />
            </filter>
            <clipPath id="ks-bowl">
              <path d={BOWL} />
              <ellipse cx={960} cy={330} rx={260} ry={38} />
            </clipPath>
            {FRAGMENTS.map((f, i) => (
              <clipPath key={i} id={`ks-frag-${i}`}>
                <polygon points={f.poly} />
              </clipPath>
            ))}
          </defs>
          <ellipse cx={960} cy={662} rx={260} ry={22} fill="#000000" opacity={0.5} />
          <g transform={`translate(0 ${hover - 40})`}>
            {FRAGMENTS.map((f, i) => (
              <g
                key={i}
                transform={`translate(${f.dx * sep} ${f.dy * sep}) rotate(${f.rot * sep} 960 470)`}
              >
                <g clipPath={`url(#ks-frag-${i})`}>
                  <Bowl rim={rim} />
                </g>
              </g>
            ))}
            {/* 碎裂瞬间的暗色裂纹 */}
            <g opacity={t < 3.2 ? 1 : 0} clipPath="url(#ks-bowl)">
              {CRACKS.map((c, i) => (
                <path
                  key={i}
                  d={c.d}
                  stroke="#05060A"
                  strokeWidth={4}
                  fill="none"
                  strokeDasharray={c.len}
                  strokeDashoffset={c.len * crackLines}
                />
              ))}
            </g>
            {/* 金色愈合线 */}
            <g opacity={goldOn} clipPath="url(#ks-bowl)">
              {CRACKS.map((c, i) => (
                <g key={i}>
                  <path
                    d={c.d}
                    stroke={theme.color.light}
                    strokeWidth={14}
                    fill="none"
                    filter="url(#ks-glow)"
                    opacity={0.7}
                    strokeDasharray={c.len}
                    strokeDashoffset={c.len * gold}
                  />
                  <path
                    d={c.d}
                    stroke={theme.color.lightHot}
                    strokeWidth={5}
                    strokeLinejoin="round"
                    fill="none"
                    strokeDasharray={c.len}
                    strokeDashoffset={c.len * gold}
                  />
                </g>
              ))}
            </g>
          </g>
        </svg>
      </Camera>
      <PoemLine text="碎过的地方" start={4.4} end={12.6} y={680} align="center" size={96} />
      <PoemLine
        text="会以金色愈合"
        en="What was broken heals in gold."
        start={9.2}
        end={12.8}
        y={800}
        align="center"
        size={96}
        highlight="金色"
      />
    </SceneShell>
  );
};
