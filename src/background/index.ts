import { EVENTS, MANIFEST_VERSION } from '@/shared/constant';
import eventBus from '@/shared/eventBus';
import { ProviderControllerRequest, RequestParams } from '@/shared/types/Request.js';
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

void restoreAppState();

// for page provider
browserRuntimeOnConnect((port: chrome.runtime.Port) => {
    if (port.name === 'popup' || port.name === 'notification' || port.name === 'tab') {
        const pm = new PortMessage(port);
        pm.listen((data: RequestParams) => {
            if (data?.type) {
                switch (data.type) {
                    case 'broadcast':
                        eventBus.emit(data.method, data.params);
                        break;
                    case 'openapi':
                        if (data.method in walletController.openapi) {
                            const method = walletController.openapi[data.method];
                            if (!method) {
                                console.error(`Method ${data.method} not found in openapi`);

                                return Promise.reject(`Method ${data.method} not found in openapi`);
                            } else {
                                // @ts-ignore
                                return method.apply(null, data.params);
                            }
                        }
                        break;
                    case 'controller':
                    default:
                        if (data.method) {
                            const method = walletController[data.method];
                            if (!method) {
                                console.error(`Method ${data.method} not found in controller`);

                                return Promise.reject(`Method ${data.method} not found in controller`);
                            } else {
                                // @ts-ignore
                                return method.apply(walletController, data.params);
                            }
                        }
                }
            }
        });

        const boardcastCallback = async (data: RequestParams) => {
            await pm.request({
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
        if (sessionId == null) {
            throw new Error('Invalid session id');
        }

        const session = sessionService.getOrCreateSession(sessionId);
        const req: ProviderControllerRequest = { data, session };

        // for background push to respective page
        session.pushMessage = (event: string, data: RequestParams) => {
            pm.send('message', { event, data });
        };

        return providerController(req);
    });

    port.onDisconnect.addListener(() => {
        // todo, remove session?
        pm.dispose();
    });
});

const addAppInstalledEvent = async () => {
    if (appStoreLoaded) {
        await openExtensionInTab();
        return;
    }
    setTimeout(async () => {
        await addAppInstalledEvent();
    }, 1000);
};

browserRuntimeOnInstalled(async (details) => {
    if (details.reason === 'install') {
        await addAppInstalledEvent();
    }
});

if (MANIFEST_VERSION === 'mv3') {
    // Keep alive for MV3
    const INTERNAL_STAYALIVE_PORT = 'CT_Internal_port_alive';
    let alivePort: chrome.runtime.Port | null = null;

    setInterval(() => {
        // console.log('Highlander', Date.now());
        if (alivePort == null) {
            alivePort = chrome.runtime.connect({ name: INTERNAL_STAYALIVE_PORT });

            alivePort.onDisconnect.addListener((p) => {
                if (chrome.runtime.lastError) {
                    // console.log('(DEBUG Highlander) Expected disconnect (on error). SW should be still running.');
                } else {
                    // console.log('(DEBUG Highlander): port disconnected');
                }

                alivePort = null;
            });
        }

        if (alivePort) {
            alivePort.postMessage({ content: 'keep alive~' });

            if (chrome.runtime.lastError) {
                // console.log(`(DEBUG Highlander): postMessage error: ${chrome.runtime.lastError.message}`);
            } else {
                // console.log(`(DEBUG Highlander): sent through ${alivePort.name} port`);
            }
        }
    }, 5000);
}
