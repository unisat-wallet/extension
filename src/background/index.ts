import log from 'loglevel';

import phishingService from '@/background/service/phishing';
import { EVENTS, MANIFEST_VERSION } from '@/shared/constant';
import eventBus from '@/shared/eventBus';
import { Message } from '@/shared/utils';
import { openExtensionInTab } from '@/ui/features/browser/tabs';

import { phishingController, providerController, walletController } from './controller';
import {
  contactBookService,
  keyringService,
  permissionService,
  preferenceService,
  sessionService,
  walletApiService
} from './service';
import { storage } from './webapi';
import { browserRuntimeOnConnect, browserRuntimeOnInstalled } from './webapi/browser';

// Chrome SidePanel API type declarations
declare global {
  interface Chrome {
    sidePanel?: {
      setPanelBehavior: (options: { openPanelOnActionClick: boolean }) => Promise<void>;
    };
  }
}

log.setDefaultLevel('error');
if (process.env.NODE_ENV === 'development') {
  log.setLevel('debug');
}

const { PortMessage } = Message;

/**
 * Flag indicating if app store has been loaded
 */
let appStoreLoaded = false;

/**
 * Configure the side panel behavior based on user preference
 */
async function configureSidePanelBehavior() {
  // Use type assertion to access the sidePanel API
  const chromeWithSidePanel = chrome as any;

  if (!chromeWithSidePanel.sidePanel) {
    return; // Skip if sidePanel API is not available
  }

  const openInSidePanel = preferenceService.getOpenInSidePanel();

  if (openInSidePanel) {
    // If user previously used side panel, associate action click with side panel opening
    try {
      await chromeWithSidePanel.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
    } catch (error) {
      console.error('[Background] Failed to set side panel behavior:', error);
    }
  } else {
    // User prefers popup mode - don't associate action with side panel
    try {
      await chromeWithSidePanel.sidePanel.setPanelBehavior({ openPanelOnActionClick: false });
    } catch (error) {
      console.error('[Background] Failed to set side panel behavior:', error);
    }
  }
}

/**
 * Restore application state from storage
 */
async function restoreAppState() {
  const keyringState = await storage.get('keyringState');
  keyringService.loadStore(keyringState);
  keyringService.store.subscribe((value) => storage.set('keyringState', value));

  await preferenceService.init();
  await walletApiService.init();
  await permissionService.init();
  await contactBookService.init();

  // Configure side panel behavior after preferences are loaded
  await configureSidePanelBehavior();

  // Initialize phishing service early to ensure protection is active
  try {
    phishingService.forceUpdate();
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
  if (port.name === 'popup' || port.name === 'notification' || port.name === 'tab' || port.name === 'sidepanel') {
    const pm = new PortMessage(port as any);
    pm.listen((data) => {
      if (data?.type) {
        switch (data.type) {
          case 'broadcast':
            eventBus.emit(data.method, data.params);
            break;
          case 'openapi':
            if (walletApiService[data.method]) {
              return walletApiService[data.method].apply(null, data.params);
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
        if (chrome.runtime.lastError) {
          // console.error('Keep-alive port disconnected:', chrome.runtime.lastError);
        }
        alivePort = null;
      });
    }

    if (alivePort) {
      alivePort.postMessage({ content: 'keep alive' });
    }
  }, 5000);
}
