import { createPersistStore } from '@/background/utils';
import { INTERNAL_REQUEST_ORIGIN } from '@/shared/constant';
import { ExtensionPersistStoreAdapter, PermissionService } from '@unisat/permission-service';
import { ChainType } from '@unisat/wallet-types';

// Export interfaces for compatibility
export interface ConnectedSite {
  origin: string;
  icon: string;
  name: string;
  chain: ChainType;
  e?: number;
  isSigned: boolean;
  isTop: boolean;
  order?: number;
  isConnected: boolean;
}

export type PermissionStore = {
  dumpCache: ReadonlyArray<any>;
};

/**
 * Permission service - extends the base PermissionService with extension-specific functionality
 */
class PermissionServiceWrapper extends PermissionService {
  constructor() {
    // Create storage adapter using the existing createPersistStore
    const storage = new ExtensionPersistStoreAdapter(createPersistStore, 'permission');

    // Call parent constructor with extension-compatible storage
    super({
      storage,
      logger: console,
      internalRequestOrigin: INTERNAL_REQUEST_ORIGIN
    });
  }

  // Legacy method names for compatibility
  touchConnectedSite = (origin: string) => super.touchConnectedSite(origin);
}

const permissionService = new PermissionServiceWrapper();

export default permissionService;
