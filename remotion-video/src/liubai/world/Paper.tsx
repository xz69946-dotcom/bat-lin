import React from "react";
import { Img, staticFile } from "remotion";
import { SCROLL } from "../timeline";
import { theme } from "../theme";

const H = SCROLL.bottom - SCROLL.top;
const TILE = 512;
const TILES: [number, number][] = [];
for (let x = 0; x < SCROLL.width; x += TILE) for (let y = 0; y < H; y += TILE) TILES.push([x, y]);

// 手卷本体：宣纸 + 装裱的细边 + 两端的卷轴。片尾拉远时这些细节才完整露出来
export const Paper: React.FC = () => (
  <>
    {/* 卷轴 */}
    {[-70, SCROLL.width + 10].map((x) => (
      <div
        key={x}
        style={{
          position: "absolute",
          left: x,
          top: SCROLL.top - 70,
          width: 60,
          height: H + 140,
          borderRadius: 30,
          background: "linear-gradient(90deg, #2A1E15 0%, #6A4A33 45%, #3A2A1E 100%)",
          boxShadow: "0 40px 80px rgba(0,0,0,0.5)",
        }}
      />
    ))}
    <div
      style={{
        position: "absolute",
        left: 0,
        top: SCROLL.top,
        width: SCROLL.width,
        height: H,
        backgroundColor: theme.color.paper,
        boxShadow: "0 60px 160px rgba(0,0,0,0.55)",
        overflow: "hidden",
      }}
    >
      {/* 宣纸纹理贴图平铺（用 <Img> 保证渲染前已加载） */}
      {TILES.map(([x, y]) => (
        <Img
          key={`${x}-${y}`}
          src={staticFile("liubai/paper.png")}
          style={{ position: "absolute", left: x, top: y, width: TILE, height: TILE }}
        />
      ))}
      {/* 纸边微微泛黄 */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(150,120,80,0.16) 0%, rgba(150,120,80,0) 8%, rgba(150,120,80,0) 92%, rgba(150,120,80,0.18) 100%)",
        }}
      />
      {/* 装裱的界线 */}
      <div
        style={{
          position: "absolute",
          left: 40,
          right: 40,
          top: 46,
          bottom: 46,
          border: `2px solid rgba(110,90,60,0.28)`,
        }}
      />
    </div>
  </>
);
