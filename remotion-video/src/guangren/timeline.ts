// 《光韧》时间轴：所有场景与转场时长都在这里定义（秒 × fps）。
export const FPS = 30;

const s = (seconds: number) => Math.round(seconds * FPS);

export const scene = {
  spark: s(14), // 序 · 微光
  crack: s(14), // 01 裂隙
  prism: s(15), // 02 折射
  bamboo: s(14), // 03 竹
  roots: s(14), // 04 根
  lighthouse: s(15), // 05 灯塔
  kintsugi: s(14), // 06 金缮
  embers: s(14), // 07 星火
  dawn: s(14), // 终 · 破晓
} as const;

// 每个转场 1 秒；转场期间两个场景重叠
export const TRANSITION = s(1);

const sceneCount = Object.keys(scene).length;

export const TOTAL_FRAMES =
  Object.values(scene).reduce((a, b) => a + b, 0) -
  (sceneCount - 1) * TRANSITION;
