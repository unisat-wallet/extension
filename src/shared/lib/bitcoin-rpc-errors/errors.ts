import { BitcoinProviderError, BitcoinRpcError } from "./classes";
import { errorDetails } from "./error-constants";

interface ErrorOptions {
    message?: string;
    data?: unknown;
}

export const rpcErrors = {
    parse: (options?: ErrorOptions) => new BitcoinRpcError(errorDetails.rpc.parse.code, options?.message ?? errorDetails.rpc.parse.message, options?.data),
    invalidRequest: (options?: ErrorOptions) => new BitcoinRpcError(errorDetails.rpc.invalidRequest.code, options?.message ?? errorDetails.rpc.invalidRequest.message, options?.data),
    methodNotFound: (options?: ErrorOptions) => new BitcoinRpcError(errorDetails.rpc.methodNotFound.code, options?.message ?? errorDetails.rpc.methodNotFound.message, options?.data),
    internal: (options?: ErrorOptions) => new BitcoinRpcError(errorDetails.rpc.internal.code, options?.message ?? errorDetails.rpc.internal.message, options?.data),
    transactionRejected: (options?: ErrorOptions) => new BitcoinRpcError(errorDetails.rpc.transactionRejected.code, options?.message ?? errorDetails.rpc.transactionRejected.message, options?.data),
    limitExceeded: (options?: ErrorOptions) => new BitcoinRpcError(errorDetails.rpc.limitExceeded.code, options?.message ?? errorDetails.rpc.limitExceeded.message, options?.data),
};
  
export const providerErrors = {
    userRejectedRequest: (options?: ErrorOptions) => new BitcoinProviderError(errorDetails.provider.userRejectedRequest.code, options?.message ?? errorDetails.provider.userRejectedRequest.message, options?.data),
    unauthorized: (options?: ErrorOptions) => new BitcoinProviderError(errorDetails.provider.unauthorized.code, options?.message ?? errorDetails.provider.unauthorized.message, options?.data),
    unsupportedMethod: (options?: ErrorOptions) => new BitcoinProviderError(errorDetails.provider.unsupportedMethod.code, options?.message ?? errorDetails.provider.unsupportedMethod.message, options?.data),
    disconnected: (options?: ErrorOptions) => new BitcoinProviderError(errorDetails.provider.disconnected.code, options?.message ?? errorDetails.provider.disconnected.message, options?.data),
    chainDisconnected: (options?: ErrorOptions) => new BitcoinProviderError(errorDetails.provider.chainDisconnected.code, options?.message ?? errorDetails.provider.chainDisconnected.message, options?.data),
};
  