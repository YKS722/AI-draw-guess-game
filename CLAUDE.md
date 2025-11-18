# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概览

这是一个"你画我猜"游戏，用户在画布上绘画，AI 系统（Google Gemini）会猜测画的是什么。应用使用 Next.js 16、App Router、TypeScript、React 19 和 Tailwind CSS 4 构建。

**技术栈：**
- Next.js 16.0.1（App Router 架构）
- React 19.2.0 和 React DOM 19.2.0
- TypeScript 5
- Tailwind CSS 4（使用 `@tailwindcss/postcss` 插件）
- ESLint 9（使用 Next.js 配置）
- Google Gemini 2.5 Flash API（通过直接 REST 调用，无 SDK）

## 开发命令

```bash
# 安装依赖
npm install

# 运行开发服务器 (localhost:3000)
npm run dev

# 生产环境构建
npm run build

# 启动生产服务器（运行前需要先 build）
npm start

# 运行代码检查（使用 ESLint 9 with Next.js config）
npm run lint
```

注意：`npm run lint` 仅执行 `eslint` 命令，不带任何参数。ESLint 配置在 `eslint.config.mjs` 中使用 Next.js 的推荐规则（core-web-vitals 和 TypeScript）。

## 环境配置

需要在 `.env.local` 中配置环境变量：
- `GEMINI_API_KEY`: Google Gemini API 密钥（从 https://makersuite.google.com/app/apikey 获取）

复制 `.env.local.example` 到 `.env.local` 并添加你的 API 密钥后再运行应用。

## 项目文件结构

```
draw-and-guess/
├── app/
│   ├── api/
│   │   └── guess/
│   │       └── route.ts          # Gemini API 调用接口（POST /api/guess）
│   ├── globals.css               # 全局样式和 Tailwind 配置
│   ├── layout.tsx                # 根布局（字体、元数据）
│   └── page.tsx                  # 主页面（游戏界面）
├── components/
│   └── DrawingCanvas.tsx         # 可重用画布组件
├── eslint.config.mjs             # ESLint 9 配置（Next.js 规则）
├── next.config.ts                # Next.js 配置
├── package.json                  # 项目依赖和脚本
├── postcss.config.mjs            # PostCSS 配置（Tailwind 4）
├── tsconfig.json                 # TypeScript 配置
├── .env.local.example            # 环境变量模板
└── CLAUDE.md                     # 本文件
```

## 架构设计

### API 集成模式
应用使用**无服务器代理模式**来保护 API 密钥：
- 客户端发送 base64 图片数据到 `/api/guess`（Next.js API Route）
- 服务端路由（app/api/guess/route.ts:26-57）直接调用 Gemini REST API（不使用 SDK）
- Gemini API 密钥仅在服务端通过 `process.env.GEMINI_API_KEY` 访问

### 组件结构
- **app/page.tsx**: 主页面（客户端组件），管理 AI 响应、加载状态和错误处理
- **components/DrawingCanvas.tsx**: 画布组件（客户端组件），处理：
  - 使用 HTML Canvas API 的鼠标事件绘图
  - 绘图状态（画笔大小、颜色）
  - 通过 `toDataURL()` 将画布转换为 base64
  - 清空画布和触发 AI 猜测的用户控件

画布始终使用白色背景（components/DrawingCanvas.tsx:23-24, 74-75）然后发送给 AI。

### 数据流
1. 用户在画布上绘画（800x600 白色画布）
2. "让 AI 猜一猜"按钮触发 `handleGuess()`（components/DrawingCanvas.tsx:78-85）
3. 画布通过 `canvas.toDataURL('image/png')` 转换为 PNG base64
4. 图片数据发送到 `/api/guess` 端点（app/page.tsx:11-37）
5. API 路由去除 base64 前缀（app/api/guess/route.ts:23）并使用中文提示词调用 Gemini Vision API
6. 从 `data.candidates?.[0]?.content?.parts?.[0]?.text` 提取响应（app/api/guess/route.ts:71-72）
7. 结果在主页面显示相应状态（加载中、错误或成功）

### TypeScript 配置
- 使用路径别名 `@/*` 指向根目录
- 目标版本：ES2017
- 模块解析：bundler
- 启用严格模式
- JSX: react-jsx（React 19）

## 重要实现细节

### Gemini API 调用结构
通过 REST 直接调用 Gemini API（不使用 SDK）：
- 端点：`https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent`
- 模型：`gemini-2.5-flash`
- 请求包含中文文本提示（要求简洁的 <10 字符回复）和内联 base64 图片数据
- 生成配置：temperature=0.7, topK=40, topP=0.95, maxOutputTokens=1024

### 画布实现
- 固定尺寸：800x600 像素
- AI 处理需要白色背景（在组件挂载和清空时设置）
- 仅使用鼠标事件（目前不支持触摸）
- 绘图使用 `lineCap: 'round'` 实现平滑笔触
- 画笔大小范围：1-20px（默认：5px）
- 支持颜色选择器选择笔触颜色

### 样式系统
- 使用 Tailwind CSS 4（新版本，配置在 `postcss.config.mjs`）
- 全局样式在 `app/globals.css` 中定义：
  - 使用 CSS 变量定义主题颜色（`--background`, `--foreground`）
  - 支持深色模式（通过 `prefers-color-scheme: dark` 媒体查询）
  - 使用 Geist Sans 和 Geist Mono 字体（通过 CSS 变量注入）
- 主题配置使用 Tailwind 4 的 `@theme inline` 指令

## 开发注意事项

### 添加新功能时
- 如果需要调用外部 API，应在 `app/api/` 下创建新的 API 路由，避免在客户端直接暴露密钥
- 所有新组件应放在 `components/` 目录，使用 `'use client'` 指令标记客户端组件
- 使用 TypeScript 严格模式，确保所有类型正确定义

### Canvas 相关
- 修改画布功能时，注意保持白色背景，否则会影响 AI 识别准确性
- 如需支持触摸设备，需要同时添加 `onTouchStart`、`onTouchMove`、`onTouchEnd` 事件处理器
- 画布导出始终使用 PNG 格式（`toDataURL('image/png')`）

### API 调用
- Gemini API 调用限制和计费基于 API 密钥配置
- 提示词在 `app/api/guess/route.ts:38` 中，可根据需要调整以获得更好的识别效果
- 当前配置要求简短回复（<10 字符），修改提示词时注意这一点
