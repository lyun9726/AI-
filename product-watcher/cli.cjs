#!/usr/bin/env node
const MultiRoomWatcher = require('./multi-room-watcher.cjs');
const readline = require('readline');
const path = require('path');

// 创建readline接口
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: '🎯 > '
});

// 创建监控器实例
const watcher = new MultiRoomWatcher();

// 显示帮助信息
function showHelp() {
  console.log(`
📦 抖音直播商品监控系统 - 多直播间版

命令列表：
  add <url> [name]     - 添加直播间监控
  remove <id>          - 移除直播间监控
  list                 - 列出所有直播间
  status               - 显示监控状态
  clear                - 清空所有监控
  restore              - 从配置恢复
  help                 - 显示帮助
  exit/quit            - 退出程序

示例：
  add https://live.douyin.com/69376413096 李佳琦
  add https://live.douyin.com/12345678 薇娅
  remove 69376413096
  list
  status
`);
}

// 处理命令
async function handleCommand(line) {
  const args = line.trim().split(/\s+/);
  const cmd = args[0]?.toLowerCase();

  switch (cmd) {
    case 'add':
      if (!args[1]) {
        console.log('❌ 请提供直播间URL');
        console.log('示例: add https://live.douyin.com/69376413096 李佳琦');
        break;
      }
      const url = args[1];
      const name = args.slice(2).join(' ') || '';
      await watcher.addRoom(url, name);
      break;

    case 'remove':
    case 'rm':
    case 'del':
      if (!args[1]) {
        console.log('❌ 请提供直播间ID');
        console.log('示例: remove 69376413096');
        break;
      }
      await watcher.removeRoom(args[1]);
      break;

    case 'list':
    case 'ls':
      const rooms = watcher.listRooms();
      if (rooms.length === 0) {
        console.log('📭 当前没有监控的直播间');
      } else {
        console.log('\n📋 监控中的直播间：');
        rooms.forEach((room, index) => {
          console.log(`${index + 1}. ${room.name} (${room.id}) - ${room.status}`);
          console.log(`   URL: ${room.url}`);
          console.log(`   统计: 接口${room.stats.apiCaptured} | DOM${room.stats.domCaptured} | 保存${room.stats.totalSaved}`);
        });
      }
      break;

    case 'status':
    case 'stat':
      watcher.showStatus();
      break;

    case 'clear':
      console.log('⚠️ 确定要清空所有监控吗？(y/n)');
      const answer = await new Promise(resolve => {
        rl.question('', resolve);
      });
      if (answer.toLowerCase() === 'y') {
        await watcher.stopAll();
        console.log('✅ 已清空所有监控');
      }
      break;

    case 'restore':
      await watcher.restoreFromConfig();
      break;

    case 'help':
    case '?':
      showHelp();
      break;

    case 'exit':
    case 'quit':
    case 'q':
      await cleanup();
      process.exit(0);
      break;

    case '':
      // 空命令，不做处理
      break;

    default:
      console.log(`❌ 未知命令: ${cmd}`);
      console.log('输入 help 查看可用命令');
  }
}

// 清理资源
async function cleanup() {
  console.log('\n👋 正在退出...');
  await watcher.stopAll();
  rl.close();
}

// 主函数
async function main() {
  console.clear();
  console.log('🎬 抖音直播商品监控系统启动');
  console.log('输入 help 查看可用命令\n');

  // 尝试从配置恢复
  await watcher.restoreFromConfig();

  // 开始交互循环
  rl.prompt();

  rl.on('line', async (line) => {
    await handleCommand(line);
    rl.prompt();
  });

  // 处理退出信号
  process.on('SIGINT', async () => {
    await cleanup();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await cleanup();
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