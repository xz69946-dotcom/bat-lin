"""按 src/ 中实际出现的字符，从 Google Fonts 下载裁剪后的 woff2 到 public/fonts，
并生成 src/font-manifest.ts（每个字体文件及其覆盖的字符范围）。

中文字符较多时，Google Fonts 的 `text=` 请求会截断，所以中文按批次下载：
每批一个文件，用 unicode-range 声明它覆盖哪些字，浏览器会按字挑选对应文件。

用法（在 remotion-video 目录下）：python3 scripts/fetch-fonts.py
"""
import glob
import json
import os
import re
import subprocess
import urllib.parse

UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/130.0 Safari/537.36"
)
OUT = "public/fonts"
CHUNK = 120

chars = set()
for f in glob.glob("src/**/*.ts*", recursive=True):
    if f.endswith("font-manifest.ts"):
        continue
    chars.update(c for c in open(f, encoding="utf-8").read() if ord(c) > 127)
latin = "".join(chr(i) for i in range(32, 127)) + "—·–×≈≥≤±→·"
# 公式用到的希腊字母与数学符号
math = latin + "ΔΛΣΨΩμνπψħ₀₁₂⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺∞∫≡≥≤≈→"
# 竖排标点，供竖写题跋使用
vertical = "︐︑︒︓︔"
cjk = "".join(sorted(chars | set("，：·—、。" + vertical)))

faces = []


def fetch(family: str, spec: str, text: str, out: str) -> None:
    url = (
        f"https://fonts.googleapis.com/css2?family={family}:{spec}"
        f"&text={urllib.parse.quote(text)}"
    )
    css = subprocess.run(
        ["curl", "-sS", "-A", UA, url], capture_output=True, text=True, check=True
    ).stdout
    srcs = re.findall(r"url\((https://[^)]+)\)", css)
    if len(srcs) != 1:
        raise SystemExit(f"{family} {spec}: expected 1 font file, got {len(srcs)}")
    subprocess.run(["curl", "-sS", "-A", UA, "-o", f"{OUT}/{out}", srcs[0]], check=True)


def unicode_range(text: str) -> str:
    return ",".join(f"U+{ord(c):X}" for c in sorted(set(text)))


def add(name: str, family_css: str, family: str, spec: str, weight: str, style: str, text: str, chunked: bool) -> None:
    # 只清理本字体自己的文件（避免误删前缀相同的其他字重，如 -italic）
    for old in glob.glob(f"{OUT}/{name}.woff2") + glob.glob(f"{OUT}/{name}-[0-9]*.woff2"):
        os.remove(old)
    parts = [text[i : i + CHUNK] for i in range(0, len(text), CHUNK)] if chunked else [text]
    for i, part in enumerate(parts):
        file = f"{name}-{i}.woff2" if chunked else f"{name}.woff2"
        fetch(family_css, spec, part, file)
        face = {"family": family, "file": file, "weight": weight, "style": style}
        if chunked:
            face["unicodeRange"] = unicode_range(part)
        faces.append(face)
    print("saved", name, f"({len(parts)} file{'s' if len(parts) > 1 else ''})")


add("NotoSerifSC-400", "Noto+Serif+SC", "Noto Serif SC", "wght@400", "400", "normal", cjk, True)
add("NotoSerifSC-700", "Noto+Serif+SC", "Noto Serif SC", "wght@700", "700", "normal", cjk, True)
add("NotoSansSC-400", "Noto+Sans+SC", "Noto Sans SC", "wght@400", "400", "normal", cjk, True)
add("NotoSansSC-700", "Noto+Sans+SC", "Noto Sans SC", "wght@700", "700", "normal", cjk, True)
add("CormorantGaramond-500-italic", "Cormorant+Garamond", "Cormorant Garamond", "ital,wght@1,500", "500", "italic", latin, False)
add("STIXTwoText-400-italic", "STIX+Two+Text", "STIX Two Text", "ital,wght@1,400", "400", "italic", math, False)
add("STIXTwoText-400", "STIX+Two+Text", "STIX Two Text", "wght@400", "400", "normal", math, False)
# 数学符号与上标的兜底字体（STIX Two Text / JetBrains Mono / 思源黑体缺少的字形）
add("STIXTwoMath-400", "STIX+Two+Math", "STIX Two Math", "wght@400", "400", "normal", math, False)
add("JetBrainsMono-400", "JetBrains+Mono", "JetBrains Mono", "wght@400", "400", "normal", math, False)
add("JetBrainsMono-700", "JetBrains+Mono", "JetBrains Mono", "wght@700", "700", "normal", math, False)
# 毛笔字体只用于少数大字
add("MaShanZheng-400", "Ma+Shan+Zheng", "Ma Shan Zheng", "wght@400", "400", "normal", "留白计当黑", False)

with open("src/font-manifest.ts", "w", encoding="utf-8") as f:
    f.write("// 由 scripts/fetch-fonts.py 生成，请勿手改。\n")
    f.write("export const FONT_FACES: {\n  family: string;\n  file: string;\n  weight: string;\n  style: string;\n  unicodeRange?: string;\n}[] = ")
    f.write(json.dumps(faces, ensure_ascii=False, indent=2))
    f.write(";\n")
print("wrote src/font-manifest.ts")
