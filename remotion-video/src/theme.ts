import { Easing } from "remotion";
import { fonts } from "./fonts";

const fontFamily = fonts.sansSC;

export const theme = {
  color: {
    background: "#0F1115",
    ink: "#F2F2F0",
    muted: "#8A8F98",
    accent: "#FF6B3D",
  },
  font: {
    family: fontFamily,
    headline: 120,
    body: 48,
  },
  stroke: 10,
  ease: {
    out: Easing.bezier(0.16, 1, 0.3, 1),
    inOut: Easing.bezier(0.65, 0, 0.35, 1),
  },
} as const;

export const video = {
  width: 1920,
  height: 1080,
  fps: 30,
  durationInSeconds: 5,
} as const;
