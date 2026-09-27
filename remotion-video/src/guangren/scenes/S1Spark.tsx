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

const CX = 960;
const CY = 470;

const RAYS = new Array(18).fill(0).map((_, i) => ({
  angle: (i / 18) * Math.PI * 2 + random(`ray-a-${i}`) * 0.2,
  length: 140 + random(`ray-l-${i}`) * 320,
  delay: random(`ray-d-${i}`) * 0.8,
}));

// 序 · 微光：黑暗中亮起一点光，光点成为「光 · 韧」之间的那个点
export const S1Spark: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const ignite = spring({
    frame: frame - 1 * fps,
    fps,
    config: { damping: 12, stiffness: 90 },
  });
  const breathe = 1 + 0.12 * Math.sin(frame / 7);
  // 结尾：光点膨胀，接续「光圈」转场
  const swell = interpolate(t, [11.5, 14], [1, 3.2], {
    ...CLAMP,
    easing: theme.ease.in,
  });
  const titleIn = spring({
    frame: frame - 4.4 * fps,
    fps,
    config: { damping: 200 },
    durationInFrames: 1.6 * fps,
  });
  const titleOut = interpolate(t, [8.4, 9.1], [1, 0], {
    ...CLAMP,
    easing: theme.ease.inOut,
  });
  const raysOut = interpolate(t, [4.2, 5.6], [1, 0], {
    ...CLAMP,
    easing: theme.ease.inOut,
  });

  return (
    <SceneShell>
      <Glow
        x={CX}
        y={CY}
        r={260 * ignite * breathe * swell}
        opacity={0.55 * ignite}
      />
      <svg
        width={1920}
        height={1080}
        style={{ position: "absolute", opacity: raysOut }}
      >
        {RAYS.map((ray, i) => {
          const r0 = 34;
          const x1 = CX + Math.cos(ray.angle) * r0;
          const y1 = CY + Math.sin(ray.angle) * r0;
          const x2 = CX + Math.cos(ray.angle) * (r0 + ray.length);
          const y2 = CY + Math.sin(ray.angle) * (r0 + ray.length);
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={theme.color.light}
              strokeWidth={theme.stroke.hair}
              strokeLinecap="round"
              strokeDasharray={ray.length}
              strokeDashoffset={interpolate(
                t,
                [2.2 + ray.delay, 3.6 + ray.delay],
                [ray.length, 0],
                { ...CLAMP, easing: theme.ease.out },
              )}
              opacity={0.55}
            />
          );
        })}
      </svg>
      {/* 光点核心 */}
      <div
        style={{
          position: "absolute",
          left: CX - 11,
          top: CY - 11,
          width: 22,
          height: 22,
          borderRadius: "50%",
          backgroundColor: theme.color.lightHot,
          boxShadow: `0 0 24px 6px ${theme.color.light}`,
          scale: `${ignite * breathe * swell}`,
        }}
      />
      {/* 标题：两个字从光点两侧分开 */}
      <div style={{ opacity: titleOut }}>
        {(["光", "韧"] as const).map((ch, i) => {
          const dir = i === 0 ? -1 : 1;
          return (
            <div
              key={ch}
              style={{
                position: "absolute",
                left: CX - theme.font.title / 2,
                top: CY - theme.font.title * 0.62,
                width: theme.font.title,
                textAlign: "center",
                fontFamily: theme.font.serif,
                fontWeight: 700,
                fontSize: theme.font.title,
                lineHeight: 1.2,
                color: i === 0 ? theme.color.light : theme.color.ink,
                textShadow:
                  i === 0 ? "0 0 60px rgba(255,195,90,0.45)" : "none",
                opacity: titleIn,
                filter: `blur(${(1 - titleIn) * 20}px)`,
                translate: `${dir * interpolate(titleIn, [0, 1], [0, 230])}px 0px`,
              }}
            >
              {ch}
            </div>
          );
        })}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: CY + 190,
            textAlign: "center",
            fontFamily: theme.font.latin,
            fontStyle: "italic",
            fontWeight: 500,
            fontSize: 44,
            color: theme.color.muted,
            letterSpacing: interpolate(t, [6, 8], [4, 18], {
              ...CLAMP,
              easing: theme.ease.out,
            }),
            opacity: interpolate(t, [6, 7], [0, 1], CLAMP),
          }}
        >
          Luminous Resilience
        </div>
      </div>
      <PoemLine
        text="所有的光，都曾穿过黑暗"
        en="Every light has travelled through the dark."
        start={9.3}
        end={12.6}
        y={690}
        align="center"
        highlight="光"
      />
    </SceneShell>
  );
};
