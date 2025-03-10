/**
 * Crypto utilities for Cosmos-SDK based chains
 * This module provides cryptographic primitives and utilities for handling
 * Secp256k1 keys and Bech32 addresses in the Cosmos ecosystem
 */
import { bech32 } from 'bech32';
import { Buffer } from 'buffer/';

import { secp256k1 } from '@noble/curves/secp256k1';
import { ripemd160 } from '@noble/hashes/ripemd160';
import { sha256 } from '@noble/hashes/sha2';

/**
 * Represents a Bech32 address
 * Handles encoding and decoding of Bech32 addresses
 */
export class Bech32Address {
  /**
   * Creates a new Bech32 address instance
   * @param address - The raw address bytes
   */
  constructor(protected readonly address: Uint8Array) {}

  /**
   * Encodes the address to Bech32 format with the given prefix
   * @param prefix - The Bech32 prefix to use
   * @returns The Bech32 encoded address string
   */
  toBech32(prefix: string): string {
    const words = bech32.toWords(this.address);
    return bech32.encode(prefix, words);
  }

  /**
   * Gets the raw address bytes
   * @returns The raw address as Uint8Array
   */
  toBytes(): Uint8Array {
    return new Uint8Array(this.address);
  }

  /**
   * Creates a Bech32Address from a Bech32 encoded string
   * @param bech32Addr - The Bech32 encoded address string
   * @returns A new Bech32Address instance
   */
  static fromBech32(bech32Addr: string): Bech32Address {
    const decoded = bech32.decode(bech32Addr);
    const address = new Uint8Array(bech32.fromWords(decoded.words));
    return new Bech32Address(address);
  }
}

/**
 * Represents a Secp256k1 private key
 * Used for managing private keys in the Cosmos ecosystem
 */
export class PrivKeySecp256k1 {
  /**
   * Creates a new private key instance
   * @param privKey - The private key as a Uint8Array
   */
  constructor(protected readonly privKey: Uint8Array) {}

  /**
   * Returns the private key bytes
   * @returns A copy of the private key as Uint8Array
   */
  toBytes(): Uint8Array {
    return new Uint8Array(this.privKey);
  }

  /**
   * Derives the corresponding public key
   * @returns A new PubKeySecp256k1 instance containing the derived public key
   */
  getPubKey(): PubKeySecp256k1 {
    return new PubKeySecp256k1(secp256k1.getPublicKey(this.privKey, true));
  }
}

/**
 * Represents a Secp256k1 public key
 * Handles public key operations including compression and address derivation
 */
export class PubKeySecp256k1 {
  /**
   * Creates a new public key instance
   * @param pubKey - The public key as a Uint8Array (33 bytes compressed or 65 bytes uncompressed)
   * @throws {Error} If the public key length is invalid
   */
  constructor(protected readonly pubKey: Uint8Array) {
    if (pubKey.length !== 33 && pubKey.length !== 65) {
      throw new Error(`Invalid length of public key: ${pubKey.length}`);
    }
  }

  /**
   * Returns the public key bytes in either compressed or uncompressed format
   * @param uncompressed - If true, returns uncompressed public key (65 bytes)
   * @returns The public key as Uint8Array
   */
  toBytes(uncompressed?: boolean): Uint8Array {
    if (uncompressed && this.pubKey.length === 65) {
      return this.pubKey;
    }
    if (!uncompressed && this.pubKey.length === 33) {
      return this.pubKey;
    }

    if (uncompressed) {
      return secp256k1.ProjectivePoint.fromHex(Buffer.from(this.pubKey).toString('hex')).toRawBytes(false);
    } else {
      return secp256k1.ProjectivePoint.fromHex(Buffer.from(this.pubKey).toString('hex')).toRawBytes(true);
    }
  }

  /**
   * Derives the Cosmos address from the public key
   * Uses SHA256 and RIPEMD160 for address derivation
   * @returns The raw address as Uint8Array
   */
  getCosmosAddress(): Uint8Array {
    return ripemd160(sha256(this.toBytes(false)));
  }

  /**
   * Gets the Bech32 encoded address with the specified prefix
   * @param prefix - The Bech32 prefix (defaults to 'cosmos')
   * @returns The Bech32 encoded address string
   */
  getBech32Address(prefix = 'cosmos'): string {
    const words = bech32.toWords(this.getCosmosAddress());
    return bech32.encode(prefix, words);
  }

  /**
   * Gets a Bech32Address instance for this public key
   * @returns A new Bech32Address instance
   */
  toBech32Address(): Bech32Address {
    return new Bech32Address(this.getCosmosAddress());
  }
}

/**
 * Converts a Bech32 address from one prefix to another
 * Useful for converting addresses between different Cosmos chains
 * @param address - The source Bech32 address
 * @param newPrefix - The new prefix to use
 * @returns The converted Bech32 address with the new prefix
 */
export function convertBech32Address(address: string, newPrefix: string): string {
  const decoded = bech32.decode(address);
  return bech32.encode(newPrefix, decoded.words);
}

/**
 * Converts a hex-encoded public key to a Bech32 address
 * @param publicKeyHex - The public key in hex string format
 * @param prefix - The Bech32 prefix to use (defaults to 'cosmos')
 * @returns The Bech32 encoded address string
 */
export function publicKeyHexToAddress(publicKeyHex: string, prefix = 'cosmos'): string {
  const publicKeyBytes = new Uint8Array(Buffer.from(publicKeyHex, 'hex'));
  const pubKey = new PubKeySecp256k1(publicKeyBytes);
  return pubKey.getBech32Address(prefix);
}
