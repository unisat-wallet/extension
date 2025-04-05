import log from 'loglevel';

import { createPersistStore } from '@/background/utils';
import { ChainType } from '@/shared/constant';

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

export type ContactBookStore = Record<string, ContactBookItem | undefined>;

// Helper function to generate a composite key from address and chain
const getCompositeKey = (address: string, chain: ChainType): string => {
  return `${address}_${chain}`;
};

class ContactBook {
  store!: ContactBookStore;

  init = async () => {
    log.debug('Initializing contact store...');
    this.store = await createPersistStore<ContactBookStore>({
      name: 'contactBook',
      template: {}
    });

    try {
      // Rebuild contact store with composite keys
      await this.rebuildContactStore();
      log.debug('Contact store initialization completed');
    } catch (error) {
      log.error('Contact data processing failed:', error);
    }
  };

  // Rebuild the contact store to use composite keys
  rebuildContactStore = async () => {
    try {
      log.debug('Rebuilding contact store to use composite keys...');

      // Extract all valid contacts
      const validContacts: ContactBookItem[] = [];

      Object.entries(this.store).forEach(([key, contact]) => {
        if (contact && contact.address && contact.chain) {
          validContacts.push({ ...contact });
        }
      });

      log.debug(`Found ${validContacts.length} valid contacts`);

      // Clear current store
      Object.keys(this.store).forEach((key) => {
        delete this.store[key];
      });

      // Add contacts back using composite keys
      const processedKeys = new Set<string>();

      validContacts.forEach((contact) => {
        const compositeKey = getCompositeKey(contact.address, contact.chain);

        // Avoid duplicates
        if (!processedKeys.has(compositeKey)) {
          this.store[compositeKey] = { ...contact };
          processedKeys.add(compositeKey);
        }
      });

      log.debug(`Rebuilt contact store with ${Object.keys(this.store).length} contacts`);
    } catch (error) {
      log.error('Failed to rebuild contact store:', error);
    }
  };

  getContactByAddress = (address: string) => {
    // Search for any contact with this address, returning the first match
    const allContacts = Object.entries(this.store);

    for (const [key, contact] of allContacts) {
      if (contact && key.startsWith(address + '_')) {
        return contact;
      }
    }

    return undefined;
  };

  getContactByAddressAndChain = (address: string, chain: ChainType) => {
    // Use composite key to retrieve contact
    const key = getCompositeKey(address, chain);
    return this.store[key];
  };

  removeContact = (address: string, chain: ChainType) => {
    // Use composite key to remove contact
    const key = getCompositeKey(address, chain);
    if (!this.store[key]) return;

    if (this.store[key]?.isAlias) {
      this.store[key] = Object.assign({}, this.store[key], {
        isContact: false
      });
    } else {
      delete this.store[key];
    }
  };

  updateContact = (data: ContactBookItem) => {
    // Use composite key to store contact
    const compositeKey = getCompositeKey(data.address, data.chain);

    // Store contact using composite key
    this.store[compositeKey] = {
      name: data.name,
      address: data.address,
      chain: data.chain,
      isContact: true,
      isAlias: false
    };
  };

  addContact = this.updateContact;

  saveContactsOrder = (contacts: ContactBookItem[]) => {
    contacts.forEach((contact, index) => {
      const key = getCompositeKey(contact.address, contact.chain);
      if (this.store[key]) {
        this.store[key] = Object.assign({}, this.store[key], {
          sortIndex: index
        });
      }
    });
  };

  listContacts = (): ContactBookItem[] => {
    const list = Object.values(this.store);
    const contacts = list.filter((item): item is ContactBookItem => !!item?.isContact) || [];

    return contacts.sort((a, b) => {
      if (a.sortIndex !== undefined && b.sortIndex !== undefined) {
        return a.sortIndex - b.sortIndex;
      }
      if (a.sortIndex !== undefined) {
        return -1;
      }
      if (b.sortIndex !== undefined) {
        return 1;
      }
      return 0;
    });
  };

  listAlias = () => {
    return Object.values(this.store).filter((item) => item?.isAlias);
  };

  updateAlias = (data: { address: string; name: string; chain: ChainType }) => {
    const key = getCompositeKey(data.address, data.chain);

    if (this.store[key]) {
      this.store[key] = Object.assign({}, this.store[key], {
        name: data.name,
        address: data.address,
        chain: data.chain,
        isAlias: true
      });
    } else {
      this.store[key] = {
        name: data.name,
        address: data.address,
        chain: data.chain,
        isAlias: true,
        isContact: false
      };
    }
  };

  addAlias = this.updateAlias;

  removeAlias = (address: string, chain: ChainType) => {
    const key = getCompositeKey(address, chain);
    if (!this.store[key]) return;

    if (this.store[key]!.isContact) {
      this.store[key]! = Object.assign({}, this.store[key], {
        isAlias: false
      });
    } else {
      delete this.store[key];
    }
  };

  getContactsByMap = () => {
    return Object.values(this.store)
      .filter((item): item is ContactBookItem => !!item?.isContact)
      .reduce(
        (res, item) => ({
          ...res,
          [getCompositeKey(item.address, item.chain)]: item
        }),
        {} as Record<string, ContactBookItem>
      );
  };
}

export default new ContactBook();
