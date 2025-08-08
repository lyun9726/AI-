// API配置文件 - 定义所有需要的API端点和环境变量

export interface APIConfig {
  // 直播抓取API
  youtube: {
    apiKey: string;
    clientId: string;
    clientSecret: string;
    baseUrl: string;
  };
  tiktok: {
    clientKey: string;
    clientSecret: string;
    baseUrl: string;
  };
  twitch: {
    clientId: string;
    clientSecret: string;
    baseUrl: string;
  };
  douyin: {
    apiKey: string;
    baseUrl: string;
  };
  kuaishou: {
    apiKey: string;
    baseUrl: string;
  };

  // 语音识别API
  openai: {
    apiKey: string;
    orgId: string;
    whisperUrl: string;
    gptUrl: string;
    model: string;
  };
  google: {
    projectId: string;
    credentials: string;
    speechUrl: string;
  };
  azure: {
    speechKey: string;
    speechRegion: string;
    speechUrl: string;
  };
  aliyun: {
    accessKeyId: string;
    accessKeySecret: string;
    speechUrl: string;
  };

  // 视频处理API
  ffmpeg: {
    serviceUrl: string;
  };
  aws: {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
    mediaConvertEndpoint: string;
  };
  aliyunVod: {
    accessKeyId: string;
    accessKeySecret: string;
    region: string;
    vodUrl: string;
  };

  // 字幕生成API
  baidu: {
    appId: string;
    secretKey: string;
    translateUrl: string;
  };
  tencent: {
    secretId: string;
    secretKey: string;
    translateUrl: string;
  };

  // 应用配置
  app: {
    baseUrl: string;
    timeout: number;
    maxFileSize: string;
    allowedFormats: string[];
    defaultSliceMinutes: number;
    maxSliceMinutes: number;
    subtitleLanguage: string;
  };
}

// 从环境变量读取配置
export const apiConfig: APIConfig = {
  // 直播抓取API
  youtube: {
    apiKey: import.meta.env.VITE_YOUTUBE_API_KEY || '',
    clientId: import.meta.env.VITE_YOUTUBE_CLIENT_ID || '',
    clientSecret: import.meta.env.VITE_YOUTUBE_CLIENT_SECRET || '',
    baseUrl: 'https://www.googleapis.com/youtube/v3',
  },
  tiktok: {
    clientKey: import.meta.env.VITE_TIKTOK_CLIENT_KEY || '',
    clientSecret: import.meta.env.VITE_TIKTOK_CLIENT_SECRET || '',
    baseUrl: 'https://open.tiktokapis.com/v2',
  },
  twitch: {
    clientId: import.meta.env.VITE_TWITCH_CLIENT_ID || '',
    clientSecret: import.meta.env.VITE_TWITCH_CLIENT_SECRET || '',
    baseUrl: 'https://api.twitch.tv/helix',
  },
  douyin: {
    apiKey: import.meta.env.VITE_DOUYIN_API_KEY || '',
    baseUrl: 'https://api.douyin.com',
  },
  kuaishou: {
    apiKey: import.meta.env.VITE_KUAISHOU_API_KEY || '',
    baseUrl: 'https://api.kuaishou.com',
  },

  // 语音识别API
  openai: {
    apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
    orgId: import.meta.env.VITE_OPENAI_ORG_ID || '',
    whisperUrl: 'https://api.openai.com/v1/audio/transcriptions',
    gptUrl: 'https://api.openai.com/v1/chat/completions',
    model: import.meta.env.VITE_OPENAI_GPT_MODEL || 'gpt-3.5-turbo',
  },
  google: {
    projectId: import.meta.env.VITE_GOOGLE_CLOUD_PROJECT_ID || '',
    credentials: import.meta.env.VITE_GOOGLE_CLOUD_CREDENTIALS || '',
    speechUrl: 'https://speech.googleapis.com/v1/speech:recognize',
  },
  azure: {
    speechKey: import.meta.env.VITE_AZURE_SPEECH_KEY || '',
    speechRegion: import.meta.env.VITE_AZURE_SPEECH_REGION || '',
    speechUrl: `https://${import.meta.env.VITE_AZURE_SPEECH_REGION}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1`,
  },
  aliyun: {
    accessKeyId: import.meta.env.VITE_ALIYUN_ACCESS_KEY_ID || '',
    accessKeySecret: import.meta.env.VITE_ALIYUN_ACCESS_KEY_SECRET || '',
    speechUrl: 'https://nls-gateway.cn-shanghai.aliyuncs.com/stream/v1',
  },

  // 视频处理API
  ffmpeg: {
    serviceUrl: import.meta.env.VITE_FFMPEG_SERVICE_URL || 'http://localhost:3001/api/ffmpeg',
  },
  aws: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID || '',
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY || '',
    region: import.meta.env.VITE_AWS_REGION || 'us-east-1',
    mediaConvertEndpoint: import.meta.env.VITE_AWS_MEDIACONVERT_ENDPOINT || '',
  },
  aliyunVod: {
    accessKeyId: import.meta.env.VITE_ALIYUN_VOD_ACCESS_KEY_ID || '',
    accessKeySecret: import.meta.env.VITE_ALIYUN_VOD_ACCESS_KEY_SECRET || '',
    region: import.meta.env.VITE_ALIYUN_VOD_REGION || 'cn-shanghai',
    vodUrl: 'https://vod.cn-shanghai.aliyuncs.com',
  },

  // 字幕生成API
  baidu: {
    appId: import.meta.env.VITE_BAIDU_TRANSLATE_APP_ID || '',
    secretKey: import.meta.env.VITE_BAIDU_TRANSLATE_SECRET_KEY || '',
    translateUrl: 'https://fanyi-api.baidu.com/api/trans/vip/translate',
  },
  tencent: {
    secretId: import.meta.env.VITE_TENCENT_SECRET_ID || '',
    secretKey: import.meta.env.VITE_TENCENT_SECRET_KEY || '',
    translateUrl: 'https://tmt.tencentcloudapi.com',
  },

  // 应用配置
  app: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
    timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000'),
    maxFileSize: import.meta.env.VITE_MAX_FILE_SIZE || '500MB',
    allowedFormats: (import.meta.env.VITE_ALLOWED_VIDEO_FORMATS || 'mp4,avi,mov,flv').split(','),
    defaultSliceMinutes: parseInt(import.meta.env.VITE_DEFAULT_SLICE_MINUTES || '3'),
    maxSliceMinutes: parseInt(import.meta.env.VITE_MAX_SLICE_MINUTES || '10'),
    subtitleLanguage: import.meta.env.VITE_SUBTITLE_LANGUAGE || 'zh-CN',
  },
};

// API端点定义
export const API_ENDPOINTS = {
  // 直播抓取
  STREAM_FETCH: '/stream/fetch',
  STREAM_INFO: '/stream/info',
  
  // 语音识别
  SPEECH_TRANSCRIBE: '/speech/transcribe',
  SPEECH_STATUS: '/speech/status',
  
  // 视频处理
  VIDEO_SLICE: '/video/slice',
  VIDEO_SUBTITLE: '/video/subtitle',
  VIDEO_MERGE: '/video/merge',
  
  // 字幕处理
  SUBTITLE_GENERATE: '/subtitle/generate',
  SUBTITLE_TRANSLATE: '/subtitle/translate',
  
  // 文件处理
  FILE_UPLOAD: '/file/upload',
  FILE_DOWNLOAD: '/file/download',
  FILE_STATUS: '/file/status',
  
  // 任务管理
  TASK_CREATE: '/task/create',
  TASK_STATUS: '/task/status',
  TASK_CANCEL: '/task/cancel',
};

// 检查API配置是否完整
export const validateAPIConfig = (): { valid: boolean; missing: string[] } => {
  const missing: string[] = [];
  
  // 检查必要的API密钥
  if (!apiConfig.openai.apiKey) missing.push('OpenAI API Key');
  if (!apiConfig.youtube.apiKey) missing.push('YouTube API Key');
  if (!apiConfig.twitch.clientId) missing.push('Twitch Client ID');
  
  return {
    valid: missing.length === 0,
    missing,
  };
};

// 获取API服务状态
export const getAPIServiceStatus = async (): Promise<Record<string, boolean>> => {
  const status: Record<string, boolean> = {};
  
  try {
    // 检查各个API服务状态
    const checks = [
      { name: 'OpenAI', url: apiConfig.openai.whisperUrl },
      { name: 'YouTube', url: apiConfig.youtube.baseUrl },
      { name: 'Twitch', url: apiConfig.twitch.baseUrl },
    ];
    
    for (const check of checks) {
      try {
        const response = await fetch(check.url, { method: 'HEAD' });
        status[check.name] = response.ok;
      } catch {
        status[check.name] = false;
      }
    }
  } catch (error) {
    console.error('API服务状态检查失败:', error);
  }
  
  return status;
}; 