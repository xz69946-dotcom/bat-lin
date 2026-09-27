import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { CLAMP, theme } from "../theme";
import { FPS, sceneStart, TOTAL_FRAMES, TRANSITION } from "../timeline";

const LINE_H = 44;
const BAR = { x0: 120, x1: 1800, y: 1012 };

// 全片常驻的界面层：左上品牌、右上「真理 0N / 08」滚动计数、底部进度轨道。
// 它不随场景切换，是连接各章的一条线。
export const Hud: React.FC = () => {
  const frame = useCurrentFrame();

  // 连续的章节序号：转场期间在两个整数之间滑动，数字像里程表一样滚动
  const chapter = sceneStart.reduce((acc, start, k) => {
    if (k === 0) return 0;
    return acc + interpolate(frame, [start, start + TRANSITION], [0, 1], {
      ...CLAMP,
      easing: theme.ease.inOut,
    });
  }, 0);
  const truth = Math.min(8, Math.max(1, chapter));
  const visible = interpolate(
    frame,
    [12.2 * FPS, 13.2 * FPS, sceneStart[9] + 7 * FPS, sceneStart[9] + 8 * FPS],
    [0, 1, 1, 0],
    CLAMP,
  );
  const counterVisible = interpolate(
    chapter,
    [0.3, 0.9, 8.1, 8.7],
    [0, 1, 1, 0],
    CLAMP,
  );
  const progress = frame / TOTAL_FRAMES;
  const dotX = BAR.x0 + (BAR.x1 - BAR.x0) * progress;

  return (
    <AbsoluteFill style={{ opacity: visible, pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: 120,
          top: 72,
          display: "flex",
          alignItems: "baseline",
          gap: 18,
        }}
      >
        <span
          style={{
            fontFamily: theme.font.title,
            fontWeight: 700,
            fontSize: theme.type.label,
            letterSpacing: 8,
            color: theme.color.ink,
          }}
        >
          宇宙真理
        </span>
        <span
          style={{
            fontFamily: theme.font.mono,
            fontSize: 18,
            letterSpacing: 5,
            color: theme.color.muted,
          }}
        >
          COSMIC TRUTHS
        </span>
      </div>
      <div
        style={{
          position: "absolute",
          right: 120,
          top: 62,
          display: "flex",
          alignItems: "center",
          gap: 14,
          opacity: counterVisible,
          fontFamily: theme.font.mono,
          fontSize: 32,
          color: theme.color.ink,
        }}
      >
        <span style={{ fontFamily: theme.font.body, fontSize: 26, color: theme.color.muted, letterSpacing: 4 }}>
          真理
        </span>
        <span style={{ color: theme.color.star }}>0</span>
        <div style={{ height: LINE_H, overflow: "hidden", marginLeft: -14 }}>
          <div style={{ translate: `0px ${-(truth - 1) * LINE_H}px` }}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} style={{ height: LINE_H, lineHeight: `${LINE_H}px`, color: theme.color.star }}>
                {n}
              </div>
            ))}
          </div>
        </div>
        <span style={{ color: theme.color.muted }}>/ 08</span>
      </div>
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        <line x1={BAR.x0} y1={BAR.y} x2={BAR.x1} y2={BAR.y} stroke={theme.color.faint} strokeWidth={2} />
        <line x1={BAR.x0} y1={BAR.y} x2={dotX} y2={BAR.y} stroke={theme.color.star} strokeWidth={2} opacity={0.8} />
        {sceneStart.map((start, k) => {
          const x = BAR.x0 + ((BAR.x1 - BAR.x0) * start) / TOTAL_FRAMES;
          const passed = frame >= start;
          return (
            <circle
              key={k}
              cx={x}
              cy={BAR.y}
              r={passed ? 4 : 3}
              fill={passed ? theme.color.star : theme.color.bg}
              stroke={theme.color.star}
              strokeOpacity={0.6}
              strokeWidth={1.5}
            />
          );
        })}
        <circle cx={dotX} cy={BAR.y} r={12} fill={theme.color.star} opacity={0.25} />
        <circle cx={dotX} cy={BAR.y} r={5} fill={theme.color.starHot} />
      </svg>
    </AbsoluteFill>
  );
};
