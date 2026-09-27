import React from "react";
import { Composition, Folder } from "remotion";
import { GuangRen } from "./GuangRen";
import { FPS, scene, TOTAL_FRAMES } from "./timeline";
import { theme } from "./theme";
import { S1Spark } from "./scenes/S1Spark";
import { S2Crack } from "./scenes/S2Crack";
import { S3Prism } from "./scenes/S3Prism";
import { S4Bamboo } from "./scenes/S4Bamboo";
import { S5Roots } from "./scenes/S5Roots";
import { S6Lighthouse } from "./scenes/S6Lighthouse";
import { S7Kintsugi } from "./scenes/S7Kintsugi";
import { S8Embers } from "./scenes/S8Embers";
import { S9Dawn } from "./scenes/S9Dawn";

const SCENES = [
  { id: "GR-1-Spark", component: S1Spark, duration: scene.spark },
  { id: "GR-2-Crack", component: S2Crack, duration: scene.crack },
  { id: "GR-3-Prism", component: S3Prism, duration: scene.prism },
  { id: "GR-4-Bamboo", component: S4Bamboo, duration: scene.bamboo },
  { id: "GR-5-Roots", component: S5Roots, duration: scene.roots },
  { id: "GR-6-Lighthouse", component: S6Lighthouse, duration: scene.lighthouse },
  { id: "GR-7-Kintsugi", component: S7Kintsugi, duration: scene.kintsugi },
  { id: "GR-8-Embers", component: S8Embers, duration: scene.embers },
  { id: "GR-9-Dawn", component: S9Dawn, duration: scene.dawn },
];

export const GuangRenCompositions: React.FC = () => (
  <>
    <Folder name="GuangRen-Scenes">
      {SCENES.map((s) => (
        <Composition
          key={s.id}
          id={s.id}
          component={s.component}
          durationInFrames={s.duration}
          fps={FPS}
          width={theme.size.width}
          height={theme.size.height}
        />
      ))}
    </Folder>
    <Composition
      id="GuangRen"
      component={GuangRen}
      durationInFrames={TOTAL_FRAMES}
      fps={FPS}
      width={theme.size.width}
      height={theme.size.height}
    />
  </>
);
