# Remotion video

<p align="center">
  <a href="https://github.com/remotion-dev/logo">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://github.com/remotion-dev/logo/raw/main/animated-logo-banner-dark.apng">
      <img alt="Animated Remotion Logo" src="https://github.com/remotion-dev/logo/raw/main/animated-logo-banner-light.gif">
    </picture>
  </a>
</p>

Welcome to your Remotion project!

## Commands

**Install Dependencies**

```console
npm i
```

**Start Preview**

```console
npm run dev
```

**Render video**

```console
npx remotion render
```

**Upgrade Remotion**

```console
npx remotion upgrade
```

## 《留白》（LiuBai）

2 分钟（1920×1080，30fps，3600 帧）。宣纸、墨、一点朱砂。

**形式**：整部片子是一幅手卷，**一个镜头从右往左**展读（与手卷的真实展读方向一致），全程没有剪切，镜头在画面之间的移动本身就是转场。诗句都以竖排题跋的形式写在画上，片尾镜头拉远，前两分钟看过的所有画面合成一整幅长卷。

| 时间 | 卷上的位置 | 画面 | 题跋 |
|---|---|---|---|
| 0–9s | 引首 | 一滴墨落下、洇开；题写「留白」 | 一滴墨落下，纸便有了天地。 |
| 9–24s | 远山 | 三层远山自右向左画出，山脚隐入云雾，点苔 | 山画七分，三分交给云。 |
| 24–40s | 江水 | 只有几道水纹，一叶扁舟渡江 | 水，从不画；留白处，便是江河。 |
| 40–56s | 梅 | 干笔写出梅枝（带飞白），朱砂点花，花瓣飘落 | 疏影横斜水清浅（林逋） |
| 56–74s | 月 | 烘云托月：只染云和天，月亮是从未落墨的纸 | 暗香浮动月黄昏 / 烘云托月：月亮一笔未画，是云，把它让了出来。 |
| 74–92s | 大字 | 「计白当黑」逐字写出，「白」只勾轮廓不填墨 | 邓石如 语 / 空白不是没有，是留给你的位置。 |
| 92–101s | 落款 | 「丙午秋 火火 写」，钤一方白文印「火火」 | |
| 101–120s | 全卷 | 镜头拉远，整幅长卷铺在案上 | 留白 · The Art of Leaving Space |

出处：「疏影横斜水清浅，暗香浮动月黄昏」出自林逋《山园小梅》；「计白当黑」出自包世臣《艺舟双楫》所记邓石如语；「烘云托月」是中国画的传统技法。

```console
npx remotion render LiuBai out/LiuBai.mp4
```

代码在 `src/liubai/`：`timeline.ts`（卷上各段位置、镜头关键帧、每段落墨时间）、`camera.ts`（镜头插值，缩放在对数空间插值）、`world/`（卷上的每一段画面）、`Overlays.tsx`（前景薄雾、暗角、片尾字幕）。宣纸纹理由 `LiuBai-PaperTile` 生成：`npx remotion still LiuBai-PaperTile public/liubai/paper.png`。

## 导出手机版

渲染完成后运行下面的命令，生成能在手机上播放、存进相册、发微信的版本（输出到 `out/phone/`）：

```console
bash scripts/to-phone.sh out/CosmicTruths.mp4 out/GuangRen.mp4
```

它会把视频转成 H.264 High@4.0、yuv420p 标准色彩范围，加一条静音音轨，并把索引放在文件开头。原因是 Remotion 直接输出的文件是全范围色彩（yuvj420p）且没有音轨，部分手机相册和微信会打不开或存不了。

## 《宇宙真理》（CosmicTruths）

2 分钟（1920×1080，30fps，3600 帧）的科普动态图形，10 个场景讲 8 条已被确证的宇宙事实。

| # | 场景 | 时长 | 画面 | 转场（出）· 镜头 |
|---|---|---|---|---|
| 序 | 奇点 | 14s | 一点颤动、爆发，物质飞散成最初的星光；标题「宇宙真理」 | 拉远 |
| 01 | 宇宙在膨胀 | 13s | 星系网格整体伸展、越远越红；哈勃图拟合出 H₀ | 推进（冲向银河系） |
| 02 | 光速不可超越 | 13s | 光从太阳到地球，计时 08:19；速度对比（对数刻度） | 横摇 |
| 03 | 引力即时空弯曲 | 13s | 恒星压弯时空网格、行星绕行、星光偏折 | 推进（钻进恒星） |
| 04 | 质量即能量 | 13s | 4 个氢核聚变成氦，天平显示少了 0.7% 的质量 | 闪光 |
| 05 | 我们由星尘构成 | 13s | 恒星洋葱分层 → 超新星抛射元素 → 人体元素构成 | 推进 |
| 06 | 熵总在增加 | 12s | 抽掉挡板，120 个粒子自发扩散，熵曲线上升 | 推进（进入微观） |
| 07 | 不确定性原理 | 12s | Δx 收窄时 Δp 展宽，乘积始终为 ħ/2 | 拉远（从最小到最大） |
| 08 | 我们只看见 5% | 13s | 宇宙网 + 环形图：暗能量 68.3%、暗物质 26.8%、普通物质 4.9% | 推进 |
| 终 | 可被理解 | 13s | 八条公式环绕并收束回一个点；爱因斯坦名言 | 淡出 |

连续性设计：

- **全片只有一片星空**（`components/Starfield.tsx`），不随场景切换。每次转场时镜头沿同一方向加速推进、后退或横摇，星星拉成光线；场景的转场动画与它方向一致。
- **常驻界面**（`components/Hud.tsx`）：右上「真理 0N / 08」像里程表一样滚动，底部进度轨道贯穿全片。
- 场景内容不会在转场前提前淡出，而是跟着镜头一起被推远、拉近或甩出画面。
- 开场的「奇点」在终章重现，首尾呼应。

数据与出处（均为公认数值，已在画面中标注近似）：宇宙年龄 13.787 ± 0.020 Gyr（Planck 2018）；H₀ ≈ 67–73 km/s/Mpc；c = 299 792 458 m/s（定义值）；1 AU / c ≈ 499 s；GPS 相对论修正约 38 μs/天；太阳质量损失约 426 万吨/秒；4 ¹H → ⁴He 质量亏损约 0.7%，释放 26.7 MeV；人体元素质量占比 O 65%、C 18.5%、H 9.5%、N 3.2%、Ca 1.5%、P 1%；宇宙组分 68.3 / 26.8 / 4.9%（Planck 2018）。结尾引文是爱因斯坦 1936 年《物理学与实在》中一句话的通行意译。

```console
npx remotion render CosmicTruths out/CosmicTruths.mp4
```

代码在 `src/cosmos/`：`theme.ts`（配色字号）、`timeline.ts`（场景时长与每个转场的镜头方向）、`transitions.tsx`（推进 / 拉远 / 横摇 / 闪光）、`scenes/`（10 个场景）。

## 《光韧》（GuangRen）

2 分钟（1920×1080，30fps，3600 帧）的动态图形短片，9 个场景、8 个转场。

| # | 场景 | 时长 | 画面 | 转场（出） |
|---|---|---|---|---|
| 序 | 微光 | 14s | 黑暗中亮起一点光，化作「光 · 韧」中间的点 | 金色光圈扩张 |
| 01 | 裂隙 | 14s | 厚墙裂开一道缝，光从缝里涌出 | 斜向光带扫过 |
| 02 | 折射 | 15s | 白光穿过棱镜分成光谱：被折弯，不折断 | 竹帘式竖条拉开 |
| 03 | 竹 | 14s | 风中竹子弯腰，风停后阻尼回弹 | 向下滑入地底 |
| 04 | 根 | 14s | 种子向下扎根、向上破土 | 雾化散焦 |
| 05 | 灯塔 | 15s | 暴雨、闪电、海浪中的灯塔光束 | 灯光过曝闪白 |
| 06 | 金缮 | 14s | 瓷碗碎裂又合拢，裂纹以金色愈合 | 沿金色裂缝撕开 |
| 07 | 星火 | 14s | 散落的光点连成网，再汇成火焰 | 冲进火焰中心 |
| 终 | 破晓 | 14s | 太阳升起，「光韧」回归，淡出 | — |

每个转场 1 秒，与前后场景重叠：场景合计 128s − 8 × 1s = 120s。

代码结构（`src/guangren/`）：

- `theme.ts`：唯一的配色、字号、缓动曲线
- `timeline.ts`：所有场景与转场时长，总时长由此计算
- `transitions.tsx`：7 个自定义转场（光圈、光扫、竹帘、雾化、闪白、裂开、穿越），另有 1 个内置 `slide`
- `scenes/`：每个场景一个组件，Studio 的 `GuangRen-Scenes` 文件夹里可单独预览
- `components/`：逐字显影的诗句 `PoemLine`、场景外壳与章节标记

```console
npm run dev                                   # Studio 预览，选择 GuangRen
npx remotion render GuangRen out/GuangRen.mp4 # 渲染成片
```

视频没有配乐，可在 `GuangRen.tsx` 中加入 `<Audio>`（见 Remotion 文档）。

### 字体

字体文件在 `public/fonts/`，按视频实际用到的字符从 Google Fonts 裁剪下载（每个几十 KB），渲染时不需要联网。
**修改文案后如出现新汉字，需要重新运行** `python3 scripts/fetch-fonts.py`，否则新字会回退成系统字体。脚本会按批下载中文字体（每批一个文件）并生成 `src/font-manifest.ts`，记录每个文件覆盖的字符。

## 在 Claude Code 云端容器里渲染

Remotion 无法在云端容器里下载自带的 Chrome（`remotion.media` 不在网络白名单里），渲染时需指定预装的无头浏览器：

```console
npx remotion render GuangRen out/GuangRen.mp4 --browser-executable=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell
```

字体已改为本地加载，因此渲染不再需要让 Chromium 信任出口网关证书。如果以后引入远程资源（在线图片、Google Fonts 等），仍需先把 `/root/.ccr/ca-bundle.crt` 导入 Chromium 的 NSS 库（`~/.pki/nssdb`）。

在本地电脑上不需要这些步骤，直接用上面的命令即可。

## Docs

Get started with Remotion by reading the [fundamentals page](https://www.remotion.dev/docs/the-fundamentals).

## Help

We provide help on our [Discord server](https://discord.gg/6VzzNDwUwV).

## Issues

Found an issue with Remotion? [File an issue here](https://github.com/remotion-dev/remotion/issues/new).

## License

Note that for some entities a company license is needed. [Read the terms here](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md).
