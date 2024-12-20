import { BitcoinProviderError, BitcoinRpcError } from "../lib/bitcoin-rpc-errors/classes";

export type WalletError = Error | BitcoinProviderError | BitcoinRpcError;

export enum WalletErrorType {
    GeneralError = 'GeneralError',
    BitcoinRpcError = 'BitcoinRpcError',
    BitcoinProviderError = 'BitcoinProviderError'
}

export interface SerializedWalletError {
    type: WalletErrorType;
    message: string;
    code?: number;
    data?: unknown;
    stack?: string;
}

