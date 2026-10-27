import React, { useMemo } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { interpolate, random } from "remotion";
import { camAt } from "./camera";
import { HeroMolecule, MiniMolecule } from "./Molecule";
import { Bacteria, FX, HOT_MELANO, Inflammation, NEUTROPHILS, Pigment, Plug, Sebum, SkinBlock, dejY, hw, topY } from "./Skin";
import { AZ } from "./theme";
import { CLAMP, prog } from "./timeline";

const CameraRig: React.FC<{ t: number }> = ({ t }) => {
  const { camera } = useThree();
  const c = camAt(t);
  const cam = camera as THREE.PerspectiveCamera;
  cam.fov = c.fov;
  cam.near = 0.1;
  cam.far = 300;
  cam.position.set(...c.pos);
  cam.lookAt(new THREE.Vector3(...c.target));
  cam.updateProjectionMatrix();
  return null;
};

// 背景里缓慢漂浮的微粒，增加纵深感
const Dust: React.FC<{ t: number }> = ({ t }) => {
  const geo = useMemo(() => {
    const n = 500;
    const arr = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      arr[i * 3] = (random(`dx${i}`) - 0.5) * 60;
      arr[i * 3 + 1] = -8 + random(`dy${i}`) * 48;
      arr[i * 3 + 2] = -30 + random(`dz${i}`) * 34;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(arr, 3));
    return g;
  }, []);
  return (
    <points geometry={geo} position={[0, Math.sin(t * 0.1) * 0.5, 0]}>
      <pointsMaterial color="#7FB8FF" size={0.06} transparent opacity={0.5} sizeAttenuation depthWrite={false} />
    </points>
  );
};

type Mol = { p: [number, number, number]; r: [number, number, number]; o: number };

// 各段里成群出现的壬二酸小分子
const swarm = (t: number): Mol[] => {
  const out: Mol[] = [];
  const spin = (i: number): [number, number, number] => [t * 0.7 + i, t * 0.9 + i * 2, t * 0.5 + i * 3];
  const jit = (i: number, a = 0.06) => [Math.sin(t * 1.3 + i * 1.7) * a, Math.cos(t * 1.1 + i * 2.3) * a] as const;

  // 下落进入皮肤（21~33s）
  if (t > 21.5 && t < 36) {
    for (let i = 0; i < 16; i++) {
      const sx = FX + (random(`ds${i}`) - 0.5) * 6;
      const sy = 6 + random(`dy${i}`) * 3;
      const sz = 3.3 + random(`dz${i}`) * 0.6;
      const delay = random(`dd${i}`) * 3;
      const k = prog(t, 23 + delay, 28.5 + delay);
      const k2 = prog(t, 28.5 + delay, 31.5 + delay);
      const ex = FX + (random(`de${i}`) - 0.5) * 0.4;
      const ey = 1.3 - random(`df${i}`) * 1.4;
      const x = interpolate(k, [0, 1], [sx, FX + (sx - FX) * 0.25]) + (ex - FX - (sx - FX) * 0.25) * k2;
      const y = interpolate(k, [0, 1], [sy, topY(FX) + 0.35]) + (ey - topY(FX) - 0.35) * k2;
      const [jx, jy] = jit(i);
      const o = interpolate(t, [22, 23.5, 34.5, 36], [0, 1, 1, 0], CLAMP);
      out.push({ p: [x + jx, y + jy, sz], r: spin(i), o });
    }
  }
  // 抗菌：在毛囊里游走（33~52s）
  if (t > 33 && t < 53) {
    for (let i = 0; i < 12; i++) {
      const y = -0.4 + random(`ay${i}`) * 1.45 + Math.sin(t * 0.6 + i) * 0.12;
      const x = FX + Math.sin(t * 0.5 + i * 2.1) * 0.25;
      const z = 3.35 + random(`az${i}`) * 0.5;
      const o = interpolate(t, [34.5, 36, 51.5, 53], [0, 1, 1, 0], CLAMP);
      out.push({ p: [x, y, z], r: spin(i), o });
    }
  }
  // 疏通：围着角栓（52~69s）
  if (t > 53 && t < 69) {
    for (let i = 0; i < 12; i++) {
      const ang = (i / 12) * Math.PI * 2 + t * 0.4;
      const y = 0.8 + (i % 4) * 0.25 + Math.sin(t + i) * 0.05;
      const r = hw(y) * 0.95;
      const enter = prog(t, 53.5 + (i % 4) * 0.4, 56 + (i % 4) * 0.4);
      const o = interpolate(t, [53.5, 55, 67.5, 69], [0, 1, 1, 0], CLAMP);
      out.push({ p: [FX + Math.cos(ang) * r, y + (1 - enter) * 2.5, 3.5 + Math.sin(ang) * 0.35], r: spin(i), o });
    }
  }
  // 抗炎：扩散到每个中性粒细胞旁边（69~87s）
  if (t > 70 && t < 87) {
    NEUTROPHILS.forEach(([nx, ny], ni) => {
      for (let j = 0; j < 2; j++) {
        const i = ni * 2 + j;
        const k = prog(t, 71 + i * 0.25, 75 + i * 0.25);
        const ang = t * 0.9 + j * Math.PI + ni;
        const tx = nx + Math.cos(ang) * 0.42;
        const ty = ny + Math.sin(ang) * 0.42;
        const x = interpolate(k, [0, 1], [FX, tx]);
        const y = interpolate(k, [0, 1], [0.4, ty]);
        const o = interpolate(t, [70.5, 72, 85.5, 87], [0, 1, 1, 0], CLAMP);
        out.push({ p: [x, y, 4.3], r: spin(i), o });
      }
    });
  }
  // 淡斑：下沉到基底层那个过度活跃的黑素细胞周围（87~105s）
  if (t > 88 && t < 105) {
    for (let i = 0; i < 8; i++) {
      const tx = HOT_MELANO + (random(`px${i}`) - 0.5) * 1.8;
      const ty = dejY(HOT_MELANO) + 0.15 + random(`py${i}`) * 0.6;
      const k = prog(t, 89 + i * 0.2, 94 + i * 0.2);
      const [jx, jy] = jit(i, 0.05);
      const o = interpolate(t, [88.5, 90, 103.5, 105], [0, 1, 1, 0], CLAMP);
      out.push({ p: [tx + jx, interpolate(k, [0, 1], [topY(tx) + 1.2, ty]) + jy, 4.25], r: spin(i), o });
    }
  }
  return out;
};

export const heroRot = (t: number): [number, number, number] => [t * 0.45, Math.sin(t * 0.3) * 0.35, 0.06];

export const Scene3D: React.FC<{ t: number }> = ({ t }) => {
  const heroGlow = interpolate(t, [10, 12, 19, 21], [0, 1, 1, 0], CLAMP);
  const heroScale = interpolate(t, [0, 2.5], [0.42, 0.55], { ...CLAMP, easing: (x) => 1 - (1 - x) ** 3 });
  const alive = 1 - prog(t, 38.5, 48.5);
  const plug = 1 - prog(t, 57, 65.5);
  const inflamLevel = interpolate(t, [69.5, 71.5, 77, 84], [0, 1, 1, 0.12], CLAMP) * (t < 69.5 ? 0 : 1);
  const ros = interpolate(t, [70, 71.5, 76.5, 82], [0, 1, 1, 0], CLAMP);
  const hot = 1 - prog(t, 93, 101.5);
  const mols = swarm(t);
  return (
    <>
      <color attach="background" args={[AZ.bg]} />
      <fog attach="fog" args={[AZ.bg, 30, 70]} />
      <CameraRig t={t} />
      <hemisphereLight args={["#FFF4EE", "#3A2A40", 0.75]} />
      <directionalLight position={[6, 12, 10]} intensity={2.2} color="#FFF6EE" />
      <directionalLight position={[-8, 4, 6]} intensity={0.7} color="#9CC8FF" />
      <pointLight position={[0, 32, 6]} intensity={40} distance={30} color="#BFFFF0" />
      <Dust t={t} />
      {t < 27 && (
        <group position={[0, 30, 0]} rotation={heroRot(t)} scale={heroScale}>
          <HeroMolecule glow={heroGlow} />
        </group>
      )}
      <SkinBlock />
      <Sebum amount={1 - 0.35 * prog(t, 40, 50)} />
      <Bacteria alive={alive} t={t} />
      <Plug intact={plug} t={t} />
      <Inflammation level={inflamLevel} ros={ros} t={t} />
      <Pigment hot={hot} t={t} glow={interpolate(t, [87, 89], [0, 1], CLAMP)} />
      {mols.map((m, i) => (
        <MiniMolecule key={i} position={m.p} rotation={m.r} opacity={m.o} scale={t < 33 ? 0.05 : 0.034} />
      ))}
    </>
  );
};
