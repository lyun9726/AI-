# 📋 手动推送步骤（如果脚本不可用）

## 方法一：使用命令行

### 1. 初始化Git仓库
```bash
git init
```

### 2. 添加所有文件
```bash
git add .
```

### 3. 提交代码
```bash
git commit -m "Initial commit: AI直播切片工具"
```

### 4. 设置主分支
```bash
git branch -M main
```

### 5. 添加远程仓库
```bash
# 替换为你的GitHub仓库地址
git remote add origin https://github.com/你的用户名/ai-livestream-slicer.git
```

### 6. 推送代码
```bash
git push -u origin main
```

## 方法二：使用GitHub Desktop

### 1. 下载GitHub Desktop
- 访问 https://desktop.github.com/
- 下载并安装GitHub Desktop

### 2. 登录GitHub账号
- 打开GitHub Desktop
- 登录你的GitHub账号

### 3. 添加本地仓库
- 点击 "Add an Existing Repository from your Hard Drive"
- 选择项目文件夹

### 4. 发布到GitHub
- 点击 "Publish repository"
- 填写仓库名称：ai-livestream-slicer
- 点击 "Publish Repository"

## 方法三：使用VS Code

### 1. 安装Git扩展
- 确保VS Code已安装Git扩展

### 2. 初始化仓库
- 在VS Code中打开项目文件夹
- 点击左侧的源代码管理图标
- 点击 "Initialize Repository"

### 3. 提交代码
- 在更改列表中点击 "+"添加所有文件
- 输入提交信息："Initial commit: AI直播切片工具"
- 点击 "✓" 提交

### 4. 推送到GitHub
- 点击 "..." 菜单
- 选择 "Remote" > "Add Remote"
- 输入GitHub仓库地址
- 点击 "Push"

## 🔧 常见问题解决

### 问题1：git命令不存在
**解决方案**：
- Windows: 下载安装 Git for Windows
- Mac: 安装 Xcode Command Line Tools
- Linux: `sudo apt install git` 或 `sudo yum install git`

### 问题2：推送被拒绝
**解决方案**：
```bash
git pull origin main --allow-unrelated-histories
git push -u origin main
```

### 问题3：认证失败
**解决方案**：
- 使用Personal Access Token代替密码
- 在GitHub设置中生成Token
- 推送时使用Token作为密码

### 问题4：文件太大
**解决方案**：
- 检查是否包含了node_modules（应该被.gitignore忽略）
- 删除不必要的大文件
- 使用Git LFS处理大文件

## 📞 需要帮助？

如果遇到问题，可以：
1. 检查GitHub仓库是否创建成功
2. 确认网络连接正常
3. 验证Git配置是否正确
4. 查看错误信息并搜索解决方案