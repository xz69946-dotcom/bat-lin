import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { CLAMP, theme } from "../theme";

type Props = {
  text: string;
  en?: string;
  // 秒：入场开始、出场开始
  start: number;
  end: number;
  y: number;
  x?: number;
  align?: "left" | "center" | "right";
  size?: number;
  // 以强调色点亮的子串
  highlight?: string;
  enColor?: string;
};

const STAGGER = 2.4; // 帧 / 字

// 逐字显影的诗句：每个字从模糊中「显影」出来，像被光照亮
export const PoemLine: React.FC<Props> = ({
  text,
  en,
  start,
  end,
  y,
  x = 160,
  align = "left",
  size = theme.font.line,
  highlight,
  enColor = theme.color.muted,
}) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const chars = Array.from(text);
  const hlStart = highlight ? text.indexOf(highlight) : -1;
  const hlEnd = hlStart >= 0 && highlight ? hlStart + highlight.length : -1;

  const exit = frame - end * fps;
  const exitOpacity = interpolate(exit, [0, 0.6 * fps], [1, 0], {
    ...CLAMP,
    easing: theme.ease.inOut,
  });
  const exitBlur = interpolate(exit, [0, 0.6 * fps], [0, 14], CLAMP);
  const enStart = start * fps + chars.length * STAGGER + 6;

  const position: React.CSSProperties =
    align === "center"
      ? { left: 0, right: 0, textAlign: "center" }
      : align === "left"
        ? { left: x, textAlign: "left" }
        : { right: width - x, textAlign: "right" };

  return (
    <div
      style={{
        position: "absolute",
        top: y,
        ...position,
        opacity: exitOpacity,
        filter: `blur(${exitBlur}px)`,
        translate: `0px ${interpolate(exit, [0, 0.6 * fps], [0, -18], {
          ...CLAMP,
          easing: theme.ease.in,
        })}px`,
      }}
    >
      <div
        style={{
          fontFamily: theme.font.serif,
          fontSize: size,
          fontWeight: 700,
          lineHeight: 1.2,
          letterSpacing: size * 0.06,
          color: theme.color.ink,
          whiteSpace: "nowrap",
        }}
      >
        {chars.map((c, i) => {
          const local = frame - start * fps - i * STAGGER;
          const lit = i >= hlStart && i < hlEnd;
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                color: lit ? theme.color.light : theme.color.ink,
                textShadow: lit
                  ? `0 0 ${size * 0.35}px rgba(255,195,90,0.55)`
                  : "none",
                opacity: interpolate(local, [0, 0.5 * fps], [0, 1], {
                  ...CLAMP,
                  easing: theme.ease.out,
                }),
                filter: `blur(${interpolate(local, [0, 0.6 * fps], [12, 0], {
                  ...CLAMP,
                  easing: theme.ease.out,
                })}px)`,
                translate: `0px ${interpolate(local, [0, 0.7 * fps], [26, 0], {
                  ...CLAMP,
                  easing: theme.ease.out,
                })}px`,
              }}
            >
              {c}
            </span>
          );
        })}
      </div>
      {en ? (
        <div
          style={{
            marginTop: size * 0.2,
            fontFamily: theme.font.latin,
            fontStyle: "italic",
            fontWeight: 500,
            fontSize: theme.font.en,
            letterSpacing: 1.5,
            color: enColor,
            opacity: interpolate(frame - enStart, [0, 0.8 * fps], [0, 1], {
              ...CLAMP,
              easing: theme.ease.out,
            }),
            translate: `0px ${interpolate(
              frame - enStart,
              [0, 0.8 * fps],
              [12, 0],
              { ...CLAMP, easing: theme.ease.out },
            )}px`,
          }}
        >
          {en}
        </div>
      ) : null}
    </div>
  );
};
