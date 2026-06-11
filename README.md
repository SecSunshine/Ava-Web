# Ava Web - 智能家居中控屏 PWA

基于 Home Assistant 的跨平台智能家居中控屏网页版，支持任何带有浏览器的设备。

## 功能特性

- **全屏 Kiosk 模式** - 一键进入全屏，屏幕常亮
- **Home Assistant 集成** - 实时 WebSocket 连接，设备状态同步
- **设备控制** - 灯光（亮度/色温）、开关、温控、媒体播放器、摄像头
- **天气时钟** - 实时天气 + 大字号时钟（Open-Meteo API）
- **PWA 安装** - 可安装到桌面/主屏，支持离线缓存
- **响应式设计** - 适配平板、手机、PC

## 快速开始

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
```

## 配置

在设置面板中配置：
- Home Assistant URL（如 `https://homeassistant.local:8123`）
- Long-Lived Access Token
- 选择要显示的实体类型

## 技术栈

- Vite + React 19 + TypeScript
- MUI v7 + Tailwind CSS v4
- Zustand 状态管理
- WebSocket (HA API)
- PWA (Service Worker)
