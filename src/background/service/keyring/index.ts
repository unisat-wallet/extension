import { KeyringService, KeyringServiceConfig, MemoryStorageAdapter } from '@unisat/keyring-service';

/**
 * KeyringService wrapper - similar to the extension but for testing
 * Extends the base KeyringService with extension-like functionality
 */
export class KeyringServiceWrapper extends KeyringService {
  constructor() {
    const storage = new MemoryStorageAdapter();

    const config: KeyringServiceConfig = {
      storage,
      logger: console
    };

    super(config);
  }

  // Override init to ensure storage adapter is properly initialized
  async init(): Promise<void> {
    console.log('[KeyringService] Starting initialization...');

    // Call parent init
    console.log('[KeyringService] Calling parent init...');
    await super.init();

    console.log('[KeyringService] Initialization complete');
  }
}

export const keyringService = new KeyringServiceWrapper();
export default keyringService;
