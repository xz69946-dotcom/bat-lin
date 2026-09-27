import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { TruthCard } from "../components/TruthCard";
import { CLAMP, theme } from "../theme";
import { scene } from "../timeline";

const DUR = scene.quantum;
const CX = 1400;
const UNIT = 115; // 每个单位的像素
const H = 190;
const PLOTS = { x: 470, p: 850 }; // 两个坐标系的基线 y

// 背景：氢原子基态电子云（按径向概率采样的点）
const CLOUD = new Array(260).fill(0).map((_, i) => {
  const u = random(`cl-u-${i}`);
  const r = -Math.log(1 - u * 0.98) * 70;
  const a = random(`cl-a-${i}`) * Math.PI * 2;
  return { x: Math.cos(a) * r, y: Math.sin(a) * r, tw: random(`cl-t-${i}`) * 6 };
});

const curve = (f: (v: number) => number, base: number) => {
  let d = "";
  for (let i = 0; i <= 160; i++) {
    const v = -3.2 + (i / 160) * 6.4;
    d += `${i === 0 ? "M" : "L"} ${(CX + v * UNIT).toFixed(1)} ${(base - f(v)).toFixed(1)} `;
  }
  return d;
};

const Bracket: React.FC<{ half: number; y: number; label: string; color: string }> = ({ half, y, label, color }) => (
  <g>
    <line x1={CX - half} y1={y} x2={CX + half} y2={y} stroke={color} strokeWidth={theme.stroke.thin} />
    <line x1={CX - half} y1={y - 10} x2={CX - half} y2={y + 10} stroke={color} strokeWidth={theme.stroke.thin} />
    <line x1={CX + half} y1={y - 10} x2={CX + half} y2={y + 10} stroke={color} strokeWidth={theme.stroke.thin} />
    <text x={CX} y={y + 38} textAnchor="middle" fill={color} fontFamily={theme.font.math} fontStyle="italic" fontSize={32}>
      {label}
    </text>
  </g>
);

// 真理 07：不确定性原理。把粒子的位置压得越窄，它的动量就摊得越开，乘积永远不小于 ħ/2
export const C8Quantum: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const sx = interpolate(t, [1.6, 4.8, 7, 9.6], [1, 0.3, 0.3, 0.75], { ...CLAMP, easing: theme.ease.inOut });
  const sp = 1 / (2 * sx); // ħ = 1 时的高斯最小不确定度
  const ui = interpolate(t, [0.6, 1.4], [0, 1], CLAMP);
  const k0 = 7;

  const px = (v: number) => H * (0.3 / sx) * Math.exp(-(v * v) / (2 * sx * sx));
  const re = (v: number) => H * 0.55 * Math.sqrt(0.3 / sx) * Math.exp(-(v * v) / (4 * sx * sx)) * Math.cos(k0 * v - frame / 3);
  const pp = (v: number) => H * (0.3 / sp) * 1.6 * Math.exp(-(v * v) / (2 * sp * sp));

  return (
    <AbsoluteFill>
      <svg width={1920} height={1080} style={{ position: "absolute", opacity: ui }}>
        <g transform={`translate(${CX} 560)`} opacity={0.35}>
          {CLOUD.map((c, i) => (
            <circle key={i} cx={c.x * 2.2} cy={c.y * 2.2} r={1.6} fill={theme.color.dark} opacity={0.4 + 0.4 * Math.sin(frame / 6 + c.tw)} />
          ))}
        </g>
        {(["x", "p"] as const).map((axis) => (
          <g key={axis}>
            <line x1={CX - 3.3 * UNIT} y1={PLOTS[axis]} x2={CX + 3.3 * UNIT} y2={PLOTS[axis]} stroke={theme.color.muted} strokeWidth={theme.stroke.hair} />
            <text x={CX + 3.3 * UNIT} y={PLOTS[axis] + 34} textAnchor="end" fill={theme.color.muted} fontFamily={theme.font.body} fontSize={24}>
              {axis === "x" ? "位置 x" : "动量 p"}
            </text>
          </g>
        ))}
        {/* 位置：波函数与概率密度 */}
        <path d={curve(re, PLOTS.x)} fill="none" stroke={theme.color.dark} strokeWidth={theme.stroke.hair + 0.5} opacity={0.8} />
        <path d={`${curve(px, PLOTS.x)} L ${CX + 3.2 * UNIT} ${PLOTS.x} L ${CX - 3.2 * UNIT} ${PLOTS.x} Z`} fill="rgba(143,211,255,0.18)" stroke={theme.color.star} strokeWidth={theme.stroke.thin} />
        <Bracket half={sx * UNIT} y={PLOTS.x + 60} label="Δx" color={theme.color.star} />
        {/* 动量分布 */}
        <path d={`${curve(pp, PLOTS.p)} L ${CX + 3.2 * UNIT} ${PLOTS.p} L ${CX - 3.2 * UNIT} ${PLOTS.p} Z`} fill="rgba(155,140,255,0.2)" stroke={theme.color.dark} strokeWidth={theme.stroke.thin} />
        <Bracket half={Math.min(3.2, sp) * UNIT} y={PLOTS.p + 60} label="Δp" color={theme.color.dark} />
      </svg>
      {/* 读数：两者此消彼长，乘积不变 */}
      <div
        style={{
          position: "absolute",
          right: 130,
          top: 150,
          padding: "16px 24px",
          borderRadius: 10,
          border: `1px solid ${theme.color.faint}`,
          background: "rgba(3,4,10,0.7)",
          fontFamily: theme.font.mono,
          fontSize: 28,
          lineHeight: 1.6,
          color: theme.color.ink,
          opacity: interpolate(t, [2, 2.8], [0, 1], CLAMP),
        }}
      >
        <div>
          <span style={{ color: theme.color.star }}>Δx</span> = {sx.toFixed(2)}
          <span style={{ color: theme.color.muted }}>{"   "}</span>
          <span style={{ color: theme.color.dark }}>Δp</span> = {sp.toFixed(2)}
        </div>
        <div>
          Δx·Δp = <span style={{ color: theme.color.starHot }}>{(sx * sp).toFixed(2)} ħ</span>
        </div>
      </div>
      <TruthCard
        no="07"
        title="不确定性原理"
        equation={<>Δx · Δp ≥ ħ/2</>}
        facts={["位置越确定，动量就越不确定", "这不是仪器不够精密，而是自然本身的性质", "海森堡，1927"]}
        factTimes={[3, 6, 8.4]}
        duration={DUR}
        accent={theme.color.dark}
      />
    </AbsoluteFill>
  );
};
