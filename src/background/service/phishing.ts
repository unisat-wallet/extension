import { fetchPhishingList } from '@/background/utils/fetch';
import { storage } from '@/background/webapi';

/**
 * Configuration interface for phishing detection service
 */
interface PhishingConfig {
  /**
   * Version number of the phishing configuration format
   */
  version: number;

  /**
   * Tolerance level for fuzzy matching (higher = more strict)
   */
  tolerance: number;

  /**
   * List of patterns for fuzzy matching against hostnames
   */
  fuzzylist: string[];

  /**
   * List of hostnames that should never be considered phishing sites
   */
  whitelist: string[];

  /**
   * List of hostnames that are confirmed phishing sites
   */
  blacklist: string[];

  /**
   * Timestamp of when the phishing list was last fetched
   */
  lastFetchTime: number;

  /**
   * Duration in milliseconds before the cache is considered expired
   */
  cacheExpireTime: number;
}

const STORE_KEY = 'phishing';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const VERSION = 2;
const RETRY_DELAY = 60 * 60 * 1000; // 1 hour retry delay
const MAX_RETRIES = 3;

const initConfig: PhishingConfig = {
  version: VERSION,
  tolerance: 1,
  fuzzylist: [],
  whitelist: [],
  blacklist: [],
  lastFetchTime: 0,
  cacheExpireTime: CACHE_DURATION
};

/**
 * Service for detecting phishing websites
 */
class PhishingService {
  /**
   * Current phishing configuration including lists and settings
   */
  private config: PhishingConfig = initConfig;

  /**
   * Flag to prevent concurrent update operations
   */
  private updating = false;

  /**
   * Set of hostnames temporarily whitelisted during this session
   */
  private temporaryWhitelist: Set<string> = new Set();

  /**
   * Set version of blacklist for O(1) lookups
   */
  private blacklistSet: Set<string> = new Set();

  /**
   * Set version of whitelist for O(1) lookups
   */
  private whitelistSet: Set<string> = new Set();

  /**
   * Counter for tracking update retry attempts
   */
  private retryCount = 0;

  /**
   * Reference to the scheduled update timer
   */
  private updateTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.init();
  }

  /**
   * Initialize the phishing service
   */
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
          // Ensure default whitelist is always present
          const mergedWhitelist = Array.from(new Set([...(stored.whitelist || []), ...initConfig.whitelist]));

          this.config = {
            ...stored,
            whitelist: mergedWhitelist
          };

          this.updateSets();
        }
      } else {
        // No stored config, use initial config
        this.config = { ...initConfig };
        this.updateSets();
        await this.updatePhishingList();
      }

      // Schedule periodic updates instead of using setInterval
      this.scheduleNextUpdate();
    } catch (error) {
      console.error('[PhishingService] Init error:', error);
      this.config = { ...initConfig };
      this.updateSets();

      // Retry after initialization failure
      setTimeout(() => this.updatePhishingList(), RETRY_DELAY);
    }
  }

  /**
   * Schedule the next update based on cache expiration
   */
  private scheduleNextUpdate() {
    if (this.updateTimer) {
      clearTimeout(this.updateTimer);
    }

    const nextUpdateTime = Math.max(0, this.config.lastFetchTime + this.config.cacheExpireTime - Date.now());

    this.updateTimer = setTimeout(() => this.updatePhishingList(), nextUpdateTime);
  }

  /**
   * Update internal sets for faster lookups
   */
  private updateSets() {
    this.blacklistSet = new Set(this.config.blacklist);
    this.whitelistSet = new Set(this.config.whitelist);
  }

  /**
   * Update the phishing list from remote source
   */
  private async updatePhishingList() {
    if (this.updating) return;

    try {
      this.updating = true;
      const newConfig = await fetchPhishingList();

      // Ensure domains in default whitelist are not in the blacklist
      const defaultWhitelist = new Set(initConfig.whitelist);

      // Filter blacklist, remove whitelisted domains and their subdomains
      let filteredBlacklist: string[] = [];
      if (Array.isArray(newConfig.blacklist)) {
        filteredBlacklist = newConfig.blacklist.filter((domain) => {
          // Remove domains in whitelist
          if (defaultWhitelist.has(domain)) {
            return false;
          }

          // Remove subdomains of whitelisted domains
          const domainParts = domain.split('.');
          if (domainParts.length > 2) {
            const mainDomain = domainParts.slice(domainParts.length - 2).join('.');
            if (defaultWhitelist.has(mainDomain)) {
              return false;
            }
          }

          // Keep other domains
          return true;
        });
      }

      // Merge remote whitelist and default whitelist
      const mergedWhitelist = Array.from(new Set([...(newConfig.whitelist || []), ...initConfig.whitelist]));

      this.config = {
        ...newConfig,
        blacklist: filteredBlacklist,
        whitelist: mergedWhitelist,
        version: VERSION,
        lastFetchTime: Date.now(),
        cacheExpireTime: CACHE_DURATION
      };

      await storage.set(STORE_KEY, this.config);
      this.updateSets();
      this.retryCount = 0;
      this.scheduleNextUpdate();
    } catch (error) {
      console.error('[PhishingService] Update error:', error);

      // Retry logic after update failure
      if (this.retryCount < MAX_RETRIES) {
        this.retryCount++;
        setTimeout(() => this.updatePhishingList(), RETRY_DELAY / this.retryCount);
      } else {
        // After reaching max retries, continue trying at normal interval
        this.scheduleNextUpdate();
      }
    } finally {
      this.updating = false;
    }
  }

  /**
   * Force an immediate update of the phishing list
   */
  public async forceUpdate() {
    this.retryCount = 0;
    return this.updatePhishingList();
  }

  /**
   * Check if a hostname is a known phishing site
   * @param hostname The hostname to check
   * @returns True if the hostname is a phishing site
   */
  public checkPhishing(hostname: string): boolean {
    if (!hostname) return false;

    const cleanHostname = hostname.replace(/^www\./, '').toLowerCase();

    try {
      // Skip checks for extension pages
      if (hostname.includes('chrome-extension://') || hostname.includes('moz-extension://')) {
        return false;
      }

      // Security check: local domains and IP addresses are always safe
      if (cleanHostname === 'localhost' || cleanHostname.startsWith('127.') || cleanHostname.startsWith('192.168.')) {
        return false;
      }

      // Security check: if blacklist is empty, consider all domains safe
      if (this.blacklistSet.size === 0) {
        return false;
      }

      // Check temporary whitelist (fastest check first)
      if (this.temporaryWhitelist.has(cleanHostname)) {
        return false;
      }

      // Check permanent whitelist - enhanced check including subdomains
      if (this.whitelistSet.has(cleanHostname)) {
        return false;
      }

      // Then check if it's a subdomain of a whitelisted domain
      const domainParts = cleanHostname.split('.');
      if (domainParts.length > 2) {
        const mainDomain = domainParts.slice(domainParts.length - 2).join('.');
        if (this.whitelistSet.has(mainDomain)) {
          return false;
        }
      }

      return this.blacklistSet.has(cleanHostname);
    } catch (error) {
      console.error('[PhishingService] Check error:', error);
      // Default to safe on error
      return false;
    }
  }

  /**
   * Add a hostname to the temporary whitelist
   * @param hostname The hostname to whitelist
   */
  public addToWhitelist(hostname: string) {
    if (!hostname) return;
    const cleanHostname = hostname.replace(/^www\./, '').toLowerCase();
    this.temporaryWhitelist.add(cleanHostname);
  }

  /**
   * Get the current phishing configuration (for debugging)
   */
  public getConfig() {
    return {
      ...this.config,
      temporaryWhitelistSize: this.temporaryWhitelist.size,
      blacklistSetSize: this.blacklistSet.size,
      whitelistSetSize: this.whitelistSet.size
    };
  }
}

export default new PhishingService();
