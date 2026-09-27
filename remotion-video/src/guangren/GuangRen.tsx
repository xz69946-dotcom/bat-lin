import React from "react";
import { AbsoluteFill } from "remotion";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { slide } from "@remotion/transitions/slide";
import { scene, TRANSITION } from "./timeline";
import { theme } from "./theme";
import {
  blinds,
  blurDissolve,
  crackSplit,
  flash,
  irisGlow,
  lightSweep,
  zoomThrough,
} from "./transitions";
import { S1Spark } from "./scenes/S1Spark";
import { S2Crack } from "./scenes/S2Crack";
import { S3Prism } from "./scenes/S3Prism";
import { S4Bamboo } from "./scenes/S4Bamboo";
import { S5Roots } from "./scenes/S5Roots";
import { S6Lighthouse } from "./scenes/S6Lighthouse";
import { S7Kintsugi } from "./scenes/S7Kintsugi";
import { S8Embers, FLAME } from "./scenes/S8Embers";
import { S9Dawn } from "./scenes/S9Dawn";

const timing = linearTiming({
  durationInFrames: TRANSITION,
  easing: theme.ease.inOut,
});

export const GuangRen: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: theme.color.bg }}>
    <TransitionSeries>
      <TransitionSeries.Sequence name="序 · 微光" durationInFrames={scene.spark}>
        <S1Spark />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={irisGlow({ cx: 960, cy: 470 })} timing={timing} />
      <TransitionSeries.Sequence name="01 裂隙" durationInFrames={scene.crack}>
        <S2Crack />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={lightSweep()} timing={timing} />
      <TransitionSeries.Sequence name="02 折射" durationInFrames={scene.prism}>
        <S3Prism />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={blinds(8)} timing={timing} />
      <TransitionSeries.Sequence name="03 竹" durationInFrames={scene.bamboo}>
        <S4Bamboo />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={slide({ direction: "from-bottom" })} timing={timing} />
      <TransitionSeries.Sequence name="04 根" durationInFrames={scene.roots}>
        <S5Roots />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={blurDissolve()} timing={timing} />
      <TransitionSeries.Sequence name="05 灯塔" durationInFrames={scene.lighthouse}>
        <S6Lighthouse />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={flash()} timing={timing} />
      <TransitionSeries.Sequence name="06 金缮" durationInFrames={scene.kintsugi}>
        <S7Kintsugi />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={crackSplit()} timing={timing} />
      <TransitionSeries.Sequence name="07 星火" durationInFrames={scene.embers}>
        <S8Embers />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={zoomThrough({ cx: FLAME.x, cy: FLAME.y + 40 })}
        timing={timing}
      />
      <TransitionSeries.Sequence name="终 · 破晓" durationInFrames={scene.dawn}>
        <S9Dawn />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  </AbsoluteFill>
);
