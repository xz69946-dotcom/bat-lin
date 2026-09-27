import { Easing } from "remotion";
import { fonts } from "../fonts";

// 《宇宙真理》的唯一设计语言：深空底 + 星光蓝为主，恒星橙与暗物质紫为辅。
export const theme = {
  size: { width: 1920, height: 1080 },
  color: {
    bg: "#03040A",
    ink: "#EAF0FF",
    muted: "#7C86A2",
    faint: "rgba(234,240,255,0.14)",
    // 主强调色：星光
    star: "#8FD3FF",
    starHot: "#E6F6FF",
    // 辅助色：恒星 / 能量
    sun: "#FFB86B",
    sunHot: "#FFE8C7",
    // 辅助色：暗物质 / 量子
    dark: "#9B8CFF",
    darkDeep: "#4B3F9E",
  },
  font: {
    title: fonts.serifSC,
    body: fonts.sansSC,
    math: fonts.math,
    mono: fonts.mono,
  },
  type: {
    hero: 200,
    title: 104,
    equation: 84,
    fact: 46,
    label: 30,
  },
  stroke: { hair: 1.5, thin: 2.5, bold: 5 },
  ease: {
    out: Easing.bezier(0.16, 1, 0.3, 1),
    inOut: Easing.bezier(0.65, 0, 0.35, 1),
    in: Easing.bezier(0.7, 0, 0.84, 0),
  },
} as const;

export const CLAMP = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;
