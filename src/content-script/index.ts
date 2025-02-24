import extension from 'extensionizer';
import { nanoid } from 'nanoid';

import { Message } from '@/shared/utils';

const channelName = nanoid();

// 添加钓鱼检测函数
async function checkPhishing() {
  try {
    const hostname = window.location.hostname;
    // 发送消息给 background 检查是否是钓鱼网站
    const isPhishing = await new Promise((resolve) => {
      try {
        chrome.runtime.sendMessage(
          {
            type: 'CHECK_PHISHING',
            hostname
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
      } catch (e) {
        console.warn('Failed to send message:', e);
        resolve(false);
      }
    });

    if (isPhishing) {
      try {
        // 直接发送重定向消息
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

/**
 * Injects a script tag into the current document
 *
 * @param {string} content - Code to be executed in the current document
 */
function injectScript() {
  try {
    // 在注入脚本前先检查钓鱼网站
    checkPhishing().then((isPhishing) => {
      if (!isPhishing) {
        // 只有在不是钓鱼网站的情况下才注入脚本
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
  // 即使不注入 provider，也要检查钓鱼网站
  checkPhishing();
}

// 修改页面内跳转监听
let checkTimeout: NodeJS.Timeout | null = null;
window.addEventListener('popstate', () => {
  // 使用防抖，避免频繁检查
  if (checkTimeout) {
    clearTimeout(checkTimeout);
  }
  checkTimeout = setTimeout(checkPhishing, 100);
});

// 添加页面可见性变化监听
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    checkPhishing();
  }
});
