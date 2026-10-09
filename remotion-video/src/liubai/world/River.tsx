import React from "react";
import { interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { BEAT } from "../timeline";
import { CLAMP, theme } from "../theme";
import { Inscription } from "./Inscription";

// 江面只有寥寥几道水纹，其余全是空白——空白本身就是水
const STROKES = new Array(18).fill(0).map((_, i) => ({
  x: 4750 + random(`wv-x-${i}`) * 2150,
  y: 770 + random(`wv-y-${i}`) * 220,
  len: 110 + random(`wv-l-${i}`) * 300,
  ph: random(`wv-p-${i}`) * Math.PI * 2,
  delay: random(`wv-d-${i}`) * 3.5,
  o: 0.25 + random(`wv-o-${i}`) * 0.35,
}));

// 对岸的远山，极淡
const SHORE: [number, number, number][] = [
  [4900, 70, 160],
  [5150, 95, 140],
  [5380, 55, 150],
];
const shoreY = (x: number) =>
  700 - SHORE.reduce((a, [px, h, w]) => a + h * Math.exp(-(((x - px) / w) ** 2)), 0) - 3 * Math.sin(x / 23);
let SHORE_D = `M 4650 720`;
for (let x = 4650; x <= 5650; x += 10) SHORE_D += ` L ${x} ${shoreY(x).toFixed(1)}`;
SHORE_D += " L 5650 720 Z";

const Boat: React.FC<{ reflection?: boolean }> = ({ reflection }) => (
  <g opacity={reflection ? 0.14 : 1}>
    <path d="M -86 -4 Q 0 6 88 -12 Q 70 4 58 10 Q 0 24 -64 12 Q -80 6 -86 -4 Z" fill={theme.color.ink} />
    <path d="M -26 -2 Q 0 -44 30 -6 Z" fill={theme.color.inkMid} />
    <path d="M -70 -26 L -57 -42 L -44 -26 Z" fill={theme.color.ink} />
    <line x1={-57} y1={-26} x2={-57} y2={-4} stroke={theme.color.ink} strokeWidth={7} strokeLinecap="round" />
    <line x1={-52} y1={-16} x2={-108} y2={22} stroke={theme.color.ink} strokeWidth={3} strokeLinecap="round" />
  </g>
);

// 一叶扁舟自右向左缓缓渡江
export const RiverSvg: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const boatX = interpolate(t, [BEAT.river, BEAT.river + 22], [6800, 5100], CLAMP);
  const boatY = 815 + Math.sin(t * 1.3) * 3;
  const tilt = Math.sin(t * 1.1) * 1.6;
  const boatIn = interpolate(t, [BEAT.river - 1, BEAT.river + 1.5], [0, 1], CLAMP);

  return (
    <g>
      <path
        d={SHORE_D}
        fill={theme.color.inkLight}
        opacity={0.3 * interpolate(t, [BEAT.river + 4, BEAT.river + 8], [0, 1], CLAMP)}
        filter="url(#lb-soft)"
      />
      <g filter="url(#lb-rough)">
        {STROKES.map((s, i) => {
          const p = interpolate(t, [BEAT.river + s.delay, BEAT.river + s.delay + 1.6], [0, 1], {
            ...CLAMP,
            easing: theme.ease.out,
          });
          if (p <= 0) return null;
          const sway = Math.sin(t * 0.8 + s.ph) * 14;
          const x0 = s.x + sway;
          const x1 = x0 + s.len * p;
          const y = s.y + Math.sin(t * 1.2 + s.ph) * 2;
          const mid = (x0 + x1) / 2;
          return (
            <path
              key={i}
              d={`M ${x0} ${y} Q ${mid} ${y - 3.2} ${x1} ${y} Q ${mid} ${y + 3.2} ${x0} ${y} Z`}
              fill={theme.color.ink}
              opacity={s.o}
            />
          );
        })}
      </g>
      <g opacity={boatIn}>
        {/* 船尾的水痕 */}
        {[0, 1, 2].map((k) => (
          <path
            key={k}
            d={`M ${boatX + 90 + k * 50} ${boatY + 12 + k * 4} q 30 ${4 + k * 2} 70 ${2 + k * 3}`}
            stroke={theme.color.ink}
            strokeWidth={2}
            fill="none"
            opacity={0.35 - k * 0.1}
          />
        ))}
        <g transform={`translate(${boatX} ${boatY + 26}) scale(1 -0.55)`} filter="url(#lb-rough)">
          <Boat reflection />
        </g>
        <g transform={`translate(${boatX} ${boatY}) rotate(${tilt})`}>
          <Boat />
        </g>
      </g>
    </g>
  );
};

export const RiverText: React.FC = () => (
  <Inscription x={5640} y={230} columns={["水，从不画；", "留白处，便是江河。"]} start={BEAT.river + 5} />
);
