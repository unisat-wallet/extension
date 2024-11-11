import { EVENTS, MANIFEST_VERSION } from '@/shared/constant';
import eventBus from '@/shared/eventBus';
import { ProviderControllerRequest, RequestParams } from '@/shared/types/Request.js';
import { Message } from '@/shared/utils';
import { openExtensionInTab } from '@/ui/features/browser/tabs';

import { Runtime } from 'webextension-polyfill';
import { providerController, walletController } from './controller';
import { WalletController } from './controller/wallet';
import {
    contactBookService,
    keyringService,
    openapiService,
    permissionService,
    preferenceService,
    sessionService
} from './service';
import { OpenApiService } from './service/openapi';
import { storage } from './webapi';
import browser, { browserRuntimeOnConnect, browserRuntimeOnInstalled } from './webapi/browser';

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
browserRuntimeOnConnect((port: Runtime.Port) => {
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
                            const method = walletController.openapi[data.method as keyof OpenApiService];
                            if (!method) {
                                const errorMsg = `Method ${data.method} not found in openapi`;
                                console.error(errorMsg);

                                return Promise.reject(new Error(errorMsg));
                            } else {
                                // @ts-expect-error
                                return method.apply(null, data.params);
                            }
                        }
                        break;
                    case 'controller':
                    default:
                        // TODO (typing): check the logic again but it looks like the logic can be 
                        // simplifed more if we are allowed to return smth in any case.
                        if (data.method) {
                            if (data.method in walletController) {
                                const method = walletController[data.method as keyof WalletController];
                                if (!method) {
                                    const errorMsg = `Method ${data.method} not found in controller`;
                                    console.error(errorMsg);
    
                                    return Promise.reject(new Error(errorMsg));
                                } else {
                                    // @ts-expect-error
                                    return method.apply(null, data.params);
                                }
                            } else {
                                const errorMsg = `Method ${data.method} not found in controller`;
                                console.error(errorMsg);

                                return Promise.reject(new Error(errorMsg));
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
    if (details.reason === 'install' ) {
        await addAppInstalledEvent();
    }
});

if (MANIFEST_VERSION === 'mv3') {
    // Keep alive for MV3
    const INTERNAL_STAYALIVE_PORT = 'CT_Internal_port_alive';
    let alivePort: Runtime.Port | null = null;

    setInterval(() => {
        // console.log('Highlander', Date.now());
        if (alivePort == null) {
            alivePort = browser.runtime.connect({ name: INTERNAL_STAYALIVE_PORT });

            alivePort.onDisconnect.addListener((p) => {
                if (browser.runtime.lastError) {
                    // console.log('(DEBUG Highlander) Expected disconnect (on error). SW should be still running.');
                } else {
                    // console.log('(DEBUG Highlander): port disconnected');
                }

                alivePort = null;
            });
        }

        if (alivePort) {
            alivePort.postMessage({ content: 'keep alive~' });

            if (browser.runtime.lastError) {
                // console.log(`(DEBUG Highlander): postMessage error: ${browser.runtime.lastError.message}`);
            } else {
                // console.log(`(DEBUG Highlander): sent through ${alivePort.name} port`);
            }
        }
    }, 5000);
}
