import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { cameraAt } from "./camera";
import { BEAT, TOTAL_FRAMES } from "./timeline";
import { CLAMP, theme } from "./theme";

// 前景薄雾：以比纸面更快的速度掠过（视差），镜头移动时给画面一层纵深
const WISPS = [
  { x: 0, y: 260, rx: 520, ry: 120, k: 1.5, o: 0.32 },
  { x: 1300, y: 820, rx: 700, ry: 150, k: 1.8, o: 0.26 },
  { x: 2600, y: 520, rx: 460, ry: 100, k: 1.35, o: 0.22 },
];
const SPAN = 3600;

export const Mist: React.FC = () => {
  const frame = useCurrentFrame();
  const cam = cameraAt(frame);
  const fade = interpolate(frame / 30, [BEAT.stamp, BEAT.stamp + 2], [1, 0], CLAMP);
  return (
    <AbsoluteFill style={{ opacity: fade, pointerEvents: "none" }}>
      {WISPS.map((w, i) => {
        const x = ((((w.x - cam.x * w.k * cam.z) % SPAN) + SPAN) % SPAN) - 900;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x - w.rx,
              top: w.y - w.ry,
              width: w.rx * 2,
              height: w.ry * 2,
              borderRadius: "50%",
              opacity: w.o,
              background: `radial-gradient(ellipse, ${theme.color.paper} 0%, rgba(241,234,220,0.6) 40%, rgba(241,234,220,0) 70%)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// 画框暗角：很轻，只为把视线收向中间
export const Vignette: React.FC = () => (
  <AbsoluteFill
    style={{
      pointerEvents: "none",
      background: "radial-gradient(ellipse at 50% 50%, rgba(40,30,20,0) 60%, rgba(40,30,20,0.22) 100%)",
    }}
  />
);

// 片尾：整幅长卷铺在案上，上下各一行字
export const Finale: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const title = interpolate(t, [BEAT.finale + 1.2, BEAT.finale + 3], [0, 1], { ...CLAMP, easing: theme.ease.out });
  const sub = interpolate(t, [BEAT.finale + 2.6, BEAT.finale + 4.2], [0, 1], { ...CLAMP, easing: theme.ease.out });
  const end = interpolate(frame, [TOTAL_FRAMES - 1.8 * fps, TOTAL_FRAMES - 0.2 * fps], [0, 1], {
    ...CLAMP,
    easing: theme.ease.inOut,
  });
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 120,
          textAlign: "center",
          fontFamily: theme.font.brush,
          fontSize: 120,
          letterSpacing: 60,
          paddingLeft: 60,
          color: theme.color.tableText,
          opacity: title,
          filter: title < 0.99 ? `blur(${(1 - title) * 10}px)` : "none",
        }}
      >
        留白
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 790,
          textAlign: "center",
          opacity: sub,
          translate: `0px ${(1 - sub) * 12}px`,
        }}
      >
        <div style={{ fontFamily: theme.font.latin, fontStyle: "italic", fontSize: 42, letterSpacing: 2, color: theme.color.tableText }}>
          The Art of Leaving Space
        </div>
        <div style={{ marginTop: 18, fontFamily: theme.font.serif, fontSize: 28, letterSpacing: 10, color: "rgba(207,197,179,0.6)" }}>
          一卷 · 两分钟 · 火火 写
        </div>
      </div>
      <AbsoluteFill style={{ backgroundColor: theme.color.table, opacity: end }} />
    </>
  );
};
