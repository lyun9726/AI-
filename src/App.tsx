import React, { useState, useCallback, useRef } from 'react';
import { Link, Play, Download, Scissors, Radio, Clock, Zap, CheckCircle, Globe, Upload } from 'lucide-react';


import { simpleVideoProcessor, ProcessingResult, VideoSlice } from './services/simpleVideoProcessor';
import { realVideoProcessor } from './services/realVideoProcessor';
import { ffmpegVideoProcessor } from './services/ffmpegVideoProcessor';
import { liveStreamService, LiveStreamInfo } from './services/liveStreamService';

interface ProcessingStep {
  id: string;
  name: string;
  status: 'pending' | 'processing' | 'completed';
  progress: number;
}

function App() {
  const [streamUrl, setStreamUrl] = useState('');
  const [isValidUrl, setIsValidUrl] = useState(false);
  const [sliceMinutes, setSliceMinutes] = useState(3);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingSteps, setProcessingSteps] = useState<ProcessingStep[]>([
    { id: 'fetch', name: '直播抓取', status: 'pending', progress: 0 },
    { id: 'download', name: '视频下载', status: 'pending', progress: 0 },
    { id: 'transcribe', name: '语音识别', status: 'pending', progress: 0 },
    { id: 'slice', name: 'FFmpeg.wasm 专业切片', status: 'pending', progress: 0 },
    { id: 'subtitle', name: '字幕叠加', status: 'pending', progress: 0 },
    { id: 'package', name: '打包输出', status: 'pending', progress: 0 },
  ]);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [processingResult, setProcessingResult] = useState<ProcessingResult | null>(null);

  const [streamInfo, setStreamInfo] = useState<LiveStreamInfo | null>(null);
  const [isAnalyzingStream, setIsAnalyzingStream] = useState(false);
  const [isLoadingFFmpeg, setIsLoadingFFmpeg] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateUrl = useCallback((url: string) => {
    // 支持抖音和快手的链接格式
    const douyinPatterns = [
      /^https?:\/\/(www\.)?douyin\.com\/user\/[^\/]+\/live/i,
      /^https?:\/\/live\.douyin\.com\/\d+/i,
      /^https?:\/\/webcast\.amemv\.com\/douyin\/webcast\/reflow\/\d+/i,
      /^https?:\/\/v\.douyin\.com\/[A-Za-z0-9]+/i
    ];
    
    const kuaishouPatterns = [
      /^https?:\/\/(www\.)?kuaishou\.com\/profile\/[^\/]+\/live/i,
      /^https?:\/\/live\.kuaishou\.com\/u\/[^\/]+/i,
      /^https?:\/\/live\.kuaishou\.com\/profile\/[^\/]+/i,
      /^https?:\/\/v\.kuaishou\.com\/[A-Za-z0-9]+/i
    ];

    // YouTube直播链接格式
    const youtubePatterns = [
      /^https?:\/\/(www\.)?youtube\.com\/watch\?v=[A-Za-z0-9_-]+/i,
      /^https?:\/\/(www\.)?youtube\.com\/live\/[A-Za-z0-9_-]+/i,
      /^https?:\/\/(www\.)?youtube\.com\/channel\/[A-Za-z0-9_-]+\/live/i,
      /^https?:\/\/(www\.)?youtube\.com\/c\/[A-Za-z0-9_-]+\/live/i,
      /^https?:\/\/(www\.)?youtube\.com\/@[A-Za-z0-9_-]+\/live/i,
      /^https?:\/\/youtu\.be\/[A-Za-z0-9_-]+/i
    ];

    // TikTok直播链接格式
    const tiktokPatterns = [
      /^https?:\/\/(www\.)?tiktok\.com\/@[A-Za-z0-9_.-]+\/live/i,
      /^https?:\/\/(www\.)?tiktok\.com\/live\/[A-Za-z0-9_-]+/i,
      /^https?:\/\/vm\.tiktok\.com\/[A-Za-z0-9]+/i
    ];

    // Twitch直播链接格式
    const twitchPatterns = [
      /^https?:\/\/(www\.)?twitch\.tv\/[A-Za-z0-9_-]+/i,
      /^https?:\/\/(www\.)?twitch\.tv\/videos\/[A-Za-z0-9_-]+/i,
      /^https?:\/\/clips\.twitch\.tv\/[A-Za-z0-9_-]+/i
    ];
    
    return [
      ...douyinPatterns, 
      ...kuaishouPatterns, 
      ...youtubePatterns, 
      ...tiktokPatterns, 
      ...twitchPatterns
    ].some(pattern => pattern.test(url));
  }, []);

  const handleUrlChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setStreamUrl(url);
    setIsValidUrl(validateUrl(url));
    
    // 如果URL有效，自动分析直播信息
    if (validateUrl(url)) {
      setIsAnalyzingStream(true);
      try {
        const info = await liveStreamService.parseStreamUrl(url);
        setStreamInfo(info);
        console.log('直播信息:', info);
      } catch (error) {
        console.error('分析直播失败:', error);
        setStreamInfo(null);
      } finally {
        setIsAnalyzingStream(false);
      }
    } else {
      setStreamInfo(null);
    }
  }, [validateUrl]);

  const getSupportedPlatforms = () => {
    return [
      { 
        name: '抖音直播', 
        examples: [
          'https://live.douyin.com/123456789',
          'https://v.douyin.com/ABC123/',
          'https://www.douyin.com/user/xxx/live'
        ]
      },
      { 
        name: '快手直播', 
        examples: [
          'https://live.kuaishou.com/u/username',
          'https://v.kuaishou.com/ABC123',
          'https://www.kuaishou.com/profile/xxx/live'
        ]
      },
      { 
        name: 'YouTube直播', 
        examples: [
          'https://www.youtube.com/watch?v=VIDEO_ID',
          'https://www.youtube.com/live/STREAM_ID',
          'https://www.youtube.com/@channelname/live',
          'https://youtu.be/VIDEO_ID'
        ]
      },
      { 
        name: 'TikTok直播', 
        examples: [
          'https://www.tiktok.com/@username/live',
          'https://www.tiktok.com/live/STREAM_ID',
          'https://vm.tiktok.com/SHORT_CODE'
        ]
      },
      { 
        name: 'Twitch直播', 
        examples: [
          'https://www.twitch.tv/streamername',
          'https://www.twitch.tv/videos/VIDEO_ID',
          'https://clips.twitch.tv/CLIP_ID'
        ]
      }
    ];
  };

  const processVideo = async () => {
    if (!videoFile && !(streamUrl && isValidUrl)) {
      alert('请先上传视频文件或输入有效的直播链接');
      return;
    }

        setIsProcessing(true);
    setIsLoadingFFmpeg(true);
    setProcessingSteps(steps => steps.map(step => ({ ...step, status: 'pending', progress: 0 })));
    
    try {
      // 步骤1: 直播抓取 (模拟)
      setProcessingSteps(steps => 
        steps.map((step, index) => ({
          ...step,
          status: index === 0 ? 'processing' : 'pending',
          progress: index === 0 ? 0 : 0
        }))
      );
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProcessingSteps(steps =>
        steps.map((step, index) => ({
          ...step,
          status: index === 0 ? 'completed' : 'pending',
          progress: index === 0 ? 100 : 0
        }))
      );

      // 步骤2: 视频下载 (模拟)
      setProcessingSteps(steps => 
        steps.map((step, index) => ({
          ...step,
          status: index === 1 ? 'processing' : index < 1 ? 'completed' : 'pending',
          progress: index === 1 ? 0 : index < 1 ? 100 : 0
        }))
      );
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProcessingSteps(steps =>
        steps.map((step, index) => ({
          ...step,
          status: index <= 1 ? 'completed' : 'pending',
          progress: index <= 1 ? 100 : 0
        }))
      );

      // 步骤3: 语音识别 (模拟)
      setProcessingSteps(steps => 
        steps.map((step, index) => ({
          ...step,
          status: index === 2 ? 'processing' : index < 2 ? 'completed' : 'pending',
          progress: index === 2 ? 0 : index < 2 ? 100 : 0
        }))
      );
      await new Promise(resolve => setTimeout(resolve, 1500));
      setProcessingSteps(steps =>
        steps.map((step, index) => ({
          ...step,
          status: index <= 2 ? 'completed' : 'pending',
          progress: index <= 2 ? 100 : 0
        }))
      );

      // 步骤4: 视频切片 (真实处理或模拟处理)
      setProcessingSteps(steps => 
        steps.map((step, index) => ({
          ...step,
          status: index === 3 ? 'processing' : index < 3 ? 'completed' : 'pending',
          progress: index === 3 ? 0 : index < 3 ? 100 : 0
        }))
      );

      let result;
      if (videoFile) {
        // 如果有上传的视频文件，使用真实的视频处理器
        result = await ffmpegVideoProcessor.processVideo(
          videoFile,
          sliceMinutes,
          (progress) => {
            setProcessingSteps(steps =>
              steps.map((step, index) => ({
                ...step,
                progress: index === 3 ? progress : step.progress
              }))
            );
          }
        );
      } else {
        // 如果是直播链接，使用真实的直播处理器
        if (!streamInfo) {
          throw new Error('直播信息获取失败，请重新输入链接');
        }
        
        // 使用actualVideoProcessor处理直播
        result = await ffmpegVideoProcessor.processLiveStream(
          streamInfo.title,
          streamInfo.platform,
          sliceMinutes,
          (progress) => {
            setProcessingSteps(steps =>
              steps.map((step, index) => ({
                ...step,
                progress: index === 3 ? progress : step.progress
              }))
            );
          }
        );
      }

      if (!result.success) {
        throw new Error(result.error || '视频处理失败');
      }

      setProcessingResult(result);
      setProcessingSteps(steps =>
        steps.map((step, index) => ({
          ...step,
          status: index <= 3 ? 'completed' : 'pending',
          progress: index <= 3 ? 100 : 0
        }))
      );

      // 步骤5: 字幕叠加 (模拟)
      setProcessingSteps(steps => 
        steps.map((step, index) => ({
          ...step,
          status: index === 4 ? 'processing' : index < 4 ? 'completed' : 'pending',
          progress: index === 4 ? 0 : index < 4 ? 100 : 0
        }))
      );
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProcessingSteps(steps =>
        steps.map((step, index) => ({
          ...step,
          status: index <= 4 ? 'completed' : 'pending',
          progress: index <= 4 ? 100 : 0
        }))
      );

      // 步骤6: 打包输出 (真实处理)
      setProcessingSteps(steps => 
        steps.map((step, index) => ({
          ...step,
          status: index === 5 ? 'processing' : index < 5 ? 'completed' : 'pending',
          progress: index === 5 ? 0 : index < 5 ? 100 : 0
        }))
      );

      const zipBlob = await ffmpegVideoProcessor.createZipFile(result.slices);
      const zipUrl = URL.createObjectURL(zipBlob);
      setDownloadUrl(zipUrl);

      setProcessingSteps(steps =>
        steps.map((step, index) => ({
          ...step,
          status: 'completed',
          progress: 100
        }))
      );

    } catch (error) {
      console.error('处理失败:', error);
      alert(`处理失败: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setIsProcessing(false);
      setIsLoadingFFmpeg(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('video/')) {
        setVideoFile(file);
        setStreamUrl(file.name); // 显示文件名
        setIsValidUrl(true);
      } else {
        alert('请选择视频文件');
      }
    }
  };

  const resetProcessor = () => {
    setStreamUrl('');
    setIsValidUrl(false);
    setIsProcessing(false);
    setDownloadUrl(null);
    setVideoFile(null);
    setProcessingResult(null);

    setProcessingSteps(steps => steps.map(step => ({ ...step, status: 'pending', progress: 0 })));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#16120f] via-[#1d1612] to-[#0f0b09]">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-3 rounded-xl mr-4">
              <Scissors className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              AI 直播切片工具
            </h1>
          </div>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            智能语音识别 • 自动字幕生成 • 精准视频切片 • 一键批量输出
          </p>
          {/* Updated: Removed API config display for cleaner UI */}
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Stream URL Input Section */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-8 mb-8">
            <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
              <Link className="w-6 h-6 mr-3 text-amber-400" />
              输入直播链接
            </h2>
            
            <div className="space-y-6">
              {/* 文件上传区域 */}
              <div className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center hover:border-amber-500 transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="space-y-4">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                  <div>
                    <p className="text-white font-medium mb-2">上传视频文件</p>
                    <p className="text-gray-400 text-sm mb-4">支持 MP4, AVI, MOV, FLV 格式</p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                      选择文件
                    </button>
                  </div>
                  {videoFile && (
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                      <p className="text-green-300 text-sm">
                        ✅ 已选择: {videoFile.name} ({(videoFile.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* 直播链接输入 (可选) */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Globe className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="url"
                  value={streamUrl}
                  onChange={handleUrlChange}
                  placeholder="或粘贴直播链接（抖音/快手/YouTube/TikTok/Twitch）"
                  className="w-full pl-12 pr-4 py-4 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300"
                />
                {streamUrl && (
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                    <div className={`w-3 h-3 rounded-full ${isValidUrl ? 'bg-green-400' : 'bg-red-400'}`}></div>
                  </div>
                )}
              </div>
              
              {streamUrl && isValidUrl && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                  <div className="flex items-center text-green-400 mb-2">
                    <Radio className="w-5 h-5 mr-2" />
                    <span className="font-semibold">链接验证通过</span>
                    {isAnalyzingStream && (
                      <span className="ml-2 text-sm text-yellow-400">分析中...</span>
                    )}
                  </div>
                  
                  {streamInfo ? (
                    <div className="space-y-2">
                      <div className="flex items-center text-green-300 text-sm">
                        <span className="font-medium">平台：</span>
                        <span className="ml-1">{streamInfo.platform}</span>
                        <span className={`ml-3 px-2 py-1 rounded text-xs ${
                          streamInfo.status === 'live' ? 'bg-red-500 text-white' : 
                          streamInfo.status === 'offline' ? 'bg-gray-500 text-white' : 
                          'bg-yellow-500 text-black'
                        }`}>
                          {streamInfo.status === 'live' ? '直播中' : 
                           streamInfo.status === 'offline' ? '已下播' : '状态未知'}
                        </span>
                      </div>
                      <div className="text-green-300 text-sm">
                        <span className="font-medium">标题：</span>
                        <span className="ml-1">{streamInfo.title}</span>
                      </div>
                      {streamInfo.quality && streamInfo.quality.length > 0 && (
                        <div className="text-green-300 text-sm">
                          <span className="font-medium">画质：</span>
                          <span className="ml-1">{streamInfo.quality.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-green-300 text-sm">检测到有效的直播链接，可以开始处理</p>
                  )}
                </div>
              )}
              
              {streamUrl && !isValidUrl && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                  <div className="flex items-center text-red-400 mb-2">
                    <span className="font-semibold">链接格式不正确</span>
                  </div>
                  <p className="text-red-300 text-sm mb-2">请输入有效的直播链接</p>
                  <p className="text-red-300 text-xs">支持：抖音、快手、YouTube、TikTok、Twitch</p>
                </div>
              )}
            </div>
          </div>

          {/* Supported Platforms */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-8 mb-8">
            <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
              <Radio className="w-6 h-6 mr-3 text-amber-400" />
              支持的平台
            </h2>
            
            <div className="flex flex-wrap gap-3">
              {getSupportedPlatforms().map((platform) => {
                const label = platform.name.replace('直播', '');
                return (
                  <span
                    key={platform.name}
                    className="px-4 py-2 rounded-full bg-gray-700/40 border border-gray-600 text-white/90 hover:bg-gray-700/60 transition"
                  >
                    {label}
                  </span>
                );
              })}
            </div>
            
            <p className="mt-6 text-gray-400 text-sm">已适配：抖音 / 快手 / YouTube / TikTok / Twitch</p>
          </div>

          {/* Settings Section */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-8 mb-8">
            <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
              <Clock className="w-6 h-6 mr-3 text-amber-400" />
              切片设置
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-white font-medium mb-4">
                  每段时长: {sliceMinutes} 分钟
                </label>
                <div className="relative">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={sliceMinutes}
                    onChange={(e) => setSliceMinutes(parseInt(e.target.value))}
                    className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    style={{
                      background: `linear-gradient(to right, #f59e0b 0%, #f59e0b ${(sliceMinutes - 1) * 11.11}%, #374151 ${(sliceMinutes - 1) * 11.11}%, #374151 100%)`
                    }}
                  />
                  <div className="flex justify-between text-sm text-gray-400 mt-2">
                    <span>1分钟</span>
                    <span>5分钟</span>
                    <span>10分钟</span>
                  </div>
                </div>
              </div>
              


              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-gray-700/50 rounded-lg p-4 text-center">
                  <div className="text-amber-400 font-semibold">预估切片数</div>
                  <div className="text-white text-xl font-bold">
                    {streamUrl && isValidUrl ? '自动计算' : '-'}
                  </div>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-4 text-center">
                  <div className="text-blue-400 font-semibold">字幕语言</div>
                  <div className="text-white text-xl font-bold">中文</div>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-4 text-center">
                  <div className="text-green-400 font-semibold">输出格式</div>
                  <div className="text-white text-xl font-bold">MP4+ZIP</div>
                </div>
              </div>
            </div>
          </div>

          {/* Process Button */}
          {((videoFile || (streamUrl && isValidUrl)) && !isProcessing && !downloadUrl) && (
            <div className="text-center mb-8">
              <button
                onClick={processVideo}
                disabled={isProcessing}
                className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 disabled:from-gray-600 disabled:to-gray-700 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center mx-auto disabled:transform-none disabled:shadow-lg"
              >
                {isProcessing ? (
                  <>
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                    {isLoadingFFmpeg ? '🚀 加载FFmpeg.wasm...' : '⚡ 处理中...'}
                  </>
                ) : (
                  <>
                    <Zap className="w-6 h-6 mr-3" />
                    {videoFile ? '🎬 开始专业视频切片' : '📺 开始直播处理'}
                  </>
                )}
              </button>
            </div>
          )}

          {/* Processing Section */}
          {isProcessing && (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-8 mb-8">
              <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
                <Play className="w-6 h-6 mr-3 text-amber-400" />
                处理进度
              </h2>
              
              <div className="space-y-4">
                {processingSteps.map((step, index) => (
                  <div key={step.id} className="flex items-center space-x-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      step.status === 'completed' ? 'bg-green-500' :
                      step.status === 'processing' ? 'bg-amber-500' : 'bg-gray-600'
                    }`}>
                      {step.status === 'completed' ? (
                        <CheckCircle className="w-5 h-5 text-white" />
                      ) : (
                        <span className="text-white font-bold text-sm">{index + 1}</span>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white font-medium">{step.name}</span>
                        <span className="text-gray-400 text-sm">{step.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            step.status === 'completed' ? 'bg-green-500' :
                            step.status === 'processing' ? 'bg-amber-500' : 'bg-gray-600'
                          }`}
                          style={{ width: `${step.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Download Section */}
          {downloadUrl && processingResult && (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-8 text-center">
              <div className="bg-green-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <h2 className="text-2xl font-semibold text-white mb-4">处理完成！</h2>
              <div className="text-gray-400 mb-6 space-y-2">
                <p>视频已成功切片并添加字幕</p>
                <div className="bg-gray-700/50 rounded-lg p-4 text-sm">
                  <div className="grid grid-cols-2 gap-4 text-left">
                    <div>
                      <span className="text-purple-400 font-semibold">切片数量：</span>
                      <span className="text-white">{processingResult.slices.length} 个MP4文件</span>
                    </div>
                    <div>
                      <span className="text-blue-400 font-semibold">每段时长：</span>
                      <span className="text-white">{sliceMinutes} 分钟</span>
                    </div>
                    <div>
                      <span className="text-green-400 font-semibold">总文件大小：</span>
                      <span className="text-white">{(processingResult.totalSize / 1024 / 1024).toFixed(2)} MB</span>
                    </div>
                    <div>
                      <span className="text-yellow-400 font-semibold">文件格式：</span>
                      <span className="text-white">MP4 + 内嵌字幕</span>
                    </div>
                  </div>
                </div>
                
                {/* 显示切片列表 */}
                <div className="bg-gray-800/50 rounded-lg p-4 text-left">
                  <h4 className="text-white font-medium mb-2">切片文件列表：</h4>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {processingResult.slices.map((slice, index) => (
                      <div key={index} className="text-gray-300 text-sm flex justify-between">
                        <span>{slice.name}</span>
                        <span>{(slice.size / 1024 / 1024).toFixed(2)} MB</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <p className="text-sm text-gray-500">ZIP包内包含所有切片MP4文件，每个文件都已自动添加字幕</p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href={downloadUrl}
                  download={`视频切片_${sliceMinutes}分钟_${new Date().toLocaleDateString()}.zip`}
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                >
                  <Download className="w-5 h-5 mr-2" />
                  下载MP4切片包
                </a>
                <button
                  onClick={resetProcessor}
                  className="bg-gray-600 hover:bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300"
                >
                  处理新视频
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;