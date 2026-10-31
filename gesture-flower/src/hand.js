import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";

const WASM = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.1.1/wasm";
const MODEL = "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";

// 21 个关键点里用到的编号
export const WRIST = 0;
export const TIPS = [4, 8, 12, 16, 20];
const MCP = [5, 9, 13, 17];
const FINGER_TIPS = [8, 12, 16, 20];

// 手骨架连线（画调试骨架用）
export const BONES = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [17, 18], [18, 19], [19, 20], [0, 17],
];

const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
const clamp01 = (v) => Math.min(1, Math.max(0, v));

// 手掌张开度 0（握拳）~ 1（完全张开）。
// 用 worldLandmarks（以手为中心、单位米的 3D 坐标），不受手离镜头远近和手掌朝向的影响。
export function opennessOf(world) {
  const w = world[WRIST];
  let fingers = 0;
  for (let i = 0; i < 4; i++) {
    // 指尖到手腕的距离 / 掌指关节到手腕的距离：握拳约 1.0，张开约 2.0
    const ratio = dist(world[FINGER_TIPS[i]], w) / dist(world[MCP[i]], w);
    fingers += clamp01((ratio - 1.15) / (1.85 - 1.15));
  }
  fingers /= 4;
  // 拇指：拇指尖到食指根部的距离 / 掌宽
  const palmWidth = dist(world[5], world[17]);
  const thumb = clamp01((dist(world[4], world[5]) / palmWidth - 0.55) / (1.05 - 0.55));
  return 0.82 * fingers + 0.18 * thumb;
}

export class HandTracker {
  constructor(video) {
    this.video = video;
    this.landmarker = null;
    this.lastVideoTime = -1;
    this.result = null;
  }

  async init(onStatus = () => {}) {
    onStatus("正在加载手势识别模型…");
    const fileset = await FilesetResolver.forVisionTasks(WASM);
    const make = (delegate) =>
      HandLandmarker.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: MODEL, delegate },
        runningMode: "VIDEO",
        numHands: 1,
        minHandDetectionConfidence: 0.6,
        minHandPresenceConfidence: 0.6,
        minTrackingConfidence: 0.5,
      });
    try {
      this.landmarker = await make("GPU");
    } catch (e) {
      console.warn("GPU 推理不可用，改用 CPU：", e);
      this.landmarker = await make("CPU");
    }
  }

  async startCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: false,
    });
    this.video.srcObject = stream;
    await this.video.play();
  }

  // 每帧调用：视频有新画面时才推理一次。返回最近一次的结果（没检测到手时为 null）
  update() {
    const v = this.video;
    if (!this.landmarker || v.readyState < 2) return null;
    if (v.currentTime !== this.lastVideoTime) {
      this.lastVideoTime = v.currentTime;
      const r = this.landmarker.detectForVideo(v, performance.now());
      this.result =
        r.landmarks && r.landmarks.length
          ? { landmarks: r.landmarks[0], world: r.worldLandmarks[0], handedness: r.handedness?.[0]?.[0]?.categoryName }
          : null;
    }
    return this.result;
  }
}

// One Euro 滤波：静止时强力去抖，快速移动时低延迟
export class OneEuro {
  constructor(minCutoff = 1.2, beta = 0.02, dCutoff = 1.0) {
    this.minCutoff = minCutoff;
    this.beta = beta;
    this.dCutoff = dCutoff;
    this.x = null;
    this.dx = 0;
  }
  static alpha(cutoff, dt) {
    const tau = 1 / (2 * Math.PI * cutoff);
    return 1 / (1 + tau / dt);
  }
  filter(value, dt) {
    if (this.x === null) {
      this.x = value;
      return value;
    }
    const dv = (value - this.x) / dt;
    this.dx += OneEuro.alpha(this.dCutoff, dt) * (dv - this.dx);
    const cutoff = this.minCutoff + this.beta * Math.abs(this.dx);
    this.x += OneEuro.alpha(cutoff, dt) * (value - this.x);
    return this.x;
  }
  reset() {
    this.x = null;
    this.dx = 0;
  }
}
