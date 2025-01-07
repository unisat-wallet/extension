// decodeMethods.ts
import { BinaryReader } from '@btc-vision/transaction';
import {
    DecodedAddLiquidityNative,
    DecodedAirdrop,
    DecodedAirdropWithAmount,
    DecodedApprove,
    DecodedApproveFrom,
    DecodedBurn,
    DecodedCancelListing,
    DecodedCreatePool,
    DecodedCreatePoolWithSignature,
    DecodedListLiquidity,
    DecodedMint,
    DecodedRemoveLiquidity,
    DecodedReserve,
    DecodedSetFees,
    DecodedSwap,
    DecodedTransfer,
    DecodedTransferFrom
} from './DecodedTypes';
import { InteractionType } from './InteractionType';

/**
 * Helpers for reading custom data from a BinaryReader
 * Adjust these according to your actual encoding.
 */
function decodeBoolean(reader: BinaryReader): boolean {
    return reader.readU8() !== 0;
}

function decodeString(reader: BinaryReader): string {
    return reader.readStringWithLength();
}

function decodeAddressMap(reader: BinaryReader): unknown {
    return reader.readAddressValueTuple();
}

/**
 * On OP_VISION, `reader.readAddress()` typically reads 32 bytes or however your chain encodes addresses.
 */
function decodeAddress(reader: BinaryReader): string {
    const addr = reader.readAddress();
    return addr.toString();
}

/* ---------------------------------------------------------------------------
 *                   OP_20 (ERC-20 style) decode methods
 * -------------------------------------------------------------------------*/
export function decodeTransfer(selector: InteractionType, reader: BinaryReader): DecodedTransfer {
    const recipient = decodeAddress(reader);
    const amount = reader.readU256();
    return { selector, recipient, amount };
}

export function decodeTransferFrom(selector: InteractionType, reader: BinaryReader): DecodedTransferFrom {
    const sender = decodeAddress(reader);
    const recipient = decodeAddress(reader);
    const amount = reader.readU256();
    return { selector, sender, recipient, amount };
}

export function decodeApprove(selector: InteractionType, reader: BinaryReader): DecodedApprove {
    const spender = decodeAddress(reader);
    const amount = reader.readU256();
    return { selector, spender, amount };
}

export function decodeApproveFrom(selector: InteractionType, reader: BinaryReader): DecodedApproveFrom {
    const spender = decodeAddress(reader);
    const amount = reader.readU256();
    const signature = reader.readBytesWithLength();
    return { selector, spender, amount, signature };
}

export function decodeBurn(selector: InteractionType, reader: BinaryReader): DecodedBurn {
    const value = reader.readU256();
    return { selector, value };
}

export function decodeMint(selector: InteractionType, reader: BinaryReader): DecodedMint {
    const address = decodeAddress(reader);
    const value = reader.readU256();
    return { selector, address, value };
}

export function decodeAirdrop(selector: InteractionType, reader: BinaryReader): DecodedAirdrop {
    const addressMapData = decodeAddressMap(reader);
    return { selector, addressMapData };
}

export function decodeAirdropWithAmount(selector: InteractionType, reader: BinaryReader): DecodedAirdropWithAmount {
    const amount = reader.readU256();
    const addresses = reader.readAddressArray().map((addr) => addr.toString());

    return { selector, amount, addresses };
}

/* ---------------------------------------------------------------------------
 *                   NativeSwap decode methods
 * -------------------------------------------------------------------------*/
export function decodeReserve(selector: InteractionType, reader: BinaryReader): DecodedReserve {
    const token = decodeAddress(reader);
    const maximumAmountIn = reader.readU256();
    const minimumAmountOut = reader.readU256();
    const forLP = decodeBoolean(reader);
    return { selector, token, maximumAmountIn, minimumAmountOut, forLP };
}

export function decodeListLiquidity(selector: InteractionType, reader: BinaryReader): DecodedListLiquidity {
    const token = decodeAddress(reader);
    const receiver = decodeString(reader);
    const amountIn = reader.readU128();
    const priority = decodeBoolean(reader);
    return { selector, token, receiver, amountIn, priority };
}

export function decodeCancelListing(selector: InteractionType, reader: BinaryReader): DecodedCancelListing {
    const token = decodeAddress(reader);
    return { selector, token };
}

export function decodeCreatePool(selector: InteractionType, reader: BinaryReader): DecodedCreatePool {
    const token = decodeAddress(reader);
    const floorPrice = reader.readU256();
    const initialLiquidity = reader.readU128();
    const receiver = decodeString(reader);
    const antiBotEnabledFor = Number(reader.readU16());
    const antiBotMaximumTokensPerReservation = reader.readU256();
    const maxReservesIn5BlocksPercent = Number(reader.readU16());

    return {
        selector,
        token,
        floorPrice,
        initialLiquidity,
        receiver,
        antiBotEnabledFor,
        antiBotMaximumTokensPerReservation,
        maxReservesIn5BlocksPercent
    };
}

export function decodeCreatePoolWithSignature(
    selector: InteractionType,
    reader: BinaryReader
): DecodedCreatePoolWithSignature {
    const signature = reader.readBytesWithLength();
    const approveAmount = reader.readU256();
    const token = decodeAddress(reader);
    const floorPrice = reader.readU256();
    const initialLiquidity = reader.readU128();
    const receiver = decodeString(reader);
    const antiBotEnabledFor = Number(reader.readU16());
    const antiBotMaximumTokensPerReservation = reader.readU256();
    const maxReservesIn5BlocksPercent = Number(reader.readU16());

    return {
        selector,
        signature,
        approveAmount,
        token,
        floorPrice,
        initialLiquidity,
        receiver,
        antiBotEnabledFor,
        antiBotMaximumTokensPerReservation,
        maxReservesIn5BlocksPercent
    };
}

export function decodeSetFees(selector: InteractionType, reader: BinaryReader): DecodedSetFees {
    const reservationBaseFee = reader.readU64();
    const priorityQueueBaseFee = reader.readU64();
    const pricePerUserInPriorityQueueBTC = reader.readU64();
    return { selector, reservationBaseFee, priorityQueueBaseFee, pricePerUserInPriorityQueueBTC };
}

export function decodeAddLiquidity(selector: InteractionType, reader: BinaryReader): DecodedAddLiquidityNative {
    const token = decodeAddress(reader);
    const receiver = decodeString(reader);
    return { selector, token, receiver };
}

export function decodeRemoveLiquidity(selector: InteractionType, reader: BinaryReader): DecodedRemoveLiquidity {
    const token = decodeAddress(reader);
    const amount = reader.readU256();
    return { selector, token, amount };
}

export function decodeSwap(selector: InteractionType, reader: BinaryReader): DecodedSwap {
    const token = decodeAddress(reader);
    return { selector, token };
}
