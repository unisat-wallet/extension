// DecodedTypes.ts

/**
 * Base decoded interface
 */
export interface Decoded {
    readonly selector: string;
}

// -----------------------------------------
// OP_20 Decoded Interfaces
// -----------------------------------------
export interface DecodedTransfer extends Decoded {
    recipient: string; // or Address
    amount: bigint;
}

export interface DecodedTransferFrom extends Decoded {
    sender: string;
    recipient: string;
    amount: bigint;
}

export interface DecodedApprove extends Decoded {
    spender: string;
    amount: bigint;
}

export interface DecodedApproveFrom extends Decoded {
    spender: string;
    amount: bigint;
    signature: Uint8Array; // or Buffer
}

export interface DecodedBurn extends Decoded {
    value: bigint;
}

export interface DecodedMint extends Decoded {
    address: string;
    value: bigint;
}

export interface DecodedAirdrop extends Decoded {
    addressMapData: unknown;
    // For a real decode, you'd need to parse an Address->bigint map
}

export interface DecodedAirdropWithAmount extends Decoded {
    amount: bigint;
    addresses: string[]; // or Address[]
}

// -----------------------------------------
// NativeSwap Decoded Interfaces
// -----------------------------------------

export interface DecodedReserve extends Decoded {
    token: string; // or Address
    maximumAmountIn: bigint;
    minimumAmountOut: bigint;
    forLP: boolean;
}

export interface DecodedListLiquidity extends Decoded {
    token: string;
    receiver: string; // a string-encoded BTC address
    amountIn: bigint;
    priority: boolean;
}

export interface DecodedCancelListing extends Decoded {
    token: string;
}

export interface DecodedCreatePool extends Decoded {
    token: string;
    floorPrice: bigint;
    initialLiquidity: bigint;
    receiver: string;
    antiBotEnabledFor: number;
    antiBotMaximumTokensPerReservation: bigint;
    maxReservesIn5BlocksPercent: number;
}

export interface DecodedCreatePoolWithSignature extends Decoded {
    signature: Uint8Array; // or Buffer
    approveAmount: bigint;
    token: string;
    floorPrice: bigint;
    initialLiquidity: bigint;
    receiver: string;
    antiBotEnabledFor: number;
    antiBotMaximumTokensPerReservation: bigint;
    maxReservesIn5BlocksPercent: number;
}

export interface DecodedSetFees extends Decoded {
    reservationBaseFee: bigint;
    priorityQueueBaseFee: bigint;
    pricePerUserInPriorityQueueBTC: bigint;
}

export interface DecodedAddLiquidityNative extends Decoded {
    token: string;
    receiver: string;
    amountIn: bigint;
    priority: boolean;
}

export interface DecodedRemoveLiquidity extends Decoded {
    token: string;
    amount: bigint;
}

export interface DecodedSwap extends Decoded {
    token: string;
}
