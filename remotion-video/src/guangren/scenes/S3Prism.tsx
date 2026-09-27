import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Camera, SceneShell } from "../components/SceneShell";
import { PoemLine } from "../components/PoemLine";
import { CLAMP, theme } from "../theme";

const TOP = { x: 960, y: 250 };
const BL = { x: 770, y: 579 };
const BR = { x: 1150, y: 579 };
const PERIM = 380 * 3;
const lerp = (a: { x: number; y: number }, b: { x: number; y: number }, k: number) => ({
  x: a.x + (b.x - a.x) * k,
  y: a.y + (b.y - a.y) * k,
});
const ENTRY = lerp(TOP, BL, 0.55);
const EXIT = lerp(TOP, BR, 0.52);
const SOURCE = { x: -40, y: 520 };
const BEAM_LEN = Math.hypot(ENTRY.x - SOURCE.x, ENTRY.y - SOURCE.y);
const INNER_LEN = Math.hypot(EXIT.x - ENTRY.x, EXIT.y - ENTRY.y);
const RAY_LEN = 1100;

// 02 折射：一束白光穿过棱镜，被折弯、被分解，却没有断
export const S3Prism: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const spread = interpolate(t, [3.8, 6, 11, 13], [0.4, 1, 1, 1.25], {
    ...CLAMP,
    easing: theme.ease.inOut,
  });
  const pulse = 0.85 + 0.15 * Math.sin(frame / 9);

  return (
    <SceneShell chapter={{ no: "02", name: "折射" }} background={theme.color.bg}>
      <Camera from={1} to={1.08} origin={`${EXIT.x}px ${EXIT.y}px`}>
        <svg width={1920} height={1080} style={{ position: "absolute" }}>
          <defs>
            <filter id="pr-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation={8} />
            </filter>
            <linearGradient id="pr-face" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#FFFFFF" stopOpacity={0.1} />
              <stop offset="1" stopColor="#FFFFFF" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          {/* 入射白光 */}
          {[16, 4].map((w, i) => (
            <line
              key={i}
              x1={SOURCE.x}
              y1={SOURCE.y}
              x2={ENTRY.x}
              y2={ENTRY.y}
              stroke={theme.color.lightHot}
              strokeWidth={w}
              strokeLinecap="round"
              filter={i === 0 ? "url(#pr-glow)" : undefined}
              opacity={i === 0 ? 0.6 : 1}
              strokeDasharray={BEAM_LEN}
              strokeDashoffset={interpolate(t, [2, 3.3], [BEAM_LEN, 0], {
                ...CLAMP,
                easing: theme.ease.inOut,
              })}
            />
          ))}
          {/* 棱镜内部 */}
          <line
            x1={ENTRY.x}
            y1={ENTRY.y}
            x2={EXIT.x}
            y2={EXIT.y}
            stroke={theme.color.lightHot}
            strokeWidth={6}
            opacity={0.7}
            strokeDasharray={INNER_LEN}
            strokeDashoffset={interpolate(t, [3.3, 3.8], [INNER_LEN, 0], CLAMP)}
          />
          {/* 光谱 */}
          {theme.color.spectrum.map((c, i) => {
            const angle = ((-4 + i * 4.2) * spread * Math.PI) / 180 + 0.08;
            const x2 = EXIT.x + Math.cos(angle) * RAY_LEN;
            const y2 = EXIT.y + Math.sin(angle) * RAY_LEN;
            const offset = interpolate(
              t,
              [3.8 + i * 0.07, 5.4 + i * 0.07],
              [RAY_LEN, 0],
              { ...CLAMP, easing: theme.ease.out },
            );
            return (
              <g key={c}>
                <line
                  x1={EXIT.x}
                  y1={EXIT.y}
                  x2={x2}
                  y2={y2}
                  stroke={c}
                  strokeWidth={22}
                  opacity={0.35 * pulse}
                  filter="url(#pr-glow)"
                  strokeDasharray={RAY_LEN}
                  strokeDashoffset={offset}
                />
                <line
                  x1={EXIT.x}
                  y1={EXIT.y}
                  x2={x2}
                  y2={y2}
                  stroke={c}
                  strokeWidth={theme.stroke.beam * 0.6}
                  strokeLinecap="round"
                  strokeDasharray={RAY_LEN}
                  strokeDashoffset={offset}
                />
              </g>
            );
          })}
          {/* 棱镜 */}
          <polygon
            points={`${TOP.x},${TOP.y} ${BR.x},${BR.y} ${BL.x},${BL.y}`}
            fill="url(#pr-face)"
            opacity={interpolate(t, [1.4, 2.4], [0, 1], CLAMP)}
          />
          <polygon
            points={`${TOP.x},${TOP.y} ${BR.x},${BR.y} ${BL.x},${BL.y}`}
            fill="none"
            stroke={theme.color.ink}
            strokeWidth={theme.stroke.thin}
            strokeLinejoin="round"
            strokeDasharray={PERIM}
            strokeDashoffset={interpolate(t, [0.8, 2.3], [PERIM, 0], {
              ...CLAMP,
              easing: theme.ease.inOut,
            })}
          />
        </svg>
      </Camera>
      <PoemLine
        text="光会被折弯"
        start={5.8}
        end={8.8}
        y={790}
        align="center"
        en="Light can be bent,"
      />
      <PoemLine
        text="但从不折断"
        start={9.3}
        end={13.6}
        y={790}
        align="center"
        highlight="从不折断"
        en="but it never breaks."
      />
    </SceneShell>
  );
};
