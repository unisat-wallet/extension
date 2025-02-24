import { fetchPhishingList } from '@/background/utils/fetch';
import { storage } from '@/background/webapi';

interface PhishingConfig {
  version: number;
  tolerance: number;
  fuzzylist: string[];
  whitelist: string[];
  blacklist: string[];
  lastFetchTime: number;
  cacheExpireTime: number;
}

const STORE_KEY = 'phishing';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const VERSION = 2;

const initConfig: PhishingConfig = {
  version: VERSION,
  tolerance: 1,
  fuzzylist: [],
  whitelist: [],
  blacklist: [],
  lastFetchTime: 0,
  cacheExpireTime: CACHE_DURATION
};

class PhishingService {
  private config: PhishingConfig = initConfig;
  private updating = false;

  constructor() {
    this.init();
  }

  private async init() {
    try {
      const stored = await storage.get(STORE_KEY);
      if (stored) {
        if (
          stored.version !== VERSION ||
          !stored.lastFetchTime ||
          Date.now() - stored.lastFetchTime > stored.cacheExpireTime
        ) {
          await this.updatePhishingList();
        } else {
          this.config = stored;
        }
      } else {
        await this.updatePhishingList();
      }

      setInterval(() => this.updatePhishingList(), CACHE_DURATION);
    } catch (e) {
      console.error('Failed to init phishing service:', e);
      this.config = initConfig;
    }
  }

  private async updatePhishingList() {
    if (this.updating) return;

    try {
      this.updating = true;
      console.log('Updating phishing list...');

      const newConfig = await fetchPhishingList();

      this.config = {
        ...newConfig,
        version: VERSION,
        lastFetchTime: Date.now(),
        cacheExpireTime: CACHE_DURATION
      };

      await storage.set(STORE_KEY, this.config);
      console.log('Phishing list updated');
    } catch (e) {
      console.error('Failed to update phishing list:', e);
    } finally {
      this.updating = false;
    }
  }

  public async forceUpdate() {
    return this.updatePhishingList();
  }

  public checkPhishing(hostname: string): boolean {
    if (!hostname) return false;

    const cleanHostname = hostname.replace(/^www\./, '').toLowerCase();

    // Check whitelist first
    if (this.config.whitelist.includes(cleanHostname)) {
      return false;
    }

    // Check blacklist
    if (this.config.blacklist.includes(cleanHostname)) {
      return true;
    }

    // Check fuzzy matching patterns
    return this.config.fuzzylist.some((pattern) => cleanHostname.includes(pattern));
  }
}

export default new PhishingService();
