import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { Sup, TruthCard } from "../components/TruthCard";
import { CLAMP, theme } from "../theme";
import { scene } from "../timeline";

const DUR = scene.energy;
const CORE = { x: 600, y: 380 };
const MERGE = 3.4;

const PROTONS = [
  { sx: -330, sy: -220 },
  { sx: 340, sy: -200 },
  { sx: -300, sy: 230 },
  { sx: 320, sy: 210 },
];
// 氦-4 核：2 个质子 + 2 个中子
const HELIUM = [
  { dx: -17, dy: -17, p: true },
  { dx: 17, dy: 17, p: true },
  { dx: 17, dy: -17, p: false },
  { dx: -17, dy: 17, p: false },
];
const PHOTONS = new Array(16).fill(0).map((_, i) => ({
  a: (i / 16) * Math.PI * 2 + random(`ph-${i}`) * 0.3,
  v: 380 + random(`phv-${i}`) * 260,
}));

const Nucleon: React.FC<{ x: number; y: number; p: boolean; r?: number }> = ({ x, y, p, r = 22 }) => (
  <g>
    <circle cx={x} cy={y} r={r} fill={p ? "#FF7A59" : "#A9B1C6"} />
    <circle cx={x - r * 0.3} cy={y - r * 0.3} r={r * 0.35} fill="#FFFFFF" opacity={0.35} />
    <text x={x} y={y + 8} textAnchor="middle" fill={theme.color.bg} fontFamily={theme.font.mono} fontSize={22} fontWeight={700}>
      {p ? "p" : "n"}
    </text>
  </g>
);

// 真理 04：质量即能量。四个氢核在太阳核心聚变为一个氦核，丢失的 0.7% 质量化为光
export const C5Energy: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const approach = interpolate(t, [0.6, MERGE], [0, 1], { ...CLAMP, easing: theme.ease.in });
  const merged = t >= MERGE;
  const burst = interpolate(t, [MERGE, MERGE + 2.2], [0, 1], { ...CLAMP, easing: theme.ease.out });
  const flash = interpolate(t, [MERGE, MERGE + 0.1, MERGE + 0.8], [0, 1, 0], CLAMP);
  const scaleIn = interpolate(t, [5.4, 6.4], [0, 1], { ...CLAMP, easing: theme.ease.out });
  const tilt = interpolate(t, [6.6, 8], [0, -6], { ...CLAMP, easing: theme.ease.out });

  const beam = { x: CORE.x, y: 760, half: 250 };
  const rad = (tilt * Math.PI) / 180;
  // 左盘（4 个氢核）更重，向下沉
  const leftY = beam.y - Math.sin(rad) * beam.half;
  const rightY = beam.y + Math.sin(rad) * beam.half;

  return (
    <AbsoluteFill>
      {/* 恒星核心的等离子体 */}
      <AbsoluteFill
        style={{
          opacity: interpolate(t, [0, 0.8], [0.6, 1], CLAMP),
          background: `radial-gradient(ellipse at 32% 40%, rgba(255,184,107,0.32) 0%, rgba(224,120,46,0.16) 35%, rgba(3,4,10,0) 70%)`,
        }}
      />
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        {/* 聚变 */}
        {!merged &&
          PROTONS.map((p, i) => {
            const wob = Math.sin(frame / 5 + i * 2) * 10 * (1 - approach);
            return <Nucleon key={i} x={CORE.x + p.sx * (1 - approach) + wob} y={CORE.y + p.sy * (1 - approach) - wob} p />;
          })}
        {merged && (
          <g>
            {PHOTONS.map((ph, i) => {
              const r = 40 + ph.v * burst;
              const x = CORE.x + Math.cos(ph.a) * r;
              const y = CORE.y + Math.sin(ph.a) * r;
              let d = `M ${x - Math.cos(ph.a) * 50} ${y - Math.sin(ph.a) * 50}`;
              for (let k = 1; k <= 10; k++) {
                const along = -50 + k * 5;
                const off = Math.sin(k * 1.6 + frame / 2) * 6;
                d += ` L ${x + Math.cos(ph.a) * along - Math.sin(ph.a) * off} ${y + Math.sin(ph.a) * along + Math.cos(ph.a) * off}`;
              }
              return (
                <path key={i} d={d} fill="none" stroke={theme.color.sunHot} strokeWidth={theme.stroke.thin} opacity={1 - burst} />
              );
            })}
            <circle cx={CORE.x} cy={CORE.y} r={60 + burst * 380} fill="none" stroke={theme.color.sunHot} strokeWidth={4} opacity={1 - burst} />
            {HELIUM.map((h, i) => (
              <Nucleon key={i} x={CORE.x + h.dx} y={CORE.y + h.dy} p={h.p} />
            ))}
            <text x={CORE.x} y={CORE.y + 86} textAnchor="middle" fill={theme.color.sunHot} fontFamily={theme.font.mono} fontSize={26} opacity={burst}>
              ⁴He
            </text>
          </g>
        )}
        <text
          x={CORE.x}
          y={CORE.y + 230}
          textAnchor="middle"
          fill={theme.color.ink}
          fontFamily={theme.font.mono}
          fontSize={30}
          opacity={interpolate(t, [MERGE + 0.6, MERGE + 1.4], [0, 1], CLAMP)}
        >
          4 ¹H → ⁴He + 2e⁺ + 2ν + 26.7 MeV
        </text>
        {/* 质量天平 */}
        <g opacity={scaleIn}>
          <polygon points={`${beam.x - 18},${beam.y + 120} ${beam.x + 18},${beam.y + 120} ${beam.x},${beam.y}`} fill={theme.color.muted} />
          <line x1={beam.x - beam.half} y1={leftY} x2={beam.x + beam.half} y2={rightY} stroke={theme.color.ink} strokeWidth={4} strokeLinecap="round" />
          {[
            { x: beam.x - beam.half, y: leftY, label: "4 × ¹H", mass: "4.0313 u" },
            { x: beam.x + beam.half, y: rightY, label: "⁴He", mass: "4.0026 u" },
          ].map((pan, i) => (
            <g key={i}>
              <line x1={pan.x} y1={pan.y} x2={pan.x} y2={pan.y + 36} stroke={theme.color.muted} strokeWidth={theme.stroke.hair} />
              <path d={`M ${pan.x - 80} ${pan.y + 36} Q ${pan.x} ${pan.y + 76} ${pan.x + 80} ${pan.y + 36} Z`} fill="rgba(255,184,107,0.18)" stroke={theme.color.sun} strokeWidth={theme.stroke.hair} />
              <text x={pan.x} y={pan.y - 44} textAnchor="middle" fill={theme.color.ink} fontFamily={theme.font.mono} fontSize={28}>
                {pan.label}
              </text>
              <text x={pan.x} y={pan.y - 12} textAnchor="middle" fill={theme.color.sun} fontFamily={theme.font.mono} fontSize={24}>
                {pan.mass}
              </text>
            </g>
          ))}
          <text
            x={beam.x}
            y={beam.y + 170}
            textAnchor="middle"
            fill={theme.color.sunHot}
            fontFamily={theme.font.body}
            fontSize={30}
            opacity={interpolate(t, [8, 8.8], [0, 1], CLAMP)}
          >
            少了 0.7% → 全部化为能量
          </text>
        </g>
      </svg>
      <AbsoluteFill style={{ backgroundColor: theme.color.sunHot, opacity: flash * 0.7 }} />
      <TruthCard
        no="04"
        title="质量即能量"
        equation={
          <>
            E = mc<Sup>2</Sup>
          </>
        }
        equationSize={110}
        facts={["太阳每秒把约 400 万吨质量化为光和热", "氢聚变为氦，约 0.7% 的质量变成能量", "1 克物质 ≈ 9 × 10¹³ 焦耳"]}
        factTimes={[4.2, 7.4, 9.2]}
        duration={DUR}
        side="right"
        accent={theme.color.sun}
      />
    </AbsoluteFill>
  );
};
