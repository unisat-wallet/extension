import phishingService from '@/background/service/phishing';
import { EVENTS, MANIFEST_VERSION } from '@/shared/constant';
import eventBus from '@/shared/eventBus';
import { Message } from '@/shared/utils';
import { openExtensionInTab } from '@/ui/features/browser/tabs';

import { providerController, walletController } from './controller';
import {
  contactBookService,
  keyringService,
  openapiService,
  permissionService,
  preferenceService,
  sessionService
} from './service';
import { storage } from './webapi';
import { browserRuntimeOnConnect, browserRuntimeOnInstalled } from './webapi/browser';

const { PortMessage } = Message;

let appStoreLoaded = false;
async function restoreAppState() {
  const keyringState = await storage.get('keyringState');
  keyringService.loadStore(keyringState);
  keyringService.store.subscribe((value) => storage.set('keyringState', value));

  await preferenceService.init();

  await openapiService.init();

  await permissionService.init();

  await contactBookService.init();

  appStoreLoaded = true;
}

restoreAppState();

// for page provider
browserRuntimeOnConnect((port) => {
  if (port.name === 'popup' || port.name === 'notification' || port.name === 'tab') {
    const pm = new PortMessage(port as any);
    pm.listen((data) => {
      if (data?.type) {
        switch (data.type) {
          case 'broadcast':
            eventBus.emit(data.method, data.params);
            break;
          case 'openapi':
            if (walletController.openapi[data.method]) {
              return walletController.openapi[data.method].apply(null, data.params);
            }
            break;
          case 'controller':
          default:
            if (data.method) {
              return walletController[data.method].apply(null, data.params);
            }
        }
      }
    });

    const boardcastCallback = (data: any) => {
      pm.request({
        type: 'broadcast',
        method: data.method,
        params: data.params
      });
    };

    if (port.name === 'popup') {
      preferenceService.setPopupOpen(true);

      port.onDisconnect.addListener(() => {
        preferenceService.setPopupOpen(false);
      });
    }

    eventBus.addEventListener(EVENTS.broadcastToUI, boardcastCallback);
    port.onDisconnect.addListener(() => {
      eventBus.removeEventListener(EVENTS.broadcastToUI, boardcastCallback);
    });

    return;
  }

  const pm = new PortMessage(port);
  pm.listen(async (data) => {
    if (!appStoreLoaded) {
      // todo
    }
    const sessionId = port.sender?.tab?.id;
    const session = sessionService.getOrCreateSession(sessionId);

    const req = { data, session };
    // for background push to respective page
    req.session.pushMessage = (event, data) => {
      pm.send('message', { event, data });
    };

    return providerController(req);
  });

  port.onDisconnect.addListener(() => {
    // todo
  });
});

const addAppInstalledEvent = () => {
  if (appStoreLoaded) {
    openExtensionInTab('index.html', {});
    return;
  }
  setTimeout(() => {
    addAppInstalledEvent();
  }, 1000);
};

browserRuntimeOnInstalled((details) => {
  if (details.reason === 'install') {
    addAppInstalledEvent();
  }
});

// MV3 keep-alive code
if (MANIFEST_VERSION === 'mv3') {
  const INTERNAL_STAYALIVE_PORT = 'CT_Internal_port_alive';
  let alivePort: any = null;

  setInterval(() => {
    if (alivePort == null) {
      alivePort = chrome.runtime.connect({ name: INTERNAL_STAYALIVE_PORT });
      alivePort.onDisconnect.addListener(() => {
        alivePort = null;
      });
    }

    if (alivePort) {
      alivePort.postMessage({ content: 'keep alive' });
    }
  }, 5000);
}

// Add message listener
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  try {
    let isPhishing: boolean;

    switch (message.type) {
      case 'CHECK_PHISHING': {
        isPhishing = phishingService.checkPhishing(message.hostname);
        sendResponse(isPhishing);
        break;
      }

      case 'REDIRECT_TO_PHISHING_PAGE': {
        if (!sender.tab?.id) break;

        try {
          chrome.tabs.update(sender.tab.id, {
            url: chrome.runtime.getURL(`index.html#/phishing?hostname=${encodeURIComponent(message.hostname)}`),
            active: true
          });
        } catch {
          // Ignore error
        }
        break;
      }

      case 'SKIP_PHISHING_PROTECTION': {
        phishingService.addToWhitelist(message.hostname);
        sendResponse(true);
        break;
      }
    }
  } catch {
    // Ignore error
  }
  return true;
});

// Unified redirect function with query params
async function redirectToPhishingPage(tabId: number, url: string, hostname: string) {
  try {
    const params = new URLSearchParams({
      hostname,
      href: url
    });

    const redirectUrl = chrome.runtime.getURL(`index.html#/phishing?${params}`);
    await chrome.tabs.update(tabId, { url: redirectUrl, active: true });
  } catch (e) {
    console.error('[Redirect] Failed to redirect tab:', e);
  }
}

// Request interception listener
chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    try {
      // Skip internal extension requests
      if (details.tabId === chrome.tabs.TAB_ID_NONE || details.url.startsWith(chrome.runtime.getURL(''))) {
        return { cancel: false };
      }

      // Only handle main frame and sub frame requests
      if (details.type !== 'main_frame' && details.type !== 'sub_frame') {
        return { cancel: false };
      }

      const url = new URL(details.url);
      const isPhishing = phishingService.checkPhishing(url.hostname);

      // Allow if not a phishing site
      if (!isPhishing) {
        return { cancel: false };
      }

      // MV3: Use tabs.update for redirection
      if (details.tabId) {
        redirectToPhishingPage(details.tabId, details.url, url.hostname);
      }
      return details.type === 'main_frame' ? {} : { cancel: true };
    } catch {
      return { cancel: false };
    }
  },
  {
    urls: ['http://*/*', 'https://*/*', 'ws://*/*', 'wss://*/*'],
    types: ['main_frame', 'sub_frame']
  }
);

// Navigation check for MV3
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'CHECK_NAVIGATION') {
    try {
      const url = new URL(message.url);
      const isPhishing = phishingService.checkPhishing(url.hostname);

      if (isPhishing && sender.tab?.id) {
        redirectToPhishingPage(sender.tab.id, message.url, url.hostname);
      }

      sendResponse({ isPhishing });
    } catch {
      sendResponse({ isPhishing: false });
    }
  }
  return true;
});
