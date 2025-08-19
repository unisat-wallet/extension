import { createPersistStore } from '@/background/utils';
import { ChainType } from '@/shared/constant';
import { ContactBook, ExtensionPersistStoreAdapter } from '@unisat/contact-book';

// Export interfaces for compatibility
export interface ContactBookItem {
  name: string;
  address: string;
  chain: ChainType;
  isAlias: boolean;
  isContact: boolean;
  sortIndex?: number;
}

export interface UIContactBookItem {
  name: string;
  address: string;
}

/**
 * ContactBook service - simple wrapper that initializes and exposes the ContactBook instance
 */
class ContactBookService extends ContactBook {
  constructor() {
    // Create storage adapter using the existing createPersistStore
    const storage = new ExtensionPersistStoreAdapter(createPersistStore, 'contactBook');

    // Call parent constructor with extension-compatible storage
    super({
      storage,
      logger: console // Use console for logging in development
    });
  }
}

const contactBookService = new ContactBookService();

export default contactBookService;
