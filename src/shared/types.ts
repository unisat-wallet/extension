import { PaymentChannelType } from './constant';

export enum AddressType {
    P2PKH,
    P2WPKH,
    P2TR,
    P2SH_P2WPKH,
    M44_P2WPKH,
    M44_P2TR
}

export enum NetworkType {
    MAINNET,
    TESTNET,
    REGTEST
}

export enum RestoreWalletType {
    OP_WALLET,
    UNISAT,
    SPARROW,
    XVERSE,
    OW,
    OTHERS
}

export interface BitcoinBalance {
    confirm_amount: string;
    pending_amount: string;
    amount: string;
    confirm_btc_amount: string;
    pending_btc_amount: string;
    btc_amount: string;
    confirm_inscription_amount: string;
    pending_inscription_amount: string;
    inscription_amount: string;
    usd_value: string;
}

export interface AddressAssets {
    total_btc: string;
    satoshis: number;
}

export interface TxHistoryInOutItem {
    address: string;
    value: number;
}

export interface TxHistoryItem {
    txid: string;
    confirmations: number;
    height: number;
    timestamp: number;
    size: number;
    feeRate: number;
    fee: number;
    outputValue: number;
    vin: TxHistoryInOutItem[];
    vout: TxHistoryInOutItem[];
    types: string[];
    methods: string[];
}

export interface AppInfo {
    logo: string;
    title: string;
    desc: string;
    url: string;
    time: number;
    id: number;
    tag?: string;
    readtime?: number;
    new?: boolean;
    tagColor?: string;
}

export interface AppSummary {
    apps: AppInfo[];
    readTabTime?: number;
}

export interface FeeSummary {
    list: {
        title: string;
        desc: string;
        feeRate: number;
    }[];
}

export interface BtcPrice {
    price: number;
    updateTime: number;
}

export interface UTXO {
    txid: string;
    vout: number;
    satoshis: number;
    scriptPk: string;
    addressType: AddressType;
}

export interface UTXO_Detail {
    txId: string;
    outputIndex: number;
    satoshis: number;
    scriptPk: string;
    addressType: AddressType;
}

export enum TxType {
    SIGN_TX,
    SEND_BITCOIN
}

interface BaseUserToSignInput {
    index: number;
    sighashTypes: number[] | undefined;
    disableTweakSigner?: boolean;
}

export interface AddressUserToSignInput extends BaseUserToSignInput {
    address: string;
}

export interface PublicKeyUserToSignInput extends BaseUserToSignInput {
    publicKey: string;
}

export type UserToSignInput = AddressUserToSignInput | PublicKeyUserToSignInput;

export interface SignPsbtOptions {
    autoFinalized: boolean;
    toSignInputs?: UserToSignInput[];
}

export interface ToSignInput {
    index: number;
    publicKey: string;
    sighashTypes?: number[];
}

export interface WalletKeyring {
    key: string;
    index: number;
    type: string;
    addressType: AddressType;
    accounts: Account[];
    alianName: string;
    hdPath: string;
}

export interface Account {
    type: string;
    pubkey: string;
    address: string;
    brandName?: string;
    alianName?: string;
    displayBrandName?: string;
    index?: number;
    balance?: number;
    key: string;
    flag: number;
}

export interface TokenBalance {
    availableBalance: string;
    overallBalance: string;
    ticker: string;
    transferableBalance: string;
    availableBalanceSafe: string;
    availableBalanceUnSafe: string;
    selfMint: boolean;
}

export interface TokenInfo {
    totalSupply: string;
    totalMinted: string;
    decimal: number;
    holder: string;
    inscriptionId: string;
    selfMint?: boolean;
}

export interface TokenTransfer {
    ticker: string;
    amount: string;
    inscriptionId: string;
    inscriptionNumber: number;
    timestamp: number;
    confirmations: number;
    satoshi: number;
}

export interface AddressTokenSummary {
    tokenInfo: TokenInfo;
    tokenBalance: TokenBalance;
    historyList: TokenTransfer[];
    transferableList: TokenTransfer[];
}

export enum RiskType {
    LOW_FEE_RATE,
    HIGH_FEE_RATE
}

export interface Risk {
    type: RiskType;
    level: 'danger' | 'warning' | 'critical';
    title: string;
    desc: string;
}

export interface DecodedPsbt {
    inputs: {
        txid: string;
        vout: number;
        address: string;
        value: number;
        sighashType?: number;
    }[];
    outputs: {
        address: string;
        value: number;
    }[];
    fee: number;
    feeRate: number;
    transactionSize: number;
    rbfEnabled: boolean;
    recommendedFeeRate: number;
    shouldWarnFeeRate: boolean;
}

export interface ToAddressInfo {
    address: string;
    domain?: string;
}

export interface RawTxInfo {
    psbtHex: string;
    rawtx: string;
    toAddressInfo?: ToAddressInfo;
    fee?: number;
}

export interface WalletConfig {
    version: string;
    moonPayEnabled: boolean;
    statusMessage: string;
    endpoint: string;
    chainTip: string;
}

export enum WebsiteState {
    CHECKING,
    SCAMMER,
    SAFE
}

export interface AddressSummary {
    address: string;
    totalSatoshis: number;
    loading?: boolean;
}

export interface VersionDetail {
    version: string;
    title: string;
    changelogs: string[];
}

export interface OPTokenInfo {
    name: string;
    amount: bigint;
    address: string;
    symbol: string;
    divisibility: number;
    logo?: string;
}

export interface BtcChannelItem {
    channel: PaymentChannelType;
    quote: number;
    payType: string[];
}

export interface TickPriceItem {
    curPrice: number;
    changePercent: number;
}

export interface BuyBtcChannel {
    channel: string;
}

export interface GroupAsset {
    type: number;
    address_arr: string[]; 
    satoshis_arr: number[];
}

export interface AddressRecentHistory {
    start: number; 
    total: number; 
    detail: TxHistoryItem[];
}

export interface ParsedSignPsbtUr {
    psbtHex: string;
    rawTx: string;
}

export interface ParsedSignMsgUr {
    requestId: string;
    publicKey: string;
    signature: string;
}
