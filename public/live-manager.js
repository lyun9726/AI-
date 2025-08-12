// 直播源管理工具前端逻辑

// 配置
const CONFIG = {
    // 默认输出目录，可以修改为绝对路径如 'E:\\Saves\\Douyin'
    defaultOutDir: 'recordings/douyin',
    defaultDuration: 3600, // 默认录制时长（秒）
    apiBase: '' // 同端口，留空即可
};

// 全局状态
let recordingTasks = new Map();
let autoRefreshInterval = null;

// 工具函数
function showModal(title, message, isError = false) {
    const modal = document.getElementById('messageModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalMessage = document.getElementById('modalMessage');
    
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    modalTitle.style.color = isError ? '#f56565' : '#333';
    
    modal.style.display = 'flex';
    console.log(`[Modal] ${title}: ${message}`);
}

function closeModal() {
    document.getElementById('messageModal').style.display = 'none';
}

// API 调用函数
async function apiCall(url, options = {}) {
    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });
        
        const data = await response.json();
        console.log(`[API] ${options.method || 'GET'} ${url}:`, data);
        
        if (!response.ok) {
            throw new Error(data.error || `HTTP ${response.status}`);
        }
        
        return data;
    } catch (error) {
        console.error(`[API Error] ${url}:`, error);
        throw error;
    }
}

// 开始录制单个源
async function startRecording(name, url, outDir = CONFIG.defaultOutDir, durationSec = CONFIG.defaultDuration) {
    try {
        const result = await apiCall('/api/record/start', {
            method: 'POST',
            body: JSON.stringify({
                name,
                url,
                durationSec,
                outDir
            })
        });
        
        console.log(`[录制开始] ${name}:`, result);
        return result;
    } catch (error) {
        console.error(`[录制失败] ${name}:`, error);
        throw error;
    }
}

// 停止录制
async function stopRecording(name) {
    try {
        const result = await apiCall('/api/record/stop', {
            method: 'POST',
            body: JSON.stringify({ name })
        });
        
        console.log(`[录制停止] ${name}:`, result);
        return result;
    } catch (error) {
        console.error(`[停止失败] ${name}:`, error);
        throw error;
    }
}

// 获取录制状态
async function getRecordingStatus() {
    try {
        const result = await apiCall('/api/record/status');
        console.log('[状态查询]:', result);
        return result.tasks || [];
    } catch (error) {
        console.error('[状态查询失败]:', error);
        return [];
    }
}

// 批量开始录制
async function startBatchRecording() {
    const cards = document.querySelectorAll('.source-card[data-enabled="true"]');
    
    if (cards.length === 0) {
        showModal('提示', '没有启用的直播源', true);
        return;
    }
    
    let successCount = 0;
    let failCount = 0;
    const errors = [];
    
    for (const card of cards) {
        const name = card.dataset.name || card.querySelector('.source-title')?.textContent;
        const url = card.dataset.url || card.querySelector('.source-url')?.textContent;
        
        if (!name || !url) {
            console.warn('[跳过] 无法获取源信息:', card);
            continue;
        }
        
        try {
            await startRecording(name, url, CONFIG.defaultOutDir, CONFIG.defaultDuration);
            successCount++;
            
            // 更新卡片状态
            const statusEl = card.querySelector('.source-status');
            if (statusEl) {
                statusEl.className = 'source-status status-recording';
                statusEl.textContent = '录制中';
            }
        } catch (error) {
            failCount++;
            errors.push(`${name}: ${error.message}`);
        }
    }
    
    // 显示结果
    if (successCount > 0 && failCount === 0) {
        showModal('成功', `已开始录制 ${successCount} 个源`);
    } else if (successCount > 0 && failCount > 0) {
        showModal('部分成功', `成功: ${successCount}, 失败: ${failCount}\n${errors.join('\n')}`, true);
    } else {
        showModal('失败', `所有源录制失败\n${errors.join('\n')}`, true);
    }
    
    // 刷新状态
    await refreshStatus();
}

// 停止所有录制
async function stopAllRecording() {
    try {
        const tasks = await getRecordingStatus();
        
        if (tasks.length === 0) {
            showModal('提示', '当前没有录制任务');
            return;
        }
        
        let successCount = 0;
        let failCount = 0;
        
        for (const task of tasks) {
            try {
                await stopRecording(task.name);
                successCount++;
            } catch (error) {
                failCount++;
                console.error(`停止失败 ${task.name}:`, error);
            }
        }
        
        if (failCount === 0) {
            showModal('成功', `已停止 ${successCount} 个录制任务`);
        } else {
            showModal('部分成功', `成功停止: ${successCount}, 失败: ${failCount}`, true);
        }
        
        // 重置所有卡片状态
        document.querySelectorAll('.source-card').forEach(card => {
            const statusEl = card.querySelector('.source-status');
            if (statusEl && statusEl.classList.contains('status-recording')) {
                const isEnabled = card.dataset.enabled === 'true';
                statusEl.className = `source-status ${isEnabled ? 'status-enabled' : 'status-disabled'}`;
                statusEl.textContent = isEnabled ? '已启用' : '已禁用';
            }
        });
        
        await refreshStatus();
    } catch (error) {
        showModal('错误', `停止失败: ${error.message}`, true);
    }
}

// 刷新状态显示
async function refreshStatus() {
    try {
        const tasks = await getRecordingStatus();
        
        // 更新录制数量
        document.getElementById('recordingCount').textContent = tasks.length;
        document.getElementById('statusText').textContent = tasks.length > 0 ? '录制中' : '就绪';
        
        // 更新任务列表
        const tasksList = document.getElementById('tasksList');
        
        if (tasks.length === 0) {
            tasksList.innerHTML = '<div style="text-align: center; color: #718096; padding: 20px;">暂无录制任务</div>';
        } else {
            tasksList.innerHTML = tasks.map(task => {
                const elapsedMin = Math.floor(task.elapsedSec / 60);
                const elapsedSec = task.elapsedSec % 60;
                return `
                    <div class="task-item">
                        <div class="task-name">${task.name} (PID: ${task.pid})</div>
                        <div class="task-details">
                            URL: ${task.url}<br>
                            输出: ${task.outDir}<br>
                            已录制: ${elapsedMin}分${elapsedSec}秒 / ${Math.floor(task.durationSec / 60)}分钟<br>
                            日志: ${task.logFile}
                        </div>
                    </div>
                `;
            }).join('');
        }
        
        // 更新卡片状态
        const recordingNames = new Set(tasks.map(t => t.name));
        document.querySelectorAll('.source-card').forEach(card => {
            const name = card.dataset.name || card.querySelector('.source-title')?.textContent;
            const statusEl = card.querySelector('.source-status');
            
            if (statusEl && name) {
                if (recordingNames.has(name)) {
                    statusEl.className = 'source-status status-recording';
                    statusEl.textContent = '录制中';
                } else if (card.dataset.enabled === 'true') {
                    statusEl.className = 'source-status status-enabled';
                    statusEl.textContent = '已启用';
                }
            }
        });
        
    } catch (error) {
        console.error('刷新状态失败:', error);
    }
}

// 添加新源（示例）
function addSource() {
    const name = prompt('请输入源名称:');
    if (!name) return;
    
    const url = prompt('请输入源URL:');
    if (!url) return;
    
    const duration = prompt('请输入录制时长（秒）:', '3600');
    const outDir = prompt('请输入输出目录:', CONFIG.defaultOutDir);
    
    // 创建新卡片
    const card = document.createElement('div');
    card.className = 'source-card';
    card.dataset.name = name;
    card.dataset.url = url;
    card.dataset.enabled = 'true';
    
    card.innerHTML = `
        <div class="source-header">
            <span class="source-title">${name}</span>
            <span class="source-status status-enabled">已启用</span>
        </div>
        <div class="source-url">${url}</div>
        <div class="source-info">
            <span>时长: ${duration}秒</span>
            <span>输出: ${outDir}</span>
        </div>
    `;
    
    document.getElementById('sourcesGrid').appendChild(card);
    showModal('成功', `已添加源: ${name}`);
}

// 初始化
function init() {
    // 绑定按钮事件
    document.getElementById('btnStartAll').addEventListener('click', startBatchRecording);
    document.getElementById('btnStopAll').addEventListener('click', stopAllRecording);
    document.getElementById('btnRefreshStatus').addEventListener('click', refreshStatus);
    document.getElementById('btnAddSource').addEventListener('click', addSource);
    
    // 点击模态框背景关闭
    document.getElementById('messageModal').addEventListener('click', (e) => {
        if (e.target.id === 'messageModal') {
            closeModal();
        }
    });
    
    // 初始刷新状态
    refreshStatus();
    
    // 自动刷新（每5秒）
    autoRefreshInterval = setInterval(refreshStatus, 5000);
    
    console.log('[Live Manager] 初始化完成');
    console.log('[配置] 默认输出目录:', CONFIG.defaultOutDir);
    console.log('[配置] 默认录制时长:', CONFIG.defaultDuration, '秒');
}

// 页面加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// 导出配置供外部修改
window.LIVE_MANAGER_CONFIG = CONFIG;