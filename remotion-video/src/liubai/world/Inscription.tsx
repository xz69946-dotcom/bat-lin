import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { CLAMP, theme } from "../theme";

// 竖排时使用竖排标点（逗号、句号、冒号、分号位于字格右上）
const VERTICAL: Record<string, string> = { "，": "︐", "。": "︒", "：": "︓", "；": "︔", "、": "︑" };

type Props = {
  // 世界坐标：x 是第一列（最右一列）的右边缘，y 是顶端
  x: number;
  y: number;
  // 每个元素是一列，自右向左排列
  columns: string[];
  start: number; // 秒
  size?: number;
  // 每列之后额外的落款（小字）
  signature?: string;
  color?: string;
  perChar?: number;
};

// 题跋：竖排、自右向左。每个字像墨渗进纸里一样，从模糊到清晰
export const Inscription: React.FC<Props> = ({
  x,
  y,
  columns,
  start,
  size = theme.type.inscription,
  signature,
  color = theme.color.ink,
  perChar = 0.13,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  let index = 0;

  const charStyle = (k: number): React.CSSProperties => {
    const local = t - start - k * perChar;
    const p = interpolate(local, [0, 0.7], [0, 1], { ...CLAMP, easing: theme.ease.out });
    return {
      display: "inline-block",
      opacity: p,
      filter: p < 0.99 ? `blur(${(1 - p) * 6}px)` : "none",
    };
  };

  const column = (text: string, fontSize: number, extra: React.CSSProperties = {}) => (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", ...extra }}>
      {Array.from(text).map((ch, i) => (
        <span
          key={i}
          style={{
            ...charStyle(index++),
            display: "block",
            height: ch === " " ? fontSize * 0.5 : fontSize * 1.22,
            lineHeight: `${fontSize * 1.22}px`,
          }}
        >
          {VERTICAL[ch] ?? ch}
        </span>
      ))}
    </div>
  );

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        translate: "-100% 0",
        display: "flex",
        flexDirection: "row-reverse",
        alignItems: "flex-start",
        gap: size * 0.62,
        fontFamily: theme.font.serif,
        fontSize: size,
        color,
      }}
    >
      {columns.map((col, c) => (
        <React.Fragment key={c}>{column(col, size)}</React.Fragment>
      ))}
      {signature
        ? column(signature, size * 0.58, {
            fontSize: size * 0.58,
            color: theme.color.inkMid,
            paddingTop: size * 1.6,
          })
        : null}
    </div>
  );
};
