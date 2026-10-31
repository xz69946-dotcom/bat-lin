import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { Flower } from "./flower.js";
import { BONES, HandTracker, OneEuro, TIPS, opennessOf } from "./hand.js";

const $ = (id) => document.getElementById(id);
const params = new URLSearchParams(location.search);
const video = $("cam");
const skel = $("skeleton");
const skelCtx = skel.getContext("2d");

// ---------------- 渲染器、相机、后期 ----------------
const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.setClearColor(0x07060d, 1);
$("stage").appendChild(renderer.domElement);

const CAM_Z = 5;
const camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 100);
camera.position.set(0, 0, CAM_Z);
const scene = new THREE.Scene();

// 背景：镜像、调暗的摄像头画面（按 object-fit: cover 裁切），花朵叠在真实的手上
const bgScene = new THREE.Scene();
const bgCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
const videoTex = new THREE.VideoTexture(video);
videoTex.colorSpace = THREE.SRGBColorSpace;
const bgMat = new THREE.ShaderMaterial({
  uniforms: { uTex: { value: videoTex }, uCrop: { value: new THREE.Vector2(1, 1) }, uOn: { value: 0 } },
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`,
  fragmentShader: `
    uniform sampler2D uTex; uniform vec2 uCrop; uniform float uOn; varying vec2 vUv;
    void main(){
      vec2 uv = (vUv - 0.5) * uCrop + 0.5;
      uv.x = 1.0 - uv.x;
      vec3 c = texture2D(uTex, uv).rgb;
      float l = dot(c, vec3(0.299, 0.587, 0.114));
      c = mix(vec3(l), c, 0.5) * 0.24;
      float vig = smoothstep(1.25, 0.35, length(vUv - 0.5) * 1.6);
      vec3 bg = vec3(0.0042, 0.0034, 0.0085); // 线性空间，输出后约为 #0B0912
      gl_FragColor = vec4(mix(bg, c * vig + bg * 0.3, uOn), 1.0);
    }`,
  depthWrite: false,
  depthTest: false,
});
bgScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), bgMat));

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(bgScene, bgCam));
const mainPass = new RenderPass(scene, camera);
mainPass.clear = false;
composer.addPass(mainPass);
const bloomPass = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.7, 0.45, 0.5);
composer.addPass(bloomPass);
composer.addPass(new OutputPass());

// 背景里缓慢漂浮的微光
const dust = (() => {
  const n = 900;
  const pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 14;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 9;
    pos[i * 3 + 2] = -6 + Math.random() * 5;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const m = new THREE.PointsMaterial({ color: 0xffb6dc, size: 0.035, transparent: true, opacity: 0.45, depthWrite: false, blending: THREE.AdditiveBlending });
  const p = new THREE.Points(g, m);
  scene.add(p);
  return p;
})();

const flower = new Flower();
scene.add(flower.object);

// ---------------- 屏幕/世界坐标换算 ----------------
const view = { halfW: 1, halfH: 1 };
function layout() {
  const w = innerWidth;
  const h = innerHeight;
  renderer.setSize(w, h);
  composer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  view.halfH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * CAM_Z;
  view.halfW = view.halfH * camera.aspect;
  flower.uniforms.uPixelRatio.value = renderer.getPixelRatio();
  flower.uniforms.uViewportH.value = h;
  const dpr = renderer.getPixelRatio();
  skel.width = w * dpr;
  skel.height = h * dpr;
  skelCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  updateCrop();
}
// 视频按 cover 方式铺满屏幕时，画面实际可见的比例
function updateCrop() {
  const vw = video.videoWidth || 16;
  const vh = video.videoHeight || 9;
  const s = Math.max(innerWidth / vw, innerHeight / vh);
  bgMat.uniforms.uCrop.value.set(innerWidth / (vw * s), innerHeight / (vh * s));
}
// 关键点（视频归一化坐标）→ 屏幕像素（与背景一样镜像、cover 裁切）
function toScreen(p) {
  const vw = video.videoWidth || 16;
  const vh = video.videoHeight || 9;
  const s = Math.max(innerWidth / vw, innerHeight / vh);
  const dw = vw * s;
  const dh = vh * s;
  return { x: (innerWidth - dw) / 2 + (1 - p.x) * dw, y: (innerHeight - dh) / 2 + p.y * dh };
}
// 屏幕像素 → z=0 平面上的世界坐标
function screenToWorld(x, y) {
  return new THREE.Vector3(((x / innerWidth) * 2 - 1) * view.halfW, -((y / innerHeight) * 2 - 1) * view.halfH, 0);
}
addEventListener("resize", layout);
video.addEventListener("loadedmetadata", updateCrop);
layout();

// ---------------- 输入状态 ----------------
const state = {
  mode: "idle", // idle | hand | demo
  tracker: null,
  openness: 0.5,
  lastTarget: 0.35,
  lastHandAt: -1e9,
  showSkeleton: false,
  pointer: { x: innerWidth / 2, y: innerHeight / 2, down: false, movedAt: -1e9 },
};
const filt = { x: new OneEuro(1.0, 0.012), y: new OneEuro(1.0, 0.012), s: new OneEuro(0.8, 0.0), roll: new OneEuro(0.8, 0.0) };
const tipFilt = Array.from({ length: 5 }, () => ({ x: new OneEuro(1.6, 0.02), y: new OneEuro(1.6, 0.02) }));
const anchor = new THREE.Vector3();
let flowerScale = 1;
let roll = 0;
let tipActive = 0;

function drawSkeleton(lm) {
  skelCtx.clearRect(0, 0, innerWidth, innerHeight);
  if (!state.showSkeleton || !lm) return;
  const pts = lm.map(toScreen);
  skelCtx.lineWidth = 2;
  skelCtx.strokeStyle = "rgba(160, 240, 255, 0.7)";
  for (const [a, b] of BONES) {
    skelCtx.beginPath();
    skelCtx.moveTo(pts[a].x, pts[a].y);
    skelCtx.lineTo(pts[b].x, pts[b].y);
    skelCtx.stroke();
  }
  for (const [i, p] of pts.entries()) {
    skelCtx.fillStyle = TIPS.includes(i) ? "#ffd36e" : "#ff8fc6";
    skelCtx.beginPath();
    skelCtx.arc(p.x, p.y, TIPS.includes(i) ? 5 : 3.5, 0, Math.PI * 2);
    skelCtx.fill();
  }
}

function updateHud(open, present) {
  const pct = Math.round(open * 100);
  $("fill").style.width = `${pct}%`;
  $("pct").textContent = `${pct}%`;
  let label;
  if (state.mode === "hand" && !present) label = "把手放进画面里";
  else if (open < 0.3) label = state.mode === "demo" ? "花苞 · 按住鼠标" : "花苞 · 握拳";
  else if (open < 0.72) label = "半开";
  else label = "绽放";
  $("state").textContent = label;
}

// ---------------- 主循环 ----------------
const timer = new THREE.Timer();
let elapsed = 0;
const forcedBloom = params.has("bloom") ? parseFloat(params.get("bloom")) : null;

function frame(now) {
  timer.update(now);
  const dt = Math.min(0.05, timer.getDelta());
  elapsed += dt;
  let target = 0.35;
  let present = false;

  if (state.mode === "hand" && state.tracker) {
    const r = state.tracker.update();
    if (r) {
      present = true;
      state.lastHandAt = elapsed;
      const lm = r.landmarks;
      // 花朵锚在掌心（五个掌根点的平均），稍微偏向手指方向
      const palm = [0, 5, 9, 13, 17].reduce((acc, i) => ({ x: acc.x + lm[i].x / 5, y: acc.y + lm[i].y / 5 }), { x: 0, y: 0 });
      const sp = toScreen(palm);
      const w = screenToWorld(filt.x.filter(sp.x, dt), filt.y.filter(sp.y, dt));
      anchor.copy(w);
      // 大小按掌长（手腕到中指根）缩放
      const a = screenToWorld(toScreen(lm[0]).x, toScreen(lm[0]).y);
      const b = screenToWorld(toScreen(lm[9]).x, toScreen(lm[9]).y);
      const palmLen = a.distanceTo(b);
      flowerScale = filt.s.filter(THREE.MathUtils.clamp(palmLen * 1.15, 0.35, 1.6), dt);
      // 手掌倾斜时花朵跟着转
      const ang = Math.atan2(b.x - a.x, b.y - a.y);
      roll = filt.roll.filter(THREE.MathUtils.clamp(-ang, -1, 1), dt);
      // 张开度 → 开合目标；指尖位置送进着色器
      const raw = opennessOf(r.world);
      state.openness += (raw - state.openness) * Math.min(1, dt * 12);
      target = THREE.MathUtils.smoothstep(state.openness, 0.18, 0.82);
      state.lastTarget = target;
      TIPS.forEach((ti, k) => {
        const s = toScreen(lm[ti]);
        const tw = screenToWorld(tipFilt[k].x.filter(s.x, dt), tipFilt[k].y.filter(s.y, dt));
        flower.uniforms.uTips.value[k].copy(tw);
      });
      tipActive = Math.min(1, tipActive + dt * 4);
      drawSkeleton(lm);
    } else {
      tipActive = Math.max(0, tipActive - dt * 3);
      drawSkeleton(null);
      // 手离开画面：花朵慢慢回到画面中央、半开着等待
      if (elapsed - state.lastHandAt > 0.6) {
        anchor.lerp(new THREE.Vector3(0, -0.2, 0), Math.min(1, dt * 1.5));
        flowerScale += (1.1 - flowerScale) * Math.min(1, dt * 1.5);
        roll += (0 - roll) * Math.min(1, dt * 2);
        Object.values(filt).forEach((f) => f.reset());
        tipFilt.forEach((f) => (f.x.reset(), f.y.reset()));
      }
      // 手短暂丢失（遮挡、模糊）时保持原状；超过 0.5 秒才回到等待状态
      target = elapsed - state.lastHandAt < 0.5 ? state.lastTarget : 0.35 + 0.08 * Math.sin(elapsed * 1.2);
    }
  } else {
    // 鼠标/触摸体验：花在中央，指针就是一根「手指」，按住 = 握拳
    anchor.lerp(new THREE.Vector3(0, -0.3, 0), Math.min(1, dt * 2));
    flowerScale += (1.25 - flowerScale) * Math.min(1, dt * 2);
    const idle = elapsed - state.pointer.movedAt > 5;
    if (state.mode === "demo") target = state.pointer.down ? 0 : idle ? 0.55 + 0.45 * Math.sin(elapsed * 0.7) : 1;
    else target = 0.5 + 0.5 * Math.sin(elapsed * 0.6);
    const pw = screenToWorld(state.pointer.x, state.pointer.y);
    flower.uniforms.uTips.value[0].copy(pw);
    for (let k = 1; k < 5; k++) flower.uniforms.uTips.value[k].set(999, 999, 999);
    tipActive += ((state.mode === "demo" && !idle ? 1 : 0) - tipActive) * Math.min(1, dt * 4);
    present = state.mode === "demo";
  }

  if (forcedBloom !== null) target = forcedBloom;
  flower.step(target, dt, elapsed);
  if (forcedBloom !== null) {
    flower.bloom = forcedBloom;
    flower.uniforms.uBloom.value = forcedBloom;
    flower.uniforms.uBurst.value = 0;
  }
  flower.object.position.copy(anchor);
  flower.object.scale.setScalar(flowerScale);
  flower.object.rotation.set(0.72, 0, roll, "ZXY");
  flower.uniforms.uScale.value = flowerScale;
  flower.uniforms.uTipActive.value = tipActive;
  flower.uniforms.uTipRadius.value = 0.32 * Math.max(0.6, flowerScale);
  dust.rotation.y = elapsed * 0.02;
  if (state.mode !== "idle") updateHud(Math.max(0, Math.min(1, flower.bloom)), present);

  composer.render();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// ---------------- 启动 ----------------
function enterUI() {
  $("overlay").hidden = true;
  $("meter").hidden = false;
}

async function startCamera() {
  const msg = $("load-msg");
  $("btn-start").disabled = true;
  try {
    const tracker = new HandTracker(video);
    msg.textContent = "正在请求摄像头权限…";
    await tracker.startCamera();
    await tracker.init((t) => (msg.textContent = t));
    state.tracker = tracker;
    state.mode = "hand";
    bgMat.uniforms.uOn.value = 1;
    updateCrop();
    $("toolbar").hidden = false;
    enterUI();
  } catch (e) {
    console.error(e);
    $("btn-start").disabled = false;
    msg.textContent =
      e && e.name === "NotAllowedError"
        ? "摄像头权限被拒绝了。可以在地址栏左侧重新允许，或先用鼠标体验。"
        : "摄像头或模型加载失败（需要联网，并在 localhost 或 https 下打开）。可以先用鼠标体验。";
  }
}

function startDemo() {
  state.mode = "demo";
  state.pointer.movedAt = elapsed;
  enterUI();
}

$("btn-start").addEventListener("click", startCamera);
$("btn-demo").addEventListener("click", startDemo);
$("btn-video").addEventListener("click", () => {
  const on = bgMat.uniforms.uOn.value > 0.5;
  bgMat.uniforms.uOn.value = on ? 0 : 1;
  $("btn-video").textContent = on ? "显示画面" : "隐藏画面";
});
$("btn-skel").addEventListener("click", () => {
  state.showSkeleton = !state.showSkeleton;
  skel.classList.toggle("on", state.showSkeleton);
  $("btn-skel").textContent = state.showSkeleton ? "隐藏骨架" : "显示骨架";
});

const onPointer = (e) => {
  state.pointer.x = e.clientX;
  state.pointer.y = e.clientY;
  state.pointer.movedAt = elapsed;
};
addEventListener("pointermove", onPointer);
addEventListener("pointerdown", (e) => {
  onPointer(e);
  state.pointer.down = true;
});
addEventListener("pointerup", () => (state.pointer.down = false));
addEventListener("pointercancel", () => (state.pointer.down = false));

if (params.has("demo")) startDemo();
// 调试用：?debug 时把内部状态挂到 window 上
if (params.has("debug")) window.__debug = { state, flower };
