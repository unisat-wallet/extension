/* eslint-disable indent */
import * as bitcoin from 'bitcoinjs-lib';
import ECPairFactory from 'ecpair';
import * as ecc from 'tiny-secp256k1';

import { AddressType, NetworkType } from '@/shared/types';

bitcoin.initEccLib(ecc);
const ECPair = ECPairFactory(ecc);

const LITECOIN = {
  messagePrefix: '\x19Litecoin Signed Message:\n',
  bech32: 'ltc',
  bip32: {
    public: 0x019da462,
    private: 0x019d9cfe,
  },
  pubKeyHash: 0x30,
  scriptHash: 0x32,
  wif: 0xb0,
};

const LITECOIN_TESTNET = {
  messagePrefix: '\x19Litecoin Signed Message:\n',
  bech32: 'tltc',
  bip32: {
  public: 0x043587cf,
  private: 0x04358394,
  },
  pubKeyHash: 0x6f,
  scriptHash: 0xc4,
  wif: 0xef,
  };

export const validator = (pubkey: Buffer, msghash: Buffer, signature: Buffer): boolean =>
  ECPair.fromPublicKey(pubkey).verify(msghash, signature);

export function toPsbtNetwork(networkType: NetworkType) {
  if (networkType === NetworkType.MAINNET) {
    // return bitcoin.networks.bitcoin;
    return LITECOIN;
  } else {
    return LITECOIN_TESTNET;
  }
}

export function publicKeyToAddress(publicKey: string, type: AddressType, networkType: NetworkType) {
  const network = toPsbtNetwork(networkType);
  if (!publicKey) return '';
  const pubkey = Buffer.from(publicKey, 'hex');
  if (type === AddressType.P2PKH) {
    const { address } = bitcoin.payments.p2pkh({
      pubkey,
      network
    });
    return address || '';
  } else if (type === AddressType.P2WPKH || type === AddressType.M44_P2WPKH) {
    const { address } = bitcoin.payments.p2wpkh({
      pubkey,
      network
    });
    return address || '';
  } else if (type === AddressType.P2TR || type === AddressType.M44_P2TR) {
    const { address } = bitcoin.payments.p2tr({
      internalPubkey: pubkey.slice(1, 33),
      network
    });
    return address || '';
  } else if (type === AddressType.P2SH_P2WPKH) {
    const data = bitcoin.payments.p2wpkh({
      pubkey,
      network
    });
    const { address } = bitcoin.payments.p2sh({
      pubkey,
      network,
      redeem: data
    });
    return address || '';
  } else {
    return '';
  }
}

export function isValidAddress(address, network: bitcoin.Network) {
  let error;
  try {
    bitcoin.address.toOutputScript(address, network);
  } catch (e) {
    error = e;
  }
  if (error) {
    return false;
  } else {
    return true;
  }
}
