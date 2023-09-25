import * as bs58check from 'bs58check';
import { sha256 } from 'js-sha256';
import * as bitcoin from 'bitcoinjs-lib';
// import ECPairFactory from 'ecpair';
import * as ecc from 'tiny-secp256k1';
import { Buffer } from 'buffer';

bitcoin.initEccLib(ecc);
// const ECPair = ECPairFactory(ecc);

// window.Buffer = window.Buffer || Buffer;

export function detectAddressTypeToScripthash(address: string): {
  output: Buffer | string;
  scripthash: string;
  address: string;
} {
  // Detect legacy address
  try {
    // bitcoin.address.fromBase58Check(address);
    const p2pkh = addressToP2PKH(address);
    const p2pkhBuf = Buffer.from(p2pkh, 'hex');
    return {
      output: p2pkh,
      scripthash: Buffer.from(sha256(p2pkhBuf), 'hex').reverse().toString('hex'),
      address,
    };
  } catch (err) {}

  // Detect segwit or taproot
  const detected = bitcoin.address.fromBech32(address);
  if (address.indexOf('bc1p') === 0) {
    const output = bitcoin.address.toOutputScript(address);
    return {
      output,
      scripthash: Buffer.from(sha256(output), 'hex').reverse().toString('hex'),
      address,
    };
  } else if (address.indexOf('bc1') === 0) {
    const output = bitcoin.address.toOutputScript(address);
    return {
      output,
      scripthash: Buffer.from(sha256(output), 'hex').reverse().toString('hex'),
      address,
    };
  } else {
    throw 'unrecognized address';
  }
}

export function addressToP2PKH(address: string): string {
  const addressDecoded = bs58check.decode(address);
  const addressDecodedSub = addressDecoded.toString().substr(2);
  const p2pkh = `76a914${addressDecodedSub}88ac`;
  return p2pkh;
}

export const toXOnly = publicKey => {
  return publicKey.slice(1, 33);
};

export function fromPubToP2tr(pub: string): string|undefined {
  const childNodeXOnlyPubkeyPrimary = toXOnly(Buffer.from(pub, 'hex'));
  const p2trPrimary = bitcoin.payments.p2tr({
    internalPubkey: childNodeXOnlyPubkeyPrimary,
  });
  return p2trPrimary.address;
}
