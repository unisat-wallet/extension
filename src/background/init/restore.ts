import {
  bgEventBus,
  contactBookService,
  keyringService,
  permissionService,
  phishingDetectService,
  preferenceService,
  walletApiService,
  walletController
} from '@unisat/wallet-background';
import { BaseProxyStorageAdapter } from '@unisat/wallet-storage';
import logger from 'loglevel';
import { encryptor } from '../utils/encryptor';
import { HttpClient } from '../utils/http-client/httpClient';
import storage from '../utils/storage';

// init/restore.ts
import { i18nService } from '@/shared/utils/i18n';
import { ExtensionAdapter } from '@unisat/phishing-detect';
import { bgI18n, CHAINS_MAP, t } from '@unisat/wallet-shared';
import { EventEmitter } from 'events';
export const AppInitEvent = new EventEmitter();

class ExtensionStorageAdapter extends BaseProxyStorageAdapter {
  constructor(private storage) {
    super();
  }

  async get(key: string): Promise<any> {
    return this.storage.get(key);
  }

  async set(key: string, value: any): Promise<void> {
    await this.storage.set(key, value);
  }
}

let appStateRestored = false;

export async function restoreAppState() {
  try {
    const proxyStorage = new ExtensionStorageAdapter(storage);

    await i18nService.init({ storage: proxyStorage });
    bgI18n.t = i18nService.translate.bind(i18nService);
    bgI18n.changeLanguage = async (locale: string) => {
      await i18nService.changeLanguage(locale);
    };

    await keyringService.init({
      storage: proxyStorage,
      logger: logger,
      encryptor: encryptor,
      t: t,
      eventBus: bgEventBus
    });

    await preferenceService.init({
      storage: proxyStorage,
      logger: logger,
      t: t,
      eventBus: bgEventBus as any
    });

    const chainType = preferenceService.getChainType();
    const endpoint = CHAINS_MAP[chainType].endpoints[0];
    const httpClient = new HttpClient();
    await walletApiService.init({
      storage: proxyStorage,
      logger: logger,
      endpoint,
      httpClient: httpClient
    });

    await permissionService.init({
      storage: proxyStorage,
      logger: logger
    });

    await contactBookService.init({
      storage: proxyStorage,
      logger: logger
    });

    const adapter = new ExtensionAdapter();
    phishingDetectService.init({
      adapter,
      logger: logger,
      t: t
    });
    // Initialize phishing service early to ensure protection is active

    appStateRestored = true;

    walletController.setBackgroundInited(true);
  } catch (err) {
    console.error('[Background] Initialization failed', err);
  }
}

export function isAppStateRestored(): boolean {
  return appStateRestored;
}
