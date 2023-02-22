// this script is injected into webpage's context
import { EventEmitter } from 'events';

import { INTERNAL_REQUEST_SESSION } from '@/shared/constant';

import { underline2Camelcase } from '.';
import { providerController } from '../controller';
import { preferenceService } from '../service';

interface StateProvider {
  accounts: string[] | null;
  isConnected: boolean;
  isUnlocked: boolean;
  initialized: boolean;
  isPermanentlyDisconnected: boolean;
}

export class BitcoinProvider extends EventEmitter {
  currentAccount = '';
  currentAccountType = '';
  currentAccountBrand = '';
  selectedAddress: string | null = null;

  _isConnected = true;
  _initialized = true;
  _isUnlocked = true;

  _state: StateProvider = {
    accounts: null,
    isConnected: true,
    isUnlocked: true,
    initialized: true,
    isPermanentlyDisconnected: false
  };

  _metamask = {
    isUnlocked: () => {
      return new Promise((resolve) => {
        resolve(this._isUnlocked);
      });
    }
  };

  constructor() {
    super();
    this.initialize();
  }

  initialize = async () => {
    this._initialized = true;
    this._state.initialized = true;
    this.emit('_initialized');
  };

  isConnected = () => {
    return false;
  };

  // TODO: support multi request!
  request = async (data) => {
    const { method } = data;
    const request = {
      data,
      session: INTERNAL_REQUEST_SESSION
    };
    const mapMethod = underline2Camelcase(method);
    const currentAccount = preferenceService.getCurrentAccount()!;
    if (!providerController[mapMethod]) {
      return;
    }
    switch (data.method) {
      case 'eth_accounts':
      case 'eth_requestAccounts':
        return [this.currentAccount];
      default:
        return providerController[mapMethod](request);
    }
  };

  // shim to matamask legacy api
  sendAsync = (payload, callback) => {
    if (Array.isArray(payload)) {
      return Promise.all(
        payload.map(
          (item) =>
            new Promise((resolve) => {
              this.sendAsync(item, (err, res) => {
                // ignore error
                resolve(res);
              });
            })
        )
      ).then((result) => callback(null, result));
    }
    const { method, params, ...rest } = payload;
    this.request({ method, params })
      .then((result) => callback(null, { ...rest, method, result }))
      .catch((error) => callback(error, { ...rest, method, error }));
  };

  send = (payload, callback?) => {
    if (typeof payload === 'string' && (!callback || Array.isArray(callback))) {
      // send(method, params? = [])
      return this.request({
        method: payload,
        params: callback
      }).then((result) => ({
        id: undefined,
        jsonrpc: '2.0',
        result
      }));
    }

    if (typeof payload === 'object' && typeof callback === 'function') {
      return this.sendAsync(payload, callback);
    }

    let result;
    switch (payload.method) {
      case 'eth_accounts':
        result = this.selectedAddress ? [this.selectedAddress] : [];
        break;
      default:
        throw new Error('sync method doesnt support');
    }

    return {
      id: payload.id,
      jsonrpc: payload.jsonrpc,
      result
    };
  };
}

const provider = new BitcoinProvider();

window.dispatchEvent(new Event('unisat#initialized'));

export default {
  currentProvider: new Proxy(provider, {
    deleteProperty: () => true
  })
};
