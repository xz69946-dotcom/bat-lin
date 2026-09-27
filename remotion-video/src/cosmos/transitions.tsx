import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import type {
  TransitionPresentation,
  TransitionPresentationComponentProps,
} from "@remotion/transitions";
import { CLAMP, theme } from "./theme";

// 四种镜头语言，与背景星空的运动方向一致：
// 推进（in）、拉远（out）、横摇（pan）、闪光（flash）。
// 注意：TransitionSeries 会在整个场景期间以 progress=0 包裹 exiting 组件，
// 所以 progress=0 时必须是「无效果」。

export type Focus = { cx: number; cy: number };

const blur = (px: number) => (px > 0.1 ? `blur(${px}px)` : "none");

// 推进：旧画面朝焦点放大冲出，新画面从远处迎上来
const ZoomIn: React.FC<TransitionPresentationComponentProps<Focus>> = ({
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
          scale: `${Math.pow(5, p)}`,
          opacity: interpolate(p, [0.25, 0.7], [1, 0], CLAMP),
          filter: blur(p * 10),
        }}
      >
        {children}
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill
      style={{
        scale: `${Math.pow(0.4, 1 - p)}`,
        opacity: interpolate(p, [0.35, 0.85], [0, 1], CLAMP),
        filter: blur((1 - p) * 8),
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
export const zoomIn = (props: Focus = { cx: 960, cy: 540 }): TransitionPresentation<Focus> => ({
  component: ZoomIn,
  props,
});

// 拉远：旧画面缩成远处的一点，新画面从镜头前退回到位
const ZoomOut: React.FC<TransitionPresentationComponentProps<Focus>> = ({
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
          scale: `${Math.pow(0.25, p)}`,
          opacity: interpolate(p, [0.3, 0.8], [1, 0], CLAMP),
        }}
      >
        {children}
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill
      style={{
        scale: `${Math.pow(2.6, 1 - p)}`,
        opacity: interpolate(p, [0.2, 0.7], [0, 1], CLAMP),
        filter: blur((1 - p) * 14),
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
export const zoomOut = (props: Focus = { cx: 960, cy: 540 }): TransitionPresentation<Focus> => ({
  component: ZoomOut,
  props,
});

// 横摇：两幅画面一起向左甩过，中段带运动模糊
const WhipPan: React.FC<TransitionPresentationComponentProps<Focus>> = ({
  children,
  presentationDirection,
  presentationProgress: p,
}) => {
  const speed = Math.sin(Math.PI * p);
  const exiting = presentationDirection === "exiting";
  return (
    <AbsoluteFill
      style={{
        translate: `${exiting ? -p * 1920 : (1 - p) * 1920}px 0px`,
        filter: blur(speed * 18),
        opacity: exiting ? interpolate(p, [0.5, 0.9], [1, 0], CLAMP) : interpolate(p, [0.1, 0.5], [0, 1], CLAMP),
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
export const whipPan = (): TransitionPresentation<Focus> => ({
  component: WhipPan,
  props: { cx: 960, cy: 540 },
});

// 闪光：聚变的光吞没画面，再从光里显出下一幕
const FlashBloom: React.FC<TransitionPresentationComponentProps<Focus>> = ({
  children,
  presentationDirection,
  presentationProgress: p,
}) => {
  if (presentationDirection === "exiting") {
    const q = interpolate(p, [0, 0.5], [0, 1], { ...CLAMP, easing: theme.ease.in });
    return (
      <AbsoluteFill>
        <AbsoluteFill style={{ filter: q > 0.01 ? `brightness(${1 + q * 2})` : "none", scale: `${1 + q * 0.08}` }}>
          {children}
        </AbsoluteFill>
        <AbsoluteFill
          style={{
            opacity: q,
            background: `radial-gradient(circle at 50% 50%, ${theme.color.sunHot} 0%, ${theme.color.sun} 60%, ${theme.color.sunHot} 100%)`,
          }}
        />
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill style={{ opacity: p < 0.5 ? 0 : 1 }}>
      <AbsoluteFill style={{ scale: `${interpolate(p, [0.5, 1], [1.12, 1], CLAMP)}` }}>{children}</AbsoluteFill>
      <AbsoluteFill
        style={{
          opacity: interpolate(p, [0.5, 1], [1, 0], { ...CLAMP, easing: theme.ease.out }),
          background: `radial-gradient(circle at 50% 50%, ${theme.color.sunHot} 0%, ${theme.color.sun} 60%, ${theme.color.sunHot} 100%)`,
        }}
      />
    </AbsoluteFill>
  );
};
export const flashBloom = (): TransitionPresentation<Focus> => ({
  component: FlashBloom,
  props: { cx: 960, cy: 540 },
});
