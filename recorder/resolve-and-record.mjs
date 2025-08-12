#!/usr/bin/env node

import { spawn } from 'child_process';
import { createWriteStream } from 'fs';
import { join } from 'path';

// 获取命令行参数
const [url, outDir, durationSec = '3600', name = 'recording'] = process.argv.slice(2);

if (!url || !outDir) {
    console.error('Usage: node resolve-and-record.mjs <url> <outDir> [durationSec] [name]');
    process.exit(1);
}

// 生成输出文件名
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const outputFile = join(outDir, `${name}-${timestamp}.mp4`);

console.log(`[Recorder] 开始录制`);
console.log(`  源: ${url}`);
console.log(`  输出: ${outputFile}`);
console.log(`  时长: ${durationSec} 秒`);

// 构建 ffmpeg 命令
const ffmpegArgs = [
    '-i', url,
    '-t', durationSec,
    '-c', 'copy',  // 直接复制流，不重新编码
    '-movflags', '+faststart',  // 优化 MP4 文件
    '-y',  // 覆盖已存在的文件
    outputFile
];

// 对于某些直播流，可能需要特殊参数
if (url.includes('.m3u8') || url.includes('douyin')) {
    // HLS 流或抖音直播
    ffmpegArgs.unshift(
        '-user_agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        '-referer', url,
        '-reconnect', '1',
        '-reconnect_streamed', '1',
        '-reconnect_delay_max', '5'
    );
}

// 启动 ffmpeg
const ffmpeg = spawn('ffmpeg', ffmpegArgs, {
    stdio: ['ignore', 'pipe', 'pipe']
});

// 处理输出
ffmpeg.stdout.on('data', (data) => {
    process.stdout.write(data);
});

ffmpeg.stderr.on('data', (data) => {
    process.stderr.write(data);
});

ffmpeg.on('close', (code) => {
    if (code === 0) {
        console.log(`[Recorder] 录制完成: ${outputFile}`);
    } else {
        console.error(`[Recorder] 录制失败，退出码: ${code}`);
    }
    process.exit(code);
});

ffmpeg.on('error', (err) => {
    console.error(`[Recorder] 启动 ffmpeg 失败:`, err);
    process.exit(1);
});

// 处理中断信号
process.on('SIGINT', () => {
    console.log('\n[Recorder] 收到中断信号，停止录制...');
    ffmpeg.kill('SIGTERM');
});

process.on('SIGTERM', () => {
    console.log('\n[Recorder] 收到终止信号，停止录制...');
    ffmpeg.kill('SIGTERM');
});