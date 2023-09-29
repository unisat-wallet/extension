/**@ignore */
export enum RPCMethod {}

/**@ignore */
export enum RPCErrorCode {
  // Standard JSON-RPC 2.0 errors
  // RPC_INVALID_REQUEST is internally mapped to HTTP_BAD_REQUEST (400).
  // It should not be used for application-layer errors.
  RPC_INVALID_REQUEST = -32600,
  // RPC_METHOD_NOT_FOUND is internally mapped to HTTP_NOT_FOUND (404).
  // It should not be used for application-layer errors.
  RPC_METHOD_NOT_FOUND = -32601,
  RPC_INVALID_PARAMS = -32602,
  // RPC_INTERNAL_ERROR should only be used for genuine errors in bitcoind
  // (for example datadir corruption).
  RPC_INTERNAL_ERROR = -32603,
  RPC_PARSE_ERROR = -32700,

  // General application defined errors
  RPC_MISC_ERROR = -1, // std::exception thrown in command handling
  RPC_TYPE_ERROR = -3, // Unexpected type was passed as parameter
  RPC_INVALID_ADDRESS_OR_KEY = -5, // Invalid address or key
  RPC_INVALID_PARAMETER = -8, // Invalid, missing or duplicate parameter
  RPC_DATABASE_ERROR = -20, // Database error
  RPC_DESERIALIZATION_ERROR = -22, // Error parsing or validating structure in raw format
  RPC_VERIFY_ERROR = -25, // General error during transaction or block submission
  RPC_VERIFY_REJECTED = -26, // Transaction or block was rejected by network rules
  RPC_IN_WARMUP = -28, // Client still warming up
  RPC_METHOD_DEPRECATED = -32 // RPC method is deprecated
}
