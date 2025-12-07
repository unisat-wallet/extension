/**
 * Type definitions for provider
 */

export interface Interceptor {
  onRequest?: (data: any) => any;
  onResponse?: (res: any, data: any) => any;
}

export interface StateProvider {
  accounts: string[] | null;
  isConnected: boolean;
  isUnlocked: boolean;
  initialized: boolean;
  isPermanentlyDisconnected: boolean;
}

export interface ProviderPrivateState {
  _selectedAddress: string | null;
  _network: string | null;
  _isConnected: boolean;
  _initialized: boolean;
  _isUnlocked: boolean;
  _state: StateProvider;
  _pushEventHandlers: any;
  _requestPromise: any;
  _bcm: any;
}
