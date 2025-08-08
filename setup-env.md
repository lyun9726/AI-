# 🔧 环境变量配置步骤

## 第一步：创建 .env 文件

在项目根目录下创建 `.env` 文件，内容如下：

```env
# AI直播切片工具 - 环境变量配置
# 用户提供的API密钥

# ===== 直播抓取API =====
# YouTube Data API v3
VITE_YOUTUBE_API_KEY=AIzaSyCTG867LVavNFIzM3j8fXJ57sdRR7VDnTY
VITE_YOUTUBE_CLIENT_ID=your_youtube_client_id_here
VITE_YOUTUBE_CLIENT_SECRET=your_youtube_client_secret_here

# TikTok API (需要申请开发者权限)
VITE_TIKTOK_CLIENT_KEY=your_tiktok_client_key_here
VITE_TIKTOK_CLIENT_SECRET=your_tiktok_client_secret_here

# Twitch API
VITE_TWITCH_CLIENT_ID=e1namazht1go6vmjxk8m7wvx02dgcl
VITE_TWITCH_CLIENT_SECRET=your_twitch_client_secret_here

# 抖音/快手API (第三方服务)
VITE_DOUYIN_API_KEY=your_douyin_api_key_here
VITE_KUAISHOU_API_KEY=your_kuaishou_api_key_here

# ===== 语音识别API =====
# OpenAI Whisper API (推荐)
VITE_OPENAI_API_KEY=sk-rHl2yyFTlfMcBvd8KegzN1NspogSE5RB4FWnFoSlWIxCsziO
VITE_OPENAI_ORG_ID=your_openai_org_id_here

# Google Speech-to-Text (备选)
VITE_GOOGLE_CLOUD_PROJECT_ID=your_google_cloud_project_id_here
VITE_GOOGLE_CLOUD_CREDENTIALS=your_google_cloud_credentials_json_here

# Azure Speech Services (备选)
VITE_AZURE_SPEECH_KEY=your_azure_speech_key_here
VITE_AZURE_SPEECH_REGION=your_azure_speech_region_here

# 阿里云智能语音交互 (国内备选)
VITE_ALIYUN_ACCESS_KEY_ID=your_aliyun_access_key_id_here
VITE_ALIYUN_ACCESS_KEY_SECRET=your_aliyun_access_key_secret_here

# ===== 视频处理API =====
# FFmpeg服务 (自建)
VITE_FFMPEG_SERVICE_URL=http://localhost:3001/api/ffmpeg

# AWS MediaConvert (云服务)
VITE_AWS_ACCESS_KEY_ID=your_aws_access_key_id_here
VITE_AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key_here
VITE_AWS_REGION=us-east-1
VITE_AWS_MEDIACONVERT_ENDPOINT=your_mediaconvert_endpoint_here

# 阿里云视频点播 (国内)
VITE_ALIYUN_VOD_ACCESS_KEY_ID=your_aliyun_vod_access_key_id_here
VITE_ALIYUN_VOD_ACCESS_KEY_SECRET=your_aliyun_vod_access_key_secret_here
VITE_ALIYUN_VOD_REGION=cn-shanghai

# ===== 字幕生成API =====
# OpenAI GPT API (字幕优化)
VITE_OPENAI_GPT_MODEL=gpt-3.5-turbo

# 百度翻译API (备选)
VITE_BAIDU_TRANSLATE_APP_ID=your_baidu_translate_app_id_here
VITE_BAIDU_TRANSLATE_SECRET_KEY=your_baidu_translate_secret_key_here

# 腾讯云机器翻译 (备选)
VITE_TENCENT_SECRET_ID=your_tencent_secret_id_here
VITE_TENCENT_SECRET_KEY=your_tencent_secret_key_here

# ===== 应用配置 =====
# 后端API服务地址
VITE_API_BASE_URL=http://localhost:3000/api
VITE_API_TIMEOUT=30000

# 文件上传配置
VITE_MAX_FILE_SIZE=500MB
VITE_ALLOWED_VIDEO_FORMATS=mp4,avi,mov,flv

# 处理配置
VITE_DEFAULT_SLICE_MINUTES=3
VITE_MAX_SLICE_MINUTES=10
VITE_SUBTITLE_LANGUAGE=zh-CN

# ===== 开发环境配置 =====
NODE_ENV=development
VITE_DEBUG_MODE=true
VITE_LOG_LEVEL=debug
```

## 第二步：验证配置

1. 保存 `.env` 文件
2. 重启开发服务器：`npm run dev`
3. 打开浏览器访问 `http://localhost:5173`
4. 查看页面顶部的"API配置状态"区域

## 第三步：检查结果

如果配置正确，你应该看到：
- ✅ OpenAI Whisper API - API密钥已配置
- ✅ YouTube Data API - API密钥已配置  
- ✅ Twitch API - Client ID已配置

## 注意事项

1. **安全提醒**：`.env` 文件包含敏感信息，不要提交到Git仓库
2. **API限制**：请注意各API的使用配额和限制
3. **费用控制**：OpenAI API按使用量收费，建议设置使用限制

## 下一步

配置完成后，你可以：
1. 测试直播链接验证功能
2. 尝试处理YouTube或Twitch直播
3. 根据需要配置其他可选API 