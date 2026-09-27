import React from "react";
import { Composition, Folder } from "remotion";
import { CosmicTruths } from "./CosmicTruths";
import { FPS, scene, TOTAL_FRAMES } from "./timeline";
import { theme } from "./theme";
import { C1Bang } from "./scenes/C1Bang";
import { C2Expansion } from "./scenes/C2Expansion";
import { C3Light } from "./scenes/C3Light";
import { C4Gravity } from "./scenes/C4Gravity";
import { C5Energy } from "./scenes/C5Energy";
import { C6Stardust } from "./scenes/C6Stardust";
import { C7Entropy } from "./scenes/C7Entropy";
import { C8Quantum } from "./scenes/C8Quantum";
import { C9Dark } from "./scenes/C9Dark";
import { C10Finale } from "./scenes/C10Finale";

const SCENES = [
  { id: "CT-01-Bang", component: C1Bang, duration: scene.bang },
  { id: "CT-02-Expansion", component: C2Expansion, duration: scene.expansion },
  { id: "CT-03-Light", component: C3Light, duration: scene.light },
  { id: "CT-04-Gravity", component: C4Gravity, duration: scene.gravity },
  { id: "CT-05-Energy", component: C5Energy, duration: scene.energy },
  { id: "CT-06-Stardust", component: C6Stardust, duration: scene.stardust },
  { id: "CT-07-Entropy", component: C7Entropy, duration: scene.entropy },
  { id: "CT-08-Quantum", component: C8Quantum, duration: scene.quantum },
  { id: "CT-09-Dark", component: C9Dark, duration: scene.dark },
  { id: "CT-10-Finale", component: C10Finale, duration: scene.finale },
];

// 单独预览的场景没有全局星空，背景为纯深空色
export const CosmicTruthsCompositions: React.FC = () => (
  <>
    <Folder name="CosmicTruths-Scenes">
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
      id="CosmicTruths"
      component={CosmicTruths}
      durationInFrames={TOTAL_FRAMES}
      fps={FPS}
      width={theme.size.width}
      height={theme.size.height}
    />
  </>
);
