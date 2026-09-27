import React from "react";
import {
  AbsoluteFill,
  interpolate,
  random,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { CLAMP, theme } from "../theme";
import { scene } from "../timeline";

const DUR = scene.bang;
const BANG = 3; // 秒
const COLORS = [theme.color.starHot, theme.color.star, theme.color.sun, theme.color.dark];

const PARTICLES = new Array(260).fill(0).map((_, i) => {
  const a = random(`bang-a-${i}`) * Math.PI * 2;
  return {
    a,
    v: 180 + Math.pow(random(`bang-v-${i}`), 0.6) * 900,
    size: 1 + random(`bang-s-${i}`) * 3.2,
    color: COLORS[Math.floor(random(`bang-c-${i}`) * COLORS.length)],
    spin: (random(`bang-r-${i}`) - 0.5) * 0.25,
  };
});

// 序：奇点。一个点颤动、爆发；物质向四周飞散，冷却成最初的星光
export const C1Bang: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const since = Math.max(0, t - BANG);

  const pointIn = interpolate(t, [0.8, 2.2], [0, 1], { ...CLAMP, easing: theme.ease.out });
  const tremble = t < BANG ? Math.sin(frame * 1.7) * interpolate(t, [1.8, 3], [0, 3], CLAMP) : 0;
  const pointGone = interpolate(t, [BANG, BANG + 0.15], [1, 0], CLAMP);
  const flash = interpolate(t, [BANG, BANG + 0.08, BANG + 0.9], [0, 1, 0], CLAMP);
  const shock = interpolate(t, [BANG, BANG + 2.2], [0, 1], { ...CLAMP, easing: theme.ease.out });
  // 粒子：先极速膨胀，再逐渐减速
  const spread = 1 - Math.exp(-since * 1.6);
  const titleIn = interpolate(t, [7.4, 8.8], [0, 1], { ...CLAMP, easing: theme.ease.out });
  const titleOut = interpolate(t, [11.6, 12.4], [1, 0], { ...CLAMP, easing: theme.ease.in });
  const lineIn = interpolate(t, [4.4, 5.4], [0, 1], { ...CLAMP, easing: theme.ease.out });
  const lineOut = interpolate(t, [6.9, 7.4], [1, 0], CLAMP);

  return (
    <AbsoluteFill>
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        {/* 冲击波 */}
        {[0, 0.18, 0.36].map((d, i) => {
          const k = Math.min(1, Math.max(0, (shock - d) / (1 - d)));
          return (
            <circle
              key={i}
              cx={960}
              cy={540}
              r={k * 1300}
              fill="none"
              stroke={i === 0 ? theme.color.starHot : theme.color.star}
              strokeWidth={theme.stroke.thin * (1 - k) * 3 + 0.5}
              opacity={(1 - k) * (t > BANG ? 0.8 : 0)}
            />
          );
        })}
        {/* 飞散的物质 */}
        {t > BANG &&
          PARTICLES.map((p, i) => {
            const a = p.a + p.spin * since;
            const r = p.v * spread + since * 14;
            const trail = p.v * 1.6 * Math.exp(-since * 1.6) * 0.12 + 1;
            const x = 960 + Math.cos(a) * r;
            const y = 540 + Math.sin(a) * r;
            return (
              <line
                key={i}
                x1={x - Math.cos(a) * trail * 6}
                y1={y - Math.sin(a) * trail * 6}
                x2={x}
                y2={y}
                stroke={p.color}
                strokeWidth={p.size}
                strokeLinecap="round"
                opacity={interpolate(since, [0, 0.3, 9], [0, 1, 0.55], CLAMP)}
              />
            );
          })}
      </svg>
      {/* 奇点 */}
      <div
        style={{
          position: "absolute",
          left: 960 - 60,
          top: 540 - 60,
          width: 120,
          height: 120,
          borderRadius: "50%",
          translate: `${tremble}px ${-tremble * 0.6}px`,
          opacity: pointIn * pointGone,
          scale: `${0.4 + pointIn * 0.6 + interpolate(t, [2, 3], [0, 0.5], CLAMP)}`,
          background: `radial-gradient(circle, ${theme.color.starHot} 0%, ${theme.color.starHot} 8%, rgba(143,211,255,0.45) 22%, rgba(143,211,255,0) 70%)`,
        }}
      />
      <AbsoluteFill style={{ backgroundColor: theme.color.starHot, opacity: flash }} />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 470,
          textAlign: "center",
          opacity: lineIn * lineOut,
          translate: `0px ${(1 - lineIn) * 20}px`,
        }}
      >
        <div
          style={{
            fontFamily: theme.font.title,
            fontWeight: 700,
            fontSize: 96,
            color: theme.color.ink,
            letterSpacing: 6,
          }}
        >
          一切，始于 <span style={{ color: theme.color.star, fontFamily: theme.font.mono }}>138</span> 亿年前
        </div>
        <div
          style={{
            marginTop: 22,
            fontFamily: theme.font.mono,
            fontSize: 28,
            letterSpacing: 3,
            color: theme.color.muted,
          }}
        >
          AGE OF THE UNIVERSE · 13.787 ± 0.020 Gyr · PLANCK 2018
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 350,
          textAlign: "center",
          opacity: titleIn * titleOut,
        }}
      >
        <div
          style={{
            fontFamily: theme.font.title,
            fontWeight: 700,
            fontSize: theme.type.hero,
            lineHeight: 1.2,
            color: theme.color.ink,
            letterSpacing: interpolate(titleIn, [0, 1], [120, 36]),
            paddingLeft: interpolate(titleIn, [0, 1], [120, 36]),
            filter: `blur(${(1 - titleIn) * 16}px)`,
            textShadow: "0 0 60px rgba(143,211,255,0.35)",
          }}
        >
          宇宙真理
        </div>
        <div
          style={{
            marginTop: 20,
            fontFamily: theme.font.body,
            fontSize: 44,
            letterSpacing: 10,
            color: theme.color.muted,
            opacity: interpolate(t, [8.6, 9.6], [0, 1], CLAMP),
          }}
        >
          关于宇宙，人类已确知的 <span style={{ color: theme.color.star }}>8</span> 件事
        </div>
      </div>
      {/* 结尾保留一颗亮点，拉远时它将化作整个星系网格 */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: interpolate(t, [DUR / fps - 2, DUR / fps - 0.5], [0, 1], CLAMP),
          background: `radial-gradient(circle at 50% 50%, rgba(143,211,255,0.35) 0%, rgba(143,211,255,0) 18%)`,
        }}
      />
    </AbsoluteFill>
  );
};
