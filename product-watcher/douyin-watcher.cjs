#!/usr/bin/env node
const MultiRoomWatcher = require('./multi-room-watcher.cjs');

async function main() {
  // 解析命令行参数
  const args = process.argv.slice(2);
  let liveUrl = null;
  
  // 优先使用命令行参数
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--url' && args[i + 1]) {
      liveUrl = args[i + 1];
      break;
    }
    // 也支持 --url=xxx 格式
    if (args[i].startsWith('--url=')) {
      liveUrl = args[i].substring(6);
      break;
    }
  }
  
  // 如果没有命令行参数，才使用环境变量
  if (!liveUrl) {
    require('dotenv').config({ path: require('path').join(__dirname, '.env') });
    liveUrl = process.env.LIVE_URL;
  }
  
  if (!liveUrl) {
    console.error('❌ 请提供直播间URL');
    console.log('\n使用方法：');
    console.log('  npm run watch:douyin -- --url="https://live.douyin.com/415069212308"');
    console.log('  或');
    console.log('  node product-watcher/douyin-watcher.cjs --url="https://live.douyin.com/415069212308"');
    process.exit(1);
  }
  
  console.log('🎬 单直播间监控模式');
  console.log('📺 监控URL:', liveUrl);
  console.log('');
  
  // 使用多直播间监控器，但只添加一个
  const watcher = new MultiRoomWatcher();
  
  // 提取直播间名称（从URL提取ID）
  const roomId = liveUrl.match(/(\d+)/)?.[1] || 'unknown';
  const roomName = `直播间_${roomId}`;
  
  // 添加直播间
  const success = await watcher.addRoom(liveUrl, roomName);
  
  if (!success) {
    console.error('❌ 添加直播间失败');
    process.exit(1);
  }
  
  console.log('\n✅ 监控已启动');
  console.log('📊 按 Ctrl+C 停止监控\n');
  
  // 定期显示状态
  setInterval(() => {
    watcher.showStatus();
  }, 30000); // 每30秒显示一次
  
  // 立即显示一次状态
  setTimeout(() => {
    watcher.showStatus();
  }, 5000);
  
  // 处理退出信号
  process.on('SIGINT', async () => {
    console.log('\n🛑 正在停止监控...');
    await watcher.stopAll();
    process.exit(0);
  });
  
  process.on('SIGTERM', async () => {
    console.log('\n🛑 正在停止监控...');
    await watcher.stopAll();
    process.exit(0);
  });
}

// 启动
if (require.main === module) {
  main().catch(error => {
    console.error('❌ 程序异常:', error.message);
    process.exit(1);
  });
}