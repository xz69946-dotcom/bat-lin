import * as THREE from "three";

// 粒子花：三层花瓣 + 花心 + 飘散的花粉。所有形状与开合都在顶点着色器里计算，
// CPU 每帧只更新几个 uniform（开合程度、指尖位置、时间）。

const LAYERS = [
  // 由外到内：花瓣数、每片花瓣的粒子数、相位偏移
  { petals: 10, count: 760, offset: 0.0 },
  { petals: 8, count: 640, offset: 0.39 },
  { petals: 6, count: 520, offset: 0.9 },
];
const CORE = 1400;
const POLLEN = 900;

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uBloom;      // 0 花苞 ~ 1 盛开
  uniform float uBurst;      // 张开瞬间的向外迸发
  uniform vec3 uTips[5];     // 五个指尖（世界坐标）
  uniform float uTipActive;
  uniform float uTipRadius;
  uniform float uPixelRatio;
  uniform float uViewportH;
  uniform float uScale;

  attribute vec4 aData;      // kind(0 花瓣 1 花心 2 花粉), layer, u(沿花瓣), v(横向 -1~1)
  attribute vec4 aRand;
  attribute float aPhi;      // 花瓣朝向角

  varying vec3 vColor;
  varying float vAlpha;

  const float PI = 3.14159265;

  // 每层花瓣的参数（外层更长、开得更大、更早开）
  float layerLen(int l)   { return l == 0 ? 1.12 : (l == 1 ? 0.88 : 0.6); }
  float layerWid(int l)   { return l == 0 ? 0.55 : (l == 1 ? 0.46 : 0.36); }
  float layerOpen(int l)  { return l == 0 ? 1.62 : (l == 1 ? 1.2 : 0.78); }
  float layerDelay(int l) { return l == 0 ? 0.0 : (l == 1 ? 0.14 : 0.28); }

  // 沿弧线积分：花瓣从基部到 u 处，弯曲角从 a0 线性变到 a0 + k
  vec2 arc(float a0, float k, float s) {
    if (abs(k) < 1e-3) return vec2(sin(a0), cos(a0)) * s;
    return vec2((cos(a0) - cos(a0 + k * s)) / k, (sin(a0 + k * s) - sin(a0)) / k);
  }

  void main() {
    int kind = int(aData.x + 0.5);
    int layer = int(aData.y + 0.5);
    float u = aData.z;
    float v = aData.w;
    vec3 p;
    vec3 col;
    float alpha;
    float size;

    if (kind == 0) {
      // ---------- 花瓣 ----------
      float lb = smoothstep(layerDelay(layer), layerDelay(layer) + 0.72, uBloom);
      float L = layerLen(layer);
      float W = layerWid(layer);
      // 花瓣轮廓：倒卵形（基部收窄、约 60% 处最宽、顶端圆钝闭合）
      float e = u < 0.6 ? (u - 0.6) / 0.6 : (u - 0.6) / 0.4;
      float w = W * sqrt(max(0.0, 1.0 - e * e));
      // 张开角与卷曲：花苞时基部外鼓、尖端内扣，正好在中轴合拢（a0 = -k/2 时尖端回到中轴）；
      // 盛开时外翻、尖端微微下垂
      float a0 = mix(0.42, layerOpen(layer), lb);
      float k = mix(-0.84, 0.5 + 0.2 * (1.0 - float(layer) * 0.5), lb);
      vec2 rh = arc(a0, k, u) * L;
      float across = v * w * 0.5;
      // 花瓣横向下凹（像勺子），花苞时更明显
      float cup = mix(0.22, 0.12, lb);
      rh.x -= cup * v * v * w;
      // 花瓣尖端随风轻颤
      float flutter = sin(uTime * 1.6 + aPhi * 3.0 + aRand.x * 6.28) * 0.025 * u * u * lb;
      rh.y += flutter;
      float r0 = 0.06;
      float c = cos(aPhi), s = sin(aPhi);
      p = vec3(c * (rh.x + r0) - s * across, rh.y, s * (rh.x + r0) + c * across);

      // 颜色：基部深玫红 → 尖端浅粉白；外层偏浅，内层偏深；花苞时整体更深
      vec3 base = mix(vec3(0.8, 0.06, 0.36), vec3(0.95, 0.12, 0.45), float(layer) * 0.5);
      vec3 tip = mix(vec3(1.0, 0.68, 0.84), vec3(1.0, 0.45, 0.68), float(layer) * 0.5);
      col = mix(base, tip, smoothstep(0.05, 0.95, u));
      // 瓣缘：更亮、更不透明，勾出每片花瓣的轮廓
      float rim = smoothstep(0.82, 0.98, abs(v));
      col = mix(col, vec3(1.0, 0.8, 0.9), rim * 0.32);
      col *= mix(0.55, 1.0, lb);
      // 花苞时粒子挤在一起，整体调暗，避免叠成一团白
      alpha = mix(0.1 + 0.06 * aRand.y, 0.34, rim) * mix(0.55, 1.0, lb);
      size = 0.026 + 0.018 * aRand.z;
    } else if (kind == 1) {
      // ---------- 花心与花蕊 ----------
      float open = smoothstep(0.25, 0.9, uBloom);
      float r = sqrt(aRand.x) * 0.15;
      float a = aRand.y * 2.0 * PI;
      float h = 0.04 + (0.15 - r) * 0.25;
      if (aRand.z > 0.55) {
        // 花蕊：从花心向上、略向外伸出的细丝，顶端是花药
        float t = (aRand.z - 0.55) / 0.45;
        r = 0.04 + t * 0.12 * open;
        h = 0.05 + t * 0.32 * open;
        a = floor(aRand.y * 18.0) / 18.0 * 2.0 * PI;
      }
      p = vec3(cos(a) * r, h * mix(0.4, 1.0, open), sin(a) * r);
      col = mix(vec3(1.0, 0.55, 0.12), vec3(1.0, 0.85, 0.45), aRand.w);
      alpha = 0.22 * mix(0.5, 1.0, open);
      size = 0.022 + 0.014 * aRand.w;
    } else {
      // ---------- 花粉：盛开后螺旋上升、飘散 ----------
      float life = fract(uTime * (0.07 + 0.08 * aRand.x) + aRand.y);
      float rad = life * (0.4 + 0.9 * aRand.z);
      float a = aRand.w * 2.0 * PI + life * 2.4;
      p = vec3(cos(a) * rad, 0.15 + life * (0.7 + 0.9 * aRand.x), sin(a) * rad);
      col = mix(vec3(1.0, 0.85, 0.5), vec3(1.0, 0.95, 0.9), aRand.x);
      alpha = sin(PI * life) * smoothstep(0.55, 0.95, uBloom) * 0.65;
      size = 0.018 + 0.022 * aRand.z;
    }

    // 张开瞬间：粒子沿径向迸发，随后弹回
    vec3 dir = normalize(p + (aRand.xyz - 0.5) * 0.4 + vec3(0.0, 0.001, 0.0));
    p += dir * uBurst * (0.25 + 0.75 * aRand.x) * (kind == 1 ? 0.3 : 1.0);

    // 世界坐标里和指尖互动：靠近指尖的粒子被推开、打旋、变亮
    vec4 world = modelMatrix * vec4(p, 1.0);
    float glow = 0.0;
    for (int i = 0; i < 5; i++) {
      vec3 d = world.xyz - uTips[i];
      float dl = length(d);
      float f = uTipActive * (1.0 - smoothstep(0.0, uTipRadius, dl));
      vec3 n = d / max(dl, 1e-4);
      world.xyz += n * f * 0.22 * uScale + cross(n, vec3(0.0, 0.0, 1.0)) * f * 0.12 * uScale;
      glow = max(glow, f);
    }
    col = mix(col, vec3(0.75, 0.97, 1.0), glow * 0.6);
    alpha = min(1.0, alpha + glow * 0.25);

    vec4 mv = viewMatrix * world;
    gl_Position = projectionMatrix * mv;
    gl_PointSize = size * uScale * uPixelRatio * uViewportH * 0.6 / -mv.z;
    vColor = col;
    vAlpha = alpha;
  }
`;

const fragmentShader = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float a = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(vColor * (0.7 + 0.6 * a), a * vAlpha);
  }
`;

export class Flower {
  constructor() {
    const data = [];
    const rand = [];
    const phi = [];
    const push = (kind, layer, u, v, ph) => {
      data.push(kind, layer, u, v);
      rand.push(Math.random(), Math.random(), Math.random(), Math.random());
      phi.push(ph);
    };
    LAYERS.forEach((L, li) => {
      for (let p = 0; p < L.petals; p++) {
        const ph = (p / L.petals) * Math.PI * 2 + L.offset;
        for (let i = 0; i < L.count; i++) {
          const u = Math.pow(Math.random(), 0.85);
          // 约 40% 的粒子落在瓣缘上，其余均匀铺在瓣面
          const v = Math.random() < 0.4 ? (Math.random() < 0.5 ? -1 : 1) * (0.94 + 0.06 * Math.random()) : Math.random() * 2 - 1;
          push(0, li, u, v, ph);
        }
      }
    });
    for (let i = 0; i < CORE; i++) push(1, 0, 0, 0, 0);
    for (let i = 0; i < POLLEN; i++) push(2, 0, 0, 0, 0);

    const n = phi.length;
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(n * 3), 3));
    g.setAttribute("aData", new THREE.BufferAttribute(new Float32Array(data), 4));
    g.setAttribute("aRand", new THREE.BufferAttribute(new Float32Array(rand), 4));
    g.setAttribute("aPhi", new THREE.BufferAttribute(new Float32Array(phi), 1));
    // 形状在着色器里算，包围球给大一点，避免被视锥剔除
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 4);

    this.uniforms = {
      uTime: { value: 0 },
      uBloom: { value: 0 },
      uBurst: { value: 0 },
      uTips: { value: Array.from({ length: 5 }, () => new THREE.Vector3(999, 999, 999)) },
      uTipActive: { value: 0 },
      uTipRadius: { value: 0.35 },
      uPixelRatio: { value: 1 },
      uViewportH: { value: 800 },
      uScale: { value: 1 },
    };
    this.material = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.points = new THREE.Points(g, this.material);
    this.object = new THREE.Group();
    this.object.add(this.points);
    this.count = n;

    // 开合动画用的弹簧状态
    this.bloom = 0;
    this.velocity = 0;
    this.burst = 0;
  }

  // target: 目标开合 0~1；dt: 秒
  step(target, dt, time) {
    // 临界阻尼弹簧：平滑跟随，张开时略带回弹感
    const k = 38;
    const c = 2 * Math.sqrt(k) * 0.82;
    const acc = k * (target - this.bloom) - c * this.velocity;
    this.velocity += acc * dt;
    this.bloom = Math.min(1.08, Math.max(-0.02, this.bloom + this.velocity * dt));
    // 张开得越快，迸发越强；随后快速衰减
    if (this.velocity > 0) this.burst += this.velocity * dt * 0.35;
    this.burst *= Math.exp(-dt * 3.2);
    this.uniforms.uBloom.value = Math.max(0, this.bloom);
    this.uniforms.uBurst.value = this.burst;
    this.uniforms.uTime.value = time;
  }
}
