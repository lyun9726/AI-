// 直播流服务 - 获取直播信息和流地址

export interface LiveStreamInfo {
  title: string;
  platform: string;
  streamUrl: string;
  thumbnailUrl?: string;
  duration?: number;
  quality?: string[];
  status: 'live' | 'offline' | 'unknown';
}

export interface StreamProcessResult {
  success: boolean;
  streamInfo?: LiveStreamInfo;
  downloadUrl?: string;
  error?: string;
}

class LiveStreamService {
  
  // 解析直播链接获取基本信息
  async parseStreamUrl(url: string): Promise<LiveStreamInfo> {
    console.log('解析直播链接:', url);
    
    try {
      // 检测平台类型
      const platform = this.detectPlatform(url);
      
      switch (platform) {
        case 'douyin':
          return await this.parseDouyinStream(url);
        case 'kuaishou':
          return await this.parseKuaishouStream(url);
        case 'youtube':
          return await this.parseYouTubeStream(url);
        case 'tiktok':
          return await this.parseTikTokStream(url);
        case 'twitch':
          return await this.parseTwitchStream(url);
        default:
          throw new Error('不支持的直播平台');
      }
    } catch (error) {
      console.error('解析直播链接失败:', error);
      throw error;
    }
  }

  // 检测平台类型
  private detectPlatform(url: string): string {
    if (url.includes('douyin.com') || url.includes('amemv.com')) return 'douyin';
    if (url.includes('kuaishou.com')) return 'kuaishou';
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
    if (url.includes('tiktok.com')) return 'tiktok';
    if (url.includes('twitch.tv')) return 'twitch';
    return 'unknown';
  }

  // 抖音直播解析
  private async parseDouyinStream(url: string): Promise<LiveStreamInfo> {
    try {
      // 由于跨域限制，这里使用代理服务或后端API
      const response = await this.fetchWithProxy(url);
      
      // 模拟解析结果（实际需要解析HTML或调用API）
      return {
        title: '抖音直播间',
        platform: '抖音',
        streamUrl: url,
        status: 'live',
        quality: ['720p', '480p', '360p']
      };
    } catch (error) {
      console.error('抖音直播解析失败:', error);
      return {
        title: '抖音直播间',
        platform: '抖音',
        streamUrl: url,
        status: 'unknown'
      };
    }
  }

  // YouTube直播解析
  private async parseYouTubeStream(url: string): Promise<LiveStreamInfo> {
    try {
      // 提取视频ID
      const videoId = this.extractYouTubeVideoId(url);
      if (!videoId) throw new Error('无效的YouTube链接');

      // 使用YouTube Data API（需要API密钥）
      const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
      if (!apiKey) {
        throw new Error('YouTube API密钥未配置');
      }

      const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet,liveStreamingDetails&key=${apiKey}`;
      
      const response = await fetch(apiUrl);
      const data = await response.json();
      
      if (data.items && data.items.length > 0) {
        const video = data.items[0];
        const isLive = video.snippet.liveBroadcastContent === 'live';
        
        return {
          title: video.snippet.title,
          platform: 'YouTube',
          streamUrl: url,
          thumbnailUrl: video.snippet.thumbnails?.high?.url,
          status: isLive ? 'live' : 'offline'
        };
      }
      
      throw new Error('未找到视频信息');
    } catch (error) {
      console.error('YouTube直播解析失败:', error);
      return {
        title: 'YouTube直播',
        platform: 'YouTube',
        streamUrl: url,
        status: 'unknown'
      };
    }
  }

  // Twitch直播解析
  private async parseTwitchStream(url: string): Promise<LiveStreamInfo> {
    try {
      const channelName = this.extractTwitchChannelName(url);
      if (!channelName) throw new Error('无效的Twitch链接');

      // 使用Twitch API（需要Client ID和Token）
      const clientId = import.meta.env.VITE_TWITCH_CLIENT_ID;
      if (!clientId) {
        throw new Error('Twitch API配置未完成');
      }

      // 注意：Twitch API需要OAuth token，这里简化处理
      return {
        title: `${channelName}的直播间`,
        platform: 'Twitch',
        streamUrl: url,
        status: 'unknown' // 需要API验证
      };
    } catch (error) {
      console.error('Twitch直播解析失败:', error);
      return {
        title: 'Twitch直播',
        platform: 'Twitch',
        streamUrl: url,
        status: 'unknown'
      };
    }
  }

  // TikTok直播解析
  private async parseTikTokStream(url: string): Promise<LiveStreamInfo> {
    return {
      title: 'TikTok直播间',
      platform: 'TikTok',
      streamUrl: url,
      status: 'unknown'
    };
  }

  // 快手直播解析
  private async parseKuaishouStream(url: string): Promise<LiveStreamInfo> {
    return {
      title: '快手直播间',
      platform: '快手',
      streamUrl: url,
      status: 'unknown'
    };
  }

  // 使用代理获取页面内容（避免跨域）
  private async fetchWithProxy(url: string): Promise<Response> {
    // 这里需要一个代理服务，或者使用CORS代理
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    return fetch(proxyUrl);
  }

  // 提取YouTube视频ID
  private extractYouTubeVideoId(url: string): string | null {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/live\/)([^&\n?#]+)/,
      /youtube\.com\/embed\/([^&\n?#]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    
    return null;
  }

  // 提取Twitch频道名
  private extractTwitchChannelName(url: string): string | null {
    const match = url.match(/twitch\.tv\/([^\/\?]+)/);
    return match ? match[1] : null;
  }

  // 模拟下载直播流
  async downloadStream(streamInfo: LiveStreamInfo, duration: number = 300): Promise<Blob> {
    console.log(`开始录制 ${streamInfo.platform} 直播，时长: ${duration}秒`);
    
    // 模拟下载过程
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 创建一个模拟的视频文件
    const mockVideoSize = Math.floor(duration * 1024 * 1024 * 0.5); // 假设0.5MB/秒
    const mockVideoData = new ArrayBuffer(mockVideoSize);
    
    return new Blob([mockVideoData], { type: 'video/mp4' });
  }
}

// 创建单例实例
export const liveStreamService = new LiveStreamService();