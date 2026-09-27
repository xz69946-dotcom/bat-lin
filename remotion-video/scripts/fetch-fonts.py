"""按 src/ 中实际出现的字符，从 Google Fonts 下载裁剪后的 woff2 到 public/fonts。

用法（在 remotion-video 目录下）：python3 scripts/fetch-fonts.py
"""
import glob
import re
import subprocess
import urllib.parse

UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/130.0 Safari/537.36"
)

chars = set()
for f in glob.glob("src/**/*.ts*", recursive=True):
    chars.update(c for c in open(f, encoding="utf-8").read() if ord(c) > 127)
latin = "".join(chr(i) for i in range(32, 127)) + "—·–×≈≥≤±→·"
# 公式用到的希腊字母与数学符号
math = latin + "ΔΛΣΨΩμνπψħ₀₁₂⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺∞∫≡≥≤≈→"
cjk = "".join(sorted(chars)) + "，：·—、。" + latin


def fetch(family: str, spec: str, text: str, out: str) -> None:
    url = (
        f"https://fonts.googleapis.com/css2?family={family}:{spec}"
        f"&text={urllib.parse.quote(text)}"
    )
    css = subprocess.run(
        ["curl", "-sS", "-A", UA, url], capture_output=True, text=True, check=True
    ).stdout
    src = re.search(r"url\((https://[^)]+)\)", css).group(1)
    subprocess.run(["curl", "-sS", "-A", UA, "-o", out, src], check=True)
    print("saved", out)


fetch("Noto+Serif+SC", "wght@400", cjk, "public/fonts/NotoSerifSC-400.woff2")
fetch("Noto+Serif+SC", "wght@700", cjk, "public/fonts/NotoSerifSC-700.woff2")
fetch("Noto+Sans+SC", "wght@400", cjk, "public/fonts/NotoSansSC-400.woff2")
fetch("Noto+Sans+SC", "wght@700", cjk, "public/fonts/NotoSansSC-700.woff2")
fetch(
    "Cormorant+Garamond",
    "ital,wght@1,500",
    latin,
    "public/fonts/CormorantGaramond-500-italic.woff2",
)
fetch("STIX+Two+Text", "ital,wght@1,400", math, "public/fonts/STIXTwoText-400-italic.woff2")
fetch("STIX+Two+Text", "wght@400", math, "public/fonts/STIXTwoText-400.woff2")
fetch("JetBrains+Mono", "wght@400", math, "public/fonts/JetBrainsMono-400.woff2")
fetch("JetBrains+Mono", "wght@700", math, "public/fonts/JetBrainsMono-700.woff2")
# 数学符号与上标的兜底字体（STIX Two Text / JetBrains Mono / 思源黑体缺少的字形）
fetch("STIX+Two+Math", "wght@400", math, "public/fonts/STIXTwoMath-400.woff2")
