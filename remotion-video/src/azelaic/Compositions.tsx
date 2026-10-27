import React from "react";
import { Composition } from "remotion";
import { Azelaic } from "./Azelaic";
import { FPS, HEIGHT, TOTAL_FRAMES, WIDTH } from "./timeline";

export const AzelaicCompositions: React.FC = () => (
  <Composition id="Azelaic" component={Azelaic} durationInFrames={TOTAL_FRAMES} fps={FPS} width={WIDTH} height={HEIGHT} />
);
