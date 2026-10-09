import React from "react";
import { AbsoluteFill, random } from "remotion";
import { theme } from "./theme";

// 生成宣纸纹理贴图（仅用于导出 public/liubai/paper.png，不进入成片时间轴）：
// 细密的纸纤维 + 低频的明暗起伏。导出后在世界坐标里平铺，跟着镜头一起移动。
export const PAPER_TILE = 512;

const FIBERS = new Array(70).fill(0).map((_, i) => ({
  x: random(`pf-x-${i}`) * PAPER_TILE,
  y: random(`pf-y-${i}`) * PAPER_TILE,
  a: random(`pf-a-${i}`) * Math.PI,
  l: 20 + random(`pf-l-${i}`) * 70,
  o: 0.04 + random(`pf-o-${i}`) * 0.07,
}));

export const PaperTile: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: theme.color.paper }}>
    <svg width={PAPER_TILE} height={PAPER_TILE}>
      <filter id="pt-grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={2} stitchTiles="stitch" />
        <feColorMatrix type="matrix" values="0 0 0 0 0.35  0 0 0 0 0.3  0 0 0 0 0.22  0 0 0 0.22 -0.04" />
      </filter>
      <filter id="pt-cloud">
        <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves={3} seed={9} stitchTiles="stitch" />
        <feColorMatrix type="matrix" values="0 0 0 0 0.45  0 0 0 0 0.38  0 0 0 0 0.25  0 0 0 0.16 -0.03" />
      </filter>
      <rect width={PAPER_TILE} height={PAPER_TILE} filter="url(#pt-cloud)" />
      <rect width={PAPER_TILE} height={PAPER_TILE} filter="url(#pt-grain)" />
      {FIBERS.map((f, i) =>
        [-PAPER_TILE, 0, PAPER_TILE].map((ox) =>
          [-PAPER_TILE, 0, PAPER_TILE].map((oy) => (
            <path
              key={`${i}-${ox}-${oy}`}
              d={`M ${f.x + ox} ${f.y + oy} q ${Math.cos(f.a) * f.l * 0.5 + 6} ${Math.sin(f.a) * f.l * 0.5 - 6} ${Math.cos(f.a) * f.l} ${Math.sin(f.a) * f.l}`}
              stroke="#6B5B44"
              strokeOpacity={f.o}
              strokeWidth={0.8}
              fill="none"
            />
          )),
        ),
      )}
    </svg>
  </AbsoluteFill>
);
