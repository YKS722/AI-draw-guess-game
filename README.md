# 你画我猜 - AI 绘画猜测游戏

一个在线的"你画我猜"游戏，玩家可以在画布上作画，AI 系统会猜测画的是什么内容。

## 技术栈

- **前端框架**: Next.js 15 (App Router)
- **样式**: Tailwind CSS
- **AI 服务**: Google Gemini API (直接调用，无 SDK)
- **语言**: TypeScript

## 功能特性

- ✏️ 交互式画布，支持自由绘画
- 🎨 可调节画笔大小和颜色
- 🤖 AI 视觉识别，猜测画作内容
- 🔄 实时反馈和加载状态
- 📱 响应式设计

## 快速开始

### 1. 获取 Gemini API 密钥

访问 [Google AI Studio](https://makersuite.google.com/app/apikey) 获取你的 Gemini API 密钥。

### 2. 配置环境变量

创建 `.env.local` 文件并添加你的 API 密钥：

\`\`\`bash
cp .env.local.example .env.local
\`\`\`

编辑 `.env.local` 文件：

\`\`\`
GEMINI_API_KEY=你的_API_密钥
\`\`\`

### 3. 安装依赖

\`\`\`bash
npm install
\`\`\`

### 4. 运行开发服务器

\`\`\`bash
npm run dev
\`\`\`

打开浏览器访问 [http://localhost:3000](http://localhost:3000)

## 使用说明

1. 在画布上绘制你想画的内容
2. 使用工具栏调整画笔大小和颜色
3. 点击"让 AI 猜一猜"按钮
4. 等待 AI 分析并给出猜测结果
5. 点击"清空画布"开始新的绘画

## 项目结构

\`\`\`
draw-and-guess/
├── app/
│   ├── api/
│   │   └── guess/
│   │       └── route.ts          # Gemini API 调用接口
│   ├── page.tsx                  # 主页面
│   └── layout.tsx                # 布局文件
├── components/
│   └── DrawingCanvas.tsx         # 画布组件
├── .env.local.example            # 环境变量示例
└── README.md                     # 项目说明
\`\`\`

## API 说明

### POST /api/guess

调用 Gemini Vision API 识别图片内容。

**请求体:**
\`\`\`json
{
  "imageData": "data:image/png;base64,..."
}
\`\`\`

**响应:**
\`\`\`json
{
  "guess": "AI 的猜测内容"
}
\`\`\`

## 技术细节

- 使用 HTML Canvas API 实现绘画功能
- 通过 `toDataURL()` 将画布转换为 base64 图片
- 直接调用 Gemini API 的 REST 接口，无需 SDK
- Next.js API Routes 作为后端代理，保护 API 密钥

## 许可证

MIT
