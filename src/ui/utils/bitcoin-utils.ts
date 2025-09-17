import * as bip39 from 'bip39';

import { AddressType, NetworkType } from '@unisat/wallet-types';

export function getAddressType(address: string, networkType?: NetworkType) {
  if (address.startsWith('bc1q') || address.startsWith('tb1q')) {
    return AddressType.P2WPKH;
  } else if (address.startsWith('bc1p') || address.startsWith('tb1p')) {
    return AddressType.P2TR;
  } else if (address.startsWith('1') || address.startsWith('m') || address.startsWith('n')) {
    return AddressType.P2PKH;
  } else if (address.startsWith('3') || address.startsWith('2')) {
    return AddressType.P2SH_P2WPKH;
  } else {
    return AddressType.UNKNOWN;
  }
}

export function isValidAddress(address: string, networkType?: NetworkType) {
  const addressType = getAddressType(address, networkType);
  if (addressType === AddressType.UNKNOWN) {
    return false;
  }

  return true;
}

export function getAddressUtxoDust(address: string) {
  const addressType = getAddressType(address);
  if (addressType === AddressType.P2WPKH) {
    return 294;
  } else if (addressType === AddressType.P2TR) {
    return 330;
  } else {
    return 546;
  }
}

export function isValidHdPath(path: string): boolean {
  if (!path || typeof path !== 'string') {
    return false;
  }

  // HD path should start with 'm' or 'M'
  if (!path.startsWith('m') && !path.startsWith('M')) {
    return false;
  }

  // Split by '/' and validate each component
  const components = path.split('/');

  // First component should be 'm' or 'M'
  if (components[0] !== 'm' && components[0] !== 'M') {
    return false;
  }

  // Validate each path component after 'm'
  for (let i = 1; i < components.length; i++) {
    const component = components[i];

    if (!component) {
      return false;
    }

    // Check if it's a hardened path (ends with ')
    const isHardened = component.endsWith("'");
    const numberPart = isHardened ? component.slice(0, -1) : component;

    // Check if the number part is a valid integer
    if (!/^\d+$/.test(numberPart)) {
      return false;
    }

    const num = parseInt(numberPart, 10);

    // Check if number is within valid range (0 to 2^31-1)
    if (num < 0 || num >= Math.pow(2, 31)) {
      return false;
    }
  }

  return true;
}

export function validateMnemonic(mnemonic: string): boolean {
  // do not use bip39.validateMnemonic here to reduce bundle size
  // const words = mnemonic.trim().split(/\s+/);
  // const wordCount = words.length;
  // return [12, 15, 18, 21, 24].includes(wordCount);

  return bip39.validateMnemonic(mnemonic);
}
