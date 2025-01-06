export enum InteractionOP20 {
    Transfer = '27f576ca', // transfer(address,uint256)
    TransferFrom = '23b872dd', // transferFrom(address,address,uint256)
    Approve = '74e21680', // approve(address,uint256)
    ApproveFrom = 'xxxxxx07', // approveFrom(address,uint256,bytes)
    Burn = 'xxxxxx09', // burn(uint256)
    Mint = 'xxxxxx10', // mint(address,uint256)
    Airdrop = 'xxxxxx11', // airdrop(AddressMap<bigint>)
    AirdropWithAmount = 'xxxxxx12' // airdropWithAmount(uint256,address[])
}

export enum InteractionMotoswap {
    AddLiquidity = 'eb686505'
}

export enum InteractionTypeNativeSwap {
    Reserve = 'x', // reserve(address,uint256,uint256,bool)
    ListLiquidity = 'x', // listLiquidity(address,string,uint256,bool)
    CancelListing = 'x', // cancelListing(address)
    CreatePool = '6fae9005', // createPool(address,uint256,uint256,string,uint32,uint256,uint32)
    CreatePoolWithSignature = 'x', // createPoolWithSignature(bytes,uint256,address,uint256,uint256,string,uint32,uint256,uint32)
    SetFees = 'x', // setFees(uint256,uint256,uint256)
    AddLiquidity = 'x', // addLiquidity(address,string,uint256,bool)
    RemoveLiquidity = 'x', // removeLiquidity(address,uint256)
    Swap = 'x' // swap(address)
}

export type InteractionType = InteractionOP20 | InteractionTypeNativeSwap | InteractionMotoswap;

const interactionTypes = [InteractionOP20, InteractionMotoswap, InteractionTypeNativeSwap];

export function isInteractionType(selector: string): selector is InteractionType {
    return interactionTypes.some((type) => Object.values(type).includes(selector));
}
