import React from "react";
import { interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { BEAT, SPOT } from "../timeline";
import { CLAMP, theme } from "../theme";
import { Inscription } from "./Inscription";

const DROP = { x: SPOT.title.x - 170, y: SPOT.title.y + 70 };
const SPLASH = new Array(14).fill(0).map((_, i) => ({
  a: random(`sp-a-${i}`) * Math.PI * 2,
  d: 70 + random(`sp-d-${i}`) * 190,
  r: 2 + random(`sp-r-${i}`) * 7,
}));

// 墨团由几个错开的圆叠成，边缘不规则
const LOBES = [
  { a: 0, d: 0, r: 1 },
  ...new Array(6).fill(0).map((_, i) => ({
    a: (i / 6) * Math.PI * 2 + random(`lb-a-${i}`) * 0.6,
    d: 30 + random(`lb-d-${i}`) * 45,
    r: 0.45 + random(`lb-r-${i}`) * 0.35,
  })),
];

// 卷首（引首）：一滴墨从空中落下，在纸上洇开；随后题写「留白」
export const InkDropSvg: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const fall = interpolate(t, [BEAT.drop - 0.75, BEAT.drop], [0, 1], { ...CLAMP, easing: theme.ease.in });
  const since = t - BEAT.drop;
  // 洇散：先快后慢，像墨被纸纤维慢慢吸开
  const core = interpolate(since, [0, 0.4, 5], [0, 70, 120], { ...CLAMP, easing: theme.ease.out });
  const halo = interpolate(since, [0, 1, 8], [0, 150, 270], { ...CLAMP, easing: theme.ease.out });
  const haloAlpha = interpolate(since, [0, 1, 8], [0, 0.4, 0.22], CLAMP);

  return (
    <g>
      <defs>
        <radialGradient id="ink-halo">
          <stop offset="0" stopColor={theme.color.inkMid} stopOpacity={0.5} />
          <stop offset="0.6" stopColor={theme.color.inkLight} stopOpacity={0.35} />
          <stop offset="1" stopColor={theme.color.inkLight} stopOpacity={0} />
        </radialGradient>
      </defs>
      {since < 0 && t > BEAT.drop - 0.75 && (
        <ellipse
          cx={DROP.x}
          cy={DROP.y - (1 - fall) * 420}
          rx={9}
          ry={9 + fall * 9}
          fill={theme.color.ink}
        />
      )}
      {since >= 0 && (
        <g>
          <circle cx={DROP.x} cy={DROP.y} r={halo} fill="url(#ink-halo)" opacity={haloAlpha * 2.2} filter="url(#lb-bleed)" />
          <g filter="url(#lb-bleed)">
            <g opacity={0.92}>
            {LOBES.map((l, i) => (
              <circle
                key={i}
                cx={DROP.x + Math.cos(l.a) * l.d * (core / 120)}
                cy={DROP.y + Math.sin(l.a) * l.d * (core / 120)}
                r={core * l.r}
                fill={theme.color.ink}
              />
            ))}
            </g>
            <circle cx={DROP.x} cy={DROP.y} r={core * 0.55} fill={theme.color.ink} opacity={0.5} />
            {SPLASH.map((s, i) => {
              const k = interpolate(since, [0, 0.25], [0, 1], { ...CLAMP, easing: theme.ease.out });
              return (
                <circle
                  key={i}
                  cx={DROP.x + Math.cos(s.a) * s.d * k}
                  cy={DROP.y + Math.sin(s.a) * s.d * k}
                  r={s.r * (0.6 + 0.4 * k) + since * 0.6}
                  fill={theme.color.ink}
                  opacity={0.8}
                />
              );
            })}
          </g>
        </g>
      )}
    </g>
  );
};

export const TitleText: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: SPOT.title.x + 290,
          top: SPOT.title.y - 330,
          translate: "-100% 0",
          display: "flex",
          flexDirection: "column",
          fontFamily: theme.font.brush,
          fontSize: theme.type.title,
          lineHeight: 1,
          color: theme.color.ink,
        }}
      >
        {["留", "白"].map((ch, i) => {
          const p = interpolate(t, [BEAT.title + i * 0.9, BEAT.title + i * 0.9 + 1.4], [0, 1], {
            ...CLAMP,
            easing: theme.ease.out,
          });
          return (
            <span
              key={ch}
              style={{
                display: "block",
                height: theme.type.title * 1.02,
                opacity: p,
                filter: p < 0.99 ? `blur(${(1 - p) * 14}px)` : "none",
                scale: `${1.06 - p * 0.06}`,
              }}
            >
              {ch}
            </span>
          );
        })}
      </div>
      <Inscription
        x={SPOT.title.x - 430}
        y={SPOT.title.y - 300}
        columns={["一滴墨落下，", "纸便有了天地。"]}
        start={BEAT.title + 2.4}
      />
    </>
  );
};
