import { fetchPhishingList } from '@/background/utils/fetch';
import { storage } from '@/background/webapi';

interface PhishingConfig {
  version: number;
  tolerance: number;
  fuzzylist: string[];
  whitelist: string[];
  blacklist: string[];
  lastFetchTime?: number;
}

const STORE_KEY = 'phishing';

const initConfig: PhishingConfig = {
  version: 2,
  tolerance: 1,
  fuzzylist: [],
  whitelist: [],
  blacklist: []
};

class PhishingService {
  private config: PhishingConfig = initConfig;

  constructor() {
    this.init();
  }

  private async init() {
    try {
      // 从 storage 获取配置
      const stored = await storage.get(STORE_KEY);
      this.config = stored || initConfig;

      // 立即更新一次列表
      await this.updatePhishingList();

      // 设置定期更新
      setInterval(() => this.updatePhishingList(), 24 * 60 * 60 * 1000);
    } catch (e) {
      console.error('Failed to init phishing service:', e);
      // 如果初始化失败，使用空配置
      this.config = initConfig;
    }
  }

  private async updatePhishingList() {
    try {
      console.log('Updating phishing list...');
      const newConfig = await fetchPhishingList();

      this.config = {
        ...newConfig,
        lastFetchTime: Date.now()
      };

      // 保存到 storage
      await storage.set(STORE_KEY, this.config);
      console.log('Phishing list updated:', this.config);
    } catch (e) {
      console.error('Failed to update phishing list:', e);
    }
  }

  public checkPhishing(hostname: string): boolean {
    if (!hostname) return false;

    // 清理域名
    const cleanHostname = hostname.replace(/^www\./, '').toLowerCase();
    console.log('Checking hostname:', cleanHostname);

    // 检查白名单
    if (this.config.whitelist.includes(cleanHostname)) {
      console.log('Domain is whitelisted');
      return false;
    }

    // 检查黑名单
    if (this.config.blacklist.includes(cleanHostname)) {
      console.log('Domain is blacklisted');
      return true;
    }

    // 检查模糊匹配列表
    const isFuzzyMatch = this.config.fuzzylist.some((pattern) => cleanHostname.includes(pattern));
    if (isFuzzyMatch) {
      console.log('Domain matches fuzzy pattern');
      return true;
    }

    return false;
  }
}

export default new PhishingService();
