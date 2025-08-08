// API服务 - 处理与后端API的通信

import { apiConfig, API_ENDPOINTS } from '../config/api';

// API请求基础类
class APIService {
  private baseURL: string;
  private timeout: number;

  constructor() {
    this.baseURL = apiConfig.app.baseUrl;
    this.timeout = apiConfig.app.timeout;
  }

  // 通用请求方法
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      timeout: this.timeout,
    };

    const response = await fetch(url, {
      ...defaultOptions,
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // 直播抓取API
  async fetchStreamInfo(url: string) {
    return this.request<{
      platform: string;
      title: string;
      duration: number;
      status: 'live' | 'ended' | 'error';
    }>(API_ENDPOINTS.STREAM_INFO, {
      method: 'POST',
      body: JSON.stringify({ url }),
    });
  }

  async fetchStream(url: string) {
    return this.request<{
      taskId: string;
      status: 'started' | 'failed';
      message: string;
    }>(API_ENDPOINTS.STREAM_FETCH, {
      method: 'POST',
      body: JSON.stringify({ url }),
    });
  }

  // 语音识别API
  async transcribeAudio(audioFile: File) {
    const formData = new FormData();
    formData.append('audio', audioFile);
    formData.append('language', apiConfig.app.subtitleLanguage);

    return this.request<{
      taskId: string;
      status: 'processing' | 'completed' | 'failed';
      transcript?: string;
    }>(API_ENDPOINTS.SPEECH_TRANSCRIBE, {
      method: 'POST',
      body: formData,
      headers: {}, // 让浏览器自动设置Content-Type
    });
  }

  async getTranscriptionStatus(taskId: string) {
    return this.request<{
      status: 'processing' | 'completed' | 'failed';
      progress: number;
      transcript?: string;
      error?: string;
    }>(`${API_ENDPOINTS.SPEECH_STATUS}?taskId=${taskId}`);
  }

  // 视频处理API
  async sliceVideo(videoFile: File, sliceMinutes: number) {
    const formData = new FormData();
    formData.append('video', videoFile);
    formData.append('sliceMinutes', sliceMinutes.toString());

    return this.request<{
      taskId: string;
      status: 'processing' | 'completed' | 'failed';
      slices?: string[];
    }>(API_ENDPOINTS.VIDEO_SLICE, {
      method: 'POST',
      body: formData,
      headers: {},
    });
  }

  async addSubtitles(videoFile: File, subtitles: string) {
    const formData = new FormData();
    formData.append('video', videoFile);
    formData.append('subtitles', subtitles);

    return this.request<{
      taskId: string;
      status: 'processing' | 'completed' | 'failed';
      outputUrl?: string;
    }>(API_ENDPOINTS.VIDEO_SUBTITLE, {
      method: 'POST',
      body: formData,
      headers: {},
    });
  }

  // 字幕处理API
  async generateSubtitles(transcript: string) {
    return this.request<{
      subtitles: string;
      language: string;
    }>(API_ENDPOINTS.SUBTITLE_GENERATE, {
      method: 'POST',
      body: JSON.stringify({ transcript }),
    });
  }

  async translateSubtitles(subtitles: string, targetLanguage: string) {
    return this.request<{
      translatedSubtitles: string;
      targetLanguage: string;
    }>(API_ENDPOINTS.SUBTITLE_TRANSLATE, {
      method: 'POST',
      body: JSON.stringify({ subtitles, targetLanguage }),
    });
  }

  // 文件处理API
  async uploadFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    return this.request<{
      fileId: string;
      url: string;
      size: number;
    }>(API_ENDPOINTS.FILE_UPLOAD, {
      method: 'POST',
      body: formData,
      headers: {},
    });
  }

  async downloadFile(fileId: string) {
    return this.request<{
      downloadUrl: string;
      expiresAt: string;
    }>(`${API_ENDPOINTS.FILE_DOWNLOAD}?fileId=${fileId}`);
  }

  // 任务管理API
  async createTask(params: {
    streamUrl: string;
    sliceMinutes: number;
    options?: {
      generateSubtitles?: boolean;
      translateSubtitles?: boolean;
      targetLanguage?: string;
    };
  }) {
    return this.request<{
      taskId: string;
      status: 'created' | 'failed';
      message: string;
    }>(API_ENDPOINTS.TASK_CREATE, {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async getTaskStatus(taskId: string) {
    return this.request<{
      taskId: string;
      status: 'pending' | 'processing' | 'completed' | 'failed';
      progress: number;
      steps: Array<{
        name: string;
        status: 'pending' | 'processing' | 'completed' | 'failed';
        progress: number;
      }>;
      result?: {
        downloadUrl: string;
        fileCount: number;
        totalSize: number;
      };
      error?: string;
    }>(`${API_ENDPOINTS.TASK_STATUS}?taskId=${taskId}`);
  }

  async cancelTask(taskId: string) {
    return this.request<{
      success: boolean;
      message: string;
    }>(API_ENDPOINTS.TASK_CANCEL, {
      method: 'POST',
      body: JSON.stringify({ taskId }),
    });
  }
}

// 创建API服务实例
export const apiService = new APIService();

// 直播平台特定的API服务
export class PlatformAPIService {
  // YouTube API
  static async getYouTubeLiveInfo(videoId: string) {
    const url = `${apiConfig.youtube.baseUrl}/videos?part=snippet,contentDetails,statistics&id=${videoId}&key=${apiConfig.youtube.apiKey}`;
    const response = await fetch(url);
    return response.json();
  }

  // Twitch API
  static async getTwitchLiveInfo(channelName: string) {
    const url = `${apiConfig.twitch.baseUrl}/streams?user_login=${channelName}`;
    const response = await fetch(url, {
      headers: {
        'Client-ID': apiConfig.twitch.clientId,
        'Authorization': `Bearer ${apiConfig.twitch.clientSecret}`,
      },
    });
    return response.json();
  }

  // TikTok API (需要特殊处理)
  static async getTikTokLiveInfo(username: string) {
    // TikTok API需要特殊的认证流程
    const url = `${apiConfig.tiktok.baseUrl}/user/info/`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${apiConfig.tiktok.clientKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username }),
    });
    return response.json();
  }
}

// 语音识别服务
export class SpeechRecognitionService {
  // OpenAI Whisper
  static async transcribeWithWhisper(audioFile: File) {
    const formData = new FormData();
    formData.append('file', audioFile);
    formData.append('model', 'whisper-1');
    formData.append('language', 'zh');

    const response = await fetch(apiConfig.openai.whisperUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiConfig.openai.apiKey}`,
      },
      body: formData,
    });

    return response.json();
  }

  // Google Speech-to-Text
  static async transcribeWithGoogle(audioFile: File) {
    // 需要先将音频文件转换为base64
    const arrayBuffer = await audioFile.arrayBuffer();
    const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

    const response = await fetch(apiConfig.google.speechUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiConfig.google.credentials}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        config: {
          encoding: 'WEBM_OPUS',
          sampleRateHertz: 48000,
          languageCode: 'zh-CN',
        },
        audio: {
          content: base64Audio,
        },
      }),
    });

    return response.json();
  }
}

// 视频处理服务
export class VideoProcessingService {
  // FFmpeg服务
  static async processWithFFmpeg(params: {
    inputFile: string;
    outputFormat: string;
    options: string[];
  }) {
    const response = await fetch(apiConfig.ffmpeg.serviceUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    return response.json();
  }

  // 切片视频
  static async sliceVideo(inputFile: string, sliceMinutes: number) {
    return this.processWithFFmpeg({
      inputFile,
      outputFormat: 'mp4',
      options: [
        '-f', 'segment',
        '-segment_time', (sliceMinutes * 60).toString(),
        '-c', 'copy',
        '-reset_timestamps', '1',
      ],
    });
  }

  // 添加字幕
  static async addSubtitles(inputFile: string, subtitleFile: string) {
    return this.processWithFFmpeg({
      inputFile,
      outputFormat: 'mp4',
      options: [
        '-i', subtitleFile,
        '-c:v', 'copy',
        '-c:a', 'copy',
        '-c:s', 'mov_text',
      ],
    });
  }
} 