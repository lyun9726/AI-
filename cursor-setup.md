# 🎯 Cursor IDE 设置指南

## 📥 项目导入步骤

### 1. 下载项目
- 从Bolt导出项目文件
- 解压到本地目录

### 2. 在Cursor中打开
```bash
# 方法1: 命令行打开
cursor /path/to/ai-livestream-slicer

# 方法2: 直接拖拽文件夹到Cursor
```

### 3. 安装依赖
```bash
npm install
```

### 4. 启动开发服务器
```bash
npm run dev
```

## 🔧 Cursor推荐配置

### 扩展插件
```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense"
  ]
}
```

### 工作区设置
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.preferences.importModuleSpecifier": "relative",
  "tailwindCSS.includeLanguages": {
    "typescript": "javascript",
    "typescriptreact": "javascript"
  }
}
```

## 🚀 优化建议

### 1. 代码结构优化
- 组件拆分和模块化
- 自定义Hook提取
- 工具函数分离
- 类型定义统一

### 2. 性能优化
- React.memo使用
- useMemo和useCallback优化
- 虚拟滚动实现
- 图片懒加载

### 3. 功能扩展
- 国际化支持
- 主题切换
- 离线功能
- PWA支持

### 4. 测试覆盖
- Jest + React Testing Library
- Cypress E2E测试
- 性能测试
- 可访问性测试

## 📋 开发检查清单

- [ ] TypeScript类型检查通过
- [ ] ESLint规则检查通过
- [ ] 所有组件有适当的props类型
- [ ] 响应式设计在各设备正常
- [ ] 性能指标达标
- [ ] 无障碍访问支持
- [ ] 错误处理完善
- [ ] 加载状态友好

## 🔍 调试技巧

### React DevTools
- 组件状态检查
- 性能分析
- Hook调试

### Chrome DevTools
- 网络请求监控
- 性能分析
- 内存使用检查

### Cursor AI助手
- 代码重构建议
- Bug修复协助
- 性能优化提示