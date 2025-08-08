#!/bin/bash

echo "🚀 开始推送AI直播切片工具到GitHub..."

# 检查是否已经是git仓库
if [ ! -d ".git" ]; then
    echo "📁 初始化Git仓库..."
    git init
else
    echo "📁 Git仓库已存在"
fi

# 添加所有文件
echo "📝 添加所有文件到Git..."
git add .

# 检查是否有变更
if git diff --staged --quiet; then
    echo "⚠️  没有检测到文件变更"
else
    echo "✅ 检测到文件变更，准备提交..."
    
    # 提交变更
    git commit -m "Initial commit: AI直播切片工具

    ✨ 功能特色:
    - 🔗 支持抖音、快手直播链接抓取
    - 🎯 智能语音识别生成中文字幕
    - ✂️ 可设置1-10分钟任意时长切片
    - 📦 批量打包输出MP4文件
    - 📱 响应式设计支持各种设备
    
    🛠️ 技术栈:
    - React + TypeScript
    - Tailwind CSS
    - Vite
    - Lucide React Icons"
fi

# 设置主分支
echo "🌿 设置主分支为main..."
git branch -M main

# 提示用户输入GitHub仓库地址
echo ""
echo "📋 请按以下步骤操作："
echo "1. 在GitHub上创建仓库后，复制仓库地址"
echo "2. 仓库地址格式: https://github.com/你的用户名/ai-livestream-slicer.git"
echo ""
read -p "请输入你的GitHub仓库地址: " repo_url

if [ -z "$repo_url" ]; then
    echo "❌ 仓库地址不能为空"
    exit 1
fi

# 添加远程仓库
echo "🔗 添加远程仓库..."
git remote remove origin 2>/dev/null || true
git remote add origin "$repo_url"

# 推送到GitHub
echo "⬆️  推送代码到GitHub..."
if git push -u origin main; then
    echo ""
    echo "🎉 成功推送到GitHub!"
    echo "📱 你的仓库地址: $repo_url"
    echo ""
    echo "🚀 接下来可以部署到:"
    echo "   • Vercel: https://vercel.com"
    echo "   • Netlify: https://netlify.com"
    echo "   • GitHub Pages: 在仓库设置中启用"
    echo ""
else
    echo "❌ 推送失败，请检查:"
    echo "   • GitHub仓库地址是否正确"
    echo "   • 是否有推送权限"
    echo "   • 网络连接是否正常"
fi