import { bech32 } from 'bech32';
import { Buffer } from 'buffer/';
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx';

import { WalletController } from '@/background/controller/wallet';
import { PubKeySecp256k1 } from '@/shared/lib/crypto';
import { incentivequery } from '@babylonlabs-io/babylon-proto-ts';
import { Secp256k1, sha256 } from '@cosmjs/crypto';
import * as encoding from '@cosmjs/encoding';
import {
  AccountData,
  DirectSecp256k1Wallet,
  encodePubkey,
  makeAuthInfoBytes,
  makeSignBytes,
  makeSignDoc
} from '@cosmjs/proto-signing';
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
  private signer?: DirectSecp256k1Wallet;
  private provider: WalletController;
  private client: SigningStargateClient;
  private _signDoc_bodyBytes: any = null;
  private _signDoc_authInfoBytes: any = null;
  constructor({
    key,
    signer,
    client,
    provider,
    chainId
  }: {
    key: Key;
    signer?: DirectSecp256k1Wallet;
    client: SigningStargateClient;
    provider: WalletController;
    chainId: string;
  }) {
    this.key = key;
    this.signer = signer;
    this.client = client;
    this.provider = provider;
    this.chainId = chainId;
  }

  static async createCosmosKeyring({
    privateKey,
    publicKey,
    name,
    chainId,
    provider
  }: {
    privateKey?: string;
    publicKey: string;
    name: string;
    chainId: string;
    provider: WalletController;
  }): Promise<CosmosKeyring> {
    let signer: DirectSecp256k1Wallet = undefined as any;
    if (privateKey) {
      signer = await DirectSecp256k1Wallet.fromKey(
        Buffer.from(privateKey, 'hex') as any,
        provider.cosmosChainInfoMap[chainId].bech32Config.bech32PrefixAccAddr
      );
    }

    const client = await SigningStargateClient.connectWithSigner(provider.cosmosChainInfoMap[chainId].rpc, null as any);

    const pubKey = encoding.fromHex(publicKey);
    const address = CosmosKeyring.publicKeyToBBNAddress(pubKey);

    const key = {
      name,
      algo: 'secp256k1',
      pubKey: pubKey,
      address: bech32AddressToAddress(address),
      bech32Address: address,
      isNanoLedger: false
    };

    return new CosmosKeyring({ key, signer, client, provider, chainId });
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

  async cosmosSignData(signBytesHex: string): Promise<{
    publicKey: string;
    signature: string;
  }> {
    const messageHash = sha256(encoding.fromHex(signBytesHex));
    const _sig = await Secp256k1.createSignature(messageHash, (this.signer as any).privkey);
    const signature = new Uint8Array([..._sig.r(32), ..._sig.s(32)]);
    return {
      publicKey: encoding.toHex(this.key.pubKey),
      signature: encoding.toHex(signature)
    };
  }

  /**
   * Convert Keystone public key to BBN address
   * @param publicKey - The public key from Keystone as Uint8Array
   * @returns BBN address string
   */
  static publicKeyToBBNAddress(publicKey: Uint8Array): string {
    const pubKey = new PubKeySecp256k1(publicKey);
    return pubKey.getBech32Address('bbn');
  }

  /**
   * getCurrentKey
   * @returns
   */
  getKey(): Key {
    return this.key;
  }

  async createSendTokenStep1(
    tokenBalance: { denom: string; amount: string },
    recipient: string,
    memo: string,
    {
      gasLimit,
      gasPrice,
      gasAdjustment
    }: {
      gasLimit: number;
      gasPrice: string;
      gasAdjustment?: number;
    }
  ) {
    const chainInfo = this.provider.cosmosChainInfoMap[this.chainId];

    const fromAddress = this.getKey().bech32Address;
    const sendMsg = {
      typeUrl: '/cosmos.bank.v1beta1.MsgSend',
      value: {
        fromAddress: fromAddress,
        toAddress: recipient,
        amount: [tokenBalance]
      }
    };

    const txBodyEncodeObject = {
      typeUrl: '/cosmos.tx.v1beta1.TxBody',
      value: {
        messages: [sendMsg],
        memo: memo,
        timeoutHeight: undefined
      }
    };

    const { accountNumber, sequence } = await this.client.getSequence(fromAddress);

    const fee = {
      amount: [
        {
          denom: chainInfo.feeCurrencies[0].coinMinimalDenom,
          amount: Math.ceil(parseFloat(gasPrice) * gasLimit * (gasAdjustment || 1.0)).toString()
        }
      ],
      gas: gasLimit // for transfer is enough
    };
    const txBodyBytes = this.client.registry.encode(txBodyEncodeObject);
    // const gasLimit = math.Int53.fromString(fee.gas).toNumber();

    const pubkey = encodePubkey(encodeSecp256k1Pubkey(this.getKey().pubKey));
    const authInfoBytes = makeAuthInfoBytes([{ pubkey, sequence }], fee.amount, gasLimit, undefined, undefined);

    const signDoc = makeSignDoc(txBodyBytes, authInfoBytes, this.chainId, accountNumber);

    // cache
    this._signDoc_bodyBytes = signDoc.bodyBytes;
    this._signDoc_authInfoBytes = signDoc.authInfoBytes;

    const signBytes = makeSignBytes(signDoc);

    return encoding.toHex(signBytes);
  }

  async createSendTokenStep2(signature: string) {
    const txRaw = TxRaw.fromPartial({
      bodyBytes: this._signDoc_bodyBytes,
      authInfoBytes: this._signDoc_authInfoBytes,
      signatures: [encoding.fromHex(signature)] // only hex for keystone. should use base64 for other signers
    });

    const txBytes = TxRaw.encode(txRaw).finish();
    return this.client.broadcastTxSync(txBytes);
  }

  /**
   * simulate babylon gas
   * @param recipient
   * @param amount
   * @param memo
   * @returns return gas fee
   */
  async simulateBabylonGas(recipient: string, amount: { denom: string; amount: string }, memo: string) {
    try {
      const chainInfo = this.provider.cosmosChainInfoMap[this.chainId];

      const key: AccountData = {
        address: this.getKey().bech32Address,
        algo: 'secp256k1',
        pubkey: this.getKey().pubKey
      };

      const dummySigner = {
        getAccounts: async () => [key]
      } as unknown as DirectSecp256k1Wallet;

      // TODO: Check if we can remove account query before simulation to optimize performance
      const client = await SigningStargateClient.connectWithSigner(chainInfo.rpc, dummySigner, {
        gasPrice: GasPrice.fromString(DEFAULT_BBN_GAS_PRICE + 'ubbn')
      });

      const { bech32Address } = this.getKey();
      const sendMsg = {
        typeUrl: '/cosmos.bank.v1beta1.MsgSend',
        value: {
          fromAddress: bech32Address,
          toAddress: recipient,
          amount: [amount]
        }
      };

      const ret = await client.simulate(bech32Address, [sendMsg], memo);

      return ret;
    } catch (error: any) {
      console.log('simulation error:', error);
    }
  }
}
