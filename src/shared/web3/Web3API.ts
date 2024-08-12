import { networks } from 'bitcoinjs-lib';
import { Network } from 'bitcoinjs-lib/src/networks.js';
import { getContract, IOP_20Contract, JSONRpcProvider, OP_20_ABI } from 'opnet';

import { ChainType } from '@/shared/constant';
import { ContractInformation } from '@/shared/web3/interfaces/ContractInformation';
import { ContractLogo } from '@/shared/web3/metadata/ContractLogo';
import { ContractNames } from '@/shared/web3/metadata/ContractNames';
import { ABICoder, Address } from '@btc-vision/bsi-binary';
import {
    AddressVerificator,
    ChainId,
    FetchUTXOParamsMultiAddress,
    OPNetLimitedProvider,
    OPNetMetadata,
    OPNetNetwork,
    OPNetTokenMetadata,
    TransactionFactory,
    UTXO
} from '@btc-vision/transaction';
import { NetworkType } from '@/shared/types';
import BigNumber from 'bignumber.js';

BigNumber.config({ EXPONENTIAL_AT: 256 });

export function getOPNetChainType(chain: ChainType): ChainId {
    switch (chain) {
        case ChainType.FRACTAL_BITCOIN_MAINNET: {
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
    public network: Network = networks.bitcoin;
    public chainId: ChainId = ChainId.Bitcoin;

    public transactionFactory: TransactionFactory = new TransactionFactory();
    public readonly abiCoder: ABICoder = new ABICoder();
    private nextUTXOs: UTXO[] = [];

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

    public get WBTC(): string {
        return this.metadata.wbtc;
    }

    public get ROUTER_ADDRESS(): Address {
        return this.metadata.router;
    }

    private _metadata?: OPNetTokenMetadata;

    private get metadata(): OPNetTokenMetadata {
        if (!this._metadata) {
            throw new Error('Metadata not set');
        }

        return this._metadata;
    }

    public setNetwork(chainType: ChainType): void {
        const oldNetwork = this.network;
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
            default:
                this.network = networks.bitcoin;
                break;
        }

        const chainId = getOPNetChainType(chainType);
        if (oldNetwork !== this.network || chainId !== this.chainId) {
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
                throw new Error('Invalid network');
        }
    }

    public setProviderFromUrl(url: string): void {
        this._provider = new JSONRpcProvider(url, 6000);
        this._limitedProvider = new OPNetLimitedProvider(url);
    }

    public async getUTXOs(addresses: string[], requiredAmount: bigint): Promise<UTXO[]> {
        const utxoSetting: FetchUTXOParamsMultiAddress = {
            addresses,
            minAmount: 20_000n, // we ensure we are not using Ordinals UTXOs
            requestedAmount: requiredAmount,
            optimized: true
        };

        console.log(utxoSetting);

        let utxos: UTXO[];
        if (this.nextUTXOs.length > 0) {
            utxos = this.nextUTXOs;
        } else {
            utxos = await this.limitedProvider.fetchUTXOMultiAddr(utxoSetting);
        }
        if (!utxos.length) {
            throw new Error('No UTXOs found');
        }

        return utxos;
    }

    public async getBalance(address: Address, filterOrdinals: boolean): Promise<bigint> {
        return await this.provider.getBalance(address, filterOrdinals);
    }

    public isValidPKHAddress(address: string): boolean {
        if (!this.network) {
            throw new Error('Network not set');
        }

        return AddressVerificator.validatePKHAddress(address, this.network);
    }

    public isValidP2TRAddress(address: string): boolean {
        if (!this.network) {
            throw new Error('Network not set');
        }

        return AddressVerificator.isValidP2TRAddress(address, this.network);
    }

    public async queryContractInformation(address: string, wallet?: string): Promise<ContractInformation | undefined> {
        const genericContract: IOP_20Contract = getContract<IOP_20Contract>(address, OP_20_ABI, this.provider, wallet);

        try {
            const [_name, _symbol, _decimals] = await Promise.all([
                genericContract.name().catch(),
                genericContract.symbol().catch(),
                genericContract.decimals().catch()
            ]);

            let name: string | undefined;
            if (!('error' in _name)) {
                name = (_name.properties as { name: string }).name;
            }

            let decimals: number | undefined;
            if (!('error' in _decimals)) {
                decimals = (_decimals.properties as { decimals: number }).decimals;
            }

            let symbol: string | undefined;
            if (!('error' in _symbol)) {
                symbol = (_symbol.properties as { symbol: string }).symbol;
            }

            const logo = this.getContractLogo(address);
            return {
                name: name ?? this.getContractName(address),
                symbol,
                decimals,
                logo
            };
        } catch (e) {
            /*const error = e as Error;
            console.log(error.message);*/

            return;
        }
    }

    private getContractLogo(address: string): string | undefined {
        return ContractLogo[address] ?? 'https://raw.githubusercontent.com/Cryptofonts/cryptoicons/master/128/btc.png';
    }

    private getContractName(address: string): string | undefined {
        return ContractNames[address] ?? 'Generic Contract';
    }

    private setProvider(network: ChainType): void {
        switch (this.network) {
            case networks.bitcoin:
                if (network === ChainType.FRACTAL_BITCOIN_MAINNET) {
                    this.setProviderFromUrl('https://fractal.opnet.org');
                } else {
                    this.setProviderFromUrl('https://api.opnet.org');
                }
                break;
            case networks.testnet:
                this.setProviderFromUrl('https://testnet.opnet.org');
                break;
            case networks.regtest:
                this.setProviderFromUrl('https://regtest.opnet.org');
                break;
            default:
                console.warn('Invalid network', this.network);
                this._provider = undefined;
                break;
        }
    }
}

export default new Web3API();
