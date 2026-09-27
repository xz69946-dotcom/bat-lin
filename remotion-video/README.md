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

## 在 Claude Code 云端容器里渲染

云端容器有两个限制：Remotion 无法下载自带的 Chrome（`remotion.media` 不在网络白名单里），Chromium 默认也不信任出口网关的证书。每个新容器先执行一次：

```console
apt-get install -y libnss3-tools
# 把 /root/.ccr/ca-bundle.crt 里 Anthropic 的出口 CA 导入 Chromium 的 NSS 库（~/.pki/nssdb）
```

然后渲染时指定预装的无头浏览器：

```console
npx remotion still MyComp out/frame.png --frame=60 --browser-executable=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell
npx remotion render MyComp --browser-executable=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell
```

在本地电脑上不需要这些步骤，直接用上面的命令即可。

## Docs

Get started with Remotion by reading the [fundamentals page](https://www.remotion.dev/docs/the-fundamentals).

## Help

We provide help on our [Discord server](https://discord.gg/6VzzNDwUwV).

## Issues

Found an issue with Remotion? [File an issue here](https://github.com/remotion-dev/remotion/issues/new).

## License

Note that for some entities a company license is needed. [Read the terms here](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md).
