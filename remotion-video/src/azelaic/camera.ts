import * as THREE from "three";
import { easeInOut } from "./timeline";

type V = [number, number, number];
type Key = { t: number; pos: V; target: V; fov?: number };

// 镜头关键帧：两帧之间做缓入缓出插值
const KEYS: Key[] = [
  { t: 0, pos: [0, 30.0, 10.5], target: [0, 29.25, 0], fov: 34 },
  { t: 8.5, pos: [1.0, 30.3, 9.6], target: [0, 29.3, 0], fov: 34 },
  { t: 10.5, pos: [0, 30.6, 10.6], target: [0.3, 29.7, 0], fov: 34 },
  { t: 20.5, pos: [1.2, 30.8, 10.2], target: [0.3, 29.7, 0], fov: 34 },
  { t: 27, pos: [0.8, 8.5, 18.5], target: [-0.6, 1.2, 2], fov: 36 },
  { t: 32.5, pos: [2.2, 5.2, 17.5], target: [0.2, -0.8, 1.8], fov: 36 },
  { t: 35.5, pos: [-1.25, 0.55, 7.5], target: [-2.6, -0.05, 3.6], fov: 36 },
  { t: 51, pos: [-1.95, 0.45, 6.9], target: [-2.6, -0.05, 3.6], fov: 36 },
  { t: 54.5, pos: [-1.35, 2.75, 6.9], target: [-2.6, 1.1, 3.6], fov: 36 },
  { t: 68, pos: [-2.05, 2.95, 6.5], target: [-2.6, 1.1, 3.6], fov: 36 },
  { t: 71.5, pos: [-0.5, -0.65, 10.2], target: [-2.3, -1.25, 3.8], fov: 36 },
  { t: 86, pos: [-1.45, -0.85, 9.7], target: [-2.3, -1.25, 3.8], fov: 36 },
  { t: 89.5, pos: [4.7, 1.35, 7.1], target: [3.0, 0.4, 4.0], fov: 36 },
  { t: 104, pos: [3.8, 1.2, 6.7], target: [3.0, 0.4, 4.0], fov: 36 },
  { t: 108, pos: [3.5, 7.5, 21], target: [-3.2, -0.6, 1], fov: 36 },
  { t: 120, pos: [5.5, 7.0, 20], target: [-3.2, -0.6, 1], fov: 36 },
];

const lerp = (a: V, b: V, k: number): V => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];

export const camAt = (t: number) => {
  let i = 0;
  while (i < KEYS.length - 2 && t > KEYS[i + 1].t) i++;
  const a = KEYS[i];
  const b = KEYS[i + 1];
  const k = easeInOut(Math.max(0, Math.min(1, (t - a.t) / (b.t - a.t))));
  return { pos: lerp(a.pos, b.pos, k), target: lerp(a.target, b.target, k), fov: (a.fov ?? 36) + ((b.fov ?? 36) - (a.fov ?? 36)) * k };
};

// 把 3D 点投影到屏幕像素坐标（给 HTML 标注定位）
export const project = (t: number, p: THREE.Vector3, w: number, h: number) => {
  const c = camAt(t);
  const cam = new THREE.PerspectiveCamera(c.fov, w / h, 0.1, 300);
  cam.position.set(...c.pos);
  cam.lookAt(new THREE.Vector3(...c.target));
  cam.updateMatrixWorld();
  cam.updateProjectionMatrix();
  const v = p.clone().project(cam);
  return { x: ((v.x + 1) / 2) * w, y: ((1 - v.y) / 2) * h, visible: v.z < 1 };
};
