import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { Flower } from "./flower.js";

const $ = (id) => document.getElementById(id);
const params = new URLSearchParams(location.search);
const stage = $("stage");
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

// ---------------- 渲染器、相机、后期 ----------------
const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x0b0912, 1);
stage.appendChild(renderer.domElement);

const CAM_Z = 5;
const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
camera.position.set(0, 0, CAM_Z);
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b0912);

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloomPass = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.7, 0.45, 0.5);
composer.addPass(bloomPass);
composer.addPass(new OutputPass());

// 背景里缓慢漂浮的微光
const dust = (() => {
  const n = 700;
  const pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 14;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 10;
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

// ---------------- 尺寸与坐标换算 ----------------
const view = { w: 1, h: 1, halfW: 1, halfH: 1 };
function layout() {
  const w = stage.clientWidth || innerWidth;
  const h = stage.clientHeight || innerHeight;
  view.w = w;
  view.h = h;
  renderer.setSize(w, h, false);
  composer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  view.halfH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * CAM_Z;
  view.halfW = view.halfH * camera.aspect;
  flower.uniforms.uPixelRatio.value = renderer.getPixelRatio();
  flower.uniforms.uViewportH.value = h;
}
// 屏幕像素（相对舞台）→ z=0 平面上的世界坐标
const toWorld = (x, y) => new THREE.Vector3(((x / view.w) * 2 - 1) * view.halfW, -((y / view.h) * 2 - 1) * view.halfH, 0);
addEventListener("resize", layout);
layout();

// ---------------- 触摸 / 鼠标 ----------------
// 长按（0.35 秒内几乎不动）= 收拢；移动 = 用指尖拨动花瓣；双指 = 捏合收拢、张开绽放
const HOLD_MS = 350;
const MOVE_PX = 12;
const pointers = new Map();
const hover = { x: 0, y: 0, at: -1e9 };
let lastInputAt = 0;

const local = (e) => {
  const r = stage.getBoundingClientRect();
  return { x: e.clientX - r.left, y: e.clientY - r.top };
};
stage.addEventListener("pointerdown", (e) => {
  const p = local(e);
  pointers.set(e.pointerId, { ...p, sx: p.x, sy: p.y, t0: performance.now(), mode: "pending" });
  try {
    stage.setPointerCapture(e.pointerId);
  } catch {
    // 个别浏览器/合成事件不支持捕获，不影响交互
  }
  lastInputAt = performance.now();
});
stage.addEventListener("pointermove", (e) => {
  const p = local(e);
  const s = pointers.get(e.pointerId);
  if (s) {
    s.x = p.x;
    s.y = p.y;
    if (s.mode === "pending" && Math.hypot(p.x - s.sx, p.y - s.sy) > MOVE_PX) s.mode = "stir";
  } else if (e.pointerType === "mouse") {
    Object.assign(hover, p, { at: performance.now() });
  }
  lastInputAt = performance.now();
});
const release = (e) => {
  pointers.delete(e.pointerId);
  lastInputAt = performance.now();
};
stage.addEventListener("pointerup", release);
stage.addEventListener("pointercancel", release);
stage.addEventListener("contextmenu", (e) => e.preventDefault());

// ---------------- 主循环 ----------------
const timer = new THREE.Timer();
let elapsed = 0;
let tipActive = 0;
let target = 0;
let mode = "intro"; // intro | rest | idle | hold | pinch | stir
const forcedBloom = params.has("bloom") ? parseFloat(params.get("bloom")) : null;

function updateHud(open) {
  const pct = Math.round(open * 100);
  $("fill").style.width = `${pct}%`;
  $("pct").textContent = `${pct}%`;
  $("state").textContent = open < 0.3 ? "花苞" : open < 0.72 ? "半开" : "绽放";
}

function frame(now) {
  timer.update(now);
  const dt = Math.min(0.05, timer.getDelta());
  elapsed += dt;
  const ms = performance.now();
  const list = [...pointers.values()];
  const tips = [];

  if (list.length >= 2) {
    // 双指：两指距离决定开合（屏幕短边的 12% 以内全收，62% 以上全开）
    mode = "pinch";
    const d = Math.hypot(list[0].x - list[1].x, list[0].y - list[1].y);
    const m = Math.min(view.w, view.h);
    target = THREE.MathUtils.clamp((d - 0.12 * m) / (0.5 * m), 0, 1);
    list.forEach((p) => tips.push(p));
  } else if (list.length === 1) {
    const p = list[0];
    if (p.mode === "pending" && ms - p.t0 > HOLD_MS) p.mode = "hold";
    mode = p.mode === "hold" ? "hold" : "stir";
    target = p.mode === "hold" ? 0 : 1;
    if (p.mode !== "pending") tips.push(p);
  } else {
    if (ms - hover.at < 1500) tips.push(hover);
    if (elapsed < 1.2) {
      // 打开页面：先是花苞，随后绽放
      mode = "intro";
      target = elapsed < 0.5 ? 0 : 1;
    } else if (ms - lastInputAt > 7000) {
      // 一段时间没人碰：自己像呼吸一样慢慢开合
      mode = "idle";
      target = 0.55 + 0.45 * Math.cos(((ms - lastInputAt - 7000) / 1000) * 0.7);
    } else {
      mode = "rest";
      target = 1;
    }
  }

  // 指尖送进着色器（最多 5 个）
  for (let k = 0; k < 5; k++) {
    const p = tips[k];
    if (p) flower.uniforms.uTips.value[k].copy(toWorld(p.x, p.y));
    else flower.uniforms.uTips.value[k].set(999, 999, 999);
  }
  tipActive += ((tips.length ? 1 : 0) - tipActive) * Math.min(1, dt * 6);

  if (forcedBloom !== null) target = forcedBloom;
  flower.step(target, dt, elapsed);
  if (forcedBloom !== null) {
    flower.bloom = forcedBloom;
    flower.uniforms.uBloom.value = forcedBloom;
    flower.uniforms.uBurst.value = 0;
  }
  if (reduceMotion) flower.uniforms.uBurst.value = 0;

  // 花朵放在画面中央略偏下，大小按屏幕短边适配（竖屏手机也能完整放下）
  const scale = THREE.MathUtils.clamp(Math.min(view.halfW, view.halfH) * 0.78, 0.55, 1.3);
  flower.object.position.set(0, -view.halfH * 0.08, 0);
  flower.object.scale.setScalar(scale);
  const spin = reduceMotion ? 0 : elapsed * 0.12;
  flower.object.rotation.set(0.72, spin, 0, "ZXY");
  flower.uniforms.uScale.value = scale;
  flower.uniforms.uTipActive.value = tipActive;
  flower.uniforms.uTipRadius.value = 0.42 * scale;
  dust.rotation.y = elapsed * 0.02;
  updateHud(Math.max(0, Math.min(1, flower.bloom)));

  composer.render();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// 调试用：?debug 时把内部状态挂到 window 上
if (params.has("debug")) window.__debug = { flower, pointers, get mode() { return mode; }, get target() { return target; } };
