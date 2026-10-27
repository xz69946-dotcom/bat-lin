import React from "react";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import "../fonts";
import { Overlays } from "./Overlays";
import { Scene3D } from "./Scene3D";
import { AZ } from "./theme";

// 《壬二酸》：3D 皮肤近景科普动画
// 一条连续的镜头：分子特写 → 落到皮肤上 → 剖面全景 → 毛囊（抗菌、疏通）→ 真皮（抗炎）→ 基底层（淡斑）→ 回顾
export const Azelaic: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  return (
    <AbsoluteFill style={{ backgroundColor: AZ.bg }}>
      <ThreeCanvas width={width} height={height} gl={{ antialias: true }} camera={{ fov: 36, position: [0, 30, 10] }}>
        <Scene3D t={t} />
      </ThreeCanvas>
      {/* 暗角 */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.45) 100%)" }} />
      <Overlays t={t} />
    </AbsoluteFill>
  );
};
