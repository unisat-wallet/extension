import phishingService from '@/background/service/phishing';
import { EVENTS, MANIFEST_VERSION } from '@/shared/constant';
import eventBus from '@/shared/eventBus';
import { Message } from '@/shared/utils';
import { openExtensionInTab } from '@/ui/features/browser/tabs';

import { phishingController, providerController, walletController } from './controller';
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

/**
 * Flag indicating if app store has been loaded
 */
let appStoreLoaded = false;

/**
 * Restore application state from storage
 */
async function restoreAppState() {
  const keyringState = await storage.get('keyringState');
  keyringService.loadStore(keyringState);
  keyringService.store.subscribe((value) => storage.set('keyringState', value));

  await preferenceService.init();
  await openapiService.init();
  await permissionService.init();
  await contactBookService.init();

  // Initialize phishing service early to ensure protection is active
  try {
    await phishingService.forceUpdate();
  } catch (error) {
    console.error('[Background] Failed to initialize phishing service:', error);
    // Continue initialization even if phishing service fails
  }

  appStoreLoaded = true;
}

// Start app state restoration
restoreAppState();

// Initialize phishing protection features
phishingController.init();

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
      // Return a pending state if app is not loaded yet
      return { error: 'App is initializing, please try again shortly' };
    }

    const sessionId = port.sender?.tab?.id;
    const session = sessionService.getOrCreateSession(sessionId);

    const req = { data, session, port };
    // for background push to respective page
    req.session.pushMessage = (event, data) => {
      pm.send('message', { event, data });
    };

    return providerController(req);
  });

  port.onDisconnect.addListener(() => {
    // Clean up session if needed
    const sessionId = port.sender?.tab?.id;
    if (sessionId) {
      // Consider session cleanup here if needed
    }
  });
});

/**
 * Handle extension installation event
 */
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
