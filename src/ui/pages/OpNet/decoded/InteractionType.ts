export enum InteractionOP20 {
    Transfer = '3b88ef57', // transfer(address,uint256)
    TransferFrom = '4b6685e7', // transferFrom(address,address,uint256)
    Approve = '9f0bb8a9', // approve(address,uint256)
    ApproveFrom = '8e72bde0', // approveFrom(address,uint256,bytes)
    Burn = '308dce5f', // burn(uint256)
    Mint = '3950e061', // mint(address,uint256)
    Airdrop = '3a546b21',
    AirdropWithAmount = 'ca1a382d'
}

export enum InteractionMotoswap {
    AddLiquidity = 'x'
}

export enum InteractionTypeNativeSwap {
    Reserve = 'c63a50d7', // reserve(address,uint256,uint256,bool)
    ListLiquidity = '2960f13b', // listLiquidity(address,string,uint256,bool)
    CancelListing = 'a48e507c', // cancelListing(address)
    CreatePool = 'ced27635', // createPool(address,uint256,uint256,string,uint32,uint256,uint32)
    CreatePoolWithSignature = '4203f335', // createPoolWithSignature(bytes,uint256,address,uint256,uint256,string,uint32,uint256,uint32)
    SetFees = 'b1a5f7c2', // setFees(uint256,uint256,uint256)
    AddLiquidity = '90d83548', // addLiquidity(address,string,uint256,bool)
    RemoveLiquidity = '70dccc7f', // removeLiquidity(address,uint256)
    Swap = 'dbed39e2' // swap(address)
}

export type InteractionType = InteractionOP20 | InteractionTypeNativeSwap | InteractionMotoswap;

const interactionTypes = [InteractionOP20, InteractionMotoswap, InteractionTypeNativeSwap];

export function isInteractionType(selector: string): selector is InteractionType {
    return interactionTypes.some((type) => Object.values(type).includes(selector));
}
