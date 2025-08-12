# 直播源管理工具 - 运行指南

## 快速开始

### 1. 安装依赖

```bash
npm install express cors multer fluent-ffmpeg archiver
```

### 2. 启动服务

```bash
node server.cjs
```

看到以下输出表示启动成功：
```
🚀 直播切片服务已启动: http://localhost:8790
📁 静态资源目录: E:\download\project-bolt-sb1-bnblijo6\project\public
📝 日志目录: E:\download\project-bolt-sb1-bnblijo6\project\debug
🎬 默认录制目录: E:\download\project-bolt-sb1-bnblijo6\project\recordings\douyin
```

### 3. 访问界面

打开浏览器访问: http://localhost:8790

会自动跳转到直播源管理页面。

## 功能使用

### 批量录制
1. 点击"开始批量录制"按钮
2. 系统会自动录制所有"已启用"的源
3. 录制文件保存在 `recordings/douyin` 目录

### 停止录制
1. 点击"停止所有录制"按钮
2. 系统会停止所有正在进行的录制任务

### 查看状态
- 页面会自动每5秒刷新一次状态
- 也可以点击"刷新状态"手动刷新
- 录制中的源会显示红色"录制中"标签

## 配置说明

### 修改输出目录

编辑 `public/live-manager.js` 文件第5行：

```javascript
const CONFIG = {
    // 默认输出目录，可以修改为绝对路径如 'E:\\Saves\\Douyin'
    defaultOutDir: 'recordings/douyin',  // <- 修改这里
    defaultDuration: 3600,
    apiBase: ''
};
```

示例：
- 相对路径: `'recordings/douyin'`
- 绝对路径: `'E:\\Saves\\Douyin'` 或 `'E:/Saves/Douyin'`

### 修改默认录制时长

同样在 `CONFIG` 对象中修改 `defaultDuration`（单位：秒）：
```javascript
defaultDuration: 3600,  // 1小时
```

## API 测试

### 使用 cURL 命令

```bash
# 1. 测试连接
curl http://localhost:8790/api/ping

# 2. 开始录制
curl -X POST http://localhost:8790/api/record/start \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"测试源1\",\"url\":\"https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8\",\"durationSec\":60,\"outDir\":\"recordings/douyin\"}"

# 3. 查询状态
curl http://localhost:8790/api/record/status

# 4. 停止录制
curl -X POST http://localhost:8790/api/record/stop \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"测试源1\"}"
```

### 使用 PowerShell (Windows)

```powershell
# 1. 测试连接
Invoke-RestMethod -Uri "http://localhost:8790/api/ping"

# 2. 开始录制
$body = @{
    name = "测试源1"
    url = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
    durationSec = 60
    outDir = "recordings/douyin"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8790/api/record/start" -Method Post -Body $body -ContentType "application/json"

# 3. 查询状态
Invoke-RestMethod -Uri "http://localhost:8790/api/record/status"

# 4. 停止录制
Invoke-RestMethod -Uri "http://localhost:8790/api/record/stop" -Method Post -Body '{"name":"测试源1"}' -ContentType "application/json"
```

## 日志查看

录制日志保存在 `debug` 目录下，文件名格式：
```
record-<任务名>-<时间戳>.log
```

示例：
```
debug/record-测试源1-2024-01-10T10-30-00-000Z.log
```

## 目录结构

```
project/
├── server.cjs              # 后端服务器
├── public/
│   ├── live-manager.html   # 管理界面
│   └── live-manager.js     # 前端逻辑
├── recorder/
│   └── resolve-and-record.mjs  # 录制模块
├── recordings/             # 默认录制输出目录
│   └── douyin/
├── debug/                  # 日志目录
└── scripts/
    └── test.http          # API 测试脚本
```

## 常见问题

### Q: 如何修改端口？
A: 设置环境变量 `PORT`：
```bash
PORT=8888 node server.cjs
```

### Q: 录制失败怎么办？
A: 检查以下几点：
1. FFmpeg 是否已安装
2. 直播源 URL 是否有效
3. 输出目录是否有写入权限
4. 查看 `debug` 目录下的日志文件

### Q: 如何添加新的直播源？
A: 点击"添加源"按钮，输入名称和URL即可。或直接编辑 `live-manager.html` 中的卡片。

## 注意事项

1. 确保 FFmpeg 已安装并在 PATH 中
2. 抖音等平台的直播链接可能需要定期更新
3. 长时间录制会占用大量磁盘空间
4. 建议定期清理录制文件和日志