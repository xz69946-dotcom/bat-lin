#!/usr/bin/env bash
# 把渲染出的 MP4 转成手机通用格式，输出到 out/phone/。
# 用法（在 remotion-video 目录下）：bash scripts/to-phone.sh out/CosmicTruths.mp4 [out/GuangRen.mp4 ...]
#
# 为什么需要：Remotion 用 JPEG 帧渲染时输出的是 yuvj420p（全范围色彩）且没有音轨，
# 部分手机相册、微信会打不开或无法保存。这里统一转成：
#   H.264 High@4.0、yuv420p（标准范围）、BT.709、带静音 AAC 音轨、moov 前置（边下边播）。
set -euo pipefail
mkdir -p out/phone
for src in "$@"; do
  name=$(basename "$src")
  npx remotion ffmpeg -v error -y -i "$src" \
    -f lavfi -i anullsrc=r=44100:cl=stereo -map 0:v:0 -map 1:a:0 -shortest \
    -vf "scale=in_range=pc:out_range=tv,format=yuv420p" \
    -c:v libx264 -profile:v high -level:v 4.0 -preset slow -crf 20 -maxrate 3M -bufsize 6M -r 30 -g 60 \
    -color_range tv -colorspace bt709 -color_primaries bt709 -color_trc bt709 \
    -c:a aac -b:a 64k -movflags +faststart "out/phone/$name"
  echo "saved out/phone/$name"
done
