# PWA Icons

このディレクトリには、PWAアプリ用のアイコンファイルが含まれます。

## 必要なアイコンサイズ

- `icon-192.png` (192x192)
- `icon-512.png` (512x512)

## アイコン生成方法

`icon.svg` を基に、以下のツールでPNGアイコンを生成してください：

### オンラインツール
- https://realfavicongenerator.net/
- https://www.favicon-generator.org/

### コマンドライン（ImageMagickを使用）
```bash
# 192x192
convert icon.svg -resize 192x192 icon-192.png

# 512x512
convert icon.svg -resize 512x512 icon-512.png
```

### Node.js（sharp を使用）
```bash
npm install sharp-cli -g
sharp -i icon.svg -o icon-192.png resize 192 192
sharp -i icon.svg -o icon-512.png resize 512 512
```

## 現在の状態

現在はSVGファイルのみ含まれています。ビルド前にPNGファイルを生成してください。
生成しない場合、PWAとしてインストールできない可能性があります。
