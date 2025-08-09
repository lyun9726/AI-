# Vercel 自动部署指南

## 🚀 快速部署到 Vercel

### 方法一：通过 Vercel Dashboard（推荐）

1. **登录 Vercel**
   - 访问 [vercel.com](https://vercel.com)
   - 使用 GitHub 账户登录

2. **导入项目**
   - 点击 "New Project"
   - 选择 "Import Git Repository"
   - 搜索并选择 `lyun9726/AI-`
   - 点击 "Import"

3. **配置项目**
   - Project Name: `ai-livestream-slicer`
   - Framework Preset: `Vite` (自动检测)
   - Root Directory: `./` (默认)
   - Build Command: `npm run build` (自动填充)
   - Output Directory: `dist` (自动填充)

4. **配置环境变量**
   在部署前，点击 "Environment Variables" 添加：
   ```
   VITE_OPENAI_API_KEY = sk-rHl2yyFTlfMcBvd8KegzN1NspogSE5RB4FWnFoSlWIxCsziO
   VITE_YOUTUBE_API_KEY = AIzaSyCTG867LVavNFIzM3j8fXJ57sdRR7VDnTY
   VITE_TWITCH_CLIENT_ID = e1namazht1go6vmjxk8m7wvx02dgcl
   ```

5. **部署**
   - 点击 "Deploy"
   - 等待 2-3 分钟完成构建和部署

### 方法二：通过 Vercel CLI

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录 Vercel
vercel login

# 部署项目
vercel

# 设置环境变量
vercel env add VITE_OPENAI_API_KEY
vercel env add VITE_YOUTUBE_API_KEY
vercel env add VITE_TWITCH_CLIENT_ID

# 重新部署
vercel --prod
```

## ⚡ 自动部署设置

部署完成后，每次推送代码到 GitHub 的 `main` 分支都会自动触发 Vercel 部署：

1. **提交代码**
   ```bash
   git add .
   git commit -m "更新功能"
   git push
   ```

2. **自动部署**
   - Vercel 会自动检测到 GitHub 的推送
   - 自动构建和部署新版本
   - 部署完成后会发送通知

## 🌐 访问地址

部署成功后，你会得到以下地址：
- **生产环境**: `https://ai-livestream-slicer.vercel.app`
- **预览环境**: 每个分支和 PR 都会有独立的预览地址

## 🔧 高级配置

### 自定义域名
1. 在 Vercel 项目设置中找到 "Domains"
2. 添加你的自定义域名
3. 按照提示配置 DNS 记录

### 环境变量管理
- **开发环境**: 在本地使用 `.env` 文件
- **生产环境**: 在 Vercel Dashboard 中配置
- **预览环境**: 可以设置不同的环境变量

### 构建优化
Vercel 会自动：
- 启用 CDN 加速
- 自动压缩资源
- 启用 HTTP/2
- 配置缓存策略

## 📊 监控和分析

Vercel 提供内置的：
- 部署历史和回滚
- 实时日志查看
- 性能分析
- 错误监控

## 🐛 故障排除

### 构建失败
1. 检查 Vercel 构建日志
2. 确保环境变量正确设置
3. 验证 Node.js 版本兼容性

### 环境变量不生效
1. 确保变量名以 `VITE_` 开头
2. 重新部署项目
3. 检查 vercel.json 配置

### 页面空白
1. 检查构建输出
2. 查看浏览器控制台错误
3. 验证路由配置