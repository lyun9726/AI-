# 🔧 API配置指南

本文档详细说明如何获取和配置AI直播切片工具所需的各种API密钥。

## 📋 必需的API服务

### 1. 🎯 语音识别API (必需)

#### OpenAI Whisper API (推荐)
- **用途**: 将直播音频转换为文字
- **获取地址**: https://platform.openai.com/api-keys
- **费用**: $0.006/分钟
- **配置步骤**:
  1. 注册OpenAI账号
  2. 进入API Keys页面
  3. 创建新的API Key
  4. 复制到 `.env` 文件

```env
VITE_OPENAI_API_KEY=sk-your-api-key-here
VITE_OPENAI_ORG_ID=org-your-org-id-here
```

#### 备选方案
- **Google Speech-to-Text**: https://console.cloud.google.com/apis/credentials
- **Azure Speech Services**: https://portal.azure.com/#create/Microsoft.CognitiveServicesSpeechServices
- **阿里云智能语音交互**: https://ai.aliyun.com/nls/

### 2. 🔗 直播抓取API

#### YouTube Data API v3
- **用途**: 获取YouTube直播信息
- **获取地址**: https://console.cloud.google.com/apis/credentials
- **费用**: 免费额度 10,000 次/天
- **配置步骤**:
  1. 创建Google Cloud项目
  2. 启用YouTube Data API v3
  3. 创建API密钥

```env
VITE_YOUTUBE_API_KEY=your-youtube-api-key
```

#### Twitch API
- **用途**: 获取Twitch直播信息
- **获取地址**: https://dev.twitch.tv/console/apps
- **费用**: 免费
- **配置步骤**:
  1. 注册Twitch开发者账号
  2. 创建新应用
  3. 获取Client ID和Client Secret

```env
VITE_TWITCH_CLIENT_ID=your-twitch-client-id
VITE_TWITCH_CLIENT_SECRET=your-twitch-client-secret
```

#### TikTok API
- **用途**: 获取TikTok直播信息
- **获取地址**: https://developers.tiktok.com/
- **费用**: 需要申请开发者权限
- **注意**: TikTok API访问受限，可能需要第三方服务

```env
VITE_TIKTOK_CLIENT_KEY=your-tiktok-client-key
VITE_TIKTOK_CLIENT_SECRET=your-tiktok-client-secret
```

### 3. ✂️ 视频处理API

#### FFmpeg服务 (推荐)
- **用途**: 视频切片、字幕叠加
- **费用**: 自建服务器成本
- **配置**: 需要搭建FFmpeg微服务

```env
VITE_FFMPEG_SERVICE_URL=http://localhost:3001/api/ffmpeg
```

#### 云服务备选
- **AWS MediaConvert**: https://aws.amazon.com/mediaconvert/
- **阿里云视频点播**: https://www.aliyun.com/product/vod

### 4. 📝 字幕生成API

#### OpenAI GPT API
- **用途**: 优化和润色字幕
- **获取地址**: https://platform.openai.com/api-keys
- **费用**: $0.002/1K tokens

```env
VITE_OPENAI_GPT_MODEL=gpt-3.5-turbo
```

#### 翻译API备选
- **百度翻译**: https://fanyi-api.baidu.com/
- **腾讯云机器翻译**: https://cloud.tencent.com/product/tmt

## 🚀 快速配置步骤

### 1. 复制环境变量文件
```bash
cp env.example .env
```

### 2. 获取必要的API密钥
1. **OpenAI API Key** (必需)
2. **YouTube API Key** (推荐)
3. **Twitch Client ID** (推荐)

### 3. 配置环境变量
编辑 `.env` 文件，填入实际的API密钥：

```env
# 必需配置
VITE_OPENAI_API_KEY=sk-your-openai-api-key
VITE_YOUTUBE_API_KEY=your-youtube-api-key
VITE_TWITCH_CLIENT_ID=your-twitch-client-id

# 后端API服务
VITE_API_BASE_URL=http://localhost:3000/api
```

### 4. 验证配置
重启开发服务器，检查控制台是否有API配置错误。

## 💰 成本估算

### 基础配置 (推荐)
- **OpenAI Whisper**: $0.006/分钟音频
- **YouTube API**: 免费 (10K次/天)
- **Twitch API**: 免费
- **FFmpeg服务**: 自建服务器成本

### 处理30分钟直播的成本
- 语音识别: $0.18
- 其他API: 免费
- **总计**: 约 $0.18/次

## 🔒 安全注意事项

1. **不要提交API密钥到Git**
   - 确保 `.env` 文件在 `.gitignore` 中
   - 使用环境变量而不是硬编码

2. **API密钥轮换**
   - 定期更换API密钥
   - 监控API使用情况

3. **访问控制**
   - 限制API密钥的权限范围
   - 设置使用配额

## 🛠️ 故障排除

### 常见问题

1. **API密钥无效**
   - 检查密钥是否正确复制
   - 确认API服务是否启用

2. **配额超限**
   - 检查API使用量
   - 考虑升级配额或使用备选服务

3. **CORS错误**
   - 确保后端API正确配置CORS
   - 检查API服务地址是否正确

### 调试模式
启用调试模式查看详细错误信息：

```env
VITE_DEBUG_MODE=true
VITE_LOG_LEVEL=debug
```

## 📞 技术支持

如果遇到API配置问题，请检查：
1. API密钥是否正确
2. 网络连接是否正常
3. API服务是否可用
4. 配额是否充足

## 🔄 更新日志

- **v1.0.0**: 初始版本，支持基础API配置
- **v1.1.0**: 增加多平台API支持
- **v1.2.0**: 优化API错误处理和重试机制 