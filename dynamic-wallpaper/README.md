# 动态壁纸（dynamic-wallpaper）

把一张 AI 生成的静态壁纸做成无缝循环的动态壁纸，**不用视频生成模型**（火山方舟的视频模型要先充值，这里只用生图）。

| 步骤 | 工具 | 说明 |
|---|---|---|
| 1. 出图 | 火山方舟 Seedream 5.0 Pro（`gen_still.py`） | 2560×1440，一张约 1 分钟 |
| 2. 抠人物 | rembg | 生成人物遮罩，脸、手、枪不参与流动 |
| 3. 做动画 | OpenCV + NumPy（`animate.py`） | 烟雾流动、亮点闪烁、粒子飘散、枪身扫光、镜头呼吸，首尾无缝 |
| 4. 编码 | FFmpeg | H.264，每 30 帧一个关键帧 |

人物的审美偏好写在仓库根目录的 `CLAUDE.md` 里（忧郁、成熟、骨相分明，不要偶像感）。

## 用法

```console
pip install "rembg[cpu]" opencv-python-headless
export ARK_API_KEY=...   # 在云环境的 Network secrets 里配置，不要写进仓库
python gen_still.py prompt_melancholy_spear.txt melancholy_spear_still.jpg
python -c "from rembg import remove, new_session; from PIL import Image; \
  remove(Image.open('melancholy_spear_still.jpg').convert('RGB').resize((1280, 720)), \
  session=new_session('isnet-general-use'), only_mask=True).save('mask.png')"
python animate.py melancholy_spear_still.jpg mask.png out.mp4 \
  --center 0.5,0.55 --focus 0.40,0.30 --spear 0.1675,1.0,0.9525,0.058
```

`animate.py` 的参数（坐标都是 0~1 的相对位置）：

| 参数 | 作用 |
|---|---|
| `--center` | 流场中心，烟雾从这里向外、向上飘 |
| `--focus` | 镜头推近的中心，一般放在脸上 |
| `--spear` | 枪尾 x,y 和枪尖 x,y；不给就不做扫光 |
| `--tint` | 飘散粒子的颜色（BGR），默认金色；银白用 `1.0,0.93,0.85` |
| `--travel` | 每个流动周期的位移，默认 64 |
| `--size` / `--fps` / `--seconds` | 默认 2560x1440、30、8 |
| `--preview` | 只输出第 0、1 和最后一帧，用来检查循环接缝 |

在 4 核 CPU 上，2560×1440、8 秒、30 帧大约要 6 分钟；1280×720 约 1.5 分钟。

## 已做过的图

| 静图 | 提示词 | 遮罩 | 参数 |
|---|---|---|---|
| `melancholy_spear_still.jpg` 忧郁剑客（金） | `prompt_melancholy_spear.txt` | isnet-general-use | `--center 0.5,0.55 --focus 0.40,0.30 --spear 0.1675,1.0,0.9525,0.058` |
| `silver_ink_still.jpg` 银墨侧脸 | `prompt_silver_ink.txt` | u2net_human_seg × 以脸为中心的径向衰减（见下） | `--center 0.6,0.4 --focus 0.58,0.42 --tint 1.0,0.93,0.85 --travel 72` |
| `golden_spear_still.jpg` 第一版（脸太嫩，已弃用） | `prompt_golden_spear.txt` | isnet-general-use | `--center 0.46,0.55 --focus 0.47,0.42 --spear 0.087,0.752,0.928,0.323` |

**遮罩要先看一眼再用。** 银墨侧脸那张，isnet 把亮的水浪当成了主体，脸几乎没抠到，直接用会变成水不动、脸在流。改用 `u2net_human_seg` 后能抠到整个头，再乘一个以脸为中心（0.61, 0.42）、半径 0.16 到 0.30 渐隐的权重，脸完全锁住，外圈的头发和烟雾仍然能飘。

## 原理

- **烟雾流动**：两相位 flow map。每个像素沿流场取样两次，两层的相位差半个周期，按三角权重交叉淡化，所以永远看不到“跳回原位”的那一下。每个像素的相位再用平滑噪声错开，避免整片烟雾同步呼吸
- **流场**：从人物中心向外、向上的方向，叠加由噪声势函数求出的卷曲场（curl noise），形成翻涌感
- **循环**：所有随时间变化的量都是整段时长的整数倍周期，所以第 0 帧和最后一帧之间的差别和普通相邻两帧一样（实测 0.66 对 0.67）
