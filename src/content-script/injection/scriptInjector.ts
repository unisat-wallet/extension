/**
 * Script injection module
 * Handles injection of provider script into page context
 */
import extension from 'extensionizer';
import { nanoid } from 'nanoid';

import { Message } from '@/shared/utils';
import { MESSAGE_TYPE } from '@unisat/wallet-shared';

/**
 * Checks the doctype of the current document if it exists
 * @returns true if the doctype is html or if none exists
 */
function doctypeCheck(): boolean {
  const { doctype } = window.document;
  if (doctype) {
    return doctype.name === 'html';
  }
  return true;
}

/**
 * Returns whether or not the extension (suffix) of the current document is prohibited
 * @returns whether or not the extension of the current document is prohibited
 */
function suffixCheck(): boolean {
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
 * @returns true if the documentElement is an html node or if none exists
 */
function documentElementCheck(): boolean {
  const documentElement = document.documentElement.nodeName;
  if (documentElement) {
    return documentElement.toLowerCase() === 'html';
  }
  return true;
}

/**
 * Checks if the current domain is blocked
 * @returns true if the current domain is blocked
 */
function blockedDomainCheck(): boolean {
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
 * Checks if the current page is in an iframe
 * @returns true if the page is in an iframe
 */
function iframeCheck(): boolean {
  const isInIframe = self != top;
  return isInIframe;
}

/**
 * Determines if the provider should be injected
 * @returns true if the provider should be injected
 */
export function shouldInjectProvider(): boolean {
  return doctypeCheck() && suffixCheck() && documentElementCheck() && !blockedDomainCheck() && !iframeCheck();
}

/**
 * Injects a script tag into the current document
 * @param channelName - The channel name for communication
 */
export function injectProviderScript(channelName: string): void {
  try {
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
    pm.on(MESSAGE_TYPE.PM_BG_TO_CONTENT, (data) => {
      bcm.send(MESSAGE_TYPE.BCM_CONTENT_TO_CHANNEL, data);
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
 * Initialize script injection if conditions are met
 * @returns The channel name if injected, null otherwise
 */
export function initializeScriptInjection(): string | null {
  if (shouldInjectProvider()) {
    const channelName = nanoid();
    injectProviderScript(channelName);
    return channelName;
  }
  return null;
}
