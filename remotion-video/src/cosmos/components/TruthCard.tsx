import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { CLAMP, theme } from "../theme";

type Props = {
  no: string;
  title: string;
  equation: React.ReactNode;
  facts: string[];
  // 场景时长（帧），用于安排退场
  duration: number;
  side?: "left" | "right";
  top?: number;
  // 每条事实出现的秒数
  factTimes?: number[];
  accent?: string;
  equationSize?: number;
};

const WIDTH = 790;

// 每条真理的文字卡：编号 → 标题 → 公式 → 事实，依次出现，在转场前一起退场
export const TruthCard: React.FC<Props> = ({
  no,
  title,
  equation,
  facts,
  duration,
  side = "left",
  top = 210,
  factTimes,
  accent = theme.color.star,
  equationSize = theme.type.equation,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const exit = interpolate(frame, [duration - 1.2 * fps, duration - 0.3 * fps], [0, 1], {
    ...CLAMP,
    easing: theme.ease.in,
  });
  const reveal = (at: number, dur = 0.8) =>
    interpolate(t, [at, at + dur], [0, 1], { ...CLAMP, easing: theme.ease.out });

  const titleIn = reveal(1.1, 1);
  const eqIn = reveal(2.1, 1);
  const times = factTimes ?? facts.map((_, i) => 3.2 + i * 1.1);

  return (
    <div
      style={{
        position: "absolute",
        top,
        width: WIDTH,
        ...(side === "left" ? { left: 130 } : { right: 130 }),
        opacity: 1 - exit,
        filter: `blur(${exit * 10}px)`,
        translate: `${(side === "left" ? -1 : 1) * exit * 60}px 0px`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <div
          style={{
            height: 2,
            width: interpolate(t, [0.7, 1.5], [0, 56], { ...CLAMP, easing: theme.ease.out }),
            backgroundColor: accent,
          }}
        />
        <div
          style={{
            fontFamily: theme.font.mono,
            fontSize: theme.type.label,
            letterSpacing: 6,
            color: accent,
            opacity: reveal(0.8),
          }}
        >
          TRUTH {no}
        </div>
      </div>
      <div
        style={{
          marginTop: 22,
          fontFamily: theme.font.title,
          fontWeight: 700,
          fontSize: theme.type.title,
          lineHeight: 1.18,
          color: theme.color.ink,
          clipPath: `inset(-20% ${100 - titleIn * 100}% -20% 0%)`,
          filter: `blur(${(1 - titleIn) * 8}px)`,
          translate: `${(1 - titleIn) * -24}px 0px`,
        }}
      >
        {title}
      </div>
      <div
        style={{
          marginTop: 26,
          fontFamily: theme.font.math,
          fontStyle: "italic",
          fontSize: equationSize,
          lineHeight: 1.2,
          color: accent,
          whiteSpace: "nowrap",
          opacity: eqIn,
          translate: `0px ${(1 - eqIn) * 20}px`,
          textShadow: `0 0 28px ${accent}55`,
        }}
      >
        {equation}
      </div>
      <div style={{ marginTop: 30, display: "flex", flexDirection: "column", gap: 18 }}>
        {facts.map((f, i) => {
          const k = reveal(times[i], 0.9);
          return (
            <div
              key={i}
              style={{
                display: "flex",
                gap: 18,
                alignItems: "flex-start",
                opacity: k,
                translate: `0px ${(1 - k) * 18}px`,
              }}
            >
              <div
                style={{
                  marginTop: theme.type.fact * 0.62,
                  flexShrink: 0,
                  width: 14,
                  height: 2,
                  backgroundColor: accent,
                }}
              />
              <div
                style={{
                  fontFamily: theme.font.body,
                  fontSize: theme.type.fact,
                  lineHeight: 1.45,
                  color: theme.color.ink,
                  opacity: 0.88,
                }}
              >
                {f}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// 公式里的上下标
export const Sub: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <sub style={{ fontSize: "0.58em", verticalAlign: "sub", lineHeight: 0 }}>{children}</sub>
);
export const Sup: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <sup style={{ fontSize: "0.58em", verticalAlign: "super", lineHeight: 0 }}>{children}</sup>
);
