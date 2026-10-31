"""用火山方舟 Seedream 生成壁纸静图。

密钥从环境变量 ARK_API_KEY 读取（在云环境设置的 Network secrets 里配置），不要写进代码或提交到仓库。
用法：python gen_still.py prompt.txt out.jpg [model] [size] [seed]
"""
import json
import os
import sys
import time
import urllib.request

prompt_file, out = sys.argv[1], sys.argv[2]
model = sys.argv[3] if len(sys.argv) > 3 else "doubao-seedream-5-0-pro-260628"
size = sys.argv[4] if len(sys.argv) > 4 else "2560x1440"
seed = int(sys.argv[5]) if len(sys.argv) > 5 else 11

key = os.environ.get("ARK_API_KEY")
if not key:
    sys.exit("缺少环境变量 ARK_API_KEY")

# 注意：Seedream 5.0 Pro 不支持 sequential_image_generation 参数，传了会报 400
body = {
    "model": model,
    "prompt": open(prompt_file, encoding="utf-8").read().strip(),
    "size": size,
    "seed": seed,
    "response_format": "url",
    "watermark": False,
}
req = urllib.request.Request(
    "https://ark.cn-beijing.volces.com/api/v3/images/generations",
    data=json.dumps(body).encode(),
    headers={"Authorization": "Bearer " + key, "Content-Type": "application/json"},
)
t = time.time()
try:
    d = json.load(urllib.request.urlopen(req, timeout=180))
except urllib.error.HTTPError as e:
    sys.exit(f"HTTP {e.code} {e.read().decode()[:600]}")
print("took", round(time.time() - t, 1), "s; usage:", d.get("usage"))
urllib.request.urlretrieve(d["data"][0]["url"], out)
print("saved", out, os.path.getsize(out))
