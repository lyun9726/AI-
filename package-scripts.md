# 📦 Package.json 脚本说明

## 🚀 可用脚本

### 开发相关
```bash
# 启动开发服务器 (热重载)
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

### 代码质量
```bash
# ESLint代码检查
npm run lint

# 自动修复ESLint问题
npm run lint:fix

# TypeScript类型检查
npm run type-check
```

### 测试相关 (可添加)
```bash
# 运行单元测试
npm run test

# 测试覆盖率报告
npm run test:coverage

# E2E测试
npm run test:e2e
```

### 部署相关
```bash
# 构建并部署到Vercel
npm run deploy:vercel

# 构建并部署到Netlify
npm run deploy:netlify
```

## 🔧 自定义脚本建议

可以在package.json中添加以下脚本：

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "type-check": "tsc --noEmit",
    "clean": "rm -rf dist node_modules/.vite",
    "analyze": "npm run build && npx vite-bundle-analyzer dist",
    "deploy:vercel": "npm run build && vercel --prod",
    "deploy:netlify": "npm run build && netlify deploy --prod --dir=dist"
  }
}
```

## 📊 性能分析

### Bundle分析
```bash
# 安装分析工具
npm install --save-dev vite-bundle-analyzer

# 分析构建结果
npm run analyze
```

### 依赖检查
```bash
# 检查过时依赖
npm outdated

# 更新依赖
npm update

# 安全审计
npm audit
```

## 🛠️ 开发工具集成

### Prettier配置
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
```

### ESLint配置
已包含在项目中，支持：
- React Hooks规则
- TypeScript检查
- 代码风格统一