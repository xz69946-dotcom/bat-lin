import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import type { TransitionPresentation } from "@remotion/transitions";
import { Hud } from "./components/Hud";
import { Nebula, Starfield } from "./components/Starfield";
import { CLAMP, theme } from "./theme";
import { FPS, moves, scene, TOTAL_FRAMES, TRANSITION } from "./timeline";
import { flashBloom, whipPan, zoomIn, zoomOut } from "./transitions";
import type { Focus } from "./transitions";
import { C1Bang } from "./scenes/C1Bang";
import { C2Expansion } from "./scenes/C2Expansion";
import { C3Light } from "./scenes/C3Light";
import { C4Gravity, WELL } from "./scenes/C4Gravity";
import { C5Energy } from "./scenes/C5Energy";
import { C6Stardust } from "./scenes/C6Stardust";
import { C7Entropy } from "./scenes/C7Entropy";
import { C8Quantum } from "./scenes/C8Quantum";
import { C9Dark } from "./scenes/C9Dark";
import { C10Finale } from "./scenes/C10Finale";

const timing = linearTiming({ durationInFrames: TRANSITION, easing: theme.ease.inOut });

// 每个转场的焦点：推进时冲向画面里的那个关键物体
const presentations: TransitionPresentation<Focus>[] = [
  zoomOut({ cx: 960, cy: 540 }), // 奇点 → 膨胀
  zoomIn({ cx: 1340, cy: 470 }), // 冲进「银河系」
  whipPan(), // 光速 → 引力
  zoomIn({ cx: WELL.x, cy: WELL.y + 156 }), // 钻进恒星
  flashBloom(), // 聚变之光 → 超新星
  zoomIn({ cx: 1350, cy: 400 }), // 冲进飞散的元素
  zoomIn({ cx: 560, cy: 470 }), // 冲进一颗粒子
  zoomOut({ cx: 1400, cy: 560 }), // 从量子尺度拉到宇宙网
  zoomIn({ cx: 560, cy: 470 }), // 冲进「5%」
];

if (presentations.length !== moves.length) {
  throw new Error("transitions and camera moves are out of sync");
}

const SCENES: { name: string; duration: number; el: React.ReactNode }[] = [
  { name: "序 · 奇点", duration: scene.bang, el: <C1Bang /> },
  { name: "01 宇宙在膨胀", duration: scene.expansion, el: <C2Expansion /> },
  { name: "02 光速不可超越", duration: scene.light, el: <C3Light /> },
  { name: "03 引力即时空弯曲", duration: scene.gravity, el: <C4Gravity /> },
  { name: "04 质量即能量", duration: scene.energy, el: <C5Energy /> },
  { name: "05 我们由星尘构成", duration: scene.stardust, el: <C6Stardust /> },
  { name: "06 熵总在增加", duration: scene.entropy, el: <C7Entropy /> },
  { name: "07 不确定性原理", duration: scene.quantum, el: <C8Quantum /> },
  { name: "08 我们只看见了 5%", duration: scene.dark, el: <C9Dark /> },
  { name: "终 · 可被理解", duration: scene.finale, el: <C10Finale /> },
];

// 图层：星云 → 星空（全片连续）→ 场景（TransitionSeries）→ 常驻界面 → 片尾淡出
export const CosmicTruths: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: theme.color.bg }}>
      <Nebula />
      <Starfield />
      <TransitionSeries>
        {SCENES.flatMap((s, i) => [
          <TransitionSeries.Sequence key={s.name} name={s.name} durationInFrames={s.duration}>
            {s.el}
          </TransitionSeries.Sequence>,
          ...(i < SCENES.length - 1
            ? [<TransitionSeries.Transition key={`t${i}`} presentation={presentations[i]} timing={timing} />]
            : []),
        ])}
      </TransitionSeries>
      <Hud />
      <AbsoluteFill
        style={{
          backgroundColor: theme.color.bg,
          opacity: interpolate(frame, [TOTAL_FRAMES - 1.6 * FPS, TOTAL_FRAMES - 0.2 * FPS], [0, 1], CLAMP),
        }}
      />
    </AbsoluteFill>
  );
};
