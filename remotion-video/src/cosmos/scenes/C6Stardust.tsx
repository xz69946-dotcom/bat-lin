import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { Sup, TruthCard } from "../components/TruthCard";
import { CLAMP, theme } from "../theme";
import { scene } from "../timeline";

const DUR = scene.stardust;
const STAR = { x: 1350, y: 400 };
const COLLAPSE = 4.2;
const BOOM = 4.6;

// 大质量恒星晚年的「洋葱」分层（由外到内）
const LAYERS = [
  { el: "H", r: 300, c: "#2A4A7A" },
  { el: "He", r: 245, c: "#3E5E8E" },
  { el: "C", r: 195, c: "#8A6A4A" },
  { el: "O", r: 150, c: "#B07A42" },
  { el: "Si", r: 105, c: "#D08A3A" },
  { el: "Fe", r: 60, c: "#E8E0D0" },
];

const DEBRIS = ["C", "N", "O", "Ne", "Mg", "Si", "S", "Ca", "Fe", "Ni", "Au", "U"].flatMap((el, i) =>
  [0, 1].map((j) => ({
    el,
    a: random(`db-a-${i}-${j}`) * Math.PI * 2,
    v: 260 + random(`db-v-${i}-${j}`) * 360,
  })),
);

// 人体元素质量占比（%）：氢来自大爆炸，其余来自恒星
const BODY = [
  { el: "O", pct: 65, fromStar: true },
  { el: "C", pct: 18.5, fromStar: true },
  { el: "H", pct: 9.5, fromStar: false },
  { el: "N", pct: 3.2, fromStar: true },
  { el: "Ca", pct: 1.5, fromStar: true },
  { el: "P", pct: 1.0, fromStar: true },
];
const CHART = { x: 1060, y: 600, w: 600, row: 60 };

// 真理 05：我们由星尘构成。恒星内部层层聚变，超新星把元素撒向宇宙，最终成为我们
export const C6Stardust: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const collapse = interpolate(t, [COLLAPSE, BOOM], [1, 0.55], { ...CLAMP, easing: theme.ease.in });
  const boom = interpolate(t, [BOOM, BOOM + 3], [0, 1], { ...CLAMP, easing: theme.ease.out });
  const flash = interpolate(t, [BOOM, BOOM + 0.1, BOOM + 1], [0, 1, 0], CLAMP);
  const shell = t < BOOM ? 1 : interpolate(t, [BOOM, BOOM + 1.2], [1, 0], CLAMP);
  const chartIn = interpolate(t, [7, 7.8], [0, 1], { ...CLAMP, easing: theme.ease.out });

  return (
    <AbsoluteFill>
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        <defs>
          <radialGradient id="sd-glow">
            <stop offset="0" stopColor={theme.color.sunHot} stopOpacity={0.6} />
            <stop offset="1" stopColor={theme.color.sun} stopOpacity={0} />
          </radialGradient>
        </defs>
        {/* 恒星分层 */}
        <g opacity={shell} transform={`translate(${STAR.x} ${STAR.y}) scale(${collapse + boom * 0.8})`}>
          <circle r={380} fill="url(#sd-glow)" opacity={0.5} />
          {LAYERS.map((l, i) => {
            const k = interpolate(t, [0.4 + i * 0.35, 1.2 + i * 0.35], [0, 1], { ...CLAMP, easing: theme.ease.out });
            return (
              <g key={l.el}>
                <circle r={l.r * k} fill={l.c} opacity={0.85} />
                <circle r={l.r * k} fill="none" stroke={theme.color.bg} strokeWidth={2} />
              </g>
            );
          })}
          {LAYERS.map((l, i) => {
            const next = LAYERS[i + 1]?.r ?? 0;
            const k = interpolate(t, [1.6 + i * 0.35, 2.2 + i * 0.35], [0, 1], CLAMP);
            return (
              <text
                key={`t${l.el}`}
                x={0}
                y={-(l.r + next) / 2 + 10}
                textAnchor="middle"
                fill={i === LAYERS.length - 1 ? theme.color.bg : theme.color.ink}
                fontFamily={theme.font.mono}
                fontSize={26}
                fontWeight={700}
                opacity={k}
              >
                {i === LAYERS.length - 1 ? "Fe" : l.el}
              </text>
            );
          })}
        </g>
        <text
          x={STAR.x}
          y={STAR.y + 350}
          textAnchor="middle"
          fill={theme.color.muted}
          fontFamily={theme.font.body}
          fontSize={26}
          opacity={interpolate(t, [2.4, 3, COLLAPSE, BOOM], [0, 1, 1, 0], CLAMP)}
        >
          聚变到铁为止：铁核坍缩 → 超新星
        </text>
        {/* 冲击波与抛射的元素 */}
        {t > BOOM && (
          <g>
            <circle cx={STAR.x} cy={STAR.y} r={boom * 900} fill="none" stroke={theme.color.sunHot} strokeWidth={6 * (1 - boom) + 1} opacity={1 - boom} />
            {DEBRIS.map((d, i) => {
              const r = 30 + d.v * boom;
              return (
                <text
                  key={i}
                  x={STAR.x + Math.cos(d.a) * r}
                  y={STAR.y + Math.sin(d.a) * r}
                  textAnchor="middle"
                  fill={d.el === "Au" || d.el === "U" ? theme.color.sunHot : theme.color.sun}
                  fontFamily={theme.font.mono}
                  fontSize={30}
                  fontWeight={700}
                  opacity={interpolate(boom, [0, 0.1, 0.75, 1], [0, 1, 1, 0.15]) * (1 - chartIn * 0.7)}
                >
                  {d.el}
                </text>
              );
            })}
          </g>
        )}
        {/* 人体元素构成 */}
        <g opacity={chartIn} transform={`translate(0 ${(1 - chartIn) * 24})`}>
          <text x={CHART.x} y={CHART.y - 34} fill={theme.color.ink} fontFamily={theme.font.body} fontSize={32}>
            人体元素构成（按质量）
          </text>
          {BODY.map((b, i) => {
            const y = CHART.y + i * CHART.row;
            const w = (b.pct / 65) * CHART.w * interpolate(t, [7.6 + i * 0.2, 8.8 + i * 0.2], [0, 1], { ...CLAMP, easing: theme.ease.out });
            const color = b.fromStar ? theme.color.sun : theme.color.star;
            return (
              <g key={b.el}>
                <text x={CHART.x} y={y + 26} fill={color} fontFamily={theme.font.mono} fontSize={30} fontWeight={700}>
                  {b.el}
                </text>
                <rect x={CHART.x + 64} y={y + 4} width={w} height={28} rx={5} fill={color} opacity={0.85} />
                <text x={CHART.x + 78 + w} y={y + 26} fill={theme.color.ink} fontFamily={theme.font.mono} fontSize={26}>
                  {b.pct}%{b.fromStar ? "" : "  ← 大爆炸"}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
      <AbsoluteFill style={{ backgroundColor: theme.color.sunHot, opacity: flash * 0.8 }} />
      <TruthCard
        no="05"
        title="我们由星尘构成"
        equation={
          <>
            3 <Sup>4</Sup>He → <Sup>12</Sup>C
          </>
        }
        facts={["你体内的碳、氧、钙、铁，都诞生于恒星", "比铁更重的元素，多来自超新星与中子星并合", "唯有氢，来自 138 亿年前的大爆炸"]}
        factTimes={[3.2, 6.2, 8.6]}
        duration={DUR}
        accent={theme.color.sun}
      />
    </AbsoluteFill>
  );
};
