import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { TruthCard } from "../components/TruthCard";
import { CLAMP, theme } from "../theme";
import { scene } from "../timeline";

const DUR = scene.entropy;
const BOX = { x: 160, y: 240, w: 800, h: 460 };
const N = 120;
const OPEN = 2.2;

const PARTICLES = new Array(N).fill(0).map((_, i) => {
  const col = i % 10;
  const row = Math.floor(i / 10);
  return {
    sx: BOX.x + 30 + col * ((BOX.w / 2 - 60) / 9),
    sy: BOX.y + 30 + row * ((BOX.h - 60) / 11),
    tx: BOX.x + 20 + random(`en-x-${i}`) * (BOX.w - 40),
    ty: BOX.y + 20 + random(`en-y-${i}`) * (BOX.h - 40),
    ph: random(`en-p-${i}`) * Math.PI * 2,
    sp: 0.5 + random(`en-s-${i}`),
  };
});

const GRAPH = { x: 160, y: 900, w: 800, h: 110 };
const entropyAt = (u: number) => 1 - Math.exp(-u * 3.2);

// 真理 06：熵总在增加。挡板抽走后，整齐排列的粒子自发散开，再也不会自己回去
export const C7Entropy: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const u = interpolate(t, [OPEN, DUR / fps - 1], [0, 1], CLAMP);
  const mix = entropyAt(u);
  const gate = interpolate(t, [OPEN - 0.4, OPEN], [0, 1], { ...CLAMP, easing: theme.ease.inOut });
  const ui = interpolate(t, [0.6, 1.2], [0, 1], CLAMP);

  let curve = "";
  for (let i = 0; i <= 60; i++) {
    const k = (i / 60) * u;
    curve += `${i === 0 ? "M" : "L"} ${GRAPH.x + k * GRAPH.w} ${GRAPH.y - entropyAt(k) * GRAPH.h} `;
  }

  return (
    <AbsoluteFill>
      <svg width={1920} height={1080} style={{ position: "absolute", opacity: ui }}>
        <rect x={BOX.x} y={BOX.y} width={BOX.w} height={BOX.h} rx={8} fill="rgba(143,211,255,0.04)" stroke={theme.color.star} strokeOpacity={0.5} strokeWidth={theme.stroke.thin} />
        {/* 挡板 */}
        <line
          x1={BOX.x + BOX.w / 2}
          y1={BOX.y - gate * BOX.h}
          x2={BOX.x + BOX.w / 2}
          y2={BOX.y + BOX.h - gate * BOX.h}
          stroke={theme.color.ink}
          strokeWidth={theme.stroke.bold}
          opacity={1 - gate}
        />
        {PARTICLES.map((p, i) => {
          const jitter = 4 + 10 * mix;
          const x = p.sx + (p.tx - p.sx) * mix + Math.sin(frame * 0.3 * p.sp + p.ph) * jitter;
          const y = p.sy + (p.ty - p.sy) * mix + Math.cos(frame * 0.27 * p.sp + p.ph * 2) * jitter;
          return <circle key={i} cx={x} cy={y} r={6} fill={theme.color.star} opacity={0.9} />;
        })}
        {/* 熵随时间变化 */}
        <line x1={GRAPH.x} y1={GRAPH.y} x2={GRAPH.x + GRAPH.w} y2={GRAPH.y} stroke={theme.color.muted} strokeWidth={theme.stroke.hair} />
        <line x1={GRAPH.x} y1={GRAPH.y} x2={GRAPH.x} y2={GRAPH.y - GRAPH.h - 10} stroke={theme.color.muted} strokeWidth={theme.stroke.hair} />
        <text x={GRAPH.x - 16} y={GRAPH.y - GRAPH.h + 4} textAnchor="end" fill={theme.color.muted} fontFamily={theme.font.math} fontStyle="italic" fontSize={32}>
          S
        </text>
        <text x={GRAPH.x + GRAPH.w} y={GRAPH.y + 36} textAnchor="end" fill={theme.color.muted} fontFamily={theme.font.body} fontSize={24}>
          时间 →
        </text>
        <path d={curve} fill="none" stroke={theme.color.star} strokeWidth={theme.stroke.thin} />
        <circle cx={GRAPH.x + u * GRAPH.w} cy={GRAPH.y - mix * GRAPH.h} r={7} fill={theme.color.starHot} />
        <text x={BOX.x} y={BOX.y - 24} fill={theme.color.muted} fontFamily={theme.font.body} fontSize={26}>
          {t < OPEN ? "有序：全部在左边" : "无序：自发扩散到整个空间"}
        </text>
      </svg>
      <TruthCard
        no="06"
        title="熵总在增加"
        equation={<>ΔS ≥ 0</>}
        facts={["孤立系统的混乱度，只增不减", "它赋予时间方向：时间之箭", "图中 120 个粒子全部自发回到左侧，概率约 10⁻³⁶"]}
        factTimes={[3, 5.4, 7.6]}
        duration={DUR}
        side="right"
      />
    </AbsoluteFill>
  );
};

