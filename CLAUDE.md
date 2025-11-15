# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概览

这是一个"你画我猜"游戏，用户在画布上绘画，AI 系统（Google Gemini）会猜测画的是什么。应用使用 Next.js 16、App Router、TypeScript、React 19 和 Tailwind CSS 4 构建。

## 开发命令

```bash
# 安装依赖
npm install

# 运行开发服务器 (localhost:3000)
npm run dev

# 生产环境构建
npm run build

# 启动生产服务器
npm start

# 运行代码检查
npm run lint
```

## 环境配置

需要在 `.env.local` 中配置环境变量：
- `GEMINI_API_KEY`: Google Gemini API 密钥（从 https://makersuite.google.com/app/apikey 获取）

复制 `.env.local.example` 到 `.env.local` 并添加你的 API 密钥后再运行应用。

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
