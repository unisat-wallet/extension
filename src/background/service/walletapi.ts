import randomstring from 'randomstring';

import { createPersistStore } from '@/background/utils';
import { CHAINS_MAP, CHANNEL, VERSION } from '@/shared/constant';
import { UniSatApiClient, createClient } from '@unisat/wallet-api';

import preferenceService from './preference';

interface WalletApiStore {
  deviceId: string;
}

export class WalletApiService {
  store!: WalletApiStore;
  private client: UniSatApiClient;
  private clientAddress = '';
  private addressFlag = 0;
  private currentEndpoint = '';

  constructor() {
    // Initialize with default configuration
    this.client = createClient({
      endpoint: 'https://api.unisat.io',
      timeout: 30000,
      retries: 3
    });
    this.currentEndpoint = 'https://api.unisat.io';
  }

  setEndpoints = async (endpoints: string[]) => {
    // Use the first endpoint from the list
    if (endpoints.length > 0) {
      this.currentEndpoint = endpoints[0];
      this.client.setBaseURL(this.currentEndpoint);
      this.updateHeaders();
    }
  };

  init = async () => {
    this.store = await createPersistStore({
      name: 'openapi', // migrated from openapi
      template: {
        deviceId: this.generateDeviceId()
      }
    });

    const chainType = preferenceService.getChainType();
    const chain = CHAINS_MAP[chainType];
    this.currentEndpoint = chain.endpoints[0];

    // Update client configuration
    this.client.setBaseURL(this.currentEndpoint);

    // Set common headers
    this.updateHeaders();

    if (!this.store.deviceId) {
      this.store.deviceId = this.generateDeviceId();
    }
  };

  setClientAddress = async (address: string, flag: number) => {
    this.clientAddress = address;
    this.addressFlag = flag;
    this.updateHeaders();
  };

  updateHeaders = () => {
    const headers: Record<string, string> = {
      'x-client': 'UniSat Wallet',
      'x-version': VERSION,
      'x-channel': CHANNEL
    };

    if (this.store?.deviceId) {
      headers['x-udid'] = this.store.deviceId;
    }

    if (this.clientAddress) {
      headers['x-address'] = this.clientAddress;
    }

    this.client.setHeaders(headers);
  };

  private generateDeviceId = (): string => {
    return randomstring.generate(12);
  };

  // Expose the client for direct access to all API methods
  getClient = (): UniSatApiClient => {
    return this.client;
  };

  // Proxy common methods for convenience
  get bitcoin() {
    return this.client.bitcoin;
  }
  get inscriptions() {
    return this.client.inscriptions;
  }
  get brc20() {
    return this.client.brc20;
  }
  get runes() {
    return this.client.runes;
  }
  get alkanes() {
    return this.client.alkanes;
  }
  get cat() {
    return this.client.cat;
  }
  get market() {
    return this.client.market;
  }
  get domain() {
    return this.client.domain;
  }
  get utility() {
    return this.client.utility;
  }
  get config() {
    return this.client.config;
  }
}

// Create and export singleton instance
const walletApiService = new WalletApiService();

export { walletApiService };
export default walletApiService;
