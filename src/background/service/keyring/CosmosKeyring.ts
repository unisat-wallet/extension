import { bech32 } from 'bech32';
import { Buffer } from 'buffer/';

import { WalletController } from '@/background/controller/wallet';
import { objToUint8Array } from '@/shared/utils';
import { incentivequery } from '@babylonlabs-io/babylon-proto-ts';
import { Secp256k1, sha256 } from '@cosmjs/crypto';
import { AccountData, DirectSecp256k1Wallet, DirectSignResponse } from '@cosmjs/proto-signing';
import { GasPrice, QueryClient, SigningStargateClient, createProtobufRpcClient } from '@cosmjs/stargate';
import { Tendermint34Client } from '@cosmjs/tendermint-rpc';

const REWARD_GAUGE_KEY_BTC_DELEGATION = 'btc_delegation';
// Default gas price for BABY
export const DEFAULT_BBN_GAS_PRICE = '0.007';
export const DEFAULT_BBN_GAS_LIMIT = '300000';

export function sortObjectByKey(obj: Record<string, any>): any {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(sortObjectByKey);
  }
  const sortedKeys = Object.keys(obj).sort();
  const result: Record<string, any> = {};
  sortedKeys.forEach((key) => {
    result[key] = sortObjectByKey(obj[key]);
  });
  return result;
}

export function sortedJsonByKeyStringify(obj: Record<string, any>): string {
  return JSON.stringify(sortObjectByKey(obj));
}

export function escapeHTML(str: string): string {
  return str.replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
}

export function serializeSignDoc(signDoc: any): Uint8Array {
  return Buffer.from(escapeHTML(sortedJsonByKeyStringify(signDoc)));
}

export function makeADR36AminoSignDoc(signer: string, data: string | Uint8Array) {
  if (typeof data === 'string') {
    data = Buffer.from(data).toString('base64');
  } else {
    data = Buffer.from(data).toString('base64');
  }

  return {
    chain_id: '',
    account_number: '0',
    sequence: '0',
    fee: {
      gas: '0',
      amount: []
    },
    msgs: [
      {
        type: 'sign/MsgSignData',
        value: {
          signer,
          data
        }
      }
    ],
    memo: ''
  };
}

export function encodeSecp256k1Pubkey(pubkey: Uint8Array): any {
  if (pubkey.length !== 33 || (pubkey[0] !== 0x02 && pubkey[0] !== 0x03)) {
    throw new Error('Public key must be compressed secp256k1, i.e. 33 bytes starting with 0x02 or 0x03');
  }
  return {
    type: 'tendermint/PubKeySecp256k1',
    value: Buffer.from(pubkey).toString('base64')
  };
}

export function encodeSecp256k1Signature(pubkey: Uint8Array, signature: Uint8Array): any {
  if (signature.length !== 64) {
    throw new Error(
      'Signature must be 64 bytes long. Cosmos SDK uses a 2x32 byte fixed length encoding for the secp256k1 signature integers r and s.'
    );
  }

  return {
    pub_key: encodeSecp256k1Pubkey(pubkey),
    signature: Buffer.from(signature).toString('base64')
  };
}

export function bech32AddressToAddress(bech32Address: string): Uint8Array {
  const decoded = bech32.decode(bech32Address);
  return new Uint8Array(bech32.fromWords(decoded.words));
}

type Key = {
  name: string;
  algo: string;
  pubKey: Uint8Array;
  address: Uint8Array;
  bech32Address: string;
  isNanoLedger: boolean;
};
export class CosmosKeyring {
  private chainId: string;
  private key: Key;
  private signer: DirectSecp256k1Wallet;
  private provider: WalletController;
  private client: SigningStargateClient;
  constructor({
    key,
    signer,
    client,
    name,
    provider,
    chainId
  }: {
    key: AccountData;
    signer: DirectSecp256k1Wallet;
    client: SigningStargateClient;
    name: string;
    provider: WalletController;
    chainId: string;
  }) {
    this.key = {
      name,
      algo: key.algo,
      pubKey: key.pubkey,
      address: bech32AddressToAddress(key.address),
      bech32Address: key.address,
      isNanoLedger: false
    };
    this.signer = signer;
    this.client = client;
    this.provider = provider;
    this.chainId = chainId;
  }

  static async createCosmosKeyring({
    privateKey,
    name,
    chainId,
    provider
  }: {
    privateKey: string;
    name: string;
    chainId: string;
    provider: WalletController;
  }): Promise<CosmosKeyring> {
    const signer = await DirectSecp256k1Wallet.fromKey(
      Buffer.from(privateKey, 'hex') as any,
      provider.cosmosChainInfoMap[chainId].bech32Config.bech32PrefixAccAddr
    );
    const client = await SigningStargateClient.connectWithSigner(provider.cosmosChainInfoMap[chainId].rpc, signer);

    const keys = await signer.getAccounts();
    const key = keys[0];
    return new CosmosKeyring({ key, signer, client, name, provider, chainId });
  }

  getKey(): Key {
    return this.key;
  }

  async getBalance() {
    const { bech32Address } = this.getKey();
    const chainInfo = this.provider.cosmosChainInfoMap[this.chainId];
    return await this.client.getBalance(bech32Address, chainInfo.currencies[0].coinMinimalDenom);
  }

  async getBabylonStakingRewards() {
    const { bech32Address } = this.getKey();
    const chain = this.provider.cosmosChainInfoMap[this.chainId];
    const tmClient = await Tendermint34Client.connect(chain.rpc);
    const client = QueryClient.withExtensions(tmClient);
    const rpc = createProtobufRpcClient(client);
    const incentiveClient = new incentivequery.QueryClientImpl(rpc);
    const req = incentivequery.QueryRewardGaugesRequest.fromPartial({
      address: bech32Address
    });

    let rewards: incentivequery.QueryRewardGaugesResponse;
    try {
      rewards = await incentiveClient.RewardGauges(req);
    } catch (error) {
      // If error message contains "reward gauge not found", silently return 0
      // This is to handle the case where the user has no rewards, meaning
      // they have not staked
      if (error instanceof Error && error.message.includes('reward gauge not found')) {
        return 0;
      }
      throw error;
    }
    const coins = rewards.rewardGauges[REWARD_GAUGE_KEY_BTC_DELEGATION]?.coins;
    if (!coins) {
      return 0;
    }

    const withdrawnCoins = rewards.rewardGauges[REWARD_GAUGE_KEY_BTC_DELEGATION]?.withdrawnCoins.reduce(
      (acc, coin) => acc + Number(coin.amount),
      0
    );

    return coins.reduce((acc, coin) => acc + Number(coin.amount), 0) - (withdrawnCoins || 0);
  }

  async signDirect(chainId: string, signerAddress: string, signDoc: any): Promise<DirectSignResponse> {
    const chainInfo = this.provider.cosmosChainInfoMap[chainId];
    if (!chainInfo) {
      throw new Error('Chain info not found');
    }
    const key = this.getKey();

    if (signerAddress !== key.bech32Address) {
      throw new Error('Signer address does not match');
    }

    signDoc.authInfoBytes = objToUint8Array(signDoc.authInfoBytes);
    signDoc.bodyBytes = objToUint8Array(signDoc.bodyBytes);
    const _sig = await this.signer.signDirect(signerAddress, signDoc as any);
    const signature = Buffer.from(_sig.signature.signature, 'base64') as any;
    return {
      signed: {
        ..._sig.signed,
        accountNumber: _sig.signed.accountNumber.toString()
      },
      signature: encodeSecp256k1Signature(key.pubKey, signature)
    } as any;
  }

  async signAminoADR36(chainId: string, signerAddress: string, data: string | Uint8Array): Promise<DirectSignResponse> {
    const chainInfo = this.provider.cosmosChainInfoMap[chainId];
    if (!chainInfo) {
      throw new Error('Chain info not found');
    }
    const key = this.getKey();

    if (signerAddress !== key.bech32Address) {
      throw new Error('Signer address does not match');
    }

    const signDoc = makeADR36AminoSignDoc(signerAddress, data);
    const toSignData = serializeSignDoc(signDoc);

    const messageHash = sha256(toSignData);
    const _sig = await Secp256k1.createSignature(messageHash, (this.signer as any).privkey);
    const signature = new Uint8Array([..._sig.r(32), ..._sig.s(32)]);
    return encodeSecp256k1Signature(key.pubKey, signature);
  }

  async sendTokens(tokenBalance: { denom: string; amount: string }, recipient: string, memo: string) {
    const chainInfo = this.provider.cosmosChainInfoMap[this.chainId];
    const client = await SigningStargateClient.connectWithSigner(chainInfo.rpc, this.signer, {
      gasPrice: GasPrice.fromString(DEFAULT_BBN_GAS_PRICE + 'ubbn')
    });

    const { bech32Address } = this.getKey();
    const result = await client.sendTokens(
      bech32Address,
      recipient,
      [tokenBalance],
      {
        amount: [
          {
            denom: chainInfo.feeCurrencies[0].coinMinimalDenom,
            amount: Math.ceil(parseFloat(DEFAULT_BBN_GAS_PRICE) * parseInt(DEFAULT_BBN_GAS_LIMIT)).toString()
          }
        ],
        gas: DEFAULT_BBN_GAS_LIMIT // for transfer is enough
      },
      memo
    );
    return result;
  }
}
