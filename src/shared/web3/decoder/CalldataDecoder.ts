import {
    InteractionMotoswap,
    InteractionOP20,
    InteractionTypeNativeSwap,
    isInteractionType
} from '@/ui/pages/OpNet/decoded/InteractionType';

export function selectorToString(calldata: string): string {
    if (calldata.length < 4) {
        return 'Unknown Interaction';
    }

    const data = Buffer.from(calldata, 'hex');
    const selector = data.subarray(0, 4).toString('hex');

    if (!isInteractionType(selector)) {
        return `Unknown Interaction : 0x${selector}`;
    }

    switch (selector) {
        // OP20
        case InteractionOP20.Transfer:
            return 'transfer(address,uint256)';
        case InteractionOP20.Approve:
            return 'approve(address,uint256)';
        case InteractionOP20.TransferFrom:
            return 'transferFrom(address,address,uint256)';
        // Motoswap
        case InteractionMotoswap.AddLiquidity:
            return 'addLiquidity(address,address,bigint,bigint,bigint,bigint,address,bigint)';
        // NativeSwap
        case InteractionTypeNativeSwap.Reserve:
            return 'reserve(address,uint256,uint256,bool)';
        case InteractionTypeNativeSwap.ListLiquidity:
            return 'listLiquidity(address,string,uint256,bool)';
        case InteractionTypeNativeSwap.CancelListing:
            return 'cancelListing(address)';
        case InteractionTypeNativeSwap.CreatePool:
            return 'createPool(address,uint256,uint256,...)';
        case InteractionTypeNativeSwap.CreatePoolWithSignature:
            return 'createPoolWithSignature(bytes,uint256,address,...)';
        case InteractionTypeNativeSwap.SetFees:
            return 'setFees(uint256,uint256,uint256)';
        case InteractionTypeNativeSwap.AddLiquidity:
            return 'addLiquidity(address,string,uint256,bool)';
        case InteractionTypeNativeSwap.RemoveLiquidity:
            return 'removeLiquidity(address,uint256)';
        case InteractionTypeNativeSwap.Swap:
            return 'swap(address)';
        default:
            return `Unknown Interaction : 0x${selector}`;
    }
}
