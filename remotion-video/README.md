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
**修改文案后如出现新汉字，需要重新运行** `python3 scripts/fetch-fonts.py`，否则新字会回退成系统字体。

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
