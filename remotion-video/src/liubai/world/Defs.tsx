import React from "react";

// 全卷共用的 SVG 滤镜：
// lb-rough  墨迹边缘的毛糙感（宣纸吸墨后的晕边）
// lb-bleed  更强的洇散，用于墨滴与远山
// lb-dry    飞白：沿笔锋方向的干笔丝缕
// lb-soft   远景与云气的柔化
export const Defs: React.FC = () => (
  <defs>
    <filter id="lb-rough" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves={3} seed={7} result="n" />
      <feDisplacementMap in="SourceGraphic" in2="n" scale={9} xChannelSelector="R" yChannelSelector="G" />
    </filter>
    <filter id="lb-bleed" x="-30%" y="-30%" width="160%" height="160%">
      <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves={4} seed={3} result="n" />
      <feDisplacementMap in="SourceGraphic" in2="n" scale={34} xChannelSelector="R" yChannelSelector="G" result="d" />
      <feGaussianBlur in="d" stdDeviation={1.2} />
    </filter>
    <filter id="lb-dry" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9 0.035" numOctaves={2} seed={11} result="streak" />
      <feColorMatrix
        in="streak"
        type="matrix"
        values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -3.2 2.3"
        result="mask"
      />
      <feComposite in="SourceGraphic" in2="mask" operator="in" result="dry" />
      <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves={2} seed={5} result="n" />
      <feDisplacementMap in="dry" in2="n" scale={6} xChannelSelector="R" yChannelSelector="G" />
    </filter>
    <filter id="lb-soft" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation={6} />
    </filter>
    <filter id="lb-cloud" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation={40} />
    </filter>
  </defs>
);
