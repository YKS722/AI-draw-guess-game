# Vercel 部署指南

## 问题诊断和解决方案

### 主要修复

1. **修正了 Gemini API 模型名称**
   - 旧的：`gemini-2.5-flash`（不存在）
   - 新的：`gemini-1.5-flash`（正确）

2. **修正了 API 端点版本**
   - 旧的：`/v1/models/...`
   - 新的：`/v1beta/models/...`

3. **添加了详细的错误日志**
   - 环境变量检查
   - API 调用详情
   - 完整的错误响应

## Vercel 部署步骤

### 1. 在 Vercel 上配置环境变量

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择你的项目
3. 进入 **Settings** → **Environment Variables**
4. 添加以下环境变量：

```
Name: GEMINI_API_KEY
Value: 你的_Gemini_API_密钥
Environment: Production, Preview, Development
```

**重要提示：**
- 确保 API 密钥没有多余的空格
- 确保选择了所有环境（Production, Preview, Development）
- 添加后需要重新部署才能生效

### 2. 获取正确的 Gemini API 密钥

1. 访问 [Google AI Studio](https://makersuite.google.com/app/apikey)
2. 如果没有密钥，点击 **Create API Key**
3. 选择一个 Google Cloud 项目（或创建新项目）
4. 复制生成的 API 密钥

**验证 API 密钥：**
在终端运行以下命令测试你的 API 密钥是否有效：

```bash
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=YOUR_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{
    "contents": [{
      "parts":[{"text":"Hello"}]
    }]
  }'
```

如果返回成功响应，说明 API 密钥有效。

### 3. 重新部署

配置环境变量后，有两种方式触发重新部署：

**方式 A：通过 Git 推送**
```bash
git add .
git commit -m "修复 Gemini API 调用问题"
git push
```

**方式 B：手动重新部署**
1. 在 Vercel Dashboard 中选择你的项目
2. 进入 **Deployments** 标签
3. 找到最新的部署，点击右侧的三个点
4. 选择 **Redeploy**

### 4. 查看部署日志

部署后，如果仍然有问题：

1. 在 Vercel Dashboard 中，进入 **Deployments**
2. 点击最新的部署
3. 查看 **Runtime Logs**
4. 尝试在应用中使用绘画功能
5. 查看实时日志输出，应该能看到：
   - 环境变量检查日志
   - Gemini API 调用详情
   - 具体的错误信息

### 5. 常见问题和解决方案

#### 问题 1: "Gemini API 密钥未配置"

**原因：** Vercel 环境变量未正确设置

**解决方案：**
- 检查 Vercel Dashboard → Settings → Environment Variables
- 确保变量名是 `GEMINI_API_KEY`（大小写敏感）
- 确保选择了正确的环境
- 重新部署项目

#### 问题 2: "Gemini API 调用失败" (404 错误)

**原因：** 使用了错误的模型名称或 API 版本

**解决方案：**
- 已在代码中修复为 `gemini-1.5-flash` 和 `/v1beta/` 端点
- 确保已推送最新代码到 Git

#### 问题 3: "Gemini API 调用失败" (403 或 401 错误)

**原因：** API 密钥无效或没有权限

**解决方案：**
- 验证 API 密钥是否正确
- 确保 API 密钥已启用 Gemini API
- 在 [Google Cloud Console](https://console.cloud.google.com/) 中检查：
  1. 进入 **APIs & Services** → **Library**
  2. 搜索 "Generative Language API"
  3. 确保已启用

#### 问题 4: "Gemini API 调用失败" (429 错误)

**原因：** API 调用配额用尽

**解决方案：**
- 检查 [Google Cloud Console](https://console.cloud.google.com/) 中的配额使用情况
- 等待配额重置（通常是每分钟）
- 考虑升级到付费计划以获得更高配额

#### 问题 5: 图片太大导致请求失败

**原因：** Base64 编码的图片可能超过请求大小限制

**解决方案：**
- Gemini API 对图片大小有限制
- 当前画布是 800x600，应该在限制内
- 如果仍有问题，可以在发送前压缩图片

### 6. 本地测试

在部署到 Vercel 之前，先在本地测试：

```bash
# 1. 创建 .env.local 文件
cp .env.local.example .env.local

# 2. 在 .env.local 中添加你的 API 密钥
# GEMINI_API_KEY=你的密钥

# 3. 运行开发服务器
npm run dev

# 4. 打开浏览器访问 http://localhost:3000
# 5. 尝试绘画并点击"让 AI 猜一猜"
# 6. 检查终端日志，应该能看到详细的调用信息
```

### 7. 验证修复

代码已更新，包含以下改进：

✅ 使用正确的模型名称：`gemini-1.5-flash`
✅ 使用正确的 API 端点：`/v1beta/models/...`
✅ 添加详细的日志记录
✅ 改进的错误处理和错误信息
✅ 环境变量验证

## 下一步

1. **推送代码更新**
   ```bash
   cd /Users/wosabi/AiGame/draw-and-guess
   git add .
   git commit -m "修复 Gemini API 调用：更新模型名称和端点，添加详细日志"
   git push
   ```

2. **在 Vercel 中检查环境变量**

3. **查看部署日志**以确认问题已解决

4. **测试应用**

## 调试技巧

如果问题仍然存在，在浏览器开发者工具中：

1. 打开 **Network** 标签
2. 绘制一些内容并点击 "让 AI 猜一猜"
3. 找到 `/api/guess` 请求
4. 查看：
   - 请求状态码
   - 响应内容（应该包含详细的错误信息）
5. 将错误信息发送给我，我可以进一步帮助诊断

## 联系支持

如果以上步骤都无法解决问题：

1. 检查 Vercel 部署日志中的详细错误信息
2. 检查浏览器控制台和网络标签中的错误
3. 记录所有错误信息和日志输出
4. 联系我获取进一步帮助
