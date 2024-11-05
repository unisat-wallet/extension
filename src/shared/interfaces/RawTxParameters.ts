import { OPTokenInfo } from '@/shared/types';

export enum Features {
    rbf = 'rbf',
    taproot = 'taproot',
    segwit = 'segwit'
}

export type PotentialFeatures = {
    [key in Features]?: boolean;
};

export enum Action {
    Transfer = 'transfer',
    Airdrop = 'airdrop',
    SendBitcoin = 'sendBitcoin',
    DeployContract = 'deploy',
    Mint = 'mint',
    Swap = 'swap',
    Stake = 'stake',
    Wrap = 'wrap',
    Unwrap = 'unwrap',
    Unstake = 'unstake',
    Claim = 'claim'
}

export interface BaseRawTxInfo<T extends Action> {
    readonly header: string;
    readonly features: PotentialFeatures;
    readonly tokens: OPTokenInfo[];
    readonly feeRate: number;
    readonly priorityFee: bigint;

    readonly action: T;
}

export interface TransferParameters extends BaseRawTxInfo<Action.Transfer> {
    readonly contractAddress: string;
    readonly to: string;
    readonly inputAmount: number;
}

export interface AirdropParameters extends BaseRawTxInfo<Action.Airdrop> {
    readonly contractAddress: string;
    readonly amounts: { pubKey: string; value: string }[];
}

export interface SendBitcoinParameters extends BaseRawTxInfo<Action.SendBitcoin> {
    readonly to: string;
    readonly inputAmount: number;
}

export interface DeployContractParameters extends BaseRawTxInfo<Action.DeployContract> {
    readonly file: File;
}

export interface MintParameters extends BaseRawTxInfo<Action.Mint> {
    readonly contractAddress: string;
    readonly inputAmount: number;
    readonly to: string;
}

export interface SwapParameters extends BaseRawTxInfo<Action.Swap> {
    readonly amountIn: number;
    readonly amountOut: number;
    readonly tokenIn: string;
    readonly tokenOut: string;
    readonly slippageTolerance: number;
    readonly deadline: string;
}

export interface StakeParameters extends BaseRawTxInfo<Action.Stake> {
    readonly inputAmount: number;
}

export interface WrapParameters extends BaseRawTxInfo<Action.Wrap> {
    readonly inputAmount: number;
}

export interface UnwrapParameters extends BaseRawTxInfo<Action.Unwrap> {
    readonly inputAmount: number;
}

export type UnstakeParameters = BaseRawTxInfo<Action.Unstake>

export type ClaimParameters = BaseRawTxInfo<Action.Claim>

export type RawTxInfo =
    | TransferParameters
    | AirdropParameters
    | SendBitcoinParameters
    | DeployContractParameters
    | MintParameters
    | SwapParameters
    | StakeParameters
    | WrapParameters
    | UnwrapParameters
    | UnstakeParameters
    | ClaimParameters;
