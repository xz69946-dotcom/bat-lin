import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// 字体放在 public/fonts，按视频实际用到的字符裁剪（见 scripts/fetch-fonts.py）。
// 本地加载可离线渲染，也不依赖渲染浏览器能访问 Google Fonts。
// 修改文案后如出现新汉字，请重新运行：python3 scripts/fetch-fonts.py
const faces = [
  { family: "Noto Serif SC", file: "NotoSerifSC-400.woff2", weight: "400" },
  { family: "Noto Serif SC", file: "NotoSerifSC-700.woff2", weight: "700" },
  { family: "Noto Sans SC", file: "NotoSansSC-400.woff2", weight: "400" },
  { family: "Noto Sans SC", file: "NotoSansSC-700.woff2", weight: "700" },
  {
    family: "Cormorant Garamond",
    file: "CormorantGaramond-500-italic.woff2",
    weight: "500",
    style: "italic",
  },
  { family: "STIX Two Text", file: "STIXTwoText-400-italic.woff2", weight: "400", style: "italic" },
  { family: "STIX Two Text", file: "STIXTwoText-400.woff2", weight: "400" },
  { family: "STIX Two Math", file: "STIXTwoMath-400.woff2", weight: "400" },
  { family: "JetBrains Mono", file: "JetBrainsMono-400.woff2", weight: "400" },
  { family: "JetBrains Mono", file: "JetBrainsMono-700.woff2", weight: "700" },
];

faces.forEach((f) => {
  loadFont({
    family: f.family,
    url: staticFile(`fonts/${f.file}`),
    weight: f.weight,
    style: f.style ?? "normal",
  });
});

export const fonts = {
  serifSC: '"Noto Serif SC", serif',
  sansSC: '"Noto Sans SC", "STIX Two Math", sans-serif',
  latin: '"Cormorant Garamond", serif',
  math: '"STIX Two Text", "STIX Two Math", serif',
  mono: '"JetBrains Mono", "STIX Two Math", monospace',
} as const;
