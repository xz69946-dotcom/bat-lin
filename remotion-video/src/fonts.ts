import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";
import { FONT_FACES } from "./font-manifest";

// 字体放在 public/fonts，按视频实际用到的字符裁剪（见 scripts/fetch-fonts.py）。
// 本地加载可离线渲染，也不依赖渲染浏览器能访问 Google Fonts。
// 修改文案后如出现新汉字，请重新运行：python3 scripts/fetch-fonts.py
FONT_FACES.forEach((f) => {
  loadFont({
    family: f.family,
    url: staticFile(`fonts/${f.file}`),
    weight: f.weight,
    style: f.style,
    unicodeRange: f.unicodeRange,
  });
});

export const fonts = {
  serifSC: '"Noto Serif SC", serif',
  sansSC: '"Noto Sans SC", "STIX Two Math", sans-serif',
  latin: '"Cormorant Garamond", serif',
  math: '"STIX Two Text", "STIX Two Math", serif',
  mono: '"JetBrains Mono", "STIX Two Math", monospace',
  // 毛笔楷书：只用于《留白》的题字与大字
  brush: '"Ma Shan Zheng", "Noto Serif SC", serif',
} as const;
