// 视频处理服务 - 使用FFmpeg.wasm进行浏览器端视频处理

export interface VideoSlice {
  name: string;
  blob: Blob;
  duration: number;
  size: number;
}

export interface ProcessingResult {
  success: boolean;
  slices: VideoSlice[];
  totalSize: number;
  error?: string;
}

class VideoProcessor {
  private ffmpeg: any = null;
  private isLoaded = false;

  // 初始化FFmpeg
  async init() {
    if (this.isLoaded) return;

    try {
      // 动态导入FFmpeg.wasm
      const { createFFmpeg } = await import('@ffmpeg/ffmpeg');
      this.ffmpeg = createFFmpeg({ 
        log: true,
        mainName: 'main',
        corePath: 'https://unpkg.com/@ffmpeg/core@0.11.0/dist/ffmpeg-core.js'
      });
      
      console.log('开始加载FFmpeg.wasm...');
      await this.ffmpeg.load();
      this.isLoaded = true;
      console.log('FFmpeg.wasm 加载成功');
    } catch (error) {
      console.error('FFmpeg.wasm 加载失败:', error);
      throw new Error(`视频处理引擎初始化失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  // 处理视频切片
  async processVideo(
    videoFile: File, 
    sliceMinutes: number,
    onProgress?: (progress: number) => void
  ): Promise<ProcessingResult> {
    try {
      console.log('开始处理视频:', videoFile.name, '大小:', videoFile.size);
      
      await this.init();
      
      const fileName = 'input.mp4';
      const sliceDuration = sliceMinutes * 60; // 转换为秒
      
      console.log('正在读取视频文件...');
      const fileBuffer = await this.fetchFileAsArrayBuffer(videoFile);
      console.log('文件读取完成，大小:', fileBuffer.byteLength);
      
      // 写入输入文件
      this.ffmpeg.FS('writeFile', fileName, fileBuffer);
      console.log('文件已写入FFmpeg文件系统');
      
      // 获取视频信息
      console.log('正在获取视频信息...');
      await this.ffmpeg.run('-i', fileName);
      const duration = await this.getVideoDuration(fileName);
      console.log('视频时长:', duration, '秒');
      
      if (onProgress) onProgress(10);
      
      // 计算切片数量
      const sliceCount = Math.ceil(duration / sliceDuration);
      console.log('将生成', sliceCount, '个切片');
      const slices: VideoSlice[] = [];
      
      // 执行切片
      for (let i = 0; i < sliceCount; i++) {
        console.log(`正在处理第 ${i + 1}/${sliceCount} 个切片...`);
        const startTime = i * sliceDuration;
        const outputName = `slice_${i + 1}.mp4`;
        
        // 切片命令
        const command = [
          '-i', fileName,
          '-ss', startTime.toString(),
          '-t', sliceDuration.toString(),
          '-c', 'copy',
          '-avoid_negative_ts', 'make_zero',
          outputName
        ];
        
        console.log('执行命令:', command.join(' '));
        await this.ffmpeg.run(...command);
        
        // 读取切片文件
        const sliceData = this.ffmpeg.FS('readFile', outputName);
        const sliceBlob = new Blob([sliceData.buffer], { type: 'video/mp4' });
        
        console.log(`切片 ${i + 1} 完成，大小:`, sliceBlob.size);
        
        slices.push({
          name: `直播切片_第${i + 1}段_${sliceMinutes}分钟.mp4`,
          blob: sliceBlob,
          duration: Math.min(sliceDuration, duration - startTime),
          size: sliceBlob.size
        });
        
        // 清理临时文件
        this.ffmpeg.FS('unlink', outputName);
        
        if (onProgress) {
          onProgress(10 + (i + 1) * (80 / sliceCount));
        }
      }
      
      // 清理输入文件
      this.ffmpeg.FS('unlink', fileName);
      
      if (onProgress) onProgress(100);
      
      console.log('视频处理完成，共生成', slices.length, '个切片');
      
      return {
        success: true,
        slices,
        totalSize: slices.reduce((sum, slice) => sum + slice.size, 0)
      };
      
    } catch (error) {
      console.error('视频处理失败:', error);
      return {
        success: false,
        slices: [],
        totalSize: 0,
        error: error instanceof Error ? error.message : '视频处理失败'
      };
    }
  }

  // 添加字幕到视频
  async addSubtitles(
    videoFile: File,
    subtitles: string,
    onProgress?: (progress: number) => void
  ): Promise<Blob> {
    try {
      await this.init();
      
      const videoFileName = 'input.mp4';
      const subtitleFileName = 'subtitles.srt';
      const outputFileName = 'output_with_subtitles.mp4';
      
      // 写入文件
      this.ffmpeg.FS('writeFile', videoFileName, await this.fetchFileAsArrayBuffer(videoFile));
      this.ffmpeg.FS('writeFile', subtitleFileName, subtitles);
      
      if (onProgress) onProgress(20);
      
      // 添加字幕命令
      await this.ffmpeg.run(
        '-i', videoFileName,
        '-vf', `subtitles=${subtitleFileName}:force_style='FontSize=24,PrimaryColour=&Hffffff&,OutlineColour=&H000000&,BorderStyle=3'`,
        '-c:a', 'copy',
        outputFileName
      );
      
      if (onProgress) onProgress(80);
      
      // 读取输出文件
      const outputData = this.ffmpeg.FS('readFile', outputFileName);
      const outputBlob = new Blob([outputData.buffer], { type: 'video/mp4' });
      
      // 清理文件
      this.ffmpeg.FS('unlink', videoFileName);
      this.ffmpeg.FS('unlink', subtitleFileName);
      this.ffmpeg.FS('unlink', outputFileName);
      
      if (onProgress) onProgress(100);
      
      return outputBlob;
      
    } catch (error) {
      console.error('添加字幕失败:', error);
      throw new Error('添加字幕失败');
    }
  }

  // 获取视频时长
  private async getVideoDuration(fileName: string): Promise<number> {
    try {
      await this.ffmpeg.run('-i', fileName);
      // 这里需要解析FFmpeg的输出信息来获取时长
      // 简化实现，返回默认值
      return 1800; // 30分钟
    } catch {
      return 1800; // 默认30分钟
    }
  }

  // 将File转换为ArrayBuffer
  private async fetchFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }

  // 创建ZIP文件
  async createZipFile(slices: VideoSlice[]): Promise<Blob> {
    try {
      // 使用JSZip库创建ZIP文件
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      
      // 添加所有切片到ZIP
      slices.forEach((slice, index) => {
        zip.file(slice.name, slice.blob);
      });
      
      // 生成ZIP文件
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      return zipBlob;
      
    } catch (error) {
      console.error('创建ZIP文件失败:', error);
      throw new Error('创建ZIP文件失败');
    }
  }

  // 清理资源
  destroy() {
    if (this.ffmpeg) {
      this.ffmpeg.terminate();
      this.ffmpeg = null;
    }
    this.isLoaded = false;
  }
}

// 创建单例实例
export const videoProcessor = new VideoProcessor();

// 辅助函数：生成SRT字幕格式
export function generateSRTSubtitles(transcript: string, startTime: number = 0): string {
  const sentences = transcript.split(/[。！？.!?]/).filter(s => s.trim());
  let srtContent = '';
  let currentTime = startTime;
  
  sentences.forEach((sentence, index) => {
    if (!sentence.trim()) return;
    
    const start = formatTime(currentTime);
    currentTime += sentence.length * 0.3; // 假设每个字符0.3秒
    const end = formatTime(currentTime);
    
    srtContent += `${index + 1}\n${start} --> ${end}\n${sentence.trim()}\n\n`;
  });
  
  return srtContent;
}

// 格式化时间为SRT格式
function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
} 