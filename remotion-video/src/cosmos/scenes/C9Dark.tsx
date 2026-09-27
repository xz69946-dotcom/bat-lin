import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { Sub, TruthCard } from "../components/TruthCard";
import { CLAMP, theme } from "../theme";
import { scene } from "../timeline";

const DUR = scene.dark;
const DONUT = { x: 560, y: 470, r: 210, w: 56 };

// Planck 2018：暗能量 68.3%，暗物质 26.8%，普通物质 4.9%
const PARTS = [
  { name: "暗能量", pct: 68.3, color: theme.color.dark },
  { name: "暗物质", pct: 26.8, color: theme.color.darkDeep },
  { name: "普通物质", pct: 4.9, color: theme.color.star },
];

// 宇宙网：节点与纤维状结构
const NODES = new Array(70).fill(0).map((_, i) => ({
  x: 60 + random(`web-x-${i}`) * 1100,
  y: 120 + random(`web-y-${i}`) * 860,
  m: 1 + random(`web-m-${i}`) * 3,
}));
const EDGES: [number, number][] = [];
NODES.forEach((a, i) => {
  NODES.map((b, j) => ({ j, d: Math.hypot(a.x - b.x, a.y - b.y) }))
    .filter((e) => e.j !== i)
    .sort((p, q) => p.d - q.d)
    .slice(0, 2)
    .forEach((e) => {
      if (!EDGES.some(([p, q]) => (p === e.j && q === i) || (p === i && q === e.j))) EDGES.push([i, e.j]);
    });
});

const arc = (a0: number, a1: number, r: number) => {
  const p0 = { x: DONUT.x + Math.cos(a0) * r, y: DONUT.y + Math.sin(a0) * r };
  const p1 = { x: DONUT.x + Math.cos(a1) * r, y: DONUT.y + Math.sin(a1) * r };
  return `M ${p0.x} ${p0.y} A ${r} ${r} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${p1.x} ${p1.y}`;
};

// 真理 08：我们只看见了宇宙的 5%。其余 95% 是暗物质与暗能量
export const C9Dark: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const web = interpolate(t, [0.4, 3], [0, 1], { ...CLAMP, easing: theme.ease.out });
  const focus = interpolate(t, [7, 8], [0, 1], { ...CLAMP, easing: theme.ease.inOut });

  let start = -Math.PI / 2;
  const segments = PARTS.map((p, i) => {
    const sweep = (p.pct / 100) * Math.PI * 2;
    const grow = interpolate(t, [2.2 + i * 1.1, 3.4 + i * 1.1], [0, 1], { ...CLAMP, easing: theme.ease.inOut });
    const seg = { ...p, a0: start + 0.012, a1: start + sweep * grow - 0.012, grow };
    start += sweep;
    return seg;
  });
  const counter = interpolate(t, [4.4, 6.2], [0, 4.9], CLAMP);

  return (
    <AbsoluteFill>
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        <g opacity={web * (1 - focus * 0.5)}>
          {EDGES.map(([i, j], k) => (
            <line key={k} x1={NODES[i].x} y1={NODES[i].y} x2={NODES[j].x} y2={NODES[j].y} stroke={theme.color.dark} strokeOpacity={0.3} strokeWidth={1.2} />
          ))}
          {NODES.map((n, i) => (
            <circle key={i} cx={n.x} cy={n.y} r={n.m * (1 + 0.2 * Math.sin(frame / 10 + i))} fill={theme.color.dark} opacity={0.7} />
          ))}
        </g>
        <circle cx={DONUT.x} cy={DONUT.y} r={DONUT.r + DONUT.w} fill="rgba(3,4,10,0.75)" />
        <circle cx={DONUT.x} cy={DONUT.y} r={DONUT.r} fill="none" stroke={theme.color.faint} strokeWidth={DONUT.w} />
        {segments.map((s, i) =>
          s.grow > 0.01 ? (
            <path
              key={s.name}
              d={arc(s.a0, s.a1, DONUT.r + (i === 2 ? focus * 22 : 0))}
              fill="none"
              stroke={s.color}
              strokeWidth={DONUT.w}
              opacity={i === 2 ? 1 : 1 - focus * 0.6}
            />
          ) : null,
        )}
        <text x={DONUT.x} y={DONUT.y + 24} textAnchor="middle" fill={theme.color.starHot} fontFamily={theme.font.mono} fontSize={80} fontWeight={700}>
          {counter.toFixed(1)}%
        </text>
        <text x={DONUT.x} y={DONUT.y + 70} textAnchor="middle" fill={theme.color.muted} fontFamily={theme.font.body} fontSize={26}>
          我们能看见的
        </text>
        {PARTS.map((p, i) => (
          <g key={p.name} opacity={interpolate(t, [2.6 + i * 1.1, 3.2 + i * 1.1], [0, 1], CLAMP)}>
            <rect x={200 + i * 250} y={800} width={22} height={22} rx={4} fill={p.color} />
            <text x={234 + i * 250} y={820} fill={theme.color.ink} fontFamily={theme.font.body} fontSize={28}>
              {p.name}
            </text>
            <text x={234 + i * 250} y={862} fill={p.color} fontFamily={theme.font.mono} fontSize={28}>
              {p.pct}%
            </text>
          </g>
        ))}
      </svg>
      <TruthCard
        no="08"
        title="我们只看见 5%"
        equation={
          <>
            Ω<Sub>Λ</Sub> + Ω<Sub>m</Sub> ≈ 1
          </>
        }
        facts={["暗能量约 68%，推动宇宙加速膨胀", "暗物质约 27%，不发光，却有引力", "它们究竟是什么，至今无人知晓"]}
        factTimes={[3.4, 5.6, 8.2]}
        duration={DUR}
        side="right"
        accent={theme.color.dark}
      />
    </AbsoluteFill>
  );
};
