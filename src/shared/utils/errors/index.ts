import { BitcoinProviderError, BitcoinRpcError } from "@/shared/lib/bitcoin-rpc-errors/classes";
import { SerializedWalletError, WalletError, WalletErrorType } from "@/shared/types/Error";

export function serializeError(error: WalletError): SerializedWalletError {
    if (error instanceof BitcoinRpcError) {
        return {
            type: WalletErrorType.BitcoinRpcError,
            message: error.message,
            code: error.code,
            data: error.data,
        };
    } else if (error instanceof BitcoinProviderError) {
        return {
            type: WalletErrorType.BitcoinProviderError,
            message: error.message,
            code: error.code,
            data: error.data,
        };
    } else {
        return {
            type: WalletErrorType.GeneralError,
            message: error.message,
            stack: error.stack,
        };
    }
}

export function deserializeError(serializedError: SerializedWalletError): WalletError {
    switch (serializedError.type) {
        case WalletErrorType.BitcoinRpcError: {
            if (serializedError.code === undefined) {
                throw new Error("Missing 'code' for BitcoinRpcError during deserialization");
            }
            return new BitcoinRpcError(
                serializedError.code,
                serializedError.message,
                serializedError.data
            );
        }
        case WalletErrorType.BitcoinProviderError: {
            if (serializedError.code === undefined) {
                throw new Error("Missing 'code' for BitcoinProviderError during deserialization");
            }
            return new BitcoinProviderError(
                serializedError.code,
                serializedError.message,
                serializedError.data
            );
        }
        case WalletErrorType.GeneralError:
        default: {
            const error = new Error(serializedError.message);
            error.stack = serializedError.stack;
            return error;
        }
    }
}

export function isWalletError(error: unknown): error is WalletError {
    return (
        error instanceof Error ||
        error instanceof BitcoinProviderError ||
        error instanceof BitcoinRpcError
    );
}



