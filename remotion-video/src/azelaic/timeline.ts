import { Easing, interpolate } from "remotion";

export const FPS = 30;
export const DURATION_S = 120;
export const TOTAL_FRAMES = FPS * DURATION_S;
export const WIDTH = 1920;
export const HEIGHT = 1080;

// 各段起止（秒）
export const SEG = {
  title: [0, 9],
  molecule: [9, 21],
  dive: [21, 33],
  antibac: [33, 52],
  kerat: [52, 69],
  inflam: [69, 87],
  pigment: [87, 105],
  summary: [105, 120],
} as const;
export type SegKey = keyof typeof SEG;

export const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);

// 段内进度 0~1
export const prog = (t: number, a: number, b: number, easing = easeInOut) =>
  interpolate(t, [a, b], [0, 1], { ...CLAMP, easing });

// 某段可见度：开头淡入、结尾淡出
export const segAlpha = (t: number, key: SegKey, fadeIn = 0.8, fadeOut = 0.8) => {
  const [a, b] = SEG[key];
  return interpolate(t, [a, a + fadeIn, b - fadeOut, b], [0, 1, 1, 0], CLAMP);
};
