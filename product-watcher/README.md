# 📦 抖音直播商品监控系统（多直播间版）

一个强大的抖音直播商品自动监控系统，支持同时监控多个直播间，自动捕获商品信息并入库。

## ✨ 核心特性

- 🎯 **多直播间并发监控** - 同时监控最多5个直播间
- 📡 **双重捕获机制** - API接口拦截 + DOM元素解析
- 💾 **智能去重存储** - SQLite数据库自动去重
- 🔄 **Webhook实时推送** - 新商品自动回调通知
- 🛡️ **反检测技术** - 绕过平台反爬虫机制
- 📊 **实时统计展示** - 监控状态一目了然
- 🔧 **多种运行模式** - CLI交互、批量配置、单直播间

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 启动服务器（必须）

```bash
# 在一个终端窗口启动
node server.cjs
# 或
npm run dev:recorder
```

服务器将在 `http://localhost:8790` 启动

### 选择监控模式

#### 方式1：交互式CLI模式（推荐）

```bash
npm run watch:multi
```

然后使用以下命令：
```
add https://live.douyin.com/69376413096 李佳琦
add https://live.douyin.com/12345678 薇娅  
add https://live.douyin.com/87654321 东方甄选
list        # 查看所有监控
status      # 查看统计
remove 69376413096  # 移除指定直播间
help        # 查看帮助
```

#### 方式2：批量配置文件模式

```bash
npm run watch:batch
```

首次运行会创建 `product-watcher/batch-config.json`：
```json
{
  "rooms": [
    {
      "url": "https://live.douyin.com/69376413096",
      "name": "李佳琦"
    },
    {
      "url": "https://live.douyin.com/12345678",
      "name": "薇娅"
    }
  ]
}
```

编辑配置文件添加你要监控的直播间，然后重新运行命令。

#### 方式3：单直播间模式

```bash
# 命令行指定URL
npm run watch:douyin -- --url="https://live.douyin.com/69376413096"

# 或使用环境变量
# 编辑 product-watcher/.env
# LIVE_URL=https://live.douyin.com/69376413096
npm run watch:douyin
```

## 📂 数据存储

### 商品数据库
- 位置：`debug/products.sqlite`
- 包含：商品ID、标题、价格、图片、店铺信息等
- 特性：自动去重、索引优化

### Webhook日志
- 位置：`debug/product-callback.log`
- 记录：所有发送到服务器的商品数据

### 监控配置
- `product-watcher/rooms.json` - 当前监控的直播间
- `product-watcher/batch-config.json` - 批量监控配置

## 🔧 高级配置

### 环境变量（product-watcher/.env）

```ini
# Webhook回调地址
WEBHOOK=http://localhost:8790/api/product/new

# DOM轮询间隔（秒）
POLL_DOM_SEC=15

# Chrome用户数据目录（可选）
USER_DATA_DIR=C:\Users\你的用户名\AppData\Local\Google\Chrome\User Data

# 调试模式
DEBUG=false
```

### API接口

服务器提供以下接口：

- `POST /api/product/new` - 接收商品数据回调
  ```json
  {
    "product": {
      "product_id": "123456",
      "title": "商品名称",
      "price": 99.99,
      "image_url": "https://..."
    },
    "live_room": {
      "room_id": "69376413096",
      "room_name": "李佳琦"
    }
  }
  ```

## 📊 监控指标

运行时会显示以下统计信息：

- **接口捕获**：通过API接口拦截到的商品数
- **DOM捕获**：通过页面元素解析到的商品数
- **保存数量**：成功保存到数据库的新商品数
- **Webhook发送**：成功推送到服务器的商品数
- **数据库总计**：数据库中的商品总数

## 🛠️ 故障排除

### Chrome浏览器未找到
- 确保已安装Chrome浏览器
- 或在 `.env` 中设置 `USER_DATA_DIR`

### 无法访问直播间
- 检查网络连接
- 确认直播间URL正确
- 某些直播间可能需要登录

### 商品捕获失败
- 检查直播间是否正在展示商品
- DOM选择器可能需要更新
- 查看控制台错误信息

## 📝 注意事项

1. **资源占用**：每个直播间会启动一个Chrome实例，注意内存使用
2. **并发限制**：默认最多同时监控5个直播间
3. **网络要求**：需要稳定的网络连接
4. **合规使用**：请遵守平台服务条款

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📄 许可

MIT License