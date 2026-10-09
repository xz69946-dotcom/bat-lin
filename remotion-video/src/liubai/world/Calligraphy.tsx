import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { BEAT, SPOT } from "../timeline";
import { CLAMP, theme } from "../theme";
import { Inscription } from "./Inscription";

const SIZE = theme.type.calligraphy;
// 两列竖写，自右向左：计白 / 当黑。「白」字只勾轮廓、不填墨
const CHARS = [
  { ch: "计", col: 0, row: 0 },
  { ch: "白", col: 0, row: 1, hollow: true },
  { ch: "当", col: 1, row: 0 },
  { ch: "黑", col: 1, row: 1 },
];
const RIGHT = SPOT.calligraphy.x + 330;
const TOP = SPOT.calligraphy.y - 360;

export const CalligraphyText: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  return (
    <>
      {CHARS.map((c, i) => {
        // 逐字由上而下「写」出：遮罩从字头扫到字尾
        const p = interpolate(t, [BEAT.calligraphy + i * 1.5, BEAT.calligraphy + i * 1.5 + 1.3], [0, 1], {
          ...CLAMP,
          easing: theme.ease.inOut,
        });
        const edge = p * 130 - 15;
        const mask = `linear-gradient(180deg, #000 ${edge}%, transparent ${edge + 15}%)`;
        return (
          <div
            key={c.ch}
            style={{
              position: "absolute",
              left: RIGHT - (c.col + 1) * SIZE * 1.08,
              top: TOP + c.row * SIZE * 1.02,
              width: SIZE,
              height: SIZE * 1.05,
              fontFamily: theme.font.brush,
              fontSize: SIZE,
              lineHeight: 1,
              textAlign: "center",
              color: c.hollow ? "transparent" : theme.color.ink,
              WebkitTextStroke: c.hollow ? `3px ${theme.color.ink}` : undefined,
              maskImage: mask,
              WebkitMaskImage: mask,
            }}
          >
            {c.ch}
          </div>
        );
      })}
      <Inscription
        x={RIGHT - SIZE * 1.08 - 30}
        y={TOP + 2 * SIZE * 1.02 + 30}
        columns={["邓石如 语"]}
        size={30}
        start={BEAT.calligraphy + 6.4}
        color={theme.color.inkMid}
      />
      <Inscription
        x={RIGHT - 2 * SIZE * 1.08 - 90}
        y={TOP + 40}
        columns={["空白不是没有，", "是留给你的位置。"]}
        start={BEAT.calligraphy + 8}
      />
    </>
  );
};
