import { Easing } from "remotion";
import { fonts } from "../fonts";

// 《留白》的唯一设计语言：宣纸、墨、一点朱砂。
export const theme = {
  size: { width: 1920, height: 1080 },
  color: {
    paper: "#F1EADC",
    paperShade: "#E4DAC6",
    ink: "#1C1A17",
    inkMid: "#4A4640",
    inkLight: "#8C857A",
    // 唯一强调色：朱砂
    vermilion: "#B5302A",
    // 片尾承托长卷的案几
    table: "#15120E",
    tableText: "#CFC5B3",
  },
  font: {
    serif: fonts.serifSC,
    brush: fonts.brush,
    latin: fonts.latin,
  },
  type: {
    inscription: 56,
    title: 260,
    calligraphy: 300,
    small: 30,
  },
  ease: {
    out: Easing.bezier(0.16, 1, 0.3, 1),
    inOut: Easing.bezier(0.65, 0, 0.35, 1),
    // 镜头移动：起步和停稳都很柔
    camera: Easing.bezier(0.45, 0, 0.25, 1),
    in: Easing.bezier(0.7, 0, 0.84, 0),
  },
} as const;

export const CLAMP = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;
