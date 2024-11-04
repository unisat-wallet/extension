import BigNumber from 'bignumber.js';
import { CallResult, getContract, IOP_20Contract, JSONRpcProvider, OP_20_ABI, UTXOs } from 'opnet';

import { CHAINS_MAP, ChainType } from '@/shared/constant';
import { NetworkType } from '@/shared/types';
import { contractLogoManager } from '@/shared/web3/contracts-logo/ContractLogoManager';
import { ContractInformation } from '@/shared/web3/interfaces/ContractInformation';
import { ContractNames } from '@/shared/web3/metadata/ContractNames';
import { networks } from '@btc-vision/bitcoin';
import { Network } from '@btc-vision/bitcoin/src/networks.js';
import {
    Address,
    AddressVerificator,
    ChainId,
    OPNetLimitedProvider,
    OPNetMetadata,
    OPNetNetwork,
    OPNetTokenMetadata,
    TransactionFactory,
    UTXO
} from '@btc-vision/transaction';

BigNumber.config({ EXPONENTIAL_AT: 256 });

export function getOPNetChainType(chain: ChainType): ChainId {
    switch (chain) {
        case ChainType.FRACTAL_BITCOIN_MAINNET: {
            return ChainId.Fractal;
        }
        case ChainType.FRACTAL_BITCOIN_TESTNET: {
            return ChainId.Fractal;
        }
        default:
            return ChainId.Bitcoin;
    }
}

export function getOPNetNetwork(network: NetworkType): OPNetNetwork {
    switch (network) {
        case NetworkType.MAINNET:
            return OPNetNetwork.Mainnet;
        case NetworkType.TESTNET:
            return OPNetNetwork.Testnet;
        case NetworkType.REGTEST:
            return OPNetNetwork.Regtest;
        default:
            throw new Error('Invalid network type');
    }
}

export function getBitcoinLibJSNetwork(network: NetworkType): Network {
    switch (network) {
        case NetworkType.MAINNET:
            return networks.bitcoin;
        case NetworkType.TESTNET:
            return networks.testnet;
        case NetworkType.REGTEST:
            return networks.regtest;
        default:
            throw new Error('Invalid network type');
    }
}

export function bigIntToDecimal(amount: bigint, decimal: number): string {
    const number = new BigNumber(amount.toString()).dividedBy(new BigNumber(10).pow(decimal));

    return number.decimalPlaces(decimal).toPrecision();
}

class Web3API {
    public readonly INVALID_PUBKEY_ERROR: string =
        'Please use the recipient token deposit address (aka "public key").\nOP_NET was unable to automatically find the public key associated with the address you are trying to send to because this address never spent an UTXO before.';

    public network: Network = networks.bitcoin;
    public chainId: ChainId = ChainId.Bitcoin;

    public transactionFactory: TransactionFactory = new TransactionFactory();

    private currentChain?: ChainType;

    constructor() {
        this.setProviderFromUrl('https://api.opnet.org');
    }

    private _limitedProvider: OPNetLimitedProvider | undefined;

    public get limitedProvider(): OPNetLimitedProvider {
        if (!this._limitedProvider) {
            throw new Error('Limited provider not set');
        }

        return this._limitedProvider;
    }

    private _provider: JSONRpcProvider | undefined;

    public get provider(): JSONRpcProvider {
        if (!this._provider) {
            throw new Error('Provider not set');
        }

        return this._provider;
    }

    public get WBTC(): Address | null {
        if (!this.metadata) return null;

        return this.metadata.wbtc;
    }

    public get ROUTER_ADDRESS(): Address | null {
        if (!this.metadata) return null;

        return this.metadata.router;
    }

    private _metadata?: OPNetTokenMetadata;

    private get metadata(): OPNetTokenMetadata | null {
        if (!this._metadata) return null;

        return this._metadata;
    }

    public setNetwork(chainType: ChainType): void {
        switch (chainType) {
            case ChainType.BITCOIN_MAINNET:
                this.network = networks.bitcoin;
                break;
            case ChainType.BITCOIN_TESTNET:
                this.network = networks.testnet;
                break;
            case ChainType.BITCOIN_REGTEST:
                this.network = networks.regtest;
                break;
            case ChainType.FRACTAL_BITCOIN_MAINNET:
                this.network = networks.bitcoin;
                break;
            case ChainType.FRACTAL_BITCOIN_TESTNET:
                this.network = networks.bitcoin;
                break;
            default:
                this.network = networks.bitcoin;
                break;
        }

        if (chainType !== this.currentChain) {
            const chainId = getOPNetChainType(chainType);

            this.currentChain = chainType;
            this.chainId = chainId;

            try {
                this._metadata = OPNetMetadata.getAddresses(this.getOPNetNetwork(), chainId);
            } catch (e) {
                //
            }

            this.setProvider(chainType);
        }
    }

    public getOPNetNetwork(): OPNetNetwork {
        switch (this.network) {
            case networks.bitcoin:
                return OPNetNetwork.Mainnet;
            case networks.testnet:
                return OPNetNetwork.Testnet;
            case networks.regtest:
                return OPNetNetwork.Regtest;
            default:
                throw new Error(`Invalid network ${this.network.bech32}`);
        }
    }

    public setProviderFromUrl(url: string): void {
        this._provider = new JSONRpcProvider(url, this.network, 6000);
        this._limitedProvider = new OPNetLimitedProvider(url);
    }

    public async getBalance(address: string, filterOrdinals: boolean): Promise<bigint> {
        return await this.provider.getBalance(address, filterOrdinals);
    }

    public isValidAddress(address: string): boolean {
        if (!this.network) {
            throw new Error('Network not set');
        }

        return !!AddressVerificator.detectAddressType(address, this.network);
    }

    public async queryContractInformation(address: string): Promise<ContractInformation | undefined> {
        const genericContract: IOP_20Contract = getContract<IOP_20Contract>(
            address,
            OP_20_ABI,
            this.provider,
            this.network
        );

        try {
            const promises: [
                Promise<CallResult<{ name: string }>>,
                Promise<
                    CallResult<{
                        symbol: string;
                    }>
                >,
                Promise<CallResult<{ decimals: number }>>,
                Promise<string>
            ] = [
                genericContract.name(),
                genericContract.symbol(),
                genericContract.decimals(),
                contractLogoManager.getContractLogo(address)
            ];

            const results = await Promise.all(promises);
            const name = results[0].properties.name ?? this.getContractName(address);
            const symbol = results[1].properties.symbol;
            const decimals = results[2].properties.decimals;

            const logo = results[3];
            return {
                name,
                symbol,
                decimals,
                logo
            };
        } catch (e) {
            return;
        }
    }

    public async getUTXOs(addresses: string[], requiredAmount?: bigint): Promise<UTXO[]> {
        const utxos: UTXO[] = await this.getUTXOsForAddresses(addresses, requiredAmount);
        if (!utxos.length) {
            throw new Error('Something went wrong while getting UTXOs.');
        }

        return utxos;
    }

    private async getUTXOsForAddresses(addresses: string[], requiredAmount?: bigint): Promise<UTXO[]> {
        let finalUTXOs: UTXOs = [];

        for (const address of addresses) {
            let utxos: UTXOs = [];

            try {
                if (!requiredAmount) {
                    utxos = await this.provider.utxoManager.getUTXOs({
                        address,
                        optimize: false,
                        mergePendingUTXOs: true,
                        filterSpentUTXOs: true
                    });
                } else {
                    utxos = await this.provider.utxoManager.getUTXOsForAmount({
                        address,
                        amount: requiredAmount,
                        optimize: false
                    });
                }
            } catch {
                //
            }

            finalUTXOs = finalUTXOs.concat(utxos);
        }

        return finalUTXOs;
    }

    private getContractName(address: string): string | undefined {
        return ContractNames[address] ?? 'Generic Contract';
    }

    private setProvider(chainType: ChainType): void {
        const chainMetadata = CHAINS_MAP[chainType];
        if (!chainMetadata) {
            throw new Error(`Chain metadata not found for ${chainType}`);
        }

        if (!chainMetadata.opnetUrl) {
            throw new Error('OPNet RPC URL not set');
        }

        this.setProviderFromUrl(chainMetadata.opnetUrl);
    }
}

export default new Web3API();
