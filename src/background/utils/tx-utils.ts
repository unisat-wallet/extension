/* eslint-disable indent */
import * as bitcoin from 'bitcoinjs-lib';
import ECPairFactory from 'ecpair';
import * as ecc from 'tiny-secp256k1';

import { AddressType, NetworkType, UTXO } from '@/shared/types';

bitcoin.initEccLib(ecc);
const ECPair = ECPairFactory(ecc);

export const toXOnly = (pubKey: Buffer) => (pubKey.length === 32 ? pubKey : pubKey.slice(1, 33));

export const validator = (pubkey: Buffer, msghash: Buffer, signature: Buffer): boolean =>
  ECPair.fromPublicKey(pubkey).verify(msghash, signature);

function satoshisToBTC(amount: number) {
  return amount / 100000000;
}

export function toPsbtNetwork(networkType: NetworkType) {
  if (networkType === NetworkType.MAINNET) {
    return bitcoin.networks.bitcoin;
  } else {
    return bitcoin.networks.testnet;
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
  } else if (type === AddressType.P2WPKH) {
    const { address } = bitcoin.payments.p2wpkh({
      pubkey,
      network
    });
    return address || '';
  } else if (type === AddressType.P2TR) {
    const { address } = bitcoin.payments.p2tr({
      internalPubkey: pubkey.slice(1, 33),
      network
    });
    return address || '';
  } else {
    return '';
  }
}

export function utxoToInput(utxo: UTXO, publicKey: Buffer) {
  if (utxo.isTaproot) {
    const input = {
      hash: utxo.txId,
      index: utxo.outputIndex,
      witnessUtxo: {
        value: utxo.satoshis,
        script: Buffer.from(utxo.scriptPk, 'hex')
      },
      tapInternalKey: toXOnly(publicKey)
    };
    return input;
  } else {
    const input = {
      hash: utxo.txId,
      index: utxo.outputIndex,
      witnessUtxo: {
        value: utxo.satoshis,
        script: Buffer.from(utxo.scriptPk, 'hex')
      }
    };
    return input;
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

interface TxInput {
  hash: string;
  index: number;
  witnessUtxo: { value: number; script: Buffer };
  tapInternalKey?: Buffer;
}

interface TxOutput {
  address: string;
  value: number;
}

const DUST = 500;

export class SingleAccountTransaction {
  private account: any;
  private inputs: TxInput[] = [];
  private outputs: TxOutput[] = [];
  private changeOutputIndex = -1;
  private addressType: AddressType;
  private wallet: any;
  private networkType: NetworkType;
  constructor(account: any, wallet: any, addressType: AddressType, networkType: NetworkType) {
    // todo
    this.account = account;
    this.wallet = wallet;
    this.addressType = addressType;
    this.networkType = networkType;
  }

  addInput(utxo: UTXO) {
    this.inputs.push(utxoToInput(utxo, Buffer.from(this.account.address, 'hex')));
  }

  getTotalInput() {
    return this.inputs.reduce((pre, cur) => pre + cur.witnessUtxo.value, 0);
  }

  getTotalOutput() {
    return this.outputs.reduce((pre, cur) => pre + cur.value, 0);
  }

  getUnspent() {
    return this.getTotalInput() - this.getTotalOutput();
  }

  addOutput(address: string, value: number) {
    const network = toPsbtNetwork(this.networkType);
    if (!isValidAddress(address, network)) throw new Error('Invalid address');
    this.outputs.push({
      address,
      value
    });
  }

  addChangeOutput(value: number) {
    this.outputs.push({
      address: publicKeyToAddress(this.account.address, this.addressType, this.networkType),
      value
    });
    this.changeOutputIndex = this.outputs.length - 1;
  }

  removeChangeOutput() {
    this.outputs.splice(this.changeOutputIndex, 1);
    this.changeOutputIndex = -1;
  }

  async createSignedPsbt() {
    const network = toPsbtNetwork(this.networkType);
    const psbt = new bitcoin.Psbt({ network });

    this.inputs.forEach((v, index) => {
      psbt.addInput(v);
      psbt.setInputSequence(index, 0xfffffffd); // support RBF
    });

    this.outputs.forEach((v) => {
      psbt.addOutput(v);
    });

    await this.wallet.signTransaction(
      this.account.type,
      this.account.address,
      psbt,
      this.inputs.map((v, index) => {
        return {
          index,
          publicKey: this.account.address,
          type: v.tapInternalKey ? AddressType.P2TR : AddressType.P2WPKH
        };
      })
    );
    psbt.validateSignaturesOfAllInputs(validator);
    psbt.finalizeAllInputs();

    return psbt;
  }

  async generate(autoAdjust: boolean) {
    // Try to estimate fee
    const unspent = this.getUnspent();
    this.addChangeOutput(Math.max(unspent, 0));
    const psbt1 = await this.createSignedPsbt();
    // this.dumpTx(psbt1);
    this.removeChangeOutput();

    // todo: support changing the feeRate
    const feeRate = 5;
    const txSize = psbt1.extractTransaction().toBuffer().length;
    const fee = txSize * feeRate;

    if (unspent > fee) {
      const left = unspent - fee;
      if (left > DUST) {
        this.addChangeOutput(left);
      }
    } else {
      if (autoAdjust) {
        this.outputs[0].value -= fee - unspent;
      }
    }
    const psbt2 = await this.createSignedPsbt();
    const tx = psbt2.extractTransaction();

    const rawtx = tx.toHex();
    const toAmount = this.outputs[0].value;
    return {
      fee: psbt2.getFee(),
      rawtx,
      toSatoshis: toAmount,
      estimateFee: fee
    };
  }

  async generateForInscriptionTx() {
    const psbt1 = await this.createSignedPsbt();

    // todo: support changing the feeRate
    const feeRate = 5;
    const txSize = psbt1.extractTransaction().toBuffer().length;
    const fee = txSize * feeRate;

    const changeAmount = this.outputs[this.changeOutputIndex].value;
    if (changeAmount > fee) {
      this.outputs[this.changeOutputIndex].value -= fee;
    } else {
      this.removeChangeOutput();
    }

    const psbt2 = await this.createSignedPsbt();
    const tx = psbt2.extractTransaction();

    const rawtx = tx.toHex();
    const toAmount = this.outputs[0].value;
    return {
      fee: psbt2.getFee(),
      rawtx,
      toSatoshis: toAmount
    };
  }

  async dumpTx(psbt) {
    const tx = psbt.extractTransaction();
    const size = tx.toBuffer().length;
    const feePaid = psbt.getFee();
    const feeRate = (feePaid / size).toFixed(4);

    console.log(`
=============================================================================================
Summary
  txid:     ${tx.getId()}
  Size:     ${tx.byteLength()}
  Fee Paid: ${psbt.getFee()}
  Fee Rate: ${feeRate} sat/B
  Detail:   ${psbt.txInputs.length} Inputs, ${psbt.txOutputs.length} Outputs
----------------------------------------------------------------------------------------------
Inputs
${this.inputs
  .map((input, index) => {
    const str = `
=>${index} ${input.witnessUtxo.value} Sats
        lock-size: ${input.witnessUtxo.script.length}
        via ${input.hash} [${input.index}]
`;
    return str;
  })
  .join('')}
total: ${this.getTotalInput()} Sats
----------------------------------------------------------------------------------------------
Outputs
${this.outputs
  .map((output, index) => {
    const str = `
=>${index} ${output.value} Sats`;
    return str;
  })
  .join('')}

total: ${this.getTotalOutput() - feePaid} Sats
=============================================================================================
    `);
  }
}
