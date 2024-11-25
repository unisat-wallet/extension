import { ChainType } from '@/shared/constant';

export enum SessionEvent {
    networkChanged = 'networkChanged',
    accountsChanged = 'accountsChanged',
    walletDisconnected = 'walletDisconnected',
    walletConnected = 'walletConnected',
    walletError = 'walletError',
    unlock = 'unlock',
    lock = 'lock',
    chainChanged = 'chainChanged'
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface BaseSessionEventPayload {}

export interface NetworkChangedEventData extends BaseSessionEventPayload {
    network: string;
    chainType: ChainType;
}

export interface ChainChangedEventData extends BaseSessionEventPayload {
    name: string;
    network: string;
    enum: ChainType;
}

export type WalletErrorEventData = BaseSessionEventPayload

export type WalletConnectedEventData = BaseSessionEventPayload

export type WalletDisconnectedEventData = BaseSessionEventPayload

export type SessionEventPayload<T extends SessionEvent> = T extends SessionEvent.networkChanged
    ? NetworkChangedEventData
    : T extends SessionEvent.accountsChanged
    ? string[]
    : T extends SessionEvent.walletDisconnected
    ? WalletDisconnectedEventData
    : T extends SessionEvent.walletConnected
    ? WalletConnectedEventData
    : T extends SessionEvent.walletError
    ? WalletErrorEventData
    : T extends SessionEvent.unlock
    ? BaseSessionEventPayload
    : T extends SessionEvent.lock
    ? BaseSessionEventPayload
    : T extends SessionEvent.chainChanged
    ? ChainChangedEventData
    : never;
