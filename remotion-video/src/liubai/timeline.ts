// 《留白》时间轴。全片是一个连续镜头在一幅手卷上游走（从右往左，与手卷的展读方向一致），
// 没有剪切：每一段的「转场」就是镜头在两处画面之间的移动。
export const FPS = 30;
export const DURATION = 120; // 秒
export const TOTAL_FRAMES = DURATION * FPS;

// 手卷的世界坐标（像素）。x 从左到右，展读从右端开始。
export const SCROLL = { width: 10400, top: -300, bottom: 1500 };

// 各段在卷上的位置
export const SPOT = {
  title: { x: 9700, y: 700 },
  mountains: { x: 8100, y: 640 },
  river: { x: 6000, y: 700 },
  plum: { x: 4300, y: 640 },
  moon: { x: 3000, y: 300 },
  calligraphy: { x: 1650, y: 600 },
  seal: { x: 300, y: 760 },
} as const;

export type CameraKey = { t: number; x: number; y: number; z: number };

// 镜头关键帧（秒）。相邻两帧之间用缓动曲线移动；停留时仍有缓慢漂移。
export const CAMERA: CameraKey[] = [
  { t: 0, x: 9700, y: 700, z: 1.5 },
  { t: 9, x: 9620, y: 690, z: 1.36 },
  { t: 15, x: 8400, y: 640, z: 1.0 },
  { t: 24, x: 7800, y: 650, z: 1.0 },
  { t: 30, x: 6100, y: 700, z: 1.0 },
  { t: 40, x: 5700, y: 700, z: 1.04 },
  { t: 46, x: 4350, y: 640, z: 1.1 },
  { t: 56, x: 4150, y: 600, z: 1.12 },
  { t: 62, x: 3000, y: 300, z: 1.0 },
  { t: 74, x: 2850, y: 320, z: 1.04 },
  { t: 80, x: 1650, y: 600, z: 1.0 },
  { t: 92, x: 1500, y: 620, z: 1.05 },
  { t: 97, x: 470, y: 700, z: 1.8 },
  { t: 101, x: 490, y: 690, z: 1.7 },
  // 拉远：整幅手卷尽收眼底
  { t: 109, x: 5200, y: 600, z: 0.163 },
  { t: 120, x: 5200, y: 600, z: 0.158 },
];

// 每段画面开始「落墨」的时间（秒）
export const BEAT = {
  drop: 1.4,
  title: 4,
  mountains: 11,
  river: 25,
  plum: 42,
  moon: 58,
  calligraphy: 76,
  colophon: 90,
  stamp: 98.5,
  finale: 108,
} as const;
