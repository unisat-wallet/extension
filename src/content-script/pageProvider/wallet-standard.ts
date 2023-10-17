import { BITCOIN_CHAINS } from '@exodus/bitcoin-wallet-standard-chains';
import { icon } from '@/shared/constant';

import type { UnisatProvider } from './index';
import type { Wallet, WalletIcon } from '@wallet-standard/base';

export const UnisatNamespace = 'unisat:';

export type UnisatFeature = {
  [UnisatNamespace]: {
    provider: UnisatProvider;
  };
};

export class UnisatWallet implements Wallet {
  readonly #version = '1.0.0' as const;
  readonly #name = 'UniSat Wallet' as const;
  readonly #icon = icon as WalletIcon;
  readonly #provider: UnisatProvider;

  get version() {
    return this.#version;
  }

  get name() {
    return this.#name;
  }

  get icon() {
    return this.#icon;
  }

  get chains() {
    return BITCOIN_CHAINS.slice();
  }

  get features(): UnisatFeature {
    return {
      [UnisatNamespace]: {
        provider: this.#provider,
      },
    };
  }

  get accounts() {
    return [];
  }

  constructor(provider: UnisatProvider) {
    this.#provider = provider;
  }
}
