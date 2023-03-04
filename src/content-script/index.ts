import extension from 'extensionizer';
import log from 'loglevel';

import browser from '@/background/webapi/browser';
import { Message } from '@/shared/utils';

/**
 * Injects a script tag into the current document
 *
 * @param {string} content - Code to be executed in the current document
 */
function injectScript() {
  try {
    const container = document.head || document.documentElement;
    const scriptTag = document.createElement('script');
    scriptTag.setAttribute('async', 'false');
    scriptTag.src = extension.runtime.getURL('pageProvider.js');
    container.insertBefore(scriptTag, container.children[0]);
    container.removeChild(scriptTag);

    const channelName = 'UNISAT';
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

/**
 * SERVICE WORKER LOGIC
 */

const EXTENSION_CONTEXT_INVALIDATED_CHROMIUM_ERROR = 'Extension context invalidated.';

const WORKER_KEEP_ALIVE_INTERVAL = 1000;
const WORKER_KEEP_ALIVE_MESSAGE = 'WORKER_KEEP_ALIVE_MESSAGE';
const TIME_45_MIN_IN_MS = 45 * 60 * 1000;
let keepAliveInterval;
let keepAliveTimer;

/**
 * Sending a message to the extension to receive will keep the service worker alive.
 *
 * If the extension is unloaded or reloaded during a session and the user attempts to send a
 * message to the extension, an "Extension context invalidated." error will be thrown from
 * chromium browsers. When this happens, prompt the user to reload the extension. Note: Handling
 * this error is not supported in Firefox here.
 */
const sendMessageWorkerKeepAlive = () => {
  browser.runtime.sendMessage({ name: WORKER_KEEP_ALIVE_MESSAGE }).catch((e) => {
    e.message === EXTENSION_CONTEXT_INVALIDATED_CHROMIUM_ERROR
      ? log.error(`Please refresh the page. Unisat: ${e}`)
      : log.error(`Unisat: ${e}`);
  });
};

/**
 * Running this method will ensure the service worker is kept alive for 45 minutes.
 * The first message is sent immediately and subsequent messages are sent at an
 * interval of WORKER_KEEP_ALIVE_INTERVAL.
 */
const runWorkerKeepAliveInterval = () => {
  clearTimeout(keepAliveTimer);

  keepAliveTimer = setTimeout(() => {
    clearInterval(keepAliveInterval);
  }, TIME_45_MIN_IN_MS);

  clearInterval(keepAliveInterval);

  sendMessageWorkerKeepAlive();

  keepAliveInterval = setInterval(() => {
    if (browser.runtime.id) {
      sendMessageWorkerKeepAlive();
    }
  }, WORKER_KEEP_ALIVE_INTERVAL);
};

/**
 * Determines if the provider should be injected
 *
 * @returns {boolean} {@code true} Whether the provider should be injected
 */
function shouldInjectProvider() {
  return doctypeCheck() && suffixCheck() && documentElementCheck() && !blockedDomainCheck();
}

if (shouldInjectProvider()) {
  injectScript();
  // runWorkerKeepAliveInterval();
}
