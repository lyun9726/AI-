#!/usr/bin/env node
const MultiRoomWatcher = require('./multi-room-watcher.cjs');
const fs = require('fs');
const path = require('path');

// 默认配置文件
const DEFAULT_CONFIG = {
  rooms: [
    {
      url: "https://live.douyin.com/69376413096",
      name: "李佳琦"
    },
    {
      url: "https://live.douyin.com/12345678",
      name: "薇娅"
    },
    {
      url: "https://live.douyin.com/87654321",
      name: "东方甄选"
    }
  ],
  settings: {
    maxRooms: 5,
    pollInterval: 15,
    webhook: "http://localhost:8790/api/product/new"
  }
};

async function main() {
  console.log('🎬 批量监控模式启动...\n');

  // 读取配置文件
  const configFile = path.join(__dirname, 'batch-config.json');
  let config = DEFAULT_CONFIG;

  if (fs.existsSync(configFile)) {
    console.log('📂 加载配置文件:', configFile);
    try {
      const data = fs.readFileSync(configFile, 'utf8');
      config = JSON.parse(data);
    } catch (error) {
      console.error('❌ 配置文件解析失败，使用默认配置');
      // 保存默认配置作为示例
      fs.writeFileSync(configFile, JSON.stringify(DEFAULT_CONFIG, null, 2));
    }
  } else {
    console.log('📝 创建默认配置文件:', configFile);
    fs.writeFileSync(configFile, JSON.stringify(DEFAULT_CONFIG, null, 2));
  }

  // 创建监控器
  const watcher = new MultiRoomWatcher();

  // 添加所有直播间
  console.log(`📦 准备监控 ${config.rooms.length} 个直播间...\n`);
  
  for (const room of config.rooms) {
    console.log(`➕ 添加: ${room.name} - ${room.url}`);
    await watcher.addRoom(room.url, room.name);
    // 避免同时启动太多浏览器
    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  console.log('\n✅ 所有直播间已添加，开始监控...');
  console.log('📊 按 Ctrl+C 停止监控\n');

  // 定期显示状态
  setInterval(() => {
    watcher.showStatus();
  }, 60000); // 每分钟显示一次状态

  // 处理退出信号
  process.on('SIGINT', async () => {
    console.log('\n🛑 收到退出信号，正在停止...');
    await watcher.stopAll();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('\n🛑 收到终止信号，正在停止...');
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