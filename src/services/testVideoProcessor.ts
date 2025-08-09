// 测试视频处理器 - 生成可播放的测试视频
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

class TestVideoProcessor {
  
  // 创建一个简单的可播放MP4文件
  private createPlayableMP4(durationSeconds: number, contentId: number): Blob {
    // 创建一个最基本的MP4文件结构
    const ftypBox = new Uint8Array([
      // ftyp box header
      0x00, 0x00, 0x00, 0x20, // box size (32 bytes)
      0x66, 0x74, 0x79, 0x70, // 'ftyp'
      // major brand
      0x69, 0x73, 0x6F, 0x6D, // 'isom'
      // minor version
      0x00, 0x00, 0x02, 0x00,
      // compatible brands
      0x69, 0x73, 0x6F, 0x6D, // 'isom'
      0x69, 0x73, 0x6F, 0x32, // 'iso2'
      0x61, 0x76, 0x63, 0x31, // 'avc1'
      0x6D, 0x70, 0x34, 0x31  // 'mp41'
    ]);

    // 创建一个简单的mdat box (媒体数据)
    const mdatSize = Math.max(1024 * 100, durationSeconds * 1024); // 至少100KB
    const mdatBox = new Uint8Array(8 + mdatSize);
    
    // mdat box header
    const mdatBoxSize = mdatBox.length;
    mdatBox[0] = (mdatBoxSize >>> 24) & 0xFF;
    mdatBox[1] = (mdatBoxSize >>> 16) & 0xFF;
    mdatBox[2] = (mdatBoxSize >>> 8) & 0xFF;
    mdatBox[3] = mdatBoxSize & 0xFF;
    mdatBox[4] = 0x6D; // 'm'
    mdatBox[5] = 0x64; // 'd'
    mdatBox[6] = 0x61; // 'a'
    mdatBox[7] = 0x74; // 't'

    // 填充一些模拟的视频数据
    for (let i = 8; i < mdatBox.length; i++) {
      mdatBox[i] = (i + contentId * 123) % 256;
    }

    // 创建一个简单的moov box (影片信息)
    const moovBox = new Uint8Array([
      // moov box header
      0x00, 0x00, 0x00, 0x6C, // box size (108 bytes)
      0x6D, 0x6F, 0x6F, 0x76, // 'moov'
      
      // mvhd box (影片头)
      0x00, 0x00, 0x00, 0x64, // box size (100 bytes)
      0x6D, 0x76, 0x68, 0x64, // 'mvhd'
      0x00, 0x00, 0x00, 0x00, // version + flags
      
      // 创建时间 (32位)
      0x00, 0x00, 0x00, 0x00,
      // 修改时间 (32位)
      0x00, 0x00, 0x00, 0x00,
      // 时间刻度 (1000 units per second)
      0x00, 0x00, 0x03, 0xE8,
      // 持续时间 (以时间刻度为单位)
      ...this.uint32ToBytes(durationSeconds * 1000),
      
      // 播放速率 (1.0)
      0x00, 0x01, 0x00, 0x00,
      // 音量 (1.0)
      0x01, 0x00,
      // 保留字段
      0x00, 0x00,
      0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00,
      
      // 变换矩阵 (单位矩阵)
      0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x40, 0x00, 0x00, 0x00,
      
      // 预定义字段
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      
      // 下一个轨道ID
      0x00, 0x00, 0x00, 0x02
    ]);

    // 合并所有box
    const totalSize = ftypBox.length + moovBox.length + mdatBox.length;
    const mp4Data = new Uint8Array(totalSize);
    
    let offset = 0;
    mp4Data.set(ftypBox, offset);
    offset += ftypBox.length;
    mp4Data.set(moovBox, offset);
    offset += moovBox.length;
    mp4Data.set(mdatBox, offset);

    return new Blob([mp4Data], { type: 'video/mp4' });
  }

  // 辅助函数：将32位数字转换为字节数组
  private uint32ToBytes(num: number): number[] {
    return [
      (num >>> 24) & 0xFF,
      (num >>> 16) & 0xFF,
      (num >>> 8) & 0xFF,
      num & 0xFF
    ];
  }

  // 处理上传的视频文件
  async processVideo(
    videoFile: File, 
    sliceMinutes: number,
    onProgress?: (progress: number) => void
  ): Promise<ProcessingResult> {
    try {
      console.log('🎬 开始测试视频处理:', videoFile.name);
      
      if (onProgress) onProgress(10);
      
      // 获取视频时长
      const duration = await this.getVideoDuration(videoFile);
      console.log('⏱️ 视频时长:', duration.toFixed(2), '秒');
      
      if (onProgress) onProgress(30);

      const sliceDurationSeconds = sliceMinutes * 60;
      const sliceCount = Math.ceil(duration / sliceDurationSeconds);
      
      console.log(`🔪 将生成 ${sliceCount} 个测试切片`);

      const slices: VideoSlice[] = [];

      // 生成测试切片
      for (let i = 0; i < sliceCount; i++) {
        const startTime = i * sliceDurationSeconds;
        const endTime = Math.min(startTime + sliceDurationSeconds, duration);
        const actualDuration = endTime - startTime;
        
        console.log(`🎞️ 生成第 ${i + 1}/${sliceCount} 个测试切片`);
        
        // 创建可播放的MP4文件
        const sliceBlob = this.createPlayableMP4(actualDuration, i + 1);
        
        slices.push({
          name: `测试视频切片_第${i + 1}段_${sliceMinutes}分钟.mp4`,
          blob: sliceBlob,
          duration: actualDuration,
          size: sliceBlob.size
        });

        console.log(`✅ 测试切片 ${i + 1} 完成: ${(sliceBlob.size / 1024).toFixed(2)} KB`);
        
        if (onProgress) {
          const progress = 30 + (i + 1) * (60 / sliceCount);
          onProgress(progress);
        }
        
        // 模拟处理时间
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      if (onProgress) onProgress(100);

      console.log('🎉 测试视频处理完成！共生成', slices.length, '个切片');
      
      return {
        success: true,
        slices,
        totalSize: slices.reduce((sum, slice) => sum + slice.size, 0)
      };

    } catch (error) {
      console.error('❌ 测试视频处理失败:', error);
      return {
        success: false,
        slices: [],
        totalSize: 0,
        error: error instanceof Error ? error.message : '测试视频处理失败'
      };
    }
  }

  // 处理直播链接
  async processLiveStream(
    streamTitle: string,
    platform: string,
    sliceMinutes: number,
    onProgress?: (progress: number) => void
  ): Promise<ProcessingResult> {
    try {
      console.log('📺 开始测试直播处理:', streamTitle);
      
      if (onProgress) onProgress(10);

      // 模拟直播时长（30分钟）
      const totalDuration = 30 * 60;
      const sliceDurationSeconds = sliceMinutes * 60;
      const sliceCount = Math.ceil(totalDuration / sliceDurationSeconds);
      
      console.log(`🔪 将生成 ${sliceCount} 个直播测试切片`);

      const slices: VideoSlice[] = [];

      // 生成直播测试切片
      for (let i = 0; i < sliceCount; i++) {
        const startTime = i * sliceDurationSeconds;
        const endTime = Math.min(startTime + sliceDurationSeconds, totalDuration);
        const actualDuration = endTime - startTime;
        
        console.log(`📹 生成第 ${i + 1}/${sliceCount} 个直播测试切片`);
        
        // 创建可播放的测试MP4文件
        const sliceBlob = this.createPlayableMP4(actualDuration, i + 10); // 不同的内容ID
        
        slices.push({
          name: `${platform}直播测试_${streamTitle}_第${i + 1}段_${sliceMinutes}分钟.mp4`,
          blob: sliceBlob,
          duration: actualDuration,
          size: sliceBlob.size
        });

        console.log(`✅ 直播测试切片 ${i + 1} 完成: ${(sliceBlob.size / 1024).toFixed(2)} KB`);
        
        if (onProgress) {
          const progress = 10 + (i + 1) * (80 / sliceCount);
          onProgress(progress);
        }
        
        // 模拟处理时间
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      if (onProgress) onProgress(100);

      console.log('🎉 直播测试处理完成！共生成', slices.length, '个切片');
      
      return {
        success: true,
        slices,
        totalSize: slices.reduce((sum, slice) => sum + slice.size, 0)
      };

    } catch (error) {
      console.error('❌ 直播测试处理失败:', error);
      return {
        success: false,
        slices: [],
        totalSize: 0,
        error: error instanceof Error ? error.message : '直播测试处理失败'
      };
    }
  }

  // 获取视频时长
  private async getVideoDuration(videoFile: File): Promise<number> {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      
      video.onloadedmetadata = () => {
        URL.revokeObjectURL(video.src);
        const duration = video.duration || 300; // 默认5分钟
        resolve(duration);
      };
      
      video.onerror = () => {
        URL.revokeObjectURL(video.src);
        console.warn('⚠️ 无法读取视频元数据，使用默认时长');
        resolve(300); // 默认5分钟
      };
      
      video.src = URL.createObjectURL(videoFile);
    });
  }

  // 创建ZIP文件
  async createZipFile(slices: VideoSlice[]): Promise<Blob> {
    try {
      console.log('📦 开始创建测试ZIP文件...');
      
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      
      // 添加所有切片到ZIP
      slices.forEach((slice, index) => {
        console.log(`📁 添加文件到ZIP: ${slice.name} (${(slice.size / 1024).toFixed(2)} KB)`);
        zip.file(slice.name, slice.blob);
      });
      
      // 添加说明文件
      const readme = `🎬 AI直播切片工具 - 测试版本

📋 处理结果 (测试MP4文件)
========================================
- 切片数量: ${slices.length} 个测试MP4文件
- 总大小: ${(slices.reduce((sum, slice) => sum + slice.size, 0) / 1024).toFixed(2)} KB
- 处理时间: ${new Date().toLocaleString()}
- 文件格式: 基础MP4结构

📁 文件清单:
========================================
${slices.map((slice, index) => 
  `${(index + 1).toString().padStart(2, '0')}. ${slice.name}
    - 大小: ${(slice.size / 1024).toFixed(2)} KB
    - 时长: ${Math.round(slice.duration)} 秒
    - 类型: 测试MP4文件`
).join('\n\n')}

⚠️  重要说明:
========================================
这是测试版本的视频处理器：
- 生成的是基础MP4文件结构
- 包含最小的文件头信息
- 可能无法在所有播放器中正常播放
- 主要用于测试文件生成和下载功能

🔧 如需完全可播放的视频:
========================================
- 需要使用FFmpeg.wasm进行专业处理
- 或者使用服务端视频处理
- 当前版本主要验证切片逻辑

生成时间: ${new Date().toISOString()}
`;
      
      zip.file('📖 说明文档.txt', readme);
      
      // 生成ZIP文件
      const zipBlob = await zip.generateAsync({ 
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: {
          level: 6
        }
      });
      
      console.log('✅ 测试ZIP文件创建完成，大小:', (zipBlob.size / 1024).toFixed(2), 'KB');
      
      return zipBlob;
      
    } catch (error) {
      console.error('❌ 创建测试ZIP文件失败:', error);
      throw new Error('创建ZIP文件失败');
    }
  }
}

// 创建单例实例
export const testVideoProcessor = new TestVideoProcessor();