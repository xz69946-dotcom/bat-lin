import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Sub, Sup, TruthCard } from "../components/TruthCard";
import { CLAMP, theme } from "../theme";
import { scene } from "../timeline";

const DUR = scene.gravity;
export const WELL = { x: 1420, y: 470 };
const HALF_W = 560;
const HALF_D = 420;
const SIGMA = 210;
const LINES = 17;

// 斜投影的时空平面：Z 越大越靠近观众；质量把平面压出一个「井」
const project = (X: number, Z: number, depth: number) => {
  const well = depth * Math.exp(-(X * X + Z * Z) / (SIGMA * SIGMA));
  return { x: WELL.x + X, y: WELL.y + Z * 0.42 + well };
};

const gridLine = (fixed: number, alongX: boolean, depth: number) => {
  let d = "";
  for (let i = 0; i <= 48; i++) {
    const k = -1 + (i / 48) * 2;
    const X = alongX ? k * HALF_W : fixed * HALF_W;
    const Z = alongX ? fixed * HALF_D : k * HALF_D;
    const p = project(X, Z, depth);
    d += `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)} `;
  }
  return d;
};

// 真理 03：引力是时空的弯曲。恒星压弯时空，行星沿弯曲的时空绕行，星光也被偏折
export const C4Gravity: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const depth = interpolate(t, [1.2, 4], [0, 190], { ...CLAMP, easing: theme.ease.inOut });
  const massIn = interpolate(t, [1, 2.2], [0, 1], { ...CLAMP, easing: theme.ease.out });
  const orbitIn = interpolate(t, [3.6, 4.6], [0, 1], CLAMP);
  const theta = t * 1.25;
  const RO = 270;
  const PX = Math.cos(theta) * RO;
  const PZ = Math.sin(theta) * RO;
  const planet = project(PX, PZ, depth);
  const behind = PZ < 0;
  const ray = interpolate(t, [6.6, 8.6], [1, 0], { ...CLAMP, easing: theme.ease.inOut });

  const core = { x: WELL.x, y: WELL.y + depth - 34 };
  const orbitPath = new Array(61)
    .fill(0)
    .map((_, i) => {
      const a = (i / 60) * Math.PI * 2;
      const p = project(Math.cos(a) * RO, Math.sin(a) * RO, depth);
      return `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
    })
    .join(" ");

  const Planet = (
    <g opacity={orbitIn}>
      <circle cx={planet.x} cy={planet.y - 14} r={26} fill={theme.color.star} opacity={0.18} />
      <circle cx={planet.x} cy={planet.y - 14} r={13} fill="#5FA8E8" />
    </g>
  );

  return (
    <AbsoluteFill>
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        <defs>
          <radialGradient id="gv-core">
            <stop offset="0" stopColor={theme.color.sunHot} />
            <stop offset="0.5" stopColor={theme.color.sun} />
            <stop offset="1" stopColor={theme.color.sun} stopOpacity={0} />
          </radialGradient>
          <linearGradient id="gv-fade" x1="0" x2="1">
            <stop offset="0" stopColor="#fff" stopOpacity={0} />
            <stop offset="0.12" stopColor="#fff" stopOpacity={1} />
          </linearGradient>
          <mask id="gv-mask">
            <rect x={880} y={0} width={1040} height={1080} fill="url(#gv-fade)" />
          </mask>
        </defs>
        <g mask="url(#gv-mask)">
          {new Array(LINES).fill(0).map((_, i) => {
            const f = -1 + (i / (LINES - 1)) * 2;
            return (
              <g key={i}>
                <path d={gridLine(f, true, depth)} fill="none" stroke={theme.color.star} strokeOpacity={0.28} strokeWidth={1.2} />
                <path d={gridLine(f, false, depth)} fill="none" stroke={theme.color.star} strokeOpacity={0.28} strokeWidth={1.2} />
              </g>
            );
          })}
          <path d={orbitPath} fill="none" stroke={theme.color.ink} strokeOpacity={0.35 * orbitIn} strokeDasharray="6 10" strokeWidth={theme.stroke.hair} />
          {behind && Planet}
          <circle cx={core.x} cy={core.y} r={110 * massIn} fill="url(#gv-core)" opacity={0.6} />
          <circle cx={core.x} cy={core.y} r={40 * massIn} fill={theme.color.sunHot} />
          {!behind && Planet}
          {/* 星光偏折：真实路径（实线）与看起来的方向（虚线） */}
          <g opacity={interpolate(t, [6.4, 6.8], [0, 1], CLAMP)}>
            <path
              d={`M 1860 300 C 1700 330, 1560 ${core.y - 190}, 1400 ${core.y - 130} S 1120 ${core.y + 170}, 1000 880`}
              fill="none"
              stroke={theme.color.starHot}
              strokeWidth={theme.stroke.thin}
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={ray}
            />
            <line
              x1={1000}
              y1={880}
              x2={1600}
              y2={150}
              stroke={theme.color.starHot}
              strokeWidth={theme.stroke.hair}
              strokeDasharray="6 10"
              opacity={interpolate(t, [8.4, 9], [0, 0.6], CLAMP)}
            />
            <circle cx={1860} cy={300} r={6} fill={theme.color.starHot} />
            <circle cx={1000} cy={880} r={8} fill="#5FA8E8" />
            <text x={1860} y={350} textAnchor="end" fill={theme.color.muted} fontFamily={theme.font.body} fontSize={24}>
              遥远的恒星
            </text>
            <text
              x={1590}
              y={150}
              textAnchor="end"
              fill={theme.color.muted}
              fontFamily={theme.font.body}
              fontSize={24}
              opacity={interpolate(t, [8.6, 9.2], [0, 1], CLAMP)}
            >
              我们看到的位置
            </text>
          </g>
        </g>
      </svg>
      <TruthCard
        no="03"
        title="引力即时空弯曲"
        equation={
          <>
            G<Sub>μν</Sub> = 8πG/c<Sup>4</Sup> · T<Sub>μν</Sub>
          </>
        }
        equationSize={72}
        facts={["物质弯曲时空，时空引导物质运动", "1919 年日食：星光偏折得到证实", "GPS 时钟每天需修正约 38 微秒"]}
        factTimes={[3.4, 6.8, 9]}
        duration={DUR}
      />
    </AbsoluteFill>
  );
};
