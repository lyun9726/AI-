const { launchChrome, setupAntiDetection } = require('./lib/chrome.cjs');
const ProductStore = require('./lib/store.cjs');
const WebhookClient = require('./lib/webhook.cjs');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

class MultiRoomWatcher {
  constructor() {
    this.store = new ProductStore();
    this.webhook = new WebhookClient(process.env.WEBHOOK || 'http://localhost:8790/api/product/new');
    this.rooms = new Map(); // roomId -> {browser, page, stats, info}
    this.configFile = path.join(__dirname, 'rooms.json');
    this.pollInterval = (process.env.POLL_DOM_SEC || 15) * 1000;
    this.maxRooms = 5; // 最多同时监控5个直播间
  }

  /** 加载配置 */
  loadConfig() {
    try {
      if (fs.existsSync(this.configFile)) {
        const data = fs.readFileSync(this.configFile, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('❌ 加载配置失败:', error.message);
    }
    return { rooms: [] };
  }

  /** 保存配置 */
  saveConfig() {
    try {
      const config = {
        rooms: Array.from(this.rooms.values()).map(r => ({
          id: r.id,
          url: r.url,
          name: r.name,
          status: r.status,
          addedAt: r.addedAt
        }))
      };
      fs.writeFileSync(this.configFile, JSON.stringify(config, null, 2));
    } catch (error) {
      console.error('❌ 保存配置失败:', error.message);
    }
  }

  /** 添加直播间 */
  async addRoom(url, name = '') {
    // 提取房间ID
    const roomId = this.extractRoomId(url);
    if (!roomId) {
      console.error('❌ 无效的直播间URL:', url);
      return false;
    }

    // 检查是否已存在
    if (this.rooms.has(roomId)) {
      console.log(`⚠️ 直播间 ${roomId} 已在监控中`);
      return false;
    }

    // 检查数量限制
    if (this.rooms.size >= this.maxRooms) {
      console.error(`❌ 已达到最大监控数量 (${this.maxRooms}个)`);
      return false;
    }

    console.log(`➕ 添加直播间: ${name || roomId}`);

    try {
      // 启动独立浏览器实例
      const browser = await launchChrome({
        headless: true, // 多个窗口时使用无头模式
        userDataDir: path.join(__dirname, 'profiles', roomId)
      });
      const page = await browser.newPage();
      await setupAntiDetection(page);

      // 存储房间信息
      const roomInfo = {
        id: roomId,
        url: url,
        name: name || `直播间_${roomId}`,
        status: 'starting',
        addedAt: new Date().toISOString(),
        browser: browser,
        page: page,
        stats: {
          apiCaptured: 0,
          domCaptured: 0,
          totalSaved: 0,
          webhookSent: 0
        }
      };

      this.rooms.set(roomId, roomInfo);

      // 设置网络监听
      this.setupNetworkListener(roomId);

      // 访问直播间
      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      roomInfo.status = 'active';
      console.log(`✅ 直播间 ${name || roomId} 开始监控`);

      // 启动监控循环
      this.startRoomMonitoring(roomId);

      // 保存配置
      this.saveConfig();

      return true;

    } catch (error) {
      console.error(`❌ 添加直播间失败:`, error.message);
      await this.removeRoom(roomId);
      return false;
    }
  }

  /** 移除直播间 */
  async removeRoom(roomId) {
    const room = this.rooms.get(roomId);
    if (!room) {
      console.log(`⚠️ 直播间 ${roomId} 不存在`);
      return false;
    }

    console.log(`➖ 移除直播间: ${room.name}`);

    try {
      room.status = 'stopping';
      
      if (room.browser) {
        await room.browser.close();
      }

      this.rooms.delete(roomId);
      this.saveConfig();

      console.log(`✅ 直播间 ${room.name} 已停止监控`);
      return true;

    } catch (error) {
      console.error(`❌ 移除直播间失败:`, error.message);
      return false;
    }
  }

  /** 提取房间ID */
  extractRoomId(url) {
    const match = url.match(/live\.douyin\.com\/(\d+)/);
    return match ? match[1] : null;
  }

  /** 设置网络监听 */
  setupNetworkListener(roomId) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    room.page.on('response', async (response) => {
      try {
        const url = response.url();
        
        if (url.includes('/webcast/product/') || 
            url.includes('/aweme/v1/web/product/') ||
            url.includes('/api/product/')) {
          
          const contentType = response.headers()['content-type'] || '';
          if (contentType.includes('application/json')) {
            const responseData = await response.json().catch(() => null);
            if (responseData) {
              const products = this.extractProductsFromApi(responseData);
              if (products.length > 0) {
                room.stats.apiCaptured += products.length;
                console.log(`📦 [${room.name}] 接口捕获 ${products.length} 个商品`);
                await this.processProducts(roomId, products, 'api');
              }
            }
          }
        }
      } catch (error) {
        // 忽略错误
      }
    });
  }

  /** 从API提取商品 */
  extractProductsFromApi(responseData) {
    let products = [];
    
    if (responseData.data && Array.isArray(responseData.data)) {
      products = responseData.data;
    } else if (responseData.data && responseData.data.products) {
      products = responseData.data.products;
    } else if (responseData.products) {
      products = responseData.products;
    } else if (responseData.items) {
      products = responseData.items;
    } else if (Array.isArray(responseData)) {
      products = responseData;
    }
    
    return products;
  }

  /** 监控单个直播间 */
  async startRoomMonitoring(roomId) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    const monitorLoop = async () => {
      if (!this.rooms.has(roomId) || room.status !== 'active') {
        return;
      }

      try {
        // DOM抓取
        const products = await room.page.evaluate(() => {
          const products = [];
          const selectors = [
            '[data-e2e="product-item"]',
            '.product-item',
            '.product-card',
            '[class*="product"]',
            '[class*="goods"]'
          ];
          
          for (const selector of selectors) {
            const elements = document.querySelectorAll(selector);
            for (const element of elements) {
              try {
                const title = element.querySelector('[class*="title"], [class*="name"]')?.textContent?.trim();
                if (title) {
                  products.push({
                    title: title,
                    price: element.querySelector('[class*="price"]')?.textContent?.trim() || '',
                    image_url: element.querySelector('img')?.src || ''
                  });
                }
              } catch (e) {}
            }
          }
          return products;
        });

        if (products.length > 0) {
          room.stats.domCaptured += products.length;
          console.log(`🪄 [${room.name}] DOM捕获 ${products.length} 个商品`);
          await this.processProducts(roomId, products, 'dom');
        }

      } catch (error) {
        console.error(`❌ [${room.name}] 监控错误:`, error.message);
      }

      // 继续循环
      setTimeout(() => monitorLoop(), this.pollInterval);
    };

    // 启动循环
    monitorLoop();
  }

  /** 处理商品数据 */
  async processProducts(roomId, rawProducts, source) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    try {
      const liveRoomInfo = {
        room_id: roomId,
        room_name: room.name,
        room_url: room.url
      };

      // 保存到数据库
      const saveResult = this.store.saveProducts(rawProducts, liveRoomInfo);
      
      if (saveResult.newCount > 0) {
        room.stats.totalSaved += saveResult.newCount;
        console.log(`💾 [${room.name}] 保存 ${saveResult.newCount} 个新商品`);
        
        // 发送Webhook
        const newProducts = saveResult.results
          .filter(r => r.isNew && r.product)
          .map(r => r.product);
        
        if (newProducts.length > 0) {
          const webhookResult = await this.webhook.sendWebhooks(newProducts, liveRoomInfo);
          room.stats.webhookSent += webhookResult.successCount;
        }
      }
      
    } catch (error) {
      console.error(`❌ [${room.name}] 处理商品失败:`, error.message);
    }
  }

  /** 显示所有直播间状态 */
  showStatus() {
    console.log('\n📊 === 监控状态 ===');
    
    if (this.rooms.size === 0) {
      console.log('当前没有监控的直播间');
      return;
    }

    for (const [roomId, room] of this.rooms) {
      console.log(`\n🏠 ${room.name} (${roomId})`);
      console.log(`  状态: ${room.status}`);
      console.log(`  URL: ${room.url}`);
      console.log(`  统计: 接口${room.stats.apiCaptured} | DOM${room.stats.domCaptured} | 保存${room.stats.totalSaved} | Webhook${room.stats.webhookSent}`);
      console.log(`  添加时间: ${room.addedAt}`);
    }

    const dbStats = this.store.getStats();
    console.log(`\n💾 数据库总计: ${dbStats.total} 个商品 (今日: ${dbStats.today})`);
  }

  /** 列出所有直播间 */
  listRooms() {
    const rooms = [];
    for (const [roomId, room] of this.rooms) {
      rooms.push({
        id: roomId,
        name: room.name,
        url: room.url,
        status: room.status,
        stats: room.stats
      });
    }
    return rooms;
  }

  /** 停止所有监控 */
  async stopAll() {
    console.log('🛑 停止所有监控...');
    
    const roomIds = Array.from(this.rooms.keys());
    for (const roomId of roomIds) {
      await this.removeRoom(roomId);
    }

    if (this.store) {
      this.store.close();
    }
  }

  /** 从配置文件恢复 */
  async restoreFromConfig() {
    const config = this.loadConfig();
    if (config.rooms && config.rooms.length > 0) {
      console.log(`📂 从配置恢复 ${config.rooms.length} 个直播间...`);
      
      for (const room of config.rooms) {
        await this.addRoom(room.url, room.name);
        await new Promise(resolve => setTimeout(resolve, 2000)); // 避免同时启动太多
      }
    }
  }
}

module.exports = MultiRoomWatcher;