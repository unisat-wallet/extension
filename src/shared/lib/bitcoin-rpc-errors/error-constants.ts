export const errorDetails = {
  rpc: {
    parse: { code: -32700, message: 'Invalid JSON was received by the server.' },
    invalidRequest: { code: -32600, message: 'The JSON sent is not a valid Request object.' },
    methodNotFound: { code: -32601, message: 'The method does not exist or is not available.' },
    invalidParams: { code: -32602, message: 'Invalid method parameter(s).' },
    internal: { code: -32603, message: 'Internal JSON-RPC error.' },
    transactionRejected: { code: -32003, message: 'Transaction rejected.' },
    resourceUnavailable: { code: -32002, message: 'Resource unavailable.' },
    methodNotSupported: { code: -32004, message: 'Method not supported.' },
    limitExceeded: { code: -32005, message: 'Request limit exceeded.' },
  },
  provider: {
    userRejectedRequest: { code: 4001, message: 'User rejected the request.' },
    unauthorized: { code: 4100, message: 'Unauthorized access.' },
    unsupportedMethod: { code: 4200, message: 'Unsupported method.' },
    disconnected: { code: 4900, message: 'The provider is disconnected.' },
    chainDisconnected: { code: 4901, message: 'The provider is disconnected from the specified chain.' },
  },
};
