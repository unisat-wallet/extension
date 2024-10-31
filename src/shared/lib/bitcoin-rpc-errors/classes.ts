
export class BitcoinRpcError extends Error {
    public code: number;
    public data?: unknown;

    constructor(code: number, message: string, data?: unknown) {
        if (!Number.isInteger(code)) {
            throw new Error('"code" must be an integer.');
        }
        if (!message || typeof message !== 'string') {
            throw new Error('"message" must be a non-empty string.');
        }
        super(message);
        this.code = code;
        this.data = data;
    }
}

export class BitcoinProviderError extends BitcoinRpcError {
    constructor(code: number, message: string, data?: unknown) {
        if (code < 4000 || code > 4999) {
            throw new Error('"code" must be between 4000 and 4999.');
        }
        super(code, message, data);
    }
}
  
  