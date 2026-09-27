import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { CLAMP, theme } from "../theme";
import { moves, TRANSITION, transitionStart } from "../timeline";

// 贯穿全片的星空：不随场景切换，而是跟随一个连续的「镜头」运动。
// 每次转场时镜头加速推进 / 后退 / 横摇，星星拉成光线，把前后两个场景缝在一起。

const COUNT = 460;
const DEPTH = 1000;
const FOCAL = 760;
const SPREAD_X = 1700;
const SPREAD_Y = 1000;
const CRUISE = 0.9; // 平时每帧的推进速度
const WARP = 70; // 转场时的峰值速度
const PAN = 2600; // 一次横摇的总位移

const STARS = new Array(COUNT).fill(0).map((_, i) => {
  const warm = random(`st-c-${i}`);
  return {
    x: (random(`st-x-${i}`) - 0.5) * 2 * SPREAD_X,
    y: (random(`st-y-${i}`) - 0.5) * 2 * SPREAD_Y,
    z: random(`st-z-${i}`) * DEPTH,
    size: 0.6 + random(`st-s-${i}`) * 1.6,
    tw: random(`st-t-${i}`) * Math.PI * 2,
    color:
      warm > 0.93
        ? theme.color.sunHot
        : warm > 0.8
          ? theme.color.star
          : theme.color.starHot,
  };
});

// 转场窗口内速度按 sin 曲线起落；对它积分得到镜头位移，保证位移是帧的纯函数
const warpIntegral = (frame: number, kind: "z" | "x") =>
  moves.reduce((acc, move, k) => {
    const p = Math.min(1, Math.max(0, (frame - transitionStart[k]) / TRANSITION));
    const shape = ((1 - Math.cos(Math.PI * p)) / Math.PI) * TRANSITION;
    if (kind === "z") {
      if (move === "in") return acc + WARP * shape;
      if (move === "out") return acc - WARP * shape;
      if (move === "flash") return acc + WARP * 0.35 * shape;
      return acc;
    }
    return move === "pan" ? acc + (PAN / TRANSITION) * (shape / (2 / Math.PI)) : acc;
  }, 0);

export const cameraZ = (frame: number) => frame * CRUISE + warpIntegral(frame, "z");
export const cameraX = (frame: number) => warpIntegral(frame, "x");

const mod = (a: number, n: number) => ((a % n) + n) % n;

const project = (x: number, y: number, z: number) => ({
  sx: 960 + (x * FOCAL) / z,
  sy: 540 + (y * FOCAL) / z,
});

export const Starfield: React.FC = () => {
  const frame = useCurrentFrame();
  const camZ = cameraZ(frame);
  const camX = cameraX(frame);
  const prevZ = cameraZ(frame - 1.4);
  const prevX = cameraX(frame - 1.4);
  // 大爆炸（第 3 秒）之前没有星星
  const born = interpolate(frame, [95, 200], [0, 1], CLAMP);

  return (
    <AbsoluteFill style={{ opacity: born }}>
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        {STARS.map((s, i) => {
          const z = mod(s.z - camZ, DEPTH) + 2;
          const zp = mod(s.z - prevZ, DEPTH) + 2;
          const x = mod(s.x - camX * (1 - z / (DEPTH * 1.6)) + SPREAD_X, SPREAD_X * 2) - SPREAD_X;
          const xp = mod(s.x - prevX * (1 - zp / (DEPTH * 1.6)) + SPREAD_X, SPREAD_X * 2) - SPREAD_X;
          const a = project(x, s.y, z);
          const b = project(xp, s.y, zp);
          const alpha =
            interpolate(z, [2, 40, 650, DEPTH], [0, 1, 0.9, 0], CLAMP) *
            (0.65 + 0.35 * Math.sin(frame / 9 + s.tw));
          const r = Math.min(4.5, s.size * (260 / z + 0.35));
          const wrapped = Math.abs(zp - z) > DEPTH / 2 || Math.abs(xp - x) > SPREAD_X;
          const streak = !wrapped && Math.hypot(a.sx - b.sx, a.sy - b.sy) > 2.5;
          if (a.sx < -40 || a.sx > 1960 || a.sy < -40 || a.sy > 1120) return null;
          return streak ? (
            <line
              key={i}
              x1={b.sx}
              y1={b.sy}
              x2={a.sx}
              y2={a.sy}
              stroke={s.color}
              strokeWidth={r * 1.1}
              strokeLinecap="round"
              opacity={alpha}
            />
          ) : (
            <circle key={i} cx={a.sx} cy={a.sy} r={r} fill={s.color} opacity={alpha} />
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

// 远处的星云：极慢的视差漂移，给深空一点体积感
export const Nebula: React.FC = () => {
  const frame = useCurrentFrame();
  const camZ = cameraZ(frame);
  const camX = cameraX(frame);
  const born = interpolate(frame, [95, 260], [0, 1], CLAMP);
  const clouds = [
    { x: 420, y: 300, r: 780, c: "143,211,255", a: 0.1, k: 0.05 },
    { x: 1500, y: 760, r: 900, c: "155,140,255", a: 0.12, k: 0.08 },
    { x: 1250, y: 180, r: 520, c: "255,184,107", a: 0.06, k: 0.12 },
  ];
  return (
    <AbsoluteFill style={{ opacity: born }}>
      {clouds.map((c, i) => {
        const x = mod(c.x - camX * c.k * 0.3 + 600, 3120) - 600;
        const scale = 1 + 0.12 * Math.sin((camZ * c.k) / 160 + i);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x - c.r,
              top: c.y - c.r,
              width: c.r * 2,
              height: c.r * 2,
              scale: `${scale}`,
              borderRadius: "50%",
              background: `radial-gradient(circle, rgba(${c.c},${c.a}) 0%, rgba(${c.c},${c.a * 0.4}) 40%, rgba(${c.c},0) 70%)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
