# 🎬 AI直播切片工具

一个专业的AI驱动直播切片工具，专门支持抖音快手直播抓取、自动语音识别、字幕生成和视频切片。

## ✨ 功能特色

- 🔗 **多平台直播抓取** - 支持抖音、快手、YouTube、TikTok、Twitch直播链接
- 🎯 **智能语音识别** - 自动识别语音内容并生成中文字幕
- ✂️ **精准视频切片** - 可设置1-10分钟任意时长切片
- 📝 **自动字幕叠加** - 每个切片自动添加内嵌字幕
- 📦 **批量打包输出** - 一键下载所有MP4切片文件
- 📱 **响应式设计** - 完美支持手机、平板、电脑访问

## 🚀 在线体验

[点击访问在线版本](https://your-deployed-url.netlify.app)

## 📱 支持平台

### 抖音直播
- `https://live.douyin.com/123456789`
- `https://v.douyin.com/ABC123/`
- `https://www.douyin.com/user/xxx/live`

### 快手直播
- `https://live.kuaishou.com/u/username`
- `https://v.kuaishou.com/ABC123`
- `https://www.kuaishou.com/profile/xxx/live`

### YouTube直播
- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://www.youtube.com/live/STREAM_ID`
- `https://www.youtube.com/@channelname/live`
- `https://youtu.be/VIDEO_ID`

### TikTok直播
- `https://www.tiktok.com/@username/live`
- `https://www.tiktok.com/live/STREAM_ID`
- `https://vm.tiktok.com/SHORT_CODE`

### Twitch直播
- `https://www.twitch.tv/streamername`
- `https://www.twitch.tv/videos/VIDEO_ID`
- `https://clips.twitch.tv/CLIP_ID`

## 🛠️ 使用方法

1. **输入直播链接** - 粘贴抖音或快手的直播链接
2. **设置切片时长** - 选择每段视频的时长（1-10分钟）
3. **开始处理** - 点击"开始抓取并处理"按钮
4. **等待完成** - 系统自动完成抓取、识别、切片、字幕等步骤
5. **下载结果** - 获得包含所有MP4切片的ZIP文件

## 📋 处理流程

```
直播链接输入 → 视频抓取 → 语音识别 → 字幕生成 → 视频切片 → 字幕叠加 → 打包输出
```

每个步骤都有实时进度显示，让你清楚了解处理状态。

## 📁 输出文件

下载的ZIP包包含：
- 多个MP4视频文件（根据设置的时长切片）
- 每个MP4都内嵌中文字幕
- 文件命名格式：`直播切片_第N段_X分钟.mp4`

## 🔧 技术栈

- **前端框架**: React + TypeScript
- **样式方案**: Tailwind CSS
- **图标库**: Lucide React
- **构建工具**: Vite
- **部署平台**: Netlify

## 📦 本地开发

```bash
# 克隆项目
git clone https://github.com/yourusername/ai-livestream-slicer.git

# 安装依赖
npm install

# 配置API密钥
cp env.example .env
# 编辑 .env 文件，填入必要的API密钥

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 🔧 API配置

本项目需要配置以下API服务才能正常运行：

### 必需API
- **OpenAI Whisper API**: 语音识别 (约$0.006/分钟)
- **YouTube Data API v3**: YouTube直播抓取 (免费)
- **Twitch API**: Twitch直播抓取 (免费)

### 可选API
- **TikTok API**: TikTok直播抓取 (需要申请)
- **FFmpeg服务**: 视频处理 (自建)
- **翻译API**: 字幕翻译 (可选)

详细配置说明请查看 [API_SETUP.md](./API_SETUP.md)

## 🌟 特色亮点

- **零配置使用** - 无需安装任何软件，浏览器直接使用
- **智能链接识别** - 自动验证和识别直播链接格式
- **实时进度反馈** - 每个处理步骤都有详细进度显示
- **移动端优化** - 完美适配手机和平板设备
- **现代化界面** - 采用最新设计趋势，用户体验优秀

## ⚠️ 使用说明

- 请确保输入的是公开可访问的直播链接
- 处理时间取决于直播时长和网络状况
- 建议使用完整链接而非短链接
- 支持正在进行的直播和历史回放

## 🤝 贡献指南

欢迎提交Issue和Pull Request来改进这个项目！

## 📄 开源协议

MIT License

## 📞 联系方式

如有问题或建议，请通过GitHub Issues联系。

---

⭐ 如果这个项目对你有帮助，请给个Star支持一下！