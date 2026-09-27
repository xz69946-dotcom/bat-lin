import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { TruthCard } from "../components/TruthCard";
import { CLAMP, theme } from "../theme";
import { scene } from "../timeline";

const DUR = scene.light;
const SUN = { x: -150, y: 470, r: 380 };
const EARTH = { x: 930, y: 470, r: 28 };
const START_X = SUN.x + SUN.r + 8;
const END_X = EARTH.x - EARTH.r - 6;
const TRAVEL = [1.4, 6.4] as const;
const SECONDS = 499; // 1 AU / c ≈ 499 s

// 对数刻度下的速度对比（km/s）
const SPEEDS = [
  { name: "地球公转", v: 29.8, color: theme.color.muted },
  { name: "帕克太阳探测器", v: 192, color: theme.color.sun },
  { name: "光", v: 299792, color: theme.color.star },
];
const BAR = { x: 140, y: 740, w: 700 };
const logW = (v: number) => (Math.log10(v) / Math.log10(299792)) * BAR.w;

// 真理 02：光速是宇宙的速度上限。一束光从太阳出发，8 分 19 秒后抵达地球
export const C3Light: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const p = interpolate(t, [TRAVEL[0], TRAVEL[1]], [0, 1], CLAMP);
  const px = START_X + (END_X - START_X) * p;
  const elapsed = Math.round(p * SECONDS);
  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");
  const arrived = interpolate(t, [TRAVEL[1], TRAVEL[1] + 0.6], [0, 1], CLAMP);
  const ui = interpolate(t, [0.8, 1.4], [0, 1], CLAMP);
  const bars = interpolate(t, [7.2, 9.2], [0, 1], { ...CLAMP, easing: theme.ease.out });

  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", inset: 0 }}>
        {/* 太阳 */}
        <div
          style={{
            position: "absolute",
            left: SUN.x - SUN.r * 1.8,
            top: SUN.y - SUN.r * 1.8,
            width: SUN.r * 3.6,
            height: SUN.r * 3.6,
            borderRadius: "50%",
            background: `radial-gradient(circle, rgba(255,184,107,0.35) 30%, rgba(255,184,107,0) 60%)`,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: SUN.x - SUN.r,
            top: SUN.y - SUN.r,
            width: SUN.r * 2,
            height: SUN.r * 2,
            borderRadius: "50%",
            background: `radial-gradient(circle at 40% 45%, ${theme.color.sunHot} 0%, ${theme.color.sun} 55%, #E0782E 100%)`,
            scale: `${1 + 0.01 * Math.sin(frame / 8)}`,
          }}
        />
        <svg width={1920} height={1080} style={{ position: "absolute" }}>
          {/* 光路 */}
          <line x1={START_X} y1={SUN.y} x2={END_X} y2={EARTH.y} stroke={theme.color.faint} strokeWidth={theme.stroke.hair} strokeDasharray="4 10" opacity={ui} />
          <line x1={START_X} y1={SUN.y} x2={px} y2={EARTH.y} stroke={theme.color.star} strokeWidth={theme.stroke.thin} opacity={0.6 * ui} />
          {/* 光子 */}
          {p > 0 && p < 1 && (
            <g>
              <line x1={Math.max(START_X, px - 160)} y1={SUN.y} x2={px} y2={SUN.y} stroke={theme.color.starHot} strokeWidth={6} strokeLinecap="round" opacity={0.5} />
              <circle cx={px} cy={SUN.y} r={16} fill={theme.color.star} opacity={0.35} />
              <circle cx={px} cy={SUN.y} r={6} fill={theme.color.starHot} />
            </g>
          )}
          {/* 地球与月球 */}
          <defs>
            <radialGradient id="lt-earth" cx="30%" cy="40%" r="75%">
              <stop offset="0" stopColor="#9FD8FF" />
              <stop offset="0.55" stopColor="#2F6FB5" />
              <stop offset="1" stopColor="#0B1B33" />
            </radialGradient>
          </defs>
          <circle cx={EARTH.x} cy={EARTH.y} r={EARTH.r + 18 + arrived * 30} fill="none" stroke={theme.color.star} strokeWidth={theme.stroke.thin} opacity={arrived * (1 - arrived) * 3} />
          <circle cx={EARTH.x} cy={EARTH.y} r={EARTH.r} fill="url(#lt-earth)" />
          <circle
            cx={EARTH.x + Math.cos(frame / 40) * 70}
            cy={EARTH.y + Math.sin(frame / 40) * 22}
            r={7}
            fill="#C9CCD6"
          />
          <text x={EARTH.x} y={EARTH.y + 74} textAnchor="middle" fill={theme.color.ink} fontFamily={theme.font.body} fontSize={26}>
            地球
          </text>
          {/* 距离标尺 */}
          <g opacity={ui}>
            <line x1={START_X} y1={SUN.y + 120} x2={END_X} y2={SUN.y + 120} stroke={theme.color.muted} strokeWidth={theme.stroke.hair} />
            <line x1={START_X} y1={SUN.y + 110} x2={START_X} y2={SUN.y + 130} stroke={theme.color.muted} strokeWidth={theme.stroke.hair} />
            <line x1={END_X} y1={SUN.y + 110} x2={END_X} y2={SUN.y + 130} stroke={theme.color.muted} strokeWidth={theme.stroke.hair} />
            <text x={(START_X + END_X) / 2} y={SUN.y + 160} textAnchor="middle" fill={theme.color.muted} fontFamily={theme.font.mono} fontSize={24}>
              1 AU ≈ 149 600 000 km
            </text>
          </g>
          {/* 速度对比（对数刻度） */}
          <g opacity={bars}>
            <text x={BAR.x} y={BAR.y - 28} fill={theme.color.muted} fontFamily={theme.font.body} fontSize={24}>
              速度对比 · 对数刻度 · km/s
            </text>
            {SPEEDS.map((s, i) => {
              const y = BAR.y + i * 70;
              const w = logW(s.v) * interpolate(t, [7.4 + i * 0.3, 8.8 + i * 0.3], [0, 1], { ...CLAMP, easing: theme.ease.out });
              return (
                <g key={s.name}>
                  <rect x={BAR.x} y={y} width={BAR.w} height={10} rx={5} fill={theme.color.faint} />
                  <rect x={BAR.x} y={y} width={w} height={10} rx={5} fill={s.color} />
                  <text x={BAR.x} y={y + 44} fill={theme.color.ink} fontFamily={theme.font.body} fontSize={26}>
                    {s.name}
                  </text>
                  <text x={BAR.x + BAR.w} y={y + 44} textAnchor="end" fill={s.color} fontFamily={theme.font.mono} fontSize={26}>
                    {s.v.toLocaleString("en-US")}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
        {/* 计时器 */}
        <div
          style={{
            position: "absolute",
            left: (START_X + END_X) / 2 - 220,
            width: 440,
            top: SUN.y - 170,
            textAlign: "center",
            opacity: ui,
          }}
        >
          <div style={{ fontFamily: theme.font.mono, fontSize: 88, fontWeight: 700, color: arrived > 0 ? theme.color.star : theme.color.ink }}>
            {mm}:{ss}
          </div>
          <div style={{ fontFamily: theme.font.body, fontSize: 22, color: theme.color.muted, letterSpacing: 2 }}>
            光走过的时间（画面已加速）
          </div>
        </div>
      </div>
      <TruthCard
        no="02"
        title="光速不可超越"
        equation={<>c = 299 792 458 m/s</>}
        equationSize={66}
        facts={["任何物质与信息都无法超越光速", "阳光抵达地球约需 8 分 19 秒", "你看到的太阳，是 8 分钟前的它"]}
        factTimes={[3.4, 6.6, 8.2]}
        duration={DUR}
        side="right"
      />
    </AbsoluteFill>
  );
};
