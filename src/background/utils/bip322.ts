import * as bitcoin from 'bitcoinjs-lib';
import { encode } from 'varuint-bitcoin';

function bip0322_hash(message: string) {
  const { sha256 } = bitcoin.crypto;
  const tag = 'BIP0322-signed-message';
  const tagHash = sha256(Buffer.from(tag));
  const result = sha256(Buffer.concat([tagHash, tagHash, Buffer.from(message)]));
  return result.toString('hex');
}

export async function signBip322MessageSimple({
  message,
  address,
  network,
  wallet
}: {
  message: string;
  address: string;
  network: bitcoin.Network;
  wallet?: any;
}) {
  const outputScript = bitcoin.address.toOutputScript(address, network);

  const prevoutHash = Buffer.from('0000000000000000000000000000000000000000000000000000000000000000', 'hex');
  const prevoutIndex = 0xffffffff;
  const sequence = 0;
  const scriptSig = Buffer.concat([Buffer.from('0020', 'hex'), Buffer.from(bip0322_hash(message), 'hex')]);

  const txToSpend = new bitcoin.Transaction();
  txToSpend.version = 0;
  txToSpend.addInput(prevoutHash, prevoutIndex, sequence, scriptSig);
  txToSpend.addOutput(outputScript, 0);

  const psbtToSign = new bitcoin.Psbt();
  psbtToSign.setVersion(0);
  psbtToSign.addInput({
    hash: txToSpend.getHash(),
    index: 0,
    sequence: 0,
    witnessUtxo: {
      script: outputScript,
      value: 0
    }
  });
  psbtToSign.addOutput({ script: Buffer.from('6a', 'hex'), value: 0 });
  await wallet.signPsbt(psbtToSign);
  const txToSign = psbtToSign.extractTransaction();

  function encodeVarString(b) {
    return Buffer.concat([encode(b.byteLength), b]);
  }

  const len = encode(txToSign.ins[0].witness.length);
  const result = Buffer.concat([len, ...txToSign.ins[0].witness.map((w) => encodeVarString(w))]);

  const signature = result.toString('base64');
  return signature;
}
