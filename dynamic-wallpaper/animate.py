"""把一张静态壁纸做成无缝循环的动态壁纸（纯代码，不用视频模型）。

图层：
1. 烟雾流动：两相位 flow map（水面着色器常用的技巧），每个像素沿流场来回取样、交叉淡化，循环无缝
2. 人物锁定：rembg(isnet) 抠出人物，脸、手、枪不参与流动
3. 金粉闪烁：高频亮点按各自相位明暗变化
4. 飘散火星：额外的金色粒子沿流场飘走，生命周期循环
5. 枪身扫光：每个循环一道光从枪尾扫到枪尖
6. 镜头呼吸：缓慢推近再退回
用法：python animate.py still.jpg mask.png out.mp4 [--center x,y] [--focus x,y] [--spear x1,y1,x2,y2] [--tint b,g,r] [--preview]
  坐标都是 0~1 的相对位置；--spear 给出枪尾、枪尖，不给就不做扫光
  --preview 只输出第 0、1 和最后一帧（png），用来检查循环接缝
"""
import argparse
import subprocess

import cv2
import numpy as np

floats = lambda v: [float(x) for x in v.split(",")]
ap = argparse.ArgumentParser()
ap.add_argument("src")
ap.add_argument("mask")
ap.add_argument("out")
ap.add_argument("--size", default="2560x1440")
ap.add_argument("--fps", type=int, default=30)
ap.add_argument("--seconds", type=float, default=8)
ap.add_argument("--center", type=floats, default=[0.46, 0.55], help="流场中心：烟雾从这里向外飘")
ap.add_argument("--focus", type=floats, default=[0.47, 0.42], help="镜头推近的中心，一般放在脸上")
ap.add_argument("--spear", type=floats, default=None, help="枪尾 x,y 和枪尖 x,y")
ap.add_argument("--tint", type=floats, default=[0.45, 0.8, 1.0], help="火星颜色（BGR），默认金色")
ap.add_argument("--travel", type=float, default=64, help="每个流动周期的位移（按 2560 宽计的像素）")
ap.add_argument("--preview", action="store_true")
a = ap.parse_args()
src, mask_path, out = a.src, a.mask, a.out
W, H = (int(v) for v in a.size.split("x"))
FPS, SECONDS, PREVIEW = a.fps, a.seconds, a.preview
N = int(round(FPS * SECONDS))
rng = np.random.default_rng(7)

img = cv2.resize(cv2.imread(src), (W, H), interpolation=cv2.INTER_AREA).astype(np.float32) / 255.0
isnet = cv2.resize(cv2.imread(mask_path, cv2.IMREAD_GRAYSCALE), (W, H)).astype(np.float32) / 255.0
s = W / 2560.0  # 以 2560 宽为基准的尺度


def smoothstep(a, b, x):
    t = np.clip((x - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)


def smooth_noise(cells, seed):
    r = np.random.default_rng(seed).random((cells[1], cells[0])).astype(np.float32)
    return cv2.resize(r, (W, H), interpolation=cv2.INTER_CUBIC)


# ---------- 人物锁定与流动强度 ----------
protect = smoothstep(0.22, 0.55, isnet)
protect = cv2.dilate(protect, np.ones((int(15 * s) | 1,) * 2, np.uint8))
protect = cv2.GaussianBlur(protect, (0, 0), 18 * s)
luma = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
smoke = smoothstep(0.04, 0.3, cv2.GaussianBlur(luma, (0, 0), 6 * s))
strength = (1 - protect) * (0.25 + 0.75 * smoke)

# ---------- 流场：从人物向外、向上飘，叠加卷曲噪声形成翻涌 ----------
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
cx, cy = a.center[0] * W, a.center[1] * H
dx, dy = (xx - cx) / W, (yy - cy) / H * 0.5 - 0.18
norm = np.sqrt(dx * dx + dy * dy) + 1e-4
out_x, out_y = dx / norm, dy / norm
psi = smooth_noise((7, 4), 1) * 1.0 + smooth_noise((14, 8), 2) * 0.45
gy, gx = np.gradient(psi)
cnorm = np.sqrt(gx * gx + gy * gy).max() + 1e-6
curl_x, curl_y = gy / cnorm, -gx / cnorm
fx = out_x * 0.65 + curl_x * 1.1
fy = out_y * 0.65 + curl_y * 1.1
fn = np.sqrt(fx * fx + fy * fy) + 1e-4
fx, fy = fx / fn * strength, fy / fn * strength
LAYER_T = SECONDS / 2  # 每层流动周期，整段循环是它的整数倍
TRAVEL = a.travel * s  # 每个周期的位移（像素）
phase_off = smooth_noise((9, 5), 3)  # 每个像素相位错开，避免整体同步“呼吸”

# ---------- 金粉闪烁 ----------
hp = np.clip(luma - cv2.GaussianBlur(luma, (0, 0), 3 * s), 0, None)
sparkle = smoothstep(0.03, 0.15, hp) * (1 - protect * 0.7)
sparkle_phase = smooth_noise((160, 90), 4) * 6.283

# ---------- 飘散火星 ----------
P = int(600 * (W * H) / (2560 * 1440))
wmap = (strength * smoke).ravel()
idx = rng.choice(W * H, size=P, p=wmap / wmap.sum())
p0 = np.stack([idx % W, idx // W], 1).astype(np.float32)
pv = np.stack([fx.ravel()[idx], fy.ravel()[idx] - 0.35], 1)
pv /= np.linalg.norm(pv, axis=1, keepdims=True) + 1e-4
p_travel = rng.uniform(80, 260, P) * s
p_cycles = rng.integers(1, 3, P)  # 一个循环里飘 1~2 次
p_off = rng.random(P)
p_size = rng.uniform(1.0, 2.6, P) * s
p_col = np.array(a.tint, np.float32)

# ---------- 枪身扫光 ----------
if a.spear:
    tail = np.array([a.spear[0] * W, a.spear[1] * H])
    tip = np.array([a.spear[2] * W, a.spear[3] * H])
    axis = tip - tail
    L2 = (axis**2).sum()
    proj = ((xx - tail[0]) * axis[0] + (yy - tail[1]) * axis[1]) / L2
    px_, py_ = tail[0] + proj * axis[0], tail[1] + proj * axis[1]
    dist = np.sqrt((xx - px_) ** 2 + (yy - py_) ** 2)
    spear = smoothstep(26 * s, 10 * s, dist) * (proj > -0.01) * (proj < 1.01) * smoothstep(0.15, 0.45, isnet)

# ---------- 泛光 ----------
def bloom(x):
    b = np.clip(x - 0.92, 0, None)
    return cv2.GaussianBlur(b, (0, 0), 12 * s) * 0.5 + cv2.GaussianBlur(b, (0, 0), 36 * s) * 0.35


cmd = ["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
       "-c:v", "libx264", "-preset", "slow", "-crf", "16", "-g", "30", "-pix_fmt", "yuv420p", "-movflags", "+faststart", out]
ff = subprocess.Popen(cmd, stdin=subprocess.PIPE)
frames = range(N) if not PREVIEW else [0, 1, N - 1]
for f in frames:
    t = f / N  # 0~1，整段循环
    # 1. 两相位流动
    acc = np.zeros_like(img)
    for k in (0.0, 0.5):
        ph = np.mod(t * SECONDS / LAYER_T + phase_off + k, 1.0)
        w = 1 - np.abs(2 * ph - 1)
        d = (ph - 0.5) * TRAVEL
        layer = cv2.remap(img, xx - fx * d, yy - fy * d, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
        acc += layer * w[..., None]
    frame = acc
    # 2. 金粉闪烁
    tw = 0.5 + 0.5 * np.sin(sparkle_phase + 2 * np.pi * 3 * t)
    frame = frame + frame * (sparkle * (tw - 0.35) * 0.9)[..., None]
    # 3. 火星
    glow = np.zeros((H, W), np.float32)
    life = np.mod(t * p_cycles + p_off, 1.0)
    pos = p0 + pv * (life * p_travel)[:, None]
    alpha = np.sin(np.pi * life) ** 1.5
    for (x, y), al, r in zip(pos, alpha, p_size):
        if 0 <= x < W and 0 <= y < H:
            cv2.circle(glow, (int(x * 4), int(y * 4)), max(1, int(r * 4)), float(al), -1, cv2.LINE_AA, shift=2)
    glow = cv2.GaussianBlur(glow, (0, 0), 1.2 * s) * 1.6 + cv2.GaussianBlur(glow, (0, 0), 6 * s) * 2.5
    frame = frame + glow[..., None] * p_col
    # 4. 枪身扫光：每个循环 1.6 秒内从枪尾扫到枪尖
    st = (t * SECONDS - 1.0) / 1.6
    if a.spear and -0.1 < st < 1.1:
        env = np.sin(np.pi * np.clip(st, 0, 1))  # 扫光两端淡入淡出
        band = np.exp(-(((proj - st) / 0.035) ** 2)) * spear * env
        halo = cv2.GaussianBlur(band, (0, 0), 14 * s)
        head = tail + axis * st  # 光头处的星芒
        flare = np.exp(-(((xx - head[0]) ** 2 + (yy - head[1]) ** 2) / (2 * (22 * s) ** 2))) * env
        frame = frame + (band * 0.9 + halo * 1.6 + flare * 0.9)[..., None] * np.array([0.85, 0.97, 1.0], np.float32)
    # 5. 泛光（轻微呼吸）
    frame = frame + bloom(frame) * (0.8 + 0.2 * np.sin(2 * np.pi * t))
    # 6. 镜头呼吸：推近 3% 再退回
    z = 1.0 + 0.03 * (0.5 - 0.5 * np.cos(2 * np.pi * t))
    fcx, fcy = a.focus[0] * W, a.focus[1] * H
    M = np.float32([[z, 0, (1 - z) * fcx], [0, z, (1 - z) * fcy]])
    frame = cv2.warpAffine(frame, M, (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
    out8 = np.clip(frame * 255, 0, 255).astype(np.uint8)
    if PREVIEW:
        cv2.imwrite(out.replace(".mp4", f"_f{f:03d}.png"), out8)
    else:
        ff.stdin.write(out8.tobytes())
ff.stdin.close()
ff.wait()
print("done", N if not PREVIEW else len(frames), "frames")
