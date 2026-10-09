import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { cameraAt, stampShake } from "./camera";
import { Finale, Mist, Vignette } from "./Overlays";
import { BEAT, FPS, SCROLL } from "./timeline";
import { theme } from "./theme";
import { Defs } from "./world/Defs";
import { Paper } from "./world/Paper";
import { InkDropSvg, TitleText } from "./world/InkTitle";
import { MountainsSvg, MountainsText } from "./world/Mountains";
import { RiverSvg, RiverText } from "./world/River";
import { PlumSvg, PlumText } from "./world/Plum";
import { MoonSvg, MoonText } from "./world/Moon";
import { CalligraphyText } from "./world/Calligraphy";
import { ColophonText, SealSvg } from "./world/Colophon";

const H = SCROLL.bottom - SCROLL.top;

// 《留白》：一个连续镜头，在一幅自右向左展开的手卷上游走。
// 所有画面都画在同一张「纸」（世界坐标）上，镜头的移动就是转场。
export const LiuBai: React.FC = () => {
  const frame = useCurrentFrame();
  const cam = cameraAt(frame);
  const shake = stampShake(frame, BEAT.stamp * FPS);

  return (
    <AbsoluteFill style={{ backgroundColor: theme.color.table, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: SCROLL.width,
          height: SCROLL.bottom,
          transformOrigin: "0 0",
          // 顺序有关的多重变换：先把镜头中心移到原点，再缩放，再移到画面中央
          transform: `translate(${960 + shake.dx}px, ${540 + shake.dy}px) scale(${cam.z}) translate(${-cam.x}px, ${-cam.y}px)`,
        }}
      >
        <Paper />
        <svg
          width={SCROLL.width}
          height={H}
          viewBox={`0 ${SCROLL.top} ${SCROLL.width} ${H}`}
          style={{ position: "absolute", left: 0, top: SCROLL.top, overflow: "visible" }}
        >
          <Defs />
          <MoonSvg />
          <MountainsSvg />
          <RiverSvg />
          <PlumSvg />
          <InkDropSvg />
          <SealSvg />
        </svg>
        <TitleText />
        <MountainsText />
        <RiverText />
        <PlumText />
        <MoonText />
        <CalligraphyText />
        <ColophonText />
      </div>
      <Mist />
      <Vignette />
      <Finale />
    </AbsoluteFill>
  );
};
