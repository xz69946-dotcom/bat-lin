import React from "react";
import * as THREE from "three";
import { AbsoluteFill, interpolate } from "remotion";
import { fonts } from "../fonts";
import { project } from "./camera";
import { HERO_ANCHORS } from "./Molecule";
import { heroRot } from "./Scene3D";
import { FX, HOT_MELANO, SEB, dejY, topY } from "./Skin";
import { AZ } from "./theme";
import { CLAMP, HEIGHT, WIDTH, segAlpha } from "./timeline";

const W = WIDTH;
const H = HEIGHT;

const panel: React.CSSProperties = {
  background: "linear-gradient(160deg, rgba(19,35,58,0.86), rgba(10,18,32,0.82))",
  border: `1.5px solid rgba(92,225,192,0.45)`,
  borderRadius: 22,
  boxShadow: "0 18px 50px rgba(0,0,0,0.45)",
  color: AZ.ink,
  fontFamily: fonts.sansSC,
};

const fadeUp = (t: number, a: number, b: number) => {
  const o = interpolate(t, [a, a + 0.6, b - 0.6, b], [0, 1, 1, 0], CLAMP);
  return { opacity: o, transform: `translateY(${(1 - Math.min(1, (t - a) / 0.6)) * 18}px)` };
};

// 带引线的 3D 标注：label 放在 anchor 附近的 (dx, dy) 偏移处
const Callout: React.FC<{ t: number; p: THREE.Vector3; text: React.ReactNode; dx: number; dy: number; a: number; b: number; color?: string }> = ({ t, p, text, dx, dy, a, b, color = AZ.accent }) => {
  const s = project(t, p, W, H);
  const o = interpolate(t, [a, a + 0.5, b - 0.5, b], [0, 1, 1, 0], CLAMP);
  if (!s.visible || o <= 0) return null;
  const lx = s.x + dx;
  const ly = s.y + dy;
  return (
    <>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: o }}>
        <line x1={s.x} y1={s.y} x2={lx} y2={ly} stroke={color} strokeWidth={2} />
        <circle cx={s.x} cy={s.y} r={6} fill={color} />
        <circle cx={s.x} cy={s.y} r={12} fill="none" stroke={color} strokeWidth={1.5} opacity={0.6} />
      </svg>
      <div
        style={{
          position: "absolute",
          left: lx,
          top: ly,
          transform: `translate(${dx < 0 ? "-100%" : "0"}, -50%)`,
          opacity: o,
          padding: "8px 18px",
          fontSize: 30,
          fontWeight: 700,
          whiteSpace: "nowrap",
          ...panel,
          borderColor: color,
        }}
      >
        {text}
      </div>
    </>
  );
};

const Title: React.FC<{ t: number }> = ({ t }) => {
  const o = segAlpha(t, "title", 1.0, 1.0);
  if (o <= 0) return null;
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 110, opacity: o, fontFamily: fonts.sansSC }}>
      <div style={{ ...fadeUp(t, 0.8, 9) }}>
        <div style={{ textAlign: "center", color: AZ.accent, fontSize: 30, letterSpacing: 10, fontWeight: 700 }}>3D 皮肤近景 · 成分科普</div>
        <div style={{ textAlign: "center", color: AZ.ink, fontSize: 120, fontWeight: 700, letterSpacing: 24, lineHeight: 1.25, textShadow: "0 6px 30px rgba(92,225,192,0.35)" }}>壬二酸</div>
        <div style={{ textAlign: "center", color: AZ.dim, fontFamily: fonts.latin, fontStyle: "italic", fontSize: 46 }}>Azelaic Acid</div>
        <div style={{ textAlign: "center", color: AZ.ink, fontSize: 36, marginTop: 18, letterSpacing: 6 }}>一个分子，四种作用</div>
      </div>
    </AbsoluteFill>
  );
};

const MoleculeInfo: React.FC<{ t: number }> = ({ t }) => {
  // 标注点跟随分子旋转：与 Scene3D 中的变换保持一致
  const rot = new THREE.Euler(...heroRot(t));
  const toWorld = (v: THREE.Vector3) => v.clone().multiplyScalar(0.55).applyEuler(rot).add(new THREE.Vector3(0, 30, 0));
  const card = fadeUp(t, 11, 21);
  return (
    <AbsoluteFill>
      <Callout t={t} p={toWorld(HERO_ANCHORS.leftCOOH)} text="羧基 –COOH" dx={-60} dy={-130} a={11.5} b={20.6} color={AZ.oxygen} />
      <Callout t={t} p={toWorld(HERO_ANCHORS.rightCOOH)} text="羧基 –COOH" dx={60} dy={-130} a={12} b={20.6} color={AZ.oxygen} />
      <Callout
        t={t}
        p={toWorld(HERO_ANCHORS.chain)}
        text={
          <span>
            7 个亚甲基 –CH<sub style={{ fontSize: 20 }}>2</sub>–
          </span>
        }
        dx={30}
        dy={170}
        a={12.6}
        b={20.6}
      />
      <div style={{ position: "absolute", left: 90, bottom: 80, width: 640, padding: "28px 34px", ...panel, ...card }}>
        <div style={{ color: AZ.accent, fontSize: 28, fontWeight: 700, letterSpacing: 4 }}>认识它</div>
        <div style={{ fontSize: 44, fontWeight: 700, margin: "6px 0 14px" }}>
          C<sub style={{ fontSize: 26 }}>9</sub>H<sub style={{ fontSize: 26 }}>16</sub>O<sub style={{ fontSize: 26 }}>4</sub>
          <span style={{ fontSize: 30, color: AZ.dim, marginLeft: 18 }}>九碳二元羧酸</span>
        </div>
        {["两端各一个羧基，中间是 7 个碳的链", "天然存在于小麦、黑麦、大麦等谷物", "皮肤上常驻的马拉色菌也会产生它"].map((s, i) => (
          <div key={i} style={{ fontSize: 30, lineHeight: 1.65, color: AZ.ink, opacity: interpolate(t, [12 + i * 0.7, 12.6 + i * 0.7], [0, 1], CLAMP) }}>
            <span style={{ color: AZ.accent, marginRight: 12 }}>●</span>
            {s}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

const Dive: React.FC<{ t: number }> = ({ t }) => {
  const q = fadeUp(t, 22, 27.2);
  const v = (x: number, y: number, z = 4) => new THREE.Vector3(x, y, z);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div style={{ ...q, fontFamily: fonts.sansSC, fontSize: 56, fontWeight: 700, color: AZ.ink, textShadow: "0 4px 24px rgba(0,0,0,0.6)" }}>
          涂在皮肤上之后，它会去哪儿？
        </div>
      </AbsoluteFill>
      <Callout t={t} p={v(3.0, topY(3.0) - 0.12)} text="角质层" dx={120} dy={-120} a={28} b={33} />
      <Callout t={t} p={v(4.3, 0.75)} text="表皮" dx={170} dy={-60} a={28.3} b={33} />
      <Callout t={t} p={v(1.9, dejY(1.9) + 0.11)} text="黑素细胞（基底层）" dx={120} dy={140} a={28.6} b={33} />
      <Callout t={t} p={v(3.6, -2.4)} text="真皮" dx={190} dy={30} a={28.9} b={33} />
      <Callout t={t} p={v(FX, -1.9, 3.5)} text="毛囊" dx={-210} dy={60} a={29.2} b={33} />
      <Callout t={t} p={v(SEB.x + 0.3, SEB.y)} text="皮脂腺" dx={60} dy={160} a={29.5} b={33} color={AZ.sebum} />
    </AbsoluteFill>
  );
};

type Legend = { color: string; text: string };

const Effect: React.FC<{
  t: number;
  a: number;
  b: number;
  idx: number;
  tag: string;
  title: string;
  lines: string[];
  legend: Legend[];
  side?: "left" | "right";
}> = ({ t, a, b, idx, tag, title, lines, legend, side = "right" }) => {
  if (t < a || t > b) return null;
  const card = fadeUp(t, a + 0.8, b);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", [side]: 80, top: 150, width: 720, padding: "30px 36px 34px", ...panel, ...card }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ background: AZ.accent, color: AZ.bg, fontWeight: 700, fontSize: 26, padding: "4px 16px", borderRadius: 999 }}>作用 {idx} / 4</div>
          <div style={{ color: AZ.accent, fontSize: 30, fontWeight: 700, letterSpacing: 4 }}>{tag}</div>
        </div>
        <div style={{ fontSize: 42, fontWeight: 700, margin: "16px 0 12px", lineHeight: 1.3 }}>{title}</div>
        {lines.map((s, i) => (
          <div key={i} style={{ fontSize: 30, lineHeight: 1.6, marginTop: 10, opacity: interpolate(t, [a + 1.6 + i * 1.6, a + 2.3 + i * 1.6], [0, 1], CLAMP) }}>
            <span style={{ color: AZ.accent, marginRight: 12 }}>●</span>
            {s}
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: side === "right" ? 80 : undefined, right: side === "left" ? 80 : undefined, bottom: 70, display: "flex", gap: 18, ...card }}>
        {legend.map((l, i) => (
          <div key={i} style={{ ...panel, padding: "10px 20px", fontSize: 26, display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ width: 18, height: 18, borderRadius: 9, background: l.color, boxShadow: `0 0 12px ${l.color}` }} />
            {l.text}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

const AZ_LEGEND: Legend = { color: AZ.accent, text: "壬二酸分子" };

const Icon: React.FC<{ k: number }> = ({ k }) => {
  const c = AZ.accent;
  const common = { fill: "none", stroke: c, strokeWidth: 4, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg width={64} height={64} viewBox="0 0 64 64">
      {k === 0 && (
        <>
          <path d="M32 6 L54 14 V30 C54 44 44 54 32 58 C20 54 10 44 10 30 V14 Z" {...common} />
          <path d="M22 32 L29 39 L43 24" {...common} />
        </>
      )}
      {k === 1 && (
        <>
          <path d="M20 10 C20 30 26 36 26 58 M44 10 C44 30 38 36 38 58" {...common} />
          <path d="M32 40 V16 M24 24 L32 16 L40 24" {...common} />
        </>
      )}
      {k === 2 && (
        <>
          <circle cx={32} cy={32} r={20} {...common} />
          <path d="M22 32 H42" {...common} />
          <path d="M32 6 V12 M32 52 V58 M6 32 H12 M52 32 H58" {...common} />
        </>
      )}
      {k === 3 && (
        <>
          <circle cx={32} cy={32} r={12} {...common} />
          <path d="M32 6 V14 M32 50 V58 M6 32 H14 M50 32 H58 M14 14 L19 19 M45 45 L50 50 M14 50 L19 45 M45 19 L50 14" {...common} />
        </>
      )}
    </svg>
  );
};

const Summary: React.FC<{ t: number }> = ({ t }) => {
  if (t < 105) return null;
  const items = [
    ["抗菌", "抑制痤疮丙酸杆菌"],
    ["疏通", "让毛囊口角化恢复正常"],
    ["抗炎", "清除活性氧、平复红肿"],
    ["淡斑", "抑制过度活跃的黑素细胞"],
  ];
  const notes = ["处方：15% 凝胶/泡沫（玫瑰痤疮）、20% 乳膏（痤疮）", "护肤品中常见约 10%", "初用可能刺痛、灼热、发痒，多会逐渐减轻", "效果需坚持数周；孕期、哺乳期请先咨询医生"];
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(10,18,32,0.82) 0%, rgba(10,18,32,0.55) 45%, rgba(10,18,32,0) 70%)", opacity: interpolate(t, [105, 106.5], [0, 1], CLAMP) }} />
      <div style={{ position: "absolute", left: 90, top: 80, fontFamily: fonts.sansSC, color: AZ.ink, ...fadeUp(t, 105.5, 121) }}>
        <div style={{ color: AZ.accent, fontSize: 30, fontWeight: 700, letterSpacing: 6 }}>回顾</div>
        <div style={{ fontSize: 58, fontWeight: 700 }}>壬二酸的四种作用</div>
      </div>
      <div style={{ position: "absolute", left: 90, top: 230, display: "grid", gridTemplateColumns: "400px 400px", gap: 20 }}>
        {items.map(([a, b], i) => (
          <div key={i} style={{ ...panel, padding: "18px 22px", height: 92, display: "flex", gap: 18, alignItems: "center", ...fadeUp(t, 106.2 + i * 0.5, 121) }}>
            <Icon k={i} />
            <div>
              <div style={{ fontSize: 36, fontWeight: 700 }}>{a}</div>
              <div style={{ fontSize: 23, color: AZ.dim, marginTop: 4, whiteSpace: "nowrap" }}>{b}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 90, top: 520, width: 772, padding: "24px 30px", ...panel, borderColor: "rgba(244,201,120,0.6)", ...fadeUp(t, 109.5, 121) }}>
        <div style={{ color: AZ.gold, fontSize: 30, fontWeight: 700, letterSpacing: 4, marginBottom: 6 }}>使用须知</div>
        {notes.map((s, i) => (
          <div key={i} style={{ fontSize: 26, lineHeight: 1.65, opacity: interpolate(t, [110.3 + i * 0.6, 110.9 + i * 0.6], [0, 1], CLAMP) }}>
            <span style={{ color: AZ.gold, marginRight: 10 }}>●</span>
            {s}
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 90, bottom: 56, fontFamily: fonts.sansSC, fontSize: 24, color: AZ.dim, ...fadeUp(t, 113, 121) }}>
        本片为科普内容，不能替代医生的诊断与治疗。
      </div>
    </AbsoluteFill>
  );
};

export const Overlays: React.FC<{ t: number }> = ({ t }) => (
  <AbsoluteFill style={{ fontFamily: fonts.sansSC }}>
    <Title t={t} />
    {t > 10 && t < 21.5 && <MoleculeInfo t={t} />}
    {t > 21.5 && t < 33.5 && <Dive t={t} />}
    <Effect
      t={t}
      a={33}
      b={52}
      idx={1}
      tag="抗菌"
      title="抑制痤疮丙酸杆菌"
      lines={["毛囊里的皮脂，是痤疮丙酸杆菌的温床", "壬二酸干扰细菌合成蛋白质，抑制它繁殖", "对表皮葡萄球菌同样有效，目前未见明确的耐药报道"]}
      legend={[AZ_LEGEND, { color: AZ.bacteria, text: "痤疮丙酸杆菌" }, { color: AZ.sebum, text: "皮脂" }]}
    />
    <Effect
      t={t}
      a={52}
      b={69}
      idx={2}
      tag="疏通毛孔"
      title="让毛囊口的角化恢复正常"
      lines={["角质细胞在毛囊口过度堆积，就会堵成角栓——粉刺", "壬二酸减少丝聚蛋白和透明角质颗粒，让角化回到正常节奏", "角栓松动、脱落，毛孔重新通畅"]}
      legend={[AZ_LEGEND, { color: "#D6C3A3", text: "角栓（粉刺）" }]}
    />
    <Effect
      t={t}
      a={69}
      b={87}
      idx={3}
      tag="抗炎"
      title="清除活性氧，平复红肿"
      lines={["中性粒细胞释放活性氧（ROS），让红肿和损伤加重", "壬二酸清除活性氧，并下调 KLK5 与抗菌肽 cathelicidin 这条炎症通路", "所以它也用于玫瑰痤疮的红斑和丘疹"]}
      legend={[AZ_LEGEND, { color: "#B89AE0", text: "中性粒细胞" }, { color: AZ.ros, text: "活性氧" }]}
    />
    <Effect
      t={t}
      a={87}
      b={105}
      idx={4}
      tag="淡化色沉"
      side="left"
      title="只盯「过度活跃」的黑素细胞"
      lines={["竞争性抑制酪氨酸酶，减少黑色素的合成", "主要作用于异常活跃的黑素细胞，对正常肤色影响很小", "常用于黄褐斑、炎症后色素沉着（痘印）"]}
      legend={[AZ_LEGEND, { color: "#B07A52", text: "黑素细胞" }, { color: "#5A3A28", text: "黑色素颗粒" }]}
    />
    {/* 镜头里的小标注：过度活跃的黑素细胞 */}
    {t > 90 && t < 104.5 && (
      <Callout t={t} p={new THREE.Vector3(HOT_MELANO, dejY(HOT_MELANO) + 0.12, 4.05)} text={t < 98 ? "过度活跃的黑素细胞" : "活跃度下降，黑色素减少"} dx={140} dy={150} a={90.5} b={104.5} color="#E7A06A" />
    )}
    <Summary t={t} />
  </AbsoluteFill>
);
