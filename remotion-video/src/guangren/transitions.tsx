import React from "react";
import { AbsoluteFill, interpolate, random } from "remotion";
import type {
  TransitionPresentation,
  TransitionPresentationComponentProps,
} from "@remotion/transitions";
import { CLAMP, theme } from "./theme";

const W = theme.size.width;
const H = theme.size.height;

type Point = { cx: number; cy: number };

// ① 光圈：新场景从一个金色光环中心向外扩张
const IrisGlow: React.FC<TransitionPresentationComponentProps<Point>> = ({
  children,
  presentationDirection,
  presentationProgress: p,
  passedProps: { cx, cy },
}) => {
  if (presentationDirection === "exiting") {
    return (
      <AbsoluteFill style={{ scale: interpolate(p, [0, 1], [1, 1.12]) }}>
        {children}
      </AbsoluteFill>
    );
  }
  const maxR = Math.max(
    Math.hypot(cx, cy),
    Math.hypot(W - cx, cy),
    Math.hypot(cx, H - cy),
    Math.hypot(W - cx, H - cy),
  );
  const r = p * maxR;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ clipPath: `circle(${r}px at ${cx}px ${cy}px)` }}>
        {children}
      </AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: cx - r,
          top: cy - r,
          width: r * 2,
          height: r * 2,
          borderRadius: "50%",
          border: `4px solid ${theme.color.lightHot}`,
          boxShadow: `0 0 40px 12px ${theme.color.light}, inset 0 0 40px 12px ${theme.color.light}`,
          opacity: interpolate(p, [0, 0.08, 0.75, 1], [0, 1, 1, 0], CLAMP),
        }}
      />
    </AbsoluteFill>
  );
};
export const irisGlow = (props: Point): TransitionPresentation<Point> => ({
  component: IrisGlow,
  props,
});

// ② 光扫：一道倾斜的光带从左扫到右，光带之后是新场景
const LightSweep: React.FC<TransitionPresentationComponentProps<Record<string, never>>> = ({
  children,
  presentationDirection,
  presentationProgress: p,
}) => {
  if (presentationDirection === "exiting") {
    return <AbsoluteFill>{children}</AbsoluteFill>;
  }
  const pos = interpolate(p, [0, 1], [-15, 115]);
  const mask = `linear-gradient(100deg, #000 ${pos - 4}%, transparent ${pos}%)`;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ maskImage: mask, WebkitMaskImage: mask }}>
        {children}
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          mixBlendMode: "screen",
          background: `linear-gradient(100deg, transparent ${pos - 10}%, rgba(255,195,90,0.55) ${pos - 2}%, rgba(255,241,210,0.95) ${pos}%, transparent ${pos + 4}%)`,
        }}
      />
    </AbsoluteFill>
  );
};
export const lightSweep = (): TransitionPresentation<Record<string, never>> => ({
  component: LightSweep,
  props: {},
});

// ③ 竹帘：一条条竖向的帘片依次拉开
const Blinds: React.FC<TransitionPresentationComponentProps<{ count: number }>> = ({
  children,
  presentationDirection,
  presentationProgress: p,
  passedProps: { count },
}) => {
  if (presentationDirection === "exiting") {
    return (
      <AbsoluteFill
        style={{
          scale: interpolate(p, [0, 1], [1, 0.96]),
          filter: `brightness(${interpolate(p, [0, 1], [1, 0.4])})`,
        }}
      >
        {children}
      </AbsoluteFill>
    );
  }
  const stagger = 0.07;
  const w = 100 / count;
  const stops: string[] = [];
  for (let k = 0; k < count; k++) {
    const sp = interpolate(p, [k * stagger, 1 - (count - 1 - k) * stagger], [0, 1], {
      ...CLAMP,
      easing: theme.ease.inOut,
    });
    const a = k * w;
    const b = a + sp * w;
    stops.push(`#000 ${a}%`, `#000 ${b}%`, `transparent ${b}%`, `transparent ${a + w}%`);
  }
  const mask = `linear-gradient(90deg, ${stops.join(", ")})`;
  return (
    <AbsoluteFill style={{ maskImage: mask, WebkitMaskImage: mask }}>
      {children}
    </AbsoluteFill>
  );
};
export const blinds = (count = 8): TransitionPresentation<{ count: number }> => ({
  component: Blinds,
  props: { count },
});

// ⑤ 雾化：旧场景散焦放大，新场景从雾中聚焦
const BlurDissolve: React.FC<TransitionPresentationComponentProps<Record<string, never>>> = ({
  children,
  presentationDirection,
  presentationProgress: p,
}) => {
  const exiting = presentationDirection === "exiting";
  return (
    <AbsoluteFill
      style={{
        opacity: exiting ? 1 : p,
        filter: `blur(${exiting ? p * 18 : (1 - p) * 18}px)`,
        scale: exiting ? 1 + p * 0.1 : 0.94 + p * 0.06,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
export const blurDissolve = (): TransitionPresentation<Record<string, never>> => ({
  component: BlurDissolve,
  props: {},
});

// ⑥ 闪白：灯光过曝成一片暖白，再从白中显出新场景
const Flash: React.FC<TransitionPresentationComponentProps<Record<string, never>>> = ({
  children,
  presentationDirection,
  presentationProgress: p,
}) => {
  if (presentationDirection === "exiting") {
    const q = interpolate(p, [0, 0.5], [0, 1], { ...CLAMP, easing: theme.ease.in });
    return (
      <AbsoluteFill>
        <AbsoluteFill style={{ filter: `brightness(${1 + q * 2})` }}>{children}</AbsoluteFill>
        <AbsoluteFill style={{ backgroundColor: theme.color.lightHot, opacity: q }} />
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill style={{ opacity: p < 0.5 ? 0 : 1 }}>
      {children}
      <AbsoluteFill
        style={{
          backgroundColor: theme.color.lightHot,
          opacity: interpolate(p, [0.5, 1], [1, 0], { ...CLAMP, easing: theme.ease.out }),
        }}
      />
    </AbsoluteFill>
  );
};
export const flash = (): TransitionPresentation<Record<string, never>> => ({
  component: Flash,
  props: {},
});

// ⑦ 裂开：画面沿一条金色裂缝左右分开，新场景从裂缝中出现
const JAG = new Array(19).fill(0).map((_, i) => ({
  x: W / 2 + (random(`split-${i}`) - 0.5) * 120,
  y: -30 + i * 63,
}));
const jagPoints = (dx: number) => JAG.map((q) => `${q.x + dx}px ${q.y}px`);
const jagSvg = (dx: number) => JAG.map((q) => `${q.x + dx},${q.y}`).join(" ");

const CrackSplit: React.FC<TransitionPresentationComponentProps<Record<string, never>>> = ({
  children,
  presentationDirection,
  presentationProgress: p,
}) => {
  const g = interpolate(p, [0.12, 1], [0, 1100], { ...CLAMP, easing: theme.ease.in });
  // TransitionSeries 在整个场景期间都会以 progress=0 包裹 exiting 组件；
  // 裂缝尚未张开时只渲染一份画面，避免两半拼接处出现细缝
  if (presentationDirection === "exiting" && g < 0.5) {
    return <AbsoluteFill>{children}</AbsoluteFill>;
  }
  if (presentationDirection === "exiting") {
    const left = `polygon(-10px -40px, ${jagPoints(0).join(", ")}, -10px ${H + 40}px)`;
    const right = `polygon(${W + 10}px -40px, ${jagPoints(0).join(", ")}, ${W + 10}px ${H + 40}px)`;
    return (
      <AbsoluteFill>
        <AbsoluteFill style={{ clipPath: left, translate: `${-g}px 0px`, rotate: `${-g * 0.002}deg` }}>
          {children}
        </AbsoluteFill>
        <AbsoluteFill style={{ clipPath: right, translate: `${g}px 0px`, rotate: `${g * 0.002}deg` }}>
          {children}
        </AbsoluteFill>
      </AbsoluteFill>
    );
  }
  const band = `polygon(${[...jagPoints(-g), ...jagPoints(g).reverse()].join(", ")})`;
  const edge = interpolate(p, [0, 0.12, 0.7, 1], [0, 1, 1, 0], CLAMP);
  const draw = interpolate(p, [0, 0.12], [1, 0], CLAMP);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ clipPath: band, scale: interpolate(p, [0, 1], [1.12, 1]) }}>
        {children}
      </AbsoluteFill>
      <svg width={W} height={H} style={{ position: "absolute", opacity: edge }}>
        {[-g, g].map((dx, i) => (
          <polyline
            key={i}
            points={jagSvg(dx)}
            fill="none"
            stroke={theme.color.lightHot}
            strokeWidth={4}
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={draw}
            style={{ filter: `drop-shadow(0 0 12px ${theme.color.light})` }}
          />
        ))}
      </svg>
    </AbsoluteFill>
  );
};
export const crackSplit = (): TransitionPresentation<Record<string, never>> => ({
  component: CrackSplit,
  props: {},
});

// ⑧ 穿越：镜头冲进火焰中心，再从光里落到新场景
const ZoomThrough: React.FC<TransitionPresentationComponentProps<Point>> = ({
  children,
  presentationDirection,
  presentationProgress: p,
  passedProps: { cx, cy },
}) => {
  if (presentationDirection === "exiting") {
    return (
      <AbsoluteFill
        style={{
          transformOrigin: `${cx}px ${cy}px`,
          scale: Math.pow(6, p),
          opacity: interpolate(p, [0.35, 0.75], [1, 0], CLAMP),
        }}
      >
        {children}
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill
      style={{
        opacity: interpolate(p, [0.4, 0.95], [0, 1], CLAMP),
        scale: interpolate(p, [0.4, 1], [1.25, 1], { ...CLAMP, easing: theme.ease.out }),
        filter: `blur(${interpolate(p, [0.4, 1], [14, 0], CLAMP)}px)`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
export const zoomThrough = (props: Point): TransitionPresentation<Point> => ({
  component: ZoomThrough,
  props,
});
