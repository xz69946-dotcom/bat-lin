import React from "react";
import { interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { Camera, Glow, SceneShell } from "../components/SceneShell";
import { PoemLine } from "../components/PoemLine";
import { CLAMP, theme } from "../theme";

const LAMP = { x: 1460, y: 408 };

const RAIN = new Array(150).fill(0).map((_, i) => ({
  x: random(`rain-x-${i}`) * 2300 - 100,
  y: random(`rain-y-${i}`) * 1300,
  speed: 34 + random(`rain-s-${i}`) * 22,
  len: 26 + random(`rain-l-${i}`) * 30,
}));

const WAVES = [
  { base: 800, amp: 16, wl: 420, speed: 0.05, color: "#0F1A33" },
  { base: 870, amp: 24, wl: 300, speed: -0.07, color: "#0A1328" },
  { base: 950, amp: 32, wl: 240, speed: 0.09, color: theme.color.coldDeep },
];

const wavePath = (w: (typeof WAVES)[number], frame: number, i: number) => {
  let d = `M -20 1100 L -20 ${w.base}`;
  for (let x = -20; x <= 1940; x += 20) {
    const y =
      w.base +
      Math.sin(x / w.wl * Math.PI * 2 + frame * w.speed + i) * w.amp +
      Math.sin(x / (w.wl * 0.37) + frame * w.speed * 1.7) * w.amp * 0.3;
    d += ` L ${x} ${y.toFixed(1)}`;
  }
  return `${d} L 1940 1100 Z`;
};

// 05 灯塔：风雨越大，光越清晰
export const S6Lighthouse: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const lampOn = interpolate(t, [1.4, 1.6, 1.8, 2.0, 2.6], [0, 0.8, 0.2, 1, 1], CLAMP);
  const beamAngle = 180 + 18 * Math.sin(t * 0.9 - 0.6);
  const beamPower = interpolate(t, [1.6, 7, 12], [0.35, 0.7, 1], CLAMP) * lampOn;
  const lightning = Math.max(
    interpolate(t, [4.0, 4.07, 4.2, 4.27, 4.6], [0, 0.55, 0.1, 0.4, 0], CLAMP),
    interpolate(t, [9.8, 9.87, 10.2], [0, 0.35, 0], CLAMP),
  );
  // 结尾：灯越来越亮，交给「闪白」转场
  const finale = interpolate(t, [12.4, 15], [0, 1], {
    ...CLAMP,
    easing: theme.ease.in,
  });

  return (
    <SceneShell
      chapter={{ no: "05", name: "灯塔" }}
      background={`linear-gradient(180deg, #05080F 0%, #0E1628 70%, #0A1122 100%)`}
    >
      <Camera from={1} to={1.06} origin={`${LAMP.x}px ${LAMP.y}px`}>
        {/* 光束 */}
        <div
          style={{
            position: "absolute",
            left: LAMP.x - 2600,
            top: LAMP.y - 300,
            width: 2600,
            height: 600,
            transformOrigin: "100% 50%",
            rotate: `${beamAngle - 180}deg`,
            clipPath: "polygon(0% 0%, 100% 49%, 100% 51%, 0% 100%)",
            background: `linear-gradient(270deg, rgba(255,241,210,0.85) 0%, rgba(255,195,90,0.35) 30%, rgba(255,195,90,0) 90%)`,
            opacity: beamPower,
          }}
        />
        <svg width={1920} height={1080} style={{ position: "absolute" }}>
          {/* 礁石与灯塔剪影 */}
          <path
            d="M 1280 1080 L 1300 860 L 1360 800 L 1420 790 L 1520 780 L 1580 810 L 1640 860 L 1700 1080 Z"
            fill="#04060B"
          />
          <polygon points="1405,790 1515,790 1492,430 1428,430" fill="#070A12" />
          {[0, 1, 2].map((i) => (
            <polygon
              key={i}
              points={`${1410 + i * 7},${720 - i * 110} ${1510 - i * 7},${720 - i * 110} ${1508 - i * 7},${690 - i * 110} ${1412 + i * 7},${690 - i * 110}`}
              fill="#161C2A"
            />
          ))}
          <rect x={1420} y={384} width={80} height={48} fill={theme.color.lightHot} opacity={lampOn} />
          <rect x={1414} y={426} width={92} height={10} fill="#070A12" />
          <polygon points="1410,386 1510,386 1460,340" fill="#070A12" />
          {WAVES.map((w, i) => (
            <path key={i} d={wavePath(w, frame, i)} fill={w.color} />
          ))}
          {/* 雨 */}
          {RAIN.map((r, i) => {
            const y = ((r.y + frame * r.speed) % 1300) - 100;
            const x = r.x - (y * 0.25);
            return (
              <line
                key={i}
                x1={x}
                y1={y}
                x2={x - r.len * 0.25}
                y2={y + r.len}
                stroke="#9FB3D9"
                strokeWidth={theme.stroke.hair}
                opacity={0.28}
              />
            );
          })}
        </svg>
        <Glow x={LAMP.x} y={LAMP.y} r={140 + finale * 1400} opacity={lampOn * 0.8} color={theme.color.light} />
      </Camera>
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "#CFE0FF",
          opacity: lightning,
        }}
      />
      <PoemLine text="风雨越大" start={2.8} end={12.4} y={330} />
      <PoemLine
        text="光越清晰"
        en="The fiercer the storm, the clearer the light."
        start={6.8}
        end={12.6}
        y={480}
        highlight="光越清晰"
      />
    </SceneShell>
  );
};
