import extension from 'extensionizer';
import { nanoid } from 'nanoid';

import { Message } from '@/shared/utils';

const channelName = nanoid();

// Add phishing detection function
async function checkPhishing() {
  try {
    const hostname = window.location.hostname;
    const isPhishing = await new Promise((resolve) => {
      chrome.runtime.sendMessage(
        {
          type: 'CHECK_PHISHING',
          hostname,
          source: 'content_script'
        },
        (response) => {
          if (chrome.runtime.lastError) {
            console.warn('Message channel error:', chrome.runtime.lastError);
            resolve(false);
            return;
          }
          resolve(response);
        }
      );
    });

    // Log the result
    // console.log(`[Content Script] Phishing check for ${hostname}: ${isPhishing}`);

    if (isPhishing) {
      try {
        // Send redirect message
        chrome.runtime.sendMessage(
          {
            type: 'REDIRECT_TO_PHISHING_PAGE',
            hostname
          },
          () => {
            if (chrome.runtime.lastError) {
              console.warn('Redirect message error:', chrome.runtime.lastError);
            }
          }
        );
      } catch (e) {
        console.warn('Failed to send redirect message:', e);
      }
      return true;
    }
    return false;
  } catch (e) {
    console.error('Failed to check phishing:', e);
    return false;
  }
}

// Enhanced MV3 phishing check - runs immediately when content script loads
(async function runInitialPhishingCheck() {
  // Run phishing check as soon as content script loads
  await checkPhishing();
})();

/**
 * Injects a script tag into the current document
 *
 * @param {string} content - Code to be executed in the current document
 */
function injectScript() {
  try {
    // Check for phishing before injecting script
    checkPhishing().then((isPhishing) => {
      if (!isPhishing) {
        // Only inject script if not a phishing site
        const container = document.head || document.documentElement;
        const scriptTag = document.createElement('script');
        scriptTag.setAttribute('async', 'false');
        scriptTag.setAttribute('channel', channelName);
        scriptTag.src = extension.runtime.getURL('pageProvider.js');
        container.insertBefore(scriptTag, container.children[0]);
        container.removeChild(scriptTag);

        const { BroadcastChannelMessage, PortMessage } = Message;

        const pm = new PortMessage().connect();

        const bcm = new BroadcastChannelMessage(channelName).listen((data) => pm.request(data));

        // background notification
        pm.on('message', (data) => {
          bcm.send('message', data);
        });

        document.addEventListener('beforeunload', () => {
          bcm.dispose();
          pm.dispose();
        });
      }
    });
  } catch (error) {
    console.error('Unisat: Provider injection failed.', error);
  }
}

/**
 * Checks the doctype of the current document if it exists
 *
 * @returns {boolean} {@code true} if the doctype is html or if none exists
 */
function doctypeCheck() {
  const { doctype } = window.document;
  if (doctype) {
    return doctype.name === 'html';
  }
  return true;
}

/**
 * Returns whether or not the extension (suffix) of the current document is prohibited
 *
 * This checks {@code window.location.pathname} against a set of file extensions
 * that we should not inject the provider into. This check is indifferent of
 * query parameters in the location.
 *
 * @returns {boolean} whether or not the extension of the current document is prohibited
 */
function suffixCheck() {
  const prohibitedTypes = [/\.xml$/u, /\.pdf$/u];
  const currentUrl = window.location.pathname;
  for (let i = 0; i < prohibitedTypes.length; i++) {
    if (prohibitedTypes[i].test(currentUrl)) {
      return false;
    }
  }
  return true;
}

/**
 * Checks the documentElement of the current document
 *
 * @returns {boolean} {@code true} if the documentElement is an html node or if none exists
 */
function documentElementCheck() {
  const documentElement = document.documentElement.nodeName;
  if (documentElement) {
    return documentElement.toLowerCase() === 'html';
  }
  return true;
}

/**
 * Checks if the current domain is blocked
 *
 * @returns {boolean} {@code true} if the current domain is blocked
 */
function blockedDomainCheck() {
  const blockedDomains: string[] = [];
  const currentUrl = window.location.href;
  let currentRegex;
  for (let i = 0; i < blockedDomains.length; i++) {
    const blockedDomain = blockedDomains[i].replace('.', '\\.');
    currentRegex = new RegExp(`(?:https?:\\/\\/)(?:(?!${blockedDomain}).)*$`, 'u');
    if (!currentRegex.test(currentUrl)) {
      return true;
    }
  }
  return false;
}

function iframeCheck() {
  const isInIframe = self != top;
  if (isInIframe) {
    return true;
  } else {
    return false;
  }
}

/**
 * Determines if the provider should be injected
 *
 * @returns {boolean} {@code true} Whether the provider should be injected
 */
function shouldInjectProvider() {
  return doctypeCheck() && suffixCheck() && documentElementCheck() && !blockedDomainCheck() && !iframeCheck();
}

if (shouldInjectProvider()) {
  injectScript();
} else {
  // Check for phishing even if not injecting provider
  checkPhishing();
}

// Add page navigation listener with debounce
let checkTimeout: NodeJS.Timeout | null = null;
window.addEventListener('popstate', () => {
  // Use debounce to avoid frequent checks
  if (checkTimeout) {
    clearTimeout(checkTimeout);
  }
  checkTimeout = setTimeout(checkPhishing, 100);
});

// Add page visibility change listener
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    checkPhishing();
  }
});

// Add network error detection
window.addEventListener(
  'error',
  (event) => {
    // Check if target is an image or link element
    if (event.target instanceof HTMLImageElement) {
      const url = event.target.src;
      if (url) {
        chrome.runtime.sendMessage({
          type: 'REPORT_NETWORK_ERROR',
          url,
          error: 'Image load failed',
          status: 'error'
        });
      }
    } else if (event.target instanceof HTMLAnchorElement) {
      const url = event.target.href;
      if (url) {
        chrome.runtime.sendMessage({
          type: 'REPORT_NETWORK_ERROR',
          url,
          error: 'Link load failed',
          status: 'error'
        });
      }
    }
  },
  true
);

// Add fetch error detection
const originalFetch = window.fetch;
window.fetch = async function (...args) {
  try {
    const response = await originalFetch.apply(this, args);
    if (!response.ok) {
      const requestUrl =
        typeof args[0] === 'string' ? args[0] : args[0] instanceof URL ? args[0].href : (args[0] as Request).url;

      chrome.runtime.sendMessage({
        type: 'REPORT_NETWORK_ERROR',
        url: requestUrl,
        error: `HTTP ${response.status}`,
        status: response.status
      });
    }
    return response;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    const requestUrl =
      typeof args[0] === 'string' ? args[0] : args[0] instanceof URL ? args[0].href : (args[0] as Request).url;

    chrome.runtime.sendMessage({
      type: 'REPORT_NETWORK_ERROR',
      url: requestUrl,
      error: errorMessage,
      status: 'network_error'
    });
    throw error;
  }
};

// Add XHR error detection
const originalXHROpen = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function (
  method: string,
  url: string | URL,
  async = true,
  username?: string | null,
  password?: string | null
) {
  this.addEventListener('error', () => {
    chrome.runtime.sendMessage({
      type: 'REPORT_NETWORK_ERROR',
      url: url.toString(),
      error: 'XHR failed',
      status: this.status
    });
  });

  this.addEventListener('load', () => {
    if (this.status >= 400) {
      chrome.runtime.sendMessage({
        type: 'REPORT_NETWORK_ERROR',
        url: url.toString(),
        error: `HTTP ${this.status}`,
        status: this.status
      });
    }
  });

  // Call original with correct arguments
  return originalXHROpen.call(this, method, url, async, username || null, password || null);
};

// Add navigation interception
// Listen for all possible navigation events
window.addEventListener('beforeunload', async (e) => {
  const url = window.location.href;
  const result = await new Promise((resolve) => {
    chrome.runtime.sendMessage(
      {
        type: 'CHECK_NAVIGATION',
        url
      },
      (response) => {
        if (chrome.runtime.lastError) {
          resolve(false);
          return;
        }
        resolve(response?.isPhishing);
      }
    );
  });

  if (result) {
    // If it's a phishing site, prevent navigation and show warning
    e.preventDefault();
    e.returnValue = '';
  }
});

// Listen for click events
document.addEventListener(
  'click',
  async (e) => {
    const element = e.target as HTMLElement;
    let url: string | null = null;

    // Check for links
    if (element instanceof HTMLAnchorElement && element.href) {
      url = element.href;
    }
    // Check other elements that might trigger navigation
    else if (element.hasAttribute('href')) {
      url = element.getAttribute('href');
    }

    if (url) {
      try {
        const result = await new Promise((resolve) => {
          chrome.runtime.sendMessage(
            {
              type: 'CHECK_NAVIGATION',
              url
            },
            (response) => {
              if (chrome.runtime.lastError) {
                resolve(false);
                return;
              }
              resolve(response?.isPhishing);
            }
          );
        });

        if (result) {
          e.preventDefault();
        }
      } catch (e) {
        console.error('[Navigation Check] Error:', e);
      }
    }
  },
  true
);
