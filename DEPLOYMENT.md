# 部署指南

## 🚀 GitHub Pages 部署

### 1. 创建 GitHub 仓库
```bash
# 在 GitHub 上创建新仓库，然后：
git init
git add .
git commit -m "Initial commit: AI直播切片工具"
git branch -M main
git remote add origin https://github.com/yourusername/ai-livestream-slicer.git
git push -u origin main
```

### 2. 启用 GitHub Pages
1. 进入仓库的 Settings 页面
2. 找到 Pages 选项
3. Source 选择 "GitHub Actions"
4. 代码推送后会自动部署

### 3. 访问地址
部署完成后，访问地址为：
`https://yourusername.github.io/ai-livestream-slicer`

## 🌐 Netlify 部署

### 方法一：GitHub 连接（推荐）
1. 登录 [Netlify](https://netlify.com)
2. 点击 "New site from Git"
3. 选择 GitHub 并授权
4. 选择你的仓库
5. 构建设置：
   - Build command: `npm run build`
   - Publish directory: `dist`
6. 点击 "Deploy site"

### 方法二：拖拽部署
1. 本地运行 `npm run build`
2. 将 `dist` 文件夹拖拽到 Netlify 部署页面

## ⚡ Vercel 部署

### GitHub 连接部署
1. 登录 [Vercel](https://vercel.com)
2. 点击 "New Project"
3. 导入 GitHub 仓库
4. Vercel 会自动识别 Vite 项目并配置
5. 点击 "Deploy"

## 🔧 自定义域名

### Netlify 自定义域名
1. 在 Netlify 项目设置中找到 "Domain management"
2. 点击 "Add custom domain"
3. 输入你的域名
4. 按照提示配置 DNS 记录

### GitHub Pages 自定义域名
1. 在仓库根目录创建 `CNAME` 文件
2. 文件内容为你的域名（如：`livestream.yourdomain.com`）
3. 在域名 DNS 设置中添加 CNAME 记录指向 `yourusername.github.io`

## 📊 部署状态检查

部署完成后，检查以下功能：
- [ ] 页面正常加载
- [ ] 链接验证功能正常
- [ ] 切片设置滑块工作正常
- [ ] 处理流程演示正常
- [ ] 下载功能正常
- [ ] 移动端适配正常

## 🐛 常见问题

### 1. 构建失败
- 检查 Node.js 版本（推荐 18+）
- 确保所有依赖都已安装：`npm ci`
- 检查 TypeScript 类型错误

### 2. 页面空白
- 检查构建输出的 `dist` 目录
- 确保路由配置正确（SPA 重定向）

### 3. 样式丢失
- 确保 Tailwind CSS 正确配置
- 检查 PostCSS 配置文件

## 🔄 持续部署

推送代码到 main 分支后，会自动触发部署：
1. GitHub Actions 自动构建
2. 部署到 GitHub Pages
3. Netlify/Vercel 也会自动同步更新

## 📈 性能优化

部署后可以考虑的优化：
- 启用 CDN 加速
- 配置缓存策略
- 压缩静态资源
- 启用 HTTPS