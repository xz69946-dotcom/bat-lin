// 《宇宙真理》时间轴：场景、转场与镜头运动都从这里派生（秒 × fps）。
export const FPS = 30;
const s = (seconds: number) => Math.round(seconds * FPS);

export type CameraMove = "in" | "out" | "pan" | "flash";

export const scene = {
  bang: s(14), // 序：奇点
  expansion: s(13), // 真理 01 宇宙在膨胀
  light: s(13), // 真理 02 光速是上限
  gravity: s(13), // 真理 03 引力是时空弯曲
  energy: s(13), // 真理 04 质量即能量
  stardust: s(13), // 真理 05 我们是星尘
  entropy: s(12), // 真理 06 熵总在增加
  quantum: s(12), // 真理 07 不确定性
  dark: s(13), // 真理 08 只看见 5%
  finale: s(13), // 终：可被理解
} as const;

export const SCENE_KEYS = Object.keys(scene) as (keyof typeof scene)[];

export const TRANSITION = s(1);

// 每个转场的镜头语言：推进、拉远、横摇、闪光。背景星空会跟着一起运动。
export const moves: CameraMove[] = [
  "out", // 奇点 → 膨胀：拉远看见整个宇宙
  "in", // 膨胀 → 光速：推进到银河系、太阳
  "pan", // 光速 → 引力：横摇
  "in", // 引力 → 质能：钻进恒星核心
  "flash", // 质能 → 星尘：核聚变的闪光化为超新星
  "in", // 星尘 → 熵：推进到微粒
  "in", // 熵 → 量子：继续推进到最小尺度
  "out", // 量子 → 暗宇宙：从最小拉到最大
  "in", // 暗宇宙 → 终章：万物收束为一点
];

export const sceneStart = SCENE_KEYS.map(
  (_, k) =>
    SCENE_KEYS.slice(0, k).reduce((a, key) => a + scene[key], 0) -
    k * TRANSITION,
);

// 第 k 个转场（场景 k → k+1）的起始帧
export const transitionStart = moves.map((_, k) => sceneStart[k + 1]);

export const TOTAL_FRAMES =
  SCENE_KEYS.reduce((a, key) => a + scene[key], 0) -
  (SCENE_KEYS.length - 1) * TRANSITION;
