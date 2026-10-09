import React from "react";
import { Composition, Folder, Still } from "remotion";
import { LiuBai } from "./LiuBai";
import { PAPER_TILE, PaperTile } from "./PaperTile";
import { FPS, TOTAL_FRAMES } from "./timeline";
import { theme } from "./theme";

export const LiuBaiCompositions: React.FC = () => (
  <>
    <Folder name="LiuBai-Assets">
      {/* 用于导出宣纸纹理：npx remotion still LiuBai-PaperTile public/liubai/paper.png */}
      <Still id="LiuBai-PaperTile" component={PaperTile} width={PAPER_TILE} height={PAPER_TILE} />
    </Folder>
    <Composition
      id="LiuBai"
      component={LiuBai}
      durationInFrames={TOTAL_FRAMES}
      fps={FPS}
      width={theme.size.width}
      height={theme.size.height}
    />
  </>
);
