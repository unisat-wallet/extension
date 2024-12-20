import { EVENTS, MANIFEST_VERSION } from '@/shared/constant';
import eventBus from '@/shared/eventBus';
import { ProviderControllerRequest, RequestParams } from '@/shared/types/Request.js';
import { Message } from '@/shared/utils';
import { openExtensionInTab } from '@/ui/features/browser/tabs';

import { SessionEvent, SessionEventPayload } from '@/shared/interfaces/SessionEvent';
import { Runtime } from 'webextension-polyfill';
import { providerController, walletController } from './controller';
import {
    contactBookService,
    keyringService,
    openapiService,
    permissionService,
    preferenceService,
    sessionService
} from './service';
import { StoredData } from './service/keyring';
import { isOpenapiServiceMethod, isWalletControllerMethod } from './utils/controller';
import { storage } from './webapi';
import browser, { browserRuntimeOnConnect, browserRuntimeOnInstalled } from './webapi/browser';

const { PortMessage } = Message;

let appStoreLoaded = false;

async function restoreAppState() {
    const keyringState = await storage.get<StoredData>('keyringState');
    keyringService.loadStore(keyringState ?? {booted: '', vault: ''});
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
                        return Promise.resolve();
                    case 'openapi':
                        // TODO (typing): Check this again as it's not the most ideal solution. 
                        // However, the problem is that we have a general type like RequestParams for 
                        // incoming request data as we have different handlers. So, we assumed that 
                        // the params are passed correctly for each method for now  
                        if (isOpenapiServiceMethod(data.method)) {
                            const method = walletController.openapi[data.method];
                            const params = Array.isArray(data.params) ? data.params : [];
                            return Promise.resolve((method as (...args: unknown[]) => unknown).apply(walletController.openapi, params));
                        } else {
                            const errorMsg = `Method ${data.method} not found in openapi`;
                            console.error(errorMsg);
                            return Promise.reject(new Error(errorMsg));
                        }
                    case 'controller':
                    default:
                        // TODO (typing): Check this again as it's not the most ideal solution. 
                        // However, the problem is that we have a general type like RequestParams for 
                        // incoming request data as we have different handlers. So, we assumed that 
                        // the params are passed correctly for each method for now 
                        if (isWalletControllerMethod(data.method)) {
                            const method = walletController[data.method];
                            const params = Array.isArray(data.params) ? data.params : [];
                            return Promise.resolve((method as (...args: unknown[]) => unknown).apply(walletController, params));
                        } else {
                            const errorMsg = `Method ${data.method} not found in controller`;
                            console.error(errorMsg);
                            return Promise.reject(new Error(errorMsg));
                        }
                }
            } else {
                return Promise.reject(new Error('Missing data in the received message'));
            }
        });

        const boardcastCallback = async (params: unknown) => {
            const data = params as RequestParams;
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
        session.pushMessage = <T extends SessionEvent>(event: T, data?: SessionEventPayload<T>) => {
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
