import React from "react";
import {
  interpolate,
  random,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Glow, SceneShell } from "../components/SceneShell";
import { PoemLine } from "../components/PoemLine";
import { CLAMP, theme } from "../theme";

export const FLAME = { x: 960, y: 420 };
const OUTER = 30;
const INNER = 12;
const COUNT = OUTER + INNER;

// 火焰轮廓（泪滴形，尖端朝上）
const teardrop = (k: number, cx: number, cy: number, a: number, b: number) => {
  const th = k * Math.PI * 2;
  return {
    x: cx + b * Math.sin(th) * Math.sin(th / 2),
    y: cy - a * Math.cos(th),
  };
};

const POINTS = new Array(COUNT).fill(0).map((_, i) => {
  const target =
    i < OUTER
      ? teardrop(i / OUTER, FLAME.x, FLAME.y, 250, 210)
      : teardrop((i - OUTER) / INNER, FLAME.x, FLAME.y + 90, 130, 110);
  return {
    // 初始：散落在画面上方区域，避开字幕带
    x: 160 + random(`em-x-${i}`) * 1600,
    y: 150 + random(`em-y-${i}`) * 560,
    tx: target.x,
    ty: target.y,
    delay: 0.8 + random(`em-d-${i}`) * 3,
    tw: random(`em-t-${i}`) * Math.PI * 2,
  };
});

// 每个点与最近的点相连
const NEIGHBOR_LINKS = POINTS.map((p, i) => {
  let best = -1;
  let bestD = Infinity;
  POINTS.forEach((q, j) => {
    if (j === i) return;
    const d = Math.hypot(p.x - q.x, p.y - q.y);
    if (d < bestD) {
      bestD = d;
      best = j;
    }
  });
  return [i, best] as const;
});

// 07 星火：一点光微不足道，万点光汇成火炬
export const S8Embers: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const gather = interpolate(t, [6.2, 9.4], [0, 1], {
    ...CLAMP,
    easing: theme.ease.inOut,
  });
  const netLines = interpolate(t, [3.6, 5.2, 6.2, 7.2], [0, 0.35, 0.35, 0], CLAMP);
  const outline = interpolate(t, [9, 10.6], [0, 1], {
    ...CLAMP,
    easing: theme.ease.out,
  });
  const fire = interpolate(t, [9.4, 11.5, 14], [0, 1, 1.25], CLAMP);

  // 聚成火焰后：越靠近火尖摆动越大，像真实的火苗
  const pos = POINTS.map((p, i) => {
    const height = Math.max(0, (FLAME.y + 250 - p.ty) / 500);
    const sway =
      gather *
      (Math.sin(t * 3.1) * 26 * height * height + Math.sin(frame / 4 + i) * 3);
    return {
      x: interpolate(gather, [0, 1], [p.x, p.tx]) + sway,
      y: interpolate(gather, [0, 1], [p.y, p.ty]) + gather * Math.cos(frame / 5 + i) * 3,
    };
  });

  const ring = (from: number, n: number) =>
    new Array(n).fill(0).map((_, k) => {
      const a = pos[from + k];
      const b = pos[from + ((k + 1) % n)];
      return `M ${a.x} ${a.y} L ${b.x} ${b.y}`;
    });

  return (
    <SceneShell chapter={{ no: "07", name: "星火" }}>
      <Glow x={FLAME.x} y={FLAME.y + 60} r={420 * fire} opacity={0.55 * Math.min(fire, 1)} />
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        {NEIGHBOR_LINKS.map(([i, j], k) => (
          <line
            key={k}
            x1={pos[i].x}
            y1={pos[i].y}
            x2={pos[j].x}
            y2={pos[j].y}
            stroke={theme.color.light}
            strokeWidth={theme.stroke.hair}
            opacity={netLines}
          />
        ))}
        {[...ring(0, OUTER), ...ring(OUTER, INNER)].map((d, k) => (
          <path
            key={k}
            d={d}
            stroke={theme.color.light}
            strokeWidth={theme.stroke.thin}
            strokeLinecap="round"
            opacity={outline * 0.9}
          />
        ))}
        {POINTS.map((p, i) => {
          const pop = spring({
            frame: frame - p.delay * fps,
            fps,
            config: { damping: 10, stiffness: 120 },
          });
          const twinkle = 0.7 + 0.3 * Math.sin(frame / 6 + p.tw);
          return (
            <g key={i}>
              <circle
                cx={pos[i].x}
                cy={pos[i].y}
                r={16 * pop}
                fill={theme.color.light}
                opacity={0.18 * twinkle}
              />
              <circle
                cx={pos[i].x}
                cy={pos[i].y}
                r={4.5 * pop}
                fill={theme.color.lightHot}
                opacity={twinkle}
              />
            </g>
          );
        })}
      </svg>
      <PoemLine
        text="一点光，微不足道"
        start={2}
        end={6}
        y={800}
        align="center"
        en="A single spark is small."
      />
      <PoemLine
        text="万点光，汇成火炬"
        start={9.8}
        end={13.6}
        y={800}
        align="center"
        highlight="火炬"
        en="Ten thousand sparks become a torch."
      />
    </SceneShell>
  );
};
