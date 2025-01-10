import { OPTokenInfo } from '@/shared/types';
import { AddressMap } from '@btc-vision/transaction';

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
    Swap = 'swap'
}

export interface BaseRawTxInfo<T extends Action> {
    readonly header: string;
    readonly features: PotentialFeatures;
    readonly tokens: OPTokenInfo[];
    readonly feeRate: number;
    readonly priorityFee: bigint;
    readonly gasSatFee?: bigint; // TODO: Implement this.

    readonly action: T;
}

export interface TransferParameters extends BaseRawTxInfo<Action.Transfer> {
    readonly contractAddress: string;
    readonly to: string;
    readonly inputAmount: number;
}

export interface AirdropParameters extends BaseRawTxInfo<Action.Airdrop> {
    readonly contractAddress: string;
    readonly amounts: AddressMap<bigint>;
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

export type RawTxInfo =
    | TransferParameters
    | AirdropParameters
    | SendBitcoinParameters
    | DeployContractParameters
    | MintParameters
    | SwapParameters;
