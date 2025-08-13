import { KEYRING_TYPE } from '@/shared/constant';
import { CosmosSignDataType } from '@/shared/types';
import { bitcoin } from '@unisat/wallet-sdk/lib/bitcoin-core';

import { Keyring, ToSignInput } from './index';

export interface ColdWalletKeyringOptions {
  xpub: string;
  addresses: string[];
  connectionType?: 'QR';
  hdPath?: string;
  publicKeys?: string[];
  accounts?: { pubkey: string; address: string }[];
}

export class ColdWalletKeyring implements Keyring {
  type = KEYRING_TYPE.ColdWalletKeyring;
  xpub: string;
  addresses: string[] = [];
  connectionType = 'QR' as const;
  hdPath?: string = undefined;
  publicKeys?: string[] = undefined;
  accounts?: string[] = undefined;

  constructor(opts?: ColdWalletKeyringOptions) {
    if (!opts) {
      this.xpub = '';
      this.addresses = [];
      return;
    }

    if (!opts.xpub) {
      throw new Error('Cold wallet xpub is required. Please re-import your cold wallet with the new format.');
    }
    this.xpub = opts.xpub;
    this.addresses = opts.addresses || [];
    this.connectionType = opts.connectionType || 'QR';
    this.hdPath = opts.hdPath;

    // Deal with publicKeys, compatible with the old version of accounts format
    if (opts.publicKeys) {
      this.publicKeys = opts.publicKeys;
    } else if (opts.accounts && Array.isArray(opts.accounts)) {
      this.publicKeys = opts.accounts.map((acc) => acc.pubkey);
    }
    this.accounts = this.publicKeys;
  }

  async serialize(): Promise<ColdWalletKeyringOptions> {
    return {
      xpub: this.xpub,
      addresses: this.addresses,
      connectionType: this.connectionType,
      hdPath: this.hdPath,
      publicKeys: this.publicKeys
    };
  }

  async deserialize(opts: ColdWalletKeyringOptions): Promise<void> {
    if (!opts) {
      throw new Error('Cannot deserialize cold wallet: no data provided');
    }

    this.xpub = opts.xpub || '';
    this.addresses = opts.addresses || [];
    this.connectionType = opts.connectionType || 'QR';
    this.hdPath = opts.hdPath;

    if (opts.publicKeys) {
      this.publicKeys = opts.publicKeys;
    } else if (opts.accounts && Array.isArray(opts.accounts)) {
      this.publicKeys = opts.accounts.map((acc) => acc.pubkey);
    }
    this.accounts = this.publicKeys;
  }

  async addAccounts(_n: number): Promise<string[]> {
    // Cold wallet cannot generate accounts directly, need to import public keys from mobile device
    throw new Error('Cold wallet cannot generate accounts. Please import public keys from mobile device.');
  }

  async getAccounts(): Promise<string[]> {
    // For cold wallet, if there is public key information, return the public key array
    if (this.accounts && this.accounts.length > 0) {
      return this.accounts;
    }
    return [];
  }

  // Cold wallet cannot sign transactions, need to interact with mobile device via QR code
  signTransaction(_psbt: bitcoin.Psbt, _inputs: ToSignInput[]): Promise<bitcoin.Psbt> {
    throw new Error('Cold wallet cannot sign transactions. Please use mobile device to sign.');
  }

  signMessage(_address: string, _message: string): Promise<string> {
    throw new Error('Cold wallet cannot sign messages. Please use mobile device to sign.');
  }

  signData(_address: string, _data: string, _type: string): Promise<string> {
    throw new Error('Cold wallet cannot sign data. Please use mobile device to sign.');
  }

  verifyMessage(_address: string, _message: string, _sig: string): Promise<boolean> {
    throw new Error('Cold wallet cannot verify messages.');
  }

  exportAccount(_address: string): Promise<string> {
    throw new Error('Cold wallet cannot export private keys.');
  }

  removeAccount(address: string): void {
    const index = this.addresses.indexOf(address);
    if (index !== -1) {
      this.addresses.splice(index, 1);
    }
  }

  // Generate a QR code for signing PSBT
  async genSignPsbtUr(psbtHex: string): Promise<{ type: string; cbor: string }> {
    return {
      type: 'crypto-psbt',
      cbor: Buffer.from(psbtHex, 'hex').toString('base64')
    };
  }

  // Parse the signed PSBT returned from the mobile device
  async parseSignPsbtUr(_type: string, cbor: string): Promise<string> {
    return Buffer.from(cbor, 'base64').toString('hex');
  }

  // Generate a QR code for signing messages
  async genSignMsgUr(publicKey: string, text: string): Promise<{ type: string; cbor: string; requestId: string }> {
    const requestId = Date.now().toString();
    return {
      type: 'crypto-message',
      cbor: Buffer.from(JSON.stringify({ publicKey, text, requestId })).toString('base64'),
      requestId
    };
  }

  // Parse the signed message returned from the mobile device
  async parseSignMsgUr(
    _type: string,
    cbor: string
  ): Promise<{ requestId: string; publicKey: string; signature: string }> {
    const data = JSON.parse(Buffer.from(cbor, 'base64').toString());
    return {
      requestId: data.requestId,
      publicKey: data.publicKey,
      signature: data.signature
    };
  }

  getConnectionType(): 'QR' {
    return 'QR';
  }

  async genSignCosmosUr(cosmosSignRequest: {
    requestId?: string;
    signData: string;
    dataType: CosmosSignDataType;
    path: string;
    chainId?: string;
    accountNumber?: string;
    address?: string;
  }): Promise<{ type: string; cbor: string; requestId: string }> {
    const requestId = cosmosSignRequest.requestId || Date.now().toString();
    return {
      type: 'crypto-cosmos',
      cbor: Buffer.from(JSON.stringify(cosmosSignRequest)).toString('base64'),
      requestId
    };
  }

  async parseSignCosmosUr(_type: string, cbor: string): Promise<any> {
    return JSON.parse(Buffer.from(cbor, 'base64').toString());
  }

  addAddress(address: string): void {
    if (!this.addresses.includes(address)) {
      this.addresses.push(address);
    }
  }

  // Check if the address exists
  hasAddress(address: string): boolean {
    return this.addresses.includes(address);
  }
}
