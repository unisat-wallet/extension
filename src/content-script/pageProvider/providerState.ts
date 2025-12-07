/**
 * Provider state management
 * Handles the internal state of the provider
 */
import BroadcastChannelMessage from '@/shared/utils/message/broadcastChannelMessage';

import ReadyPromise from './readyPromise';
import { ProviderPrivateState } from './types';

const script = document.currentScript;
const channelName = script?.getAttribute('channel') || 'UNISAT';

export let cache_origin = '';

// Create Symbol key for private methods
export const requestMethodKey = Symbol('requestMethod');

export const _unisatProviderPrivate: ProviderPrivateState = {
  _selectedAddress: null,
  _network: null,
  _isConnected: false,
  _initialized: false,
  _isUnlocked: false,

  _state: {
    accounts: null,
    isConnected: false,
    isUnlocked: false,
    initialized: false,
    isPermanentlyDisconnected: false
  },

  _pushEventHandlers: null,
  _requestPromise: new ReadyPromise(0),
  _bcm: new BroadcastChannelMessage(channelName)
};

export function getProviderPrivate(): ProviderPrivateState {
  return _unisatProviderPrivate;
}

export function setCacheOrigin(origin: string): void {
  cache_origin = origin;
}

export function getCacheOrigin(): string {
  return cache_origin;
}
