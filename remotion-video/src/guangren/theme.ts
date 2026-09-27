import { Easing } from "remotion";
import { fonts } from "../fonts";

// 《光韧》的唯一设计语言：暗夜底 + 一种暖金色的光。
export const theme = {
  size: { width: 1920, height: 1080 },
  color: {
    bg: "#06070B",
    night: "#0C111D",
    slate: "#151B27",
    ink: "#F3EEE4",
    muted: "#8B8F9C",
    inkSoft: "rgba(243,238,228,0.78)",
    // 唯一强调色：光
    light: "#FFC35A",
    lightHot: "#FFF1D2",
    // 辅助色：夜与雨的冷蓝
    cold: "#4E6A9A",
    coldDeep: "#0A1226",
    // 泥土（根）
    soil: "#120F0C",
    // 仅在「折射」场景使用的光谱
    spectrum: [
      "#FF4D5E",
      "#FF8A3D",
      "#FFD23F",
      "#5BD17A",
      "#3FB6FF",
      "#5B6CFF",
      "#A45BFF",
    ],
  },
  font: {
    serif: fonts.serifSC,
    latin: fonts.latin,
    title: 240,
    line: 112,
    tagline: 80,
    en: 38,
    label: 32,
  },
  stroke: { hair: 1.5, thin: 3, beam: 10 },
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
