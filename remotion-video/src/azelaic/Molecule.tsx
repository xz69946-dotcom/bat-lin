import React, { useMemo } from "react";
import * as THREE from "three";
import { AZ } from "./theme";

// 壬二酸 HOOC-(CH2)7-COOH：9 个碳的锯齿链，两端各一个羧基
type Atom = { p: THREE.Vector3; el: "C" | "O" | "H" };
type Bond = { a: number; b: number; order: 1 | 2 };

const build = (withH: boolean) => {
  const atoms: Atom[] = [];
  const bonds: Bond[] = [];
  const dx = 1.26;
  const dy = 0.42;
  for (let i = 0; i < 9; i++) atoms.push({ p: new THREE.Vector3((i - 4) * dx, i % 2 ? dy : -dy, 0), el: "C" });
  for (let i = 0; i < 8; i++) bonds.push({ a: i, b: i + 1, order: 1 });
  // 两端羧基：C=O 与 C-OH
  const carboxyl = (ci: number, dir: -1 | 1) => {
    const c = atoms[ci].p;
    const up = ci % 2 ? 1 : -1;
    const o1 = atoms.push({ p: c.clone().add(new THREE.Vector3(dir * 0.62, up * 1.08, 0)), el: "O" }) - 1;
    const o2 = atoms.push({ p: c.clone().add(new THREE.Vector3(dir * 1.2, -up * 0.42, 0)), el: "O" }) - 1;
    bonds.push({ a: ci, b: o1, order: 2 }, { a: ci, b: o2, order: 1 });
    if (withH) {
      const h = atoms.push({ p: atoms[o2].p.clone().add(new THREE.Vector3(dir * 0.62, -up * 0.6, 0)), el: "H" }) - 1;
      bonds.push({ a: o2, b: h, order: 1 });
    }
  };
  carboxyl(0, -1);
  carboxyl(8, 1);
  if (withH) {
    // 中间 7 个 CH2，每个碳两个氢（前后各一个，指向链外侧）
    for (let i = 1; i < 8; i++) {
      const c = atoms[i].p;
      const out = i % 2 ? 1 : -1;
      for (const z of [-1, 1]) {
        const h = atoms.push({ p: c.clone().add(new THREE.Vector3(0, out * 0.55, z * 0.85)), el: "H" }) - 1;
        bonds.push({ a: i, b: h, order: 1 });
      }
    }
  }
  return { atoms, bonds };
};

const RADIUS = { C: 0.36, O: 0.34, H: 0.22 };

const BondMesh: React.FC<{ a: THREE.Vector3; b: THREE.Vector3; r: number; color: string; offset?: THREE.Vector3; emissive?: string; ei?: number }> = ({ a, b, r, color, offset, emissive, ei = 0 }) => {
  const { pos, quat, len } = useMemo(() => {
    const d = b.clone().sub(a);
    const mid = a.clone().add(b).multiplyScalar(0.5);
    if (offset) mid.add(offset);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize());
    return { pos: mid, quat: q, len: d.length() };
  }, [a, b, offset]);
  return (
    <mesh position={pos} quaternion={quat}>
      <cylinderGeometry args={[r, r, len, 14]} />
      <meshStandardMaterial color={color} roughness={0.35} metalness={0.1} emissive={emissive ?? "#000"} emissiveIntensity={ei} />
    </mesh>
  );
};

// 主角分子：带氢原子的完整球棍模型
export const HeroMolecule: React.FC<{ glow?: number }> = ({ glow = 0 }) => {
  const { atoms, bonds } = useMemo(() => build(true), []);
  const color = (el: Atom["el"]) => (el === "C" ? AZ.carbon : el === "O" ? AZ.oxygen : AZ.hydrogen);
  return (
    <group>
      {atoms.map((at, i) => (
        <mesh key={i} position={at.p}>
          <sphereGeometry args={[RADIUS[at.el], 32, 24]} />
          <meshStandardMaterial
            color={color(at.el)}
            roughness={0.28}
            metalness={0.05}
            emissive={at.el === "O" ? "#ff2040" : AZ.accent}
            emissiveIntensity={at.el === "O" ? glow * 0.5 : at.el === "C" ? glow * 0.25 : 0}
          />
        </mesh>
      ))}
      {bonds.map((bd, i) => {
        const A = atoms[bd.a].p;
        const B = atoms[bd.b].p;
        if (bd.order === 2) {
          const n = new THREE.Vector3(0, 0, 1).multiplyScalar(0.11);
          return (
            <group key={i}>
              <BondMesh a={A} b={B} r={0.065} color="#C9D2DF" offset={n} />
              <BondMesh a={A} b={B} r={0.065} color="#C9D2DF" offset={n.clone().negate()} />
            </group>
          );
        }
        return <BondMesh key={i} a={A} b={B} r={0.09} color="#C9D2DF" />;
      })}
    </group>
  );
};

// 场景里成群出现的小分子：只画碳和氧，碳带薄荷青微光，方便在皮肤里辨认
export const MiniMolecule: React.FC<{ position: [number, number, number]; rotation?: [number, number, number]; scale?: number; opacity?: number }> = ({
  position,
  rotation = [0, 0, 0],
  scale = 0.07,
  opacity = 1,
}) => {
  const { atoms, bonds } = useMemo(() => build(false), []);
  if (opacity <= 0.01) return null;
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {atoms.map((at, i) => (
        <mesh key={i} position={at.p}>
          <sphereGeometry args={[at.el === "C" ? 0.42 : 0.4, 14, 10]} />
          <meshStandardMaterial
            color={at.el === "C" ? AZ.accent : AZ.oxygen}
            emissive={at.el === "C" ? AZ.accent : "#ff2040"}
            emissiveIntensity={0.55}
            roughness={0.3}
            transparent={opacity < 1}
            opacity={opacity}
          />
        </mesh>
      ))}
      {bonds.map((bd, i) => (
        <BondMesh key={i} a={atoms[bd.a].p} b={atoms[bd.b].p} r={0.14} color={AZ.accent2} emissive={AZ.accent} ei={0.4} />
      ))}
    </group>
  );
};

// 供标注使用：主角分子上几个关键点的局部坐标
export const HERO_ANCHORS = {
  leftCOOH: new THREE.Vector3(-6.2, 0.2, 0),
  rightCOOH: new THREE.Vector3(6.2, 0.2, 0),
  chain: new THREE.Vector3(0, 0.6, 0),
};
