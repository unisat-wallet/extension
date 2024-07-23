import { networks } from 'bitcoinjs-lib';
import { Network } from 'bitcoinjs-lib/src/networks.js';
import { getContract, IOP_20Contract, JSONRpcProvider, OP_20_ABI } from 'opnet';

import { ChainType } from '@/shared/constant';
import { ContractInformation } from '@/shared/web3/interfaces/ContractInformation';
import { ContractLogo } from '@/shared/web3/metadata/ContractLogo';
import { ContractNames } from '@/shared/web3/metadata/ContractNames';
import { ABICoder } from '@btc-vision/bsi-binary';
import {
  AddressVerificator,
  FetchUTXOParamsMultiAddress,
  OPNetLimitedProvider,
  ROUTER_ADDRESS_REGTEST,
  TransactionFactory,
  UTXO,
  wBTC
} from '@btc-vision/transaction';

class Web3API {
  public network: Network = networks.bitcoin;
  public transactionFactory: TransactionFactory = new TransactionFactory();
  public readonly abiCoder: ABICoder = new ABICoder();

  private _limitedProvider: OPNetLimitedProvider | undefined;
  private _provider: JSONRpcProvider | undefined;

  public get WBTC(): string {
    return wBTC.getAddress(this.network);
  }

  public get MOTOSWAP_ROUTER(): string {
    return ROUTER_ADDRESS_REGTEST;
  }

  public get provider(): JSONRpcProvider {
    if (!this._provider) {
      throw new Error('Provider not set');
    }

    return this._provider;
  }

  public get limitedProvider(): OPNetLimitedProvider {
    if (!this._limitedProvider) {
      throw new Error('Limited provider not set');
    }

    return this._limitedProvider;
  }

  public setNetwork(network: ChainType): void {
    const oldNetwork = this.network;
    switch (network) {
      case ChainType.BITCOIN_MAINNET:
        this.network = networks.bitcoin;
        break;
      case ChainType.BITCOIN_TESTNET:
        this.network = networks.testnet;
        break;
      case ChainType.BITCOIN_REGTEST:
        this.network = networks.regtest;
        break;
      default:
        this.network = networks.bitcoin;
        break;
    }

    if (oldNetwork !== this.network) {
      this.setProvider();
    }
  }

  public setProviderFromUrl(url: string): void {
    this._provider = new JSONRpcProvider(url);
    this._limitedProvider = new OPNetLimitedProvider(url);
  }

  public async getUTXOs(addresses: string[], requiredAmount: bigint): Promise<UTXO[]> {
    const utxoSetting: FetchUTXOParamsMultiAddress = {
      addresses,
      minAmount: 50_000n, // we ensure we are not using Ordinals UTXOs
      requestedAmount: requiredAmount
    };

    const utxos: UTXO[] = await this.limitedProvider.fetchUTXOMultiAddr(utxoSetting);
    if (!utxos.length) {
      throw new Error('No UTXOs found');
    }

    return utxos;
  }

  private getContractLogo(address: string): string | undefined {
    return ContractLogo[address] ?? 'https://raw.githubusercontent.com/Cryptofonts/cryptoicons/master/128/btc.png';
  }

  private getContractName(address: string): string | undefined {
    return ContractNames[address] ?? 'Generic Contract';
  }

  public isValidPKHAddress(address: string): boolean {
    return AddressVerificator.validatePKHAddress(address, this.network);
  }

  public isValidP2TRAddress(address: string): boolean {
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
      const error = e as Error;

      console.log(error.message);

      return;
    }
  }

  private setProvider(): void {
    switch (this.network) {
      case networks.bitcoin:
        this.setProviderFromUrl('https://api.opnet.org');
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
