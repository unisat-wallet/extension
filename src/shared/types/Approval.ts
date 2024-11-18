import { SessionInfo as Session } from '@/background/service/session';
import { IDeploymentParameters } from '@btc-vision/transaction';
import { ChainType } from '../constant';
import { NetworkType, RawTxInfo, SignPsbtOptions, TxType } from '../types';
import { DetailedInteractionParameters } from '../web3/interfaces/DetailedInteractionParameters';
import { WalletError } from './Error';
import { ProviderControllerRequest } from './Request';

// APPROVAL CONTEXT
export interface ApprovalContext {
    request: ProviderControllerRequest & {
        requestedApproval?: boolean;
    };
    mapMethod: string;
    approvalRes?: ApprovalResponse;
}

// APPROVAL OBJECT INTERFACE
export interface Approval {
    data: ApprovalData;

    resolve(params?: ApprovalResponse): void;

    reject(err: WalletError): void;
}

// UNION OF APPROVAL DATA
export type ApprovalData = LockApprovalData | StandardApprovalData;

// LOCK APPROVAL DATA
export interface LockApprovalData {
    lock: boolean;
}

// STANDARD APPROVAL DATA
export type StandardApprovalData<T extends ApprovalType = ApprovalType> = {
    approvalComponent: T;
    params: ApprovalComponentParams<T>;
    origin?: string;
    approvalType?: string;
}

// APPROVAL COMPONENTS(TYPES) ENUM
export enum ApprovalType {
    Connect = 'Connect',
    SignData = 'SignData',
    SignInteraction = 'SignInteraction',
    SignPsbt = 'SignPsbt',
    SignText = 'SignText',
    SwitchChain = 'SwitchChain',
    SwitchNetwork = 'SwitchNetwork',
    SignDeployment = 'SignDeployment',
}

// APPROVAL COMPONENT PARAMS MAPPING
export type ApprovalComponentParams<T extends ApprovalType> = 
    T extends ApprovalType.Connect ? ConnectApprovalParams :
    T extends ApprovalType.SignData ? SignDataApprovalParams :
    T extends ApprovalType.SignInteraction ? SignInteractionApprovalParams :
    T extends ApprovalType.SignPsbt ? SignPsbtApprovalParams :
    T extends ApprovalType.SignText ? SignTextApprovalParams :
    T extends ApprovalType.SwitchChain ? SwitchChainApprovalParams :
    T extends ApprovalType.SwitchNetwork ? SwitchNetworkApprovalParams :
    T extends ApprovalType.SignDeployment ? SignDeploymentApprovalParams :
    never;

// UNION OF APPROVAL RESPONSES
export type ApprovalResponse =
    | LockApprovalResponse
    | ConnectApprovalResponse
    | SwitchNetworkApprovalResponse
    | SwitchChainApprovalResponse
    | SignPsbtApprovalResponse
    | SignInteractionApprovalResponse
    | SignDeploymentApprovalResponse
    | SignTextApprovalResponse
    | SignDataApprovalResponse;


// APPROVAL RESPONSES
export interface BaseApprovalResponse {
    uiRequestComponent?: string;
}

export type LockApprovalResponse = BaseApprovalResponse | undefined;

export type ConnectApprovalResponse = BaseApprovalResponse | undefined;

export type SwitchNetworkApprovalResponse = BaseApprovalResponse | undefined;

export type SwitchChainApprovalResponse = BaseApprovalResponse | undefined;

export interface SignPsbtApprovalResponse extends BaseApprovalResponse {
    psbtHex: string;
    signed: boolean;
}

export type SignInteractionApprovalResponse = BaseApprovalResponse | undefined;

export type SignDeploymentApprovalResponse = BaseApprovalResponse | undefined;

export interface SignTextApprovalResponse extends BaseApprovalResponse {
    signature?: string;
}

export type SignDataApprovalResponse = BaseApprovalResponse | undefined;


// APPROVAL REQUEST PARAMS
export interface ConnectApprovalParams {
    method: string;
    data: Record<never, never>;
    session: Session;
}

export interface SignDataApprovalParams {
    method: string;
    data: {
        data: string;
    };
    session: Session;
}

export interface SignInteractionApprovalParams {
    method: string;
    data: DetailedInteractionParameters;
    session: Session;
}

export interface SignPsbtApprovalParams {
    method: string;
    data: {
        type: TxType;
        psbtHex: string;
        options?: SignPsbtOptions;
        rawTxInfo?: RawTxInfo;
        sendBitcoinParams?: {
            toAddress: string;
            satoshis: number;
            memo: string;
            memos: string[];
            feeRate: number;
        };
        sendInscriptionParams?: {
            toAddress: string;
            inscriptionId: string;
            feeRate: number;
        };
        sendRunesParams?: {
            toAddress: string;
            runeid: string;
            amount: string;
            feeRate: number;
        };
    };
    session?: Session;
}

export interface SignTextApprovalParams {
    method: string;
    data: {
        text: string;
        type: string;
    };
    session: Session;
}

export interface SwitchChainApprovalParams {
    method: string;
    data: {
        chain: ChainType;
    };
    session: Session;
}

export interface SwitchNetworkApprovalParams {
    method: string;
    data: {
        networkType: NetworkType;
    };
    session: Session;
}

export interface SignDeploymentApprovalParams {
    method: string;
    data: IDeploymentParameters;
    session: Session;
}
