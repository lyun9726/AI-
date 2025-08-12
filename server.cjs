const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

const app = express();
const PORT = process.env.PORT || 8790;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态资源服务
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname)); // 服务项目根目录

// 录制任务管理
const recordMap = new Map(); // name -> {child, pid, url, outDir, startAt, durationSec, logFile}

// 确保目录存在
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// 生成日志文件路径
function getLogFile(name) {
  const debugDir = path.join(__dirname, 'debug');
  ensureDir(debugDir);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return path.join(debugDir, `record-${name}-${timestamp}.log`);
}

// 首页重定向
app.get('/', (req, res) => {
  const liveManagerPath = path.join(__dirname, 'public', 'live-manager.html');
  if (fs.existsSync(liveManagerPath)) {
    res.redirect('/live-manager.html');
  } else {
    res.send('直播切片服务已启动');
  }
});

// API: ping
app.get('/api/ping', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// API: 开始录制
app.post('/api/record/start', async (req, res) => {
  const { name, url, durationSec = 3600, outDir = 'recordings/douyin' } = req.body;

  if (!name || !url) {
    return res.status(400).json({ error: '缺少必要参数: name, url' });
  }

  // 检查是否已在录制
  if (recordMap.has(name)) {
    const task = recordMap.get(name);
    if (task.child && !task.child.killed) {
      return res.status(409).json({ error: `任务 ${name} 已在录制中` });
    }
  }

  // 处理输出目录
  const resolvedOutDir = path.isAbsolute(outDir) ? outDir : path.join(__dirname, outDir);
  ensureDir(resolvedOutDir);

  // 生成日志文件
  const logFile = getLogFile(name);
  const logStream = fs.createWriteStream(logFile, { flags: 'a' });

  try {
    // 调用录制模块
    const recorderPath = path.join(__dirname, 'recorder', 'resolve-and-record.mjs');
    
    // 如果录制模块不存在，使用 ffmpeg 直接录制
    let child;
    const startAt = new Date().toISOString();
    
    if (fs.existsSync(recorderPath)) {
      // 使用录制模块
      child = spawn('node', [recorderPath, url, resolvedOutDir, String(durationSec), name], {
        detached: false,
        stdio: ['ignore', 'pipe', 'pipe']
      });
    } else {
      // 直接使用 ffmpeg
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const outputFile = path.join(resolvedOutDir, `${name}-${timestamp}.mp4`);
      
      child = spawn('ffmpeg', [
        '-i', url,
        '-t', String(durationSec),
        '-c', 'copy',
        '-y',
        outputFile
      ], {
        detached: false,
        stdio: ['ignore', 'pipe', 'pipe']
      });
    }

    // 日志记录
    logStream.write(`[${startAt}] 开始录制: ${name}\n`);
    logStream.write(`URL: ${url}\n`);
    logStream.write(`输出目录: ${resolvedOutDir}\n`);
    logStream.write(`时长: ${durationSec} 秒\n`);
    logStream.write(`PID: ${child.pid}\n`);
    logStream.write('---\n');

    // 捕获输出
    child.stdout.on('data', (data) => {
      const text = data.toString();
      logStream.write(`[STDOUT] ${text}`);
      console.log(`[${name}] ${text}`);
    });

    child.stderr.on('data', (data) => {
      const text = data.toString();
      logStream.write(`[STDERR] ${text}`);
      console.error(`[${name}] ${text}`);
    });

    child.on('close', (code) => {
      const endAt = new Date().toISOString();
      logStream.write(`[${endAt}] 录制结束，退出码: ${code}\n`);
      logStream.end();
      
      const task = recordMap.get(name);
      if (task) {
        task.alive = false;
      }
    });

    child.on('error', (err) => {
      logStream.write(`[ERROR] ${err.message}\n`);
      logStream.end();
    });

    // 保存任务信息
    recordMap.set(name, {
      child,
      pid: child.pid,
      url,
      outDir: resolvedOutDir,
      startAt,
      durationSec,
      logFile,
      alive: true
    });

    res.json({
      success: true,
      message: `开始录制 ${name}`,
      pid: child.pid,
      logFile
    });

  } catch (error) {
    logStream.write(`[ERROR] 启动失败: ${error.message}\n`);
    logStream.end();
    res.status(500).json({ error: `启动录制失败: ${error.message}` });
  }
});

// API: 停止录制
app.post('/api/record/stop', (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: '缺少参数: name' });
  }

  const task = recordMap.get(name);
  if (!task) {
    return res.status(404).json({ error: `未找到任务: ${name}` });
  }

  if (task.child && !task.child.killed) {
    try {
      // Windows 兼容性处理
      if (process.platform === 'win32') {
        spawn('taskkill', ['/pid', task.pid, '/f', '/t']);
      } else {
        task.child.kill('SIGTERM');
      }
      
      task.alive = false;
      res.json({ success: true, message: `已停止录制 ${name}` });
    } catch (error) {
      res.status(500).json({ error: `停止失败: ${error.message}` });
    }
  } else {
    res.json({ success: true, message: `任务 ${name} 已经停止` });
  }
});

// API: 查询状态
app.get('/api/record/status', (req, res) => {
  const tasks = [];
  
  for (const [name, task] of recordMap.entries()) {
    if (task.alive && task.child && !task.child.killed) {
      const now = new Date();
      const start = new Date(task.startAt);
      const elapsedSec = Math.floor((now - start) / 1000);
      
      tasks.push({
        name,
        pid: task.pid,
        url: task.url,
        outDir: task.outDir,
        startAt: task.startAt,
        durationSec: task.durationSec,
        elapsedSec,
        logFile: task.logFile,
        alive: task.alive
      });
    }
  }
  
  res.json({ tasks });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 直播切片服务已启动: http://localhost:${PORT}`);
  console.log(`📁 静态资源目录: ${path.join(__dirname, 'public')}`);
  console.log(`📝 日志目录: ${path.join(__dirname, 'debug')}`);
  console.log(`🎬 默认录制目录: ${path.join(__dirname, 'recordings/douyin')}`);
});

// 优雅退出
process.on('SIGINT', () => {
  console.log('\n正在停止所有录制...');
  
  for (const [name, task] of recordMap.entries()) {
    if (task.child && !task.child.killed) {
      console.log(`停止录制: ${name}`);
      if (process.platform === 'win32') {
        spawn('taskkill', ['/pid', task.pid, '/f', '/t']);
      } else {
        task.child.kill('SIGTERM');
      }
    }
  }
  
  setTimeout(() => {
    process.exit(0);
  }, 2000);
});