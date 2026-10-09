import { interpolate } from "remotion";
import { CAMERA, FPS } from "./timeline";
import { CLAMP, theme } from "./theme";

export type Camera = { x: number; y: number; z: number };

// 镜头位置是时间的纯函数：在相邻关键帧之间按缓动曲线过渡，缩放在对数空间插值，
// 这样推拉的速度在视觉上是均匀的。
export const cameraAt = (frame: number): Camera => {
  const t = frame / FPS;
  const i = Math.max(0, CAMERA.findIndex((k, idx) => idx < CAMERA.length - 1 && t < CAMERA[idx + 1].t));
  const a = CAMERA[i];
  const b = CAMERA[Math.min(i + 1, CAMERA.length - 1)];
  if (a === b || t >= CAMERA[CAMERA.length - 1].t) {
    const last = CAMERA[CAMERA.length - 1];
    return { x: last.x, y: last.y, z: last.z };
  }
  const k = interpolate(t, [a.t, b.t], [0, 1], { ...CLAMP, easing: theme.ease.camera });
  return {
    x: a.x + (b.x - a.x) * k,
    y: a.y + (b.y - a.y) * k,
    z: Math.exp(Math.log(a.z) + (Math.log(b.z) - Math.log(a.z)) * k),
  };
};

// 盖印时的一下轻微震动
export const stampShake = (frame: number, stampFrame: number) => {
  const d = frame - stampFrame;
  if (d < 0 || d > 14) return { dx: 0, dy: 0 };
  const amp = 6 * Math.exp(-d / 3.5);
  return { dx: Math.sin(d * 2.7) * amp, dy: Math.cos(d * 3.1) * amp };
};
