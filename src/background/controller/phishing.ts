import { PhishingMessageType } from '@/background/constant/PhishingMessageType';
import phishingService from '@/background/service/phishing';
import { MANIFEST_VERSION } from '@/shared/constant';

/**
 * Default update interval for phishing rules (24 hours)
 */
const DEFAULT_UPDATE_INTERVAL = 24 * 60 * 60 * 1000;

/**
 * PhishingController class for handling all phishing protection related functionality
 */
class PhishingController {
  private updateIntervalId: NodeJS.Timeout | null = null;

  /**
   * Initialize phishing protection features
   */
  public init(): void {
    // Register message listener for phishing-related messages
    this.registerMessageListener();

    // Setup declarative rules for MV3
    this.setupDeclarativeRules();
  }

  /**
   * Register message listener for phishing-related messages
   */
  private registerMessageListener(): void {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      // Handle phishing-related messages
      if (Object.values(PhishingMessageType).includes(message.type)) {
        return this.handleMessage(message, sender, sendResponse);
      }

      return false;
    });
  }

  /**
   * Handle phishing-related messages
   * @param message Message object
   * @param sender Sender information
   * @param sendResponse Response callback
   * @returns True if handled asynchronously
   */
  private handleMessage(
    message: any,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void
  ): boolean {
    try {
      switch (message.type) {
        case PhishingMessageType.CHECK_PHISHING: {
          if (!message.hostname) {
            sendResponse({ error: 'Missing hostname parameter' });
            return false;
          }

          const isPhishing = phishingService.checkPhishing(message.hostname);
          sendResponse({ isPhishing });
          return false;
        }

        case PhishingMessageType.REDIRECT_TO_PHISHING_PAGE: {
          if (!sender.tab?.id || !message.hostname) {
            sendResponse({ error: 'Invalid parameters or sender' });
            return false;
          }

          // Verify the domain is still in the blacklist before redirecting
          const isPhishing = phishingService.checkPhishing(message.hostname);
          if (!isPhishing) {
            sendResponse({ success: false, skipped: true });
            return false;
          }

          this.redirectToPhishingPage(sender.tab.id, message.url || '', message.hostname)
            .then(() => sendResponse({ success: true }))
            .catch((error) => sendResponse({ error: String(error) }));
          return true;
        }

        case PhishingMessageType.SKIP_PHISHING_PROTECTION: {
          if (!message.hostname) {
            sendResponse({ error: 'Missing hostname parameter' });
            return false;
          }

          phishingService.addToWhitelist(message.hostname);
          sendResponse({ success: true });
          return false;
        }

        case PhishingMessageType.FORCE_UPDATE_PHISHING_LIST: {
          phishingService
            .forceUpdate()
            .then(() => sendResponse({ success: true }))
            .catch((error) => sendResponse({ error: String(error) }));
          return true;
        }

        case PhishingMessageType.GET_PHISHING_STATS: {
          sendResponse({ stats: phishingService.getConfig() });
          return false;
        }

        case PhishingMessageType.CHECK_NAVIGATION: {
          if (!message.url) {
            sendResponse({ error: 'Missing URL parameter' });
            return false;
          }

          try {
            const url = new URL(message.url);

            // Skip checks for phishing warning page URL
            if (message.url.includes(chrome.runtime.getURL('index.html#/phishing'))) {
              sendResponse({ isPhishing: false, skipped: true });
              return false;
            }

            const isPhishing = phishingService.checkPhishing(url.hostname);

            if (isPhishing && sender.tab?.id) {
              this.redirectToPhishingPage(sender.tab.id, message.url, url.hostname)
                .then(() => sendResponse({ isPhishing, redirected: true }))
                .catch((error) => sendResponse({ isPhishing, redirected: false, error: String(error) }));
              return true;
            }

            sendResponse({ isPhishing, redirected: false });
          } catch (error) {
            sendResponse({ isPhishing: false, error: String(error) });
          }
          return false;
        }
      }
    } catch (error) {
      sendResponse({ error: 'Internal error processing request' });
    }

    return false;
  }

  /**
   * Redirect a tab to the phishing warning page
   * @param tabId Tab ID to redirect
   * @param url Original URL that was blocked
   * @param hostname Hostname that triggered the phishing detection
   */
  public async redirectToPhishingPage(tabId: number, url: string, hostname: string): Promise<void> {
    try {
      // Check if current URL is already the warning page to avoid repeated redirects
      const tab = await chrome.tabs.get(tabId);
      const currentUrl = tab.url || '';

      // If already on warning page, don't redirect again
      if (currentUrl.includes('index.html#/phishing')) {
        return;
      }

      const params = new URLSearchParams({
        hostname,
        href: url,
        timestamp: Date.now().toString() // Add timestamp to prevent caching
      });

      const redirectUrl = chrome.runtime.getURL(`index.html#/phishing?${params}`);
      await chrome.tabs.update(tabId, { url: redirectUrl, active: true });
    } catch (error) {
      console.error('[Phishing] Failed to redirect tab:', error);
      throw error; // Re-throw to allow proper error handling by caller
    }
  }

  /**
   * Setup phishing protection using declarative rules
   * Initializes rules and schedules periodic updates
   * @param updateInterval Interval in milliseconds for rule updates
   */
  public setupDeclarativeRules(updateInterval = DEFAULT_UPDATE_INTERVAL): void {
    if (MANIFEST_VERSION !== 'mv3' || !chrome.declarativeNetRequest) {
      return;
    }

    // Initialize declarative rules when extension loads
    this.initDeclarativeRules();

    // Schedule periodic updates of the rules
    this.updateIntervalId = setInterval(() => this.updateDeclarativeRules(), updateInterval);
  }

  /**
   * Initialize declarative network request rules for phishing protection
   * Creates initial rule set based on current phishing list
   */
  public async initDeclarativeRules(): Promise<void> {
    try {
      await this.updateDeclarativeRules();
    } catch (error) {
      console.error('[Phishing] Failed to initialize declarative rules:', error);
    }
  }

  /**
   * Update declarative network request rules based on phishing list
   * Only applicable for MV3 extensions
   */
  public async updateDeclarativeRules(): Promise<void> {
    if (MANIFEST_VERSION !== 'mv3' || !chrome.declarativeNetRequest) {
      console.warn('[Phishing] Declarative rules are only available in MV3');
      return;
    }

    try {
      const config = phishingService.getConfig();
      const blacklist = config.blacklist || [];

      if (!blacklist.length) {
        console.warn('[Phishing] No blacklisted domains available for rules');
        return;
      }

      // First, remove existing rules
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: await this.getCurrentRuleIds()
      });

      // Create new rules based on blacklist
      const rules = this.createPhishingRules(blacklist);

      // Update with new rules
      await chrome.declarativeNetRequest.updateDynamicRules({
        addRules: rules
      });

      console.log(
        `[Phishing] Updated MV3 declarative rules: ${rules.length} rules created from ${blacklist.length} domains`
      );
    } catch (error) {
      console.error('[Phishing] Failed to update declarative rules:', error);
    }
  }

  /**
   * Get current rule IDs for removal
   * @returns Array of rule IDs
   */
  private async getCurrentRuleIds(): Promise<number[]> {
    try {
      const rules = await chrome.declarativeNetRequest.getDynamicRules();
      return rules.map((rule) => rule.id);
    } catch (error) {
      console.error('[Phishing] Failed to get current rule IDs:', error);
      return [];
    }
  }

  /**
   * Create declarative network request rules from blacklisted domains
   * @param blacklist Array of blacklisted domains
   * @returns Array of declarative network request rules
   */
  private createPhishingRules(blacklist: string[]): chrome.declarativeNetRequest.Rule[] {
    // Limit number of rules to avoid hitting Chrome's limits
    // Chrome has a limit of 5,000 dynamic rules
    const MAX_RULES = 4900;
    const domains = blacklist.slice(0, MAX_RULES);

    return domains.map((domain, index) => {
      // Rule IDs should be between 1 and 2^32-1
      const ruleId = index + 1;

      return {
        id: ruleId,
        priority: 1,
        action: {
          type: chrome.declarativeNetRequest.RuleActionType.REDIRECT,
          redirect: {
            url: chrome.runtime.getURL(
              `index.html#/phishing?hostname=${encodeURIComponent(domain)}&timestamp=${Date.now()}`
            )
          }
        },
        condition: {
          urlFilter: `||${domain}/`,
          resourceTypes: [chrome.declarativeNetRequest.ResourceType.MAIN_FRAME]
        }
      } as chrome.declarativeNetRequest.Rule;
    });
  }

  /**
   * Force update of phishing list and rules
   */
  public async forceUpdate(): Promise<void> {
    try {
      await phishingService.forceUpdate();

      if (MANIFEST_VERSION === 'mv3' && chrome.declarativeNetRequest) {
        await this.updateDeclarativeRules();
      }

      console.log('[Phishing] Forced update completed successfully');
    } catch (error) {
      console.error('[Phishing] Force update failed:', error);
      throw error;
    }
  }

  /**
   * Force reload of phishing lists
   * This can be used to fix issues with phishing detection
   */
  public async forceReload(): Promise<void> {
    console.log('[PhishingController] Force reloading phishing lists');
    try {
      await phishingService.forceUpdate();
      console.log('[PhishingController] Phishing lists reloaded successfully');

      // Get updated statistics
      const stats = phishingService.getConfig();
      console.log(
        `[PhishingController] Updated stats: blacklist size: ${stats.blacklist?.length || 0}, whitelist size: ${
          stats.whitelist?.length || 0
        }`
      );

      return Promise.resolve();
    } catch (error) {
      console.error('[PhishingController] Failed to reload phishing lists:', error);
      return Promise.reject(error);
    }
  }

  /**
   * Check if a hostname is in the phishing blacklist
   * @param hostname Hostname to check
   * @returns True if hostname is in blacklist
   */
  public checkPhishing(hostname: string): boolean {
    // Basic validation
    if (!hostname || typeof hostname !== 'string') {
      console.warn(`[PhishingController] Invalid hostname: ${hostname}`);
      return false;
    }

    // Get phishing service stats
    const stats = phishingService.getConfig();
    const blacklistSize = stats.blacklist?.length || 0;
    const whitelistSize = stats.whitelist?.length || 0;

    // If blacklist is empty but whitelist exists, might be an initialization issue
    if (blacklistSize === 0 && whitelistSize > 0) {
      return false;
    }

    // Call service to check
    return phishingService.checkPhishing(hostname);
  }

  /**
   * Add a hostname to the phishing whitelist
   * @param hostname Hostname to whitelist
   */
  public addToWhitelist(hostname: string): void {
    phishingService.addToWhitelist(hostname);
  }

  /**
   * Get phishing configuration and stats
   * @returns Phishing configuration object
   */
  public getStats(): any {
    return phishingService.getConfig();
  }
}

export default new PhishingController();
