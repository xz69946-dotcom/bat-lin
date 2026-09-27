import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Sub, Sup } from "../components/TruthCard";
import { CLAMP, theme } from "../theme";

const CENTER = { x: 960, y: 520 };
const COLLAPSE = [5, 6.6] as const;

// 八条真理的公式环绕中心旋转，最后收束成一个点——回到开场的奇点
const ORBIT: { label: React.ReactNode; color: string }[] = [
  { label: <>v = H<Sub>0</Sub>d</>, color: theme.color.star },
  { label: <>c</>, color: theme.color.star },
  { label: <>G<Sub>μν</Sub></>, color: theme.color.star },
  { label: <>E = mc<Sup>2</Sup></>, color: theme.color.sun },
  { label: <><Sup>12</Sup>C</>, color: theme.color.sun },
  { label: <>ΔS ≥ 0</>, color: theme.color.star },
  { label: <>Δx·Δp ≥ ħ/2</>, color: theme.color.dark },
  { label: <>Ω ≈ 1</>, color: theme.color.dark },
];

export const C10Finale: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const spin = t * 0.35;
  const shrink = interpolate(t, [COLLAPSE[0], COLLAPSE[1]], [1, 0], { ...CLAMP, easing: theme.ease.in });
  const point = interpolate(t, [COLLAPSE[1] - 0.3, COLLAPSE[1]], [0, 1], CLAMP);
  const flash = interpolate(t, [COLLAPSE[1], COLLAPSE[1] + 0.1, COLLAPSE[1] + 0.9], [0, 0.8, 0], CLAMP);
  const quote1 = interpolate(t, [7.2, 8.4], [0, 1], { ...CLAMP, easing: theme.ease.out });
  const quote2 = interpolate(t, [8.4, 9.6], [0, 1], { ...CLAMP, easing: theme.ease.out });
  const cite = interpolate(t, [9.8, 10.6], [0, 1], CLAMP);

  const ringIn = interpolate(t, [0.2, 1.6], [0, 1], { ...CLAMP, easing: theme.ease.out });

  return (
    <AbsoluteFill>
      {/* 轨道与中心的微光：八条真理围绕同一个源头 */}
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        {[1, 0.72, 0.46].map((k, i) => (
          <ellipse
            key={i}
            cx={CENTER.x}
            cy={CENTER.y}
            rx={640 * k * shrink}
            ry={300 * k * shrink}
            fill="none"
            stroke={theme.color.star}
            strokeOpacity={0.22 - i * 0.05}
            strokeWidth={theme.stroke.hair}
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - ringIn}
          />
        ))}
        {ORBIT.map((o, i) => {
          const a = spin + (i / ORBIT.length) * Math.PI * 2;
          return (
            <line
              key={i}
              x1={CENTER.x}
              y1={CENTER.y}
              x2={CENTER.x + Math.cos(a) * 640 * shrink}
              y2={CENTER.y + Math.sin(a) * 300 * shrink}
              stroke={o.color}
              strokeOpacity={0.14 * ringIn}
              strokeWidth={1}
            />
          );
        })}
        <circle cx={CENTER.x} cy={CENTER.y} r={140 * shrink + 20} fill={theme.color.star} opacity={0.08 * ringIn} />
        <circle cx={CENTER.x} cy={CENTER.y} r={5} fill={theme.color.starHot} opacity={ringIn * shrink} />
      </svg>
      {ORBIT.map((o, i) => {
        const a = spin + (i / ORBIT.length) * Math.PI * 2;
        const appear = interpolate(t, [0.4 + i * 0.25, 1 + i * 0.25], [0, 1], { ...CLAMP, easing: theme.ease.out });
        const rx = 640 * shrink;
        const ry = 300 * shrink;
        const depth = (Math.sin(a) + 1) / 2; // 越靠下越近
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: CENTER.x + Math.cos(a) * rx - 200,
              top: CENTER.y + Math.sin(a) * ry - 40,
              width: 400,
              textAlign: "center",
              fontFamily: theme.font.math,
              fontStyle: "italic",
              fontSize: 60 + depth * 30,
              color: o.color,
              opacity: appear * (0.45 + depth * 0.55) * interpolate(shrink, [0, 0.15], [0, 1], CLAMP),
              textShadow: `0 0 24px ${o.color}66`,
              whiteSpace: "nowrap",
            }}
          >
            {o.label}
          </div>
        );
      })}
      {/* 奇点重现 */}
      <div
        style={{
          position: "absolute",
          left: CENTER.x - 60,
          top: CENTER.y - 60,
          width: 120,
          height: 120,
          borderRadius: "50%",
          opacity: point * interpolate(t, [COLLAPSE[1], COLLAPSE[1] + 1.2], [1, 0], CLAMP),
          background: `radial-gradient(circle, ${theme.color.starHot} 0%, ${theme.color.starHot} 8%, rgba(143,211,255,0.45) 22%, rgba(143,211,255,0) 70%)`,
          scale: `${0.6 + 0.1 * Math.sin(frame / 5)}`,
        }}
      />
      <AbsoluteFill style={{ backgroundColor: theme.color.starHot, opacity: flash }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 360, textAlign: "center" }}>
        {[
          { text: "宇宙最不可理解之处，", k: quote1 },
          { text: "是它竟然可以被理解。", k: quote2 },
        ].map((q) => (
          <div
            key={q.text}
            style={{
              fontFamily: theme.font.title,
              fontWeight: 700,
              fontSize: 96,
              lineHeight: 1.45,
              letterSpacing: 6,
              color: theme.color.ink,
              opacity: q.k,
              filter: `blur(${(1 - q.k) * 12}px)`,
              translate: `0px ${(1 - q.k) * 24}px`,
            }}
          >
            {q.text}
          </div>
        ))}
        <div
          style={{
            marginTop: 36,
            fontFamily: theme.font.body,
            fontSize: 36,
            letterSpacing: 4,
            color: theme.color.muted,
            opacity: cite,
          }}
        >
          —— 爱因斯坦（大意，1936）
        </div>
      </div>
    </AbsoluteFill>
  );
};
