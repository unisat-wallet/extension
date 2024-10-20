import { ChainType } from '@/shared/constant';

export enum SessionEvent {
    networkChanged = 'networkChanged',
    accountChanged = 'accountChanged',
    walletDisconnected = 'walletDisconnected',
    walletConnected = 'walletConnected',
    walletError = 'walletError',
    unlock = 'unlock',
    lock = 'lock',
    chainChanged = 'chainChanged'
}

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

export interface WalletErrorEventData extends BaseSessionEventPayload {}

export interface WalletConnectedEventData extends BaseSessionEventPayload {}

export interface WalletDisconnectedEventData extends BaseSessionEventPayload {}

export type SessionEventPayload<T extends SessionEvent> = T extends SessionEvent.networkChanged
    ? NetworkChangedEventData
    : T extends SessionEvent.accountChanged
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
