import React, { useMemo } from "react";
import * as THREE from "three";
import { random } from "remotion";
import { AZ } from "./theme";

// ---------------- 皮肤剖面的几何 ----------------
// 坐标：x 横向，y 向上（皮肤表面约 y=1.5），z 指向镜头。正面切口在 z=ZF。
export const X0 = -8;
export const X1 = 8;
export const ZF = 4;
const ZS = 3; // 前后两块的分界：前块带毛囊切口，后块是完整的
const ZB = -4;
export const topY = (x: number) => 1.5 + 0.05 * Math.sin(1.3 * x) + 0.03 * Math.sin(3.7 * x + 1);
export const cornBot = (x: number) => topY(x) - 0.28;
export const dejY = (x: number) => 0.05 + 0.2 * Math.sin(2.3 * x + 0.4); // 表皮-真皮交界（真皮乳头）
export const FX = -2.6; // 毛囊中心
export const BULB_Y = -2.6;
const R0 = 0.42;
export const hw = (y: number) => (y > 0.9 ? R0 + 0.34 * Math.min(1, (y - 0.9) / 0.65) ** 1.5 : R0);
export const SEB = new THREE.Vector3(FX + 0.95, -1.15, ZF); // 皮脂腺
export const MELANOCYTES = [-6.1, -4.7, 0.5, 1.9, 3.4, 4.9, 6.3];
export const HOT_MELANO = 3.4; // 过度活跃的黑素细胞
export const NEUTROPHILS: [number, number][] = [
  [FX - 1.25, -0.7],
  [FX + 1.55, -0.45],
  [FX - 1.6, -1.9],
  [FX + 1.9, -2.0],
  [FX - 0.95, -2.9],
  [FX + 1.1, -3.1],
];

const N = 140;
const xs = (a: number, b: number) => Array.from({ length: N + 1 }, (_, i) => a + ((b - a) * i) / N);
const ys = (a: number, b: number, n = 24) => Array.from({ length: n + 1 }, (_, i) => a + ((b - a) * i) / n);

const shapeFrom = (pts: [number, number][]) => {
  const s = new THREE.Shape();
  pts.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y)));
  s.closePath();
  return s;
};

// 一层（上下两条边界曲线之间）在毛囊左侧/右侧的部分
const bandPiece = (bot: (x: number) => number, top: (x: number) => number, side: -1 | 1) => {
  const yb = bot(FX);
  const yt = top(FX);
  const wallB = FX + side * hw(yb);
  const wallT = FX + side * hw(yt);
  const pts: [number, number][] = [];
  if (side < 0) {
    xs(X0, wallB).forEach((x) => pts.push([x, bot(x)]));
    ys(yb, yt).forEach((y) => pts.push([FX - hw(y), y]));
    xs(wallT, X0).forEach((x) => pts.push([x, top(x)]));
  } else {
    xs(wallB, X1).forEach((x) => pts.push([x, bot(x)]));
    xs(X1, wallT).forEach((x) => pts.push([x, top(x)]));
    ys(yt, yb).forEach((y) => pts.push([FX + hw(y), y]));
  }
  return shapeFrom(pts);
};

const dermisU = () => {
  const pts: [number, number][] = [[X0, -4], [X1, -4]];
  const yd = dejY(FX);
  xs(X1, FX + hw(yd)).forEach((x) => pts.push([x, dejY(x)]));
  ys(yd, BULB_Y).forEach((y) => pts.push([FX + hw(y), y]));
  for (let i = 1; i < 24; i++) {
    const a = -(Math.PI * i) / 24;
    pts.push([FX + R0 * Math.cos(a), BULB_Y + R0 * Math.sin(a)]);
  }
  ys(BULB_Y, yd).forEach((y) => pts.push([FX - hw(y), y]));
  xs(FX - hw(yd), X0).forEach((x) => pts.push([x, dejY(x)]));
  return shapeFrom(pts);
};

const fullBand = (bot: (x: number) => number, top: (x: number) => number) => {
  const pts: [number, number][] = [];
  xs(X0, X1).forEach((x) => pts.push([x, bot(x)]));
  xs(X1, X0).forEach((x) => pts.push([x, top(x)]));
  return shapeFrom(pts);
};

const channelShape = () => {
  const yt = topY(FX);
  const pts: [number, number][] = [];
  ys(yt, BULB_Y).forEach((y) => pts.push([FX + hw(y), y]));
  for (let i = 1; i < 24; i++) {
    const a = -(Math.PI * i) / 24;
    pts.push([FX + R0 * Math.cos(a), BULB_Y + R0 * Math.sin(a)]);
  }
  ys(BULB_Y, yt).forEach((y) => pts.push([FX - hw(y), y]));
  return shapeFrom(pts);
};

const extrude = (s: THREE.Shape, depth: number) => new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false, curveSegments: 1 });

const inChannel = (x: number, y: number, pad = 0.06) => y > BULB_Y - R0 - pad && Math.abs(x - FX) < hw(Math.max(y, BULB_Y)) + pad;

// ---------------- 皮肤块 ----------------
const Layers: React.FC = () => {
  const g = useMemo(() => {
    const corn = (x: number) => topY(x);
    return {
      cornL: extrude(bandPiece(cornBot, corn, -1), ZF - ZS),
      cornR: extrude(bandPiece(cornBot, corn, 1), ZF - ZS),
      epiL: extrude(bandPiece(dejY, cornBot, -1), ZF - ZS),
      epiR: extrude(bandPiece(dejY, cornBot, 1), ZF - ZS),
      der: extrude(dermisU(), ZF - ZS),
      bCorn: extrude(fullBand(cornBot, corn), ZS - ZB),
      bEpi: extrude(fullBand(dejY, cornBot), ZS - ZB),
      bDer: extrude(fullBand(() => -4, dejY), ZS - ZB),
      channel: new THREE.ShapeGeometry(channelShape()),
    };
  }, []);
  const mat = (c: string, r = 0.75) => <meshStandardMaterial color={c} roughness={r} metalness={0} />;
  return (
    <group>
      {/* 前块（带毛囊切口） */}
      <group position={[0, 0, ZS]}>
        <mesh geometry={g.cornL}>{mat(AZ.corneum, 0.9)}</mesh>
        <mesh geometry={g.cornR}>{mat(AZ.corneum, 0.9)}</mesh>
        <mesh geometry={g.epiL}>{mat(AZ.epidermis)}</mesh>
        <mesh geometry={g.epiR}>{mat(AZ.epidermis)}</mesh>
        <mesh geometry={g.der}>{mat(AZ.dermis)}</mesh>
      </group>
      {/* 后块 */}
      <group position={[0, 0, ZB]}>
        <mesh geometry={g.bCorn}>{mat(AZ.corneum, 0.9)}</mesh>
        <mesh geometry={g.bEpi}>{mat(AZ.epidermis)}</mesh>
        <mesh geometry={g.bDer}>{mat(AZ.dermis)}</mesh>
      </group>
      {/* 毛囊内壁 */}
      <mesh geometry={g.channel} position={[0, 0, ZS + 0.003]}>
        <meshStandardMaterial color={AZ.follicle} roughness={0.85} />
      </mesh>
    </group>
  );
};

// 实例化的小球（细胞、颗粒）
type Inst = { p: [number, number, number]; s: [number, number, number]; c: string };
const Instances: React.FC<{ items: Inst[]; seg?: number; rough?: number; emissive?: string; ei?: number }> = ({ items, seg = 10, rough = 0.6, emissive, ei = 0 }) => {
  const mesh = useMemo(() => {
    const geo = new THREE.SphereGeometry(1, seg, Math.max(6, Math.round(seg * 0.7)));
    const m = new THREE.MeshStandardMaterial({ roughness: rough, emissive: emissive ?? "#000", emissiveIntensity: ei });
    const im = new THREE.InstancedMesh(geo, m, Math.max(1, items.length));
    const o = new THREE.Object3D();
    const col = new THREE.Color();
    items.forEach((it, i) => {
      o.position.set(...it.p);
      o.scale.set(...it.s);
      o.updateMatrix();
      im.setMatrixAt(i, o.matrix);
      im.setColorAt(i, col.set(it.c));
    });
    im.count = items.length;
    im.instanceMatrix.needsUpdate = true;
    if (im.instanceColor) im.instanceColor.needsUpdate = true;
    return im;
  }, [items, seg, rough, emissive, ei]);
  return <primitive object={mesh} />;
};

const Cells: React.FC = () => {
  const { cells, nuclei, flakes } = useMemo(() => {
    const cells: Inst[] = [];
    const nuclei: Inst[] = [];
    const flakes: Inst[] = [];
    let k = 0;
    for (let y = -0.2; y < 1.3; y += 0.17) {
      for (let x = X0 + 0.1; x < X1; x += 0.2) {
        k++;
        const jx = x + (random(`cx${k}`) - 0.5) * 0.08 + ((Math.round((y + 0.2) / 0.17) % 2) * 0.1);
        const jy = y + (random(`cy${k}`) - 0.5) * 0.05;
        const lo = dejY(jx);
        const hi = cornBot(jx);
        if (jy < lo + 0.06 || jy > hi - 0.04 || inChannel(jx, jy, 0.1)) continue;
        if (MELANOCYTES.some((m) => Math.abs(jx - m) < 0.13 && jy - lo < 0.2)) continue;
        const d = jy - lo;
        const u = hi - jy;
        const basal = d < 0.17;
        const gran = u < 0.16;
        const shade = random(`cs${k}`) * 0.08;
        const c = new THREE.Color(gran ? "#ECC2A6" : basal ? "#E9AE98" : "#F6D3C2").offsetHSL(0, 0, -shade).getStyle();
        cells.push({ p: [jx, jy, ZF], s: basal ? [0.075, 0.1, 0.05] : gran ? [0.12, 0.05, 0.035] : [0.095, 0.08, 0.045], c });
        if (!gran) nuclei.push({ p: [jx, jy + 0.005, ZF + 0.035], s: [0.032, 0.032, 0.018], c: "#B06E62" });
      }
    }
    let j = 0;
    for (let y = 0; y < 0.25; y += 0.065) {
      for (let x = X0 + 0.1; x < X1; x += 0.34) {
        j++;
        const jx = x + ((Math.round(y / 0.065) % 2) * 0.17);
        const yy = cornBot(jx) + 0.04 + y;
        if (inChannel(jx, yy, 0.12)) continue;
        flakes.push({ p: [jx, yy, ZF], s: [0.17, 0.022, 0.03], c: random(`fl${j}`) > 0.5 ? "#F6EBD8" : "#E7D6BB" });
      }
    }
    return { cells, nuclei, flakes };
  }, []);
  return (
    <group>
      <Instances items={cells} seg={10} rough={0.55} />
      <Instances items={nuclei} seg={8} rough={0.5} />
      <Instances items={flakes} seg={8} rough={0.85} />
    </group>
  );
};

const Tube: React.FC<{ pts: THREE.Vector3[]; r: number; color: string; ei?: number }> = ({ pts, r, color, ei = 0 }) => {
  const geo = useMemo(() => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), Math.max(16, pts.length * 8), r, 8, false), [pts, r]);
  return (
    <mesh geometry={geo}>
      <meshStandardMaterial color={color} roughness={0.6} emissive={color} emissiveIntensity={ei} />
    </mesh>
  );
};

const Dermis: React.FC = () => {
  const { fibers, caps, fibro } = useMemo(() => {
    const fibers: THREE.Vector3[][] = [];
    for (let i = 0; i < 46; i++) {
      const x0 = X0 + random(`fx${i}`) * (X1 - X0 - 2);
      const y0 = -3.8 + random(`fy${i}`) * 3.3;
      const len = 1.5 + random(`fl${i}`) * 2.5;
      const amp = 0.06 + random(`fa${i}`) * 0.08;
      const pts: THREE.Vector3[] = [];
      for (let k = 0; k <= 8; k++) {
        const x = x0 + (len * k) / 8;
        const y = y0 + Math.sin(k * 1.4 + i) * amp + (k / 8) * (random(`fs${i}`) - 0.5) * 0.4;
        pts.push(new THREE.Vector3(x, y, ZF + 0.02));
      }
      if (pts.some((p) => inChannel(p.x, p.y, 0.25) || p.y > dejY(p.x) - 0.12 || Math.hypot(p.x - SEB.x - 0.3, p.y - SEB.y) < 0.75 || p.x > X1 - 0.05)) continue;
      fibers.push(pts);
    }
    const caps: THREE.Vector3[][] = [];
    for (let k = -3; k < 4; k++) {
      const xp = (Math.PI / 2 - 0.4) / 2.3 + (k * 2 * Math.PI) / 2.3;
      if (xp < X0 + 0.3 || xp > X1 - 0.3 || Math.abs(xp - FX) < 0.9) continue;
      const top = dejY(xp) - 0.1;
      caps.push([
        new THREE.Vector3(xp - 0.13, -0.75, ZF + 0.03),
        new THREE.Vector3(xp - 0.1, top - 0.15, ZF + 0.03),
        new THREE.Vector3(xp, top, ZF + 0.03),
        new THREE.Vector3(xp + 0.1, top - 0.15, ZF + 0.03),
        new THREE.Vector3(xp + 0.13, -0.75, ZF + 0.03),
      ]);
    }
    const fibro: Inst[] = [];
    for (let i = 0; i < 40; i++) {
      const x = X0 + 0.3 + random(`bx${i}`) * (X1 - X0 - 0.6);
      const y = -3.7 + random(`by${i}`) * 3.2;
      if (inChannel(x, y, 0.3) || y > dejY(x) - 0.15 || Math.hypot(x - SEB.x - 0.3, y - SEB.y) < 0.8) continue;
      fibro.push({ p: [x, y, ZF + 0.02], s: [0.1, 0.03, 0.02], c: "#B8655F" });
    }
    return { fibers, caps, fibro };
  }, []);
  return (
    <group>
      {fibers.map((p, i) => (
        <Tube key={i} pts={p} r={0.028} color={AZ.collagen} />
      ))}
      {caps.map((p, i) => (
        <Tube key={i} pts={p} r={0.035} color={AZ.capillary} ei={0.15} />
      ))}
      <Instances items={fibro} seg={8} />
    </group>
  );
};

// ---------------- 毛囊、皮脂腺、毛发 ----------------
const Follicle: React.FC = () => {
  const gland = useMemo(
    () =>
      [
        [0, 0, 0.3],
        [0.36, 0.2, 0.25],
        [0.32, -0.27, 0.24],
        [0.64, 0.0, 0.22],
        [0.08, -0.44, 0.2],
        [0.55, -0.42, 0.18],
      ] as const,
    [],
  );
  return (
    <group>
      {/* 毛干与毛球 */}
      <mesh position={[FX, 0.3, 3.5]} rotation={[0, 0, 0.05]}>
        <cylinderGeometry args={[0.085, 0.1, 6.1, 20]} />
        <meshStandardMaterial color={AZ.hair} roughness={0.4} />
      </mesh>
      <mesh position={[FX, BULB_Y - 0.05, 3.5]} scale={[1, 0.85, 1]}>
        <sphereGeometry args={[0.3, 24, 16]} />
        <meshStandardMaterial color="#6A4630" roughness={0.6} />
      </mesh>
      {/* 皮脂腺（剖面上凸起的小叶）+ 导管 */}
      {gland.map(([dx, dy, r], i) => (
        <mesh key={i} position={[SEB.x + dx, SEB.y + dy, ZF]} scale={[1, 1, 0.45]}>
          <sphereGeometry args={[r, 24, 16]} />
          <meshStandardMaterial color={AZ.sebum} roughness={0.45} emissive="#a07a20" emissiveIntensity={0.1} />
        </mesh>
      ))}
      <Tube pts={[new THREE.Vector3(SEB.x - 0.15, SEB.y + 0.15, ZF), new THREE.Vector3(FX + 0.55, -0.8, ZF - 0.1), new THREE.Vector3(FX + 0.3, -0.7, 3.6)]} r={0.06} color={AZ.sebum} />
    </group>
  );
};

// 毛囊里的皮脂
export const Sebum: React.FC<{ amount: number }> = ({ amount }) => (
  <mesh position={[FX, 0.15, 3.5]} scale={[1, 0.6 + amount * 0.4, 1]}>
    <capsuleGeometry args={[0.3, 1.0, 8, 20]} />
    <meshStandardMaterial color={AZ.sebum} roughness={0.3} transparent opacity={0.55 + amount * 0.25} emissive="#a07a20" emissiveIntensity={0.12} />
  </mesh>
);

// ---------------- 痤疮丙酸杆菌 ----------------
export const Bacteria: React.FC<{ alive: number; t: number }> = ({ alive, t }) => {
  const list = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => ({
        x: FX + (random(`bx${i}`) - 0.5) * 0.5,
        y: -0.45 + random(`by${i}`) * 1.4,
        z: 3.84 + random(`bz${i}`) * 0.1,
        r: random(`br${i}`) * Math.PI,
        ph: random(`bp${i}`) * 6,
        th: random(`bt${i}`), // 被消灭的先后
      })),
    [],
  );
  return (
    <group>
      {list.map((b, i) => {
        // alive 从 1 降到 0 时，按 th 的顺序依次萎缩、变灰
        const k = Math.max(0, Math.min(1, (alive - b.th * 0.8) / 0.2));
        if (k <= 0.02) return null;
        const col = new THREE.Color(AZ.bacteria).lerp(new THREE.Color("#8a8a8a"), 1 - k);
        return (
          <mesh key={i} position={[b.x + Math.sin(t * 1.3 + b.ph) * 0.02, b.y + Math.cos(t * 1.1 + b.ph) * 0.02, b.z]} rotation={[0.3, 0.2, b.r + Math.sin(t + b.ph) * 0.2]} scale={0.4 + 0.6 * k}>
            <capsuleGeometry args={[0.04, 0.13, 6, 12]} />
            <meshStandardMaterial color={col} roughness={0.4} emissive={AZ.bacteria} emissiveIntensity={0.25 * k} transparent opacity={0.3 + 0.7 * k} />
          </mesh>
        );
      })}
    </group>
  );
};

// ---------------- 角栓（粉刺） ----------------
export const Plug: React.FC<{ intact: number; t: number }> = ({ intact, t }) => {
  const discs = useMemo(() => Array.from({ length: 8 }, (_, i) => ({ y: 0.78 + i * 0.09, ph: random(`pd${i}`) * 6, dx: (random(`px${i}`) - 0.5) * 0.05 })), []);
  return (
    <group>
      {discs.map((d, i) => {
        // 松动：从上往下依次被抬起、散开、变淡
        const order = 1 - i / discs.length;
        const loose = Math.max(0, Math.min(1, ((1 - intact) - order * 0.55) / 0.45));
        const shrink = 1 - loose;
        if (shrink <= 0.03) return null;
        const y = d.y + loose * (0.9 + i * 0.05);
        const x = FX + d.dx + loose * Math.sin(d.ph) * 0.6;
        const w = hw(d.y) * 0.86;
        return (
          <mesh key={i} position={[x, y, 3.5]} rotation={[0, 0, loose * Math.sin(d.ph) * 0.8 + Math.sin(t + d.ph) * 0.02]} scale={[w * (0.15 + 0.85 * shrink ** 1.5), 0.065 * shrink + 0.01, 0.45 * (0.15 + 0.85 * shrink ** 1.5)]}>
            <sphereGeometry args={[1, 20, 12]} />
            <meshStandardMaterial color={i === discs.length - 1 ? "#8C7764" : i % 2 ? "#E6D7BD" : "#D6C3A3"} roughness={0.8} />
          </mesh>
        );
      })}
    </group>
  );
};

// ---------------- 炎症：红晕、中性粒细胞、活性氧 ----------------
export const Inflammation: React.FC<{ level: number; ros: number; t: number }> = ({ level, ros, t }) => {
  if (level <= 0.01) return null;
  return (
    <group>
      <mesh position={[FX, -1.2, ZF + 0.12]} scale={[2.6, 2.2, 0.2]}>
        <sphereGeometry args={[1, 32, 20]} />
        <meshBasicMaterial color="#FF3045" transparent opacity={0.28 * level} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      {NEUTROPHILS.map(([x, y], i) => {
        const s = level;
        return (
          <group key={i} position={[x + Math.sin(t * 0.7 + i) * 0.03, y + Math.cos(t * 0.6 + i) * 0.03, ZF + 0.12]} scale={s}>
            <mesh scale={[1, 1, 0.6]}>
              <sphereGeometry args={[0.18, 24, 16]} />
              <meshStandardMaterial color={AZ.neutrophil} roughness={0.5} transparent opacity={0.95} />
            </mesh>
            {[[-0.06, 0.03], [0.05, 0.05], [0.02, -0.06]].map(([dx, dy], k) => (
              <mesh key={k} position={[dx, dy, 0.07]}>
                <sphereGeometry args={[0.055, 14, 10]} />
                <meshStandardMaterial color="#8A5BB8" roughness={0.4} />
              </mesh>
            ))}
            {/* 活性氧火花 */}
            {Array.from({ length: 7 }, (_, k) => {
              const a = (k / 7) * Math.PI * 2 + i;
              const ph = (t * 0.8 + k / 7 + i * 0.13) % 1;
              const r = 0.22 + ph * 0.55;
              const o = ros * (1 - ph);
              if (o <= 0.02) return null;
              return (
                <mesh key={`r${k}`} position={[Math.cos(a) * r, Math.sin(a) * r, 0.05]} scale={0.035 + 0.02 * (1 - ph)}>
                  <sphereGeometry args={[1, 10, 8]} />
                  <meshBasicMaterial color={AZ.ros} transparent opacity={o} blending={THREE.AdditiveBlending} depthWrite={false} />
                </mesh>
              );
            })}
          </group>
        );
      })}
    </group>
  );
};

// ---------------- 黑素细胞与黑色素 ----------------
export const Pigment: React.FC<{ hot: number; t: number; glow: number }> = ({ hot, t, glow }) => {
  const data = useMemo(() => {
    return MELANOCYTES.map((mx, mi) => {
      const isHot = mx === HOT_MELANO;
      const n = isHot ? 46 : 12;
      const gran = Array.from({ length: n }, (_, k) => ({
        dx: (random(`gx${mi}-${k}`) - 0.5) * (isHot ? 1.1 : 0.7),
        y0: random(`gy${mi}-${k}`),
        sp: 0.05 + random(`gs${mi}-${k}`) * 0.05,
        th: random(`gt${mi}-${k}`),
      }));
      return { mx, isHot, gran };
    });
  }, []);
  return (
    <group>
      {data.map(({ mx, isHot, gran }, mi) => {
        const by = dejY(mx) + 0.11;
        const sc = isHot ? 1 + 0.45 * hot : 1;
        const dendrites: [number, number][] = [
          [-0.38, 0.42],
          [0.02, 0.56],
          [0.4, 0.4],
        ];
        return (
          <group key={mi}>
            {isHot && (
              <mesh position={[mx, by + 0.2, ZF + 0.06]} scale={[0.9, 0.7, 0.1]}>
                <sphereGeometry args={[1, 24, 16]} />
                <meshBasicMaterial color="#FF9A3C" transparent opacity={0.3 * hot * glow} blending={THREE.AdditiveBlending} depthWrite={false} />
              </mesh>
            )}
            <mesh position={[mx, by, ZF + 0.02]} scale={[sc, sc, 0.55 * sc]}>
              <sphereGeometry args={[0.11, 20, 14]} />
              <meshStandardMaterial color={isHot ? new THREE.Color(AZ.melanocyte).lerp(new THREE.Color("#3a1d10"), hot) : AZ.melanocyte} roughness={0.5} />
            </mesh>
            {dendrites.map(([dx, dy], k) => (
              <Tube key={k} pts={[new THREE.Vector3(mx, by, ZF + 0.03), new THREE.Vector3(mx + dx * 0.5, by + dy * 0.55, ZF + 0.04), new THREE.Vector3(mx + dx, by + dy, ZF + 0.045)]} r={0.016 * (isHot ? sc : 1)} color={AZ.melanocyte} />
            ))}
            {gran.map((g, k) => {
              // 过度活跃的那个：hot 降低时，颗粒按 th 顺序消失
              const vis = isHot ? (g.th < 0.25 + 0.75 * hot ? 1 : 0) : 1;
              if (!vis) return null;
              const y = by + 0.12 + ((g.y0 + t * g.sp) % 1) * 0.75;
              if (y > cornBot(mx + g.dx) - 0.08) return null;
              return (
                <mesh key={k} position={[mx + g.dx * (0.4 + 0.6 * ((g.y0 + t * g.sp) % 1)), y, ZF + 0.06]}>
                  <sphereGeometry args={[isHot ? 0.026 : 0.02, 8, 6]} />
                  <meshStandardMaterial color={AZ.melanin} roughness={0.4} />
                </mesh>
              );
            })}
          </group>
        );
      })}
    </group>
  );
};

export const SkinBlock: React.FC = () => (
  <group>
    <Layers />
    <Cells />
    <Dermis />
    <Follicle />
  </group>
);
