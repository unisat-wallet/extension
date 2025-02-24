import { ChainType } from '.';

export const PHASE1: {
  [key: string]: string;
} = {};

export enum BabylonPhaseState {
  NONE,
  PENDING,
  ACTIVE,
  CLOSED
}

interface BabylonConfig {
  chainId: string;
  phase1: {
    state: BabylonPhaseState;
    stakingUrl: string;
    stakingApi: string;
  };
  phase2: {
    state: BabylonPhaseState;
    stakingUrl: string;
    stakingApi: string;
  };
}

export const DEFAULT_BABYLON_CONFIG: BabylonConfig = {
  chainId: '',
  phase1: {
    state: BabylonPhaseState.NONE,
    stakingUrl: '',
    stakingApi: ''
  },
  phase2: {
    state: BabylonPhaseState.NONE,
    stakingUrl: '',
    stakingApi: ''
  }
};

export const BABYLON_CONFIG_MAP: { [key: string]: BabylonConfig } = {
  [ChainType.BITCOIN_MAINNET]: {
    chainId: 'bbn-test-5',
    phase1: {
      state: BabylonPhaseState.CLOSED,
      stakingUrl: 'https://btc-staking.unisat.io',
      stakingApi: 'https://staking-api.babylonlabs.io'
    },
    phase2: {
      state: BabylonPhaseState.PENDING,
      stakingUrl: 'https://btc-staking-2.unisat.io',
      stakingApi: 'https://staking-api.babylonlabs.io'
    }
  },
  [ChainType.BITCOIN_SIGNET]: {
    chainId: 'bbn-test-5',
    phase1: {
      state: BabylonPhaseState.NONE,
      stakingUrl: 'https://sbtc-staking.unisat.io',
      stakingApi: 'https://staking-api.testnet.babylonlabs.io'
    },
    phase2: {
      state: BabylonPhaseState.ACTIVE,
      stakingUrl: 'https://sbtc-staking-2.unisat.io',
      stakingApi: 'https://staking-api.testnet.babylonlabs.io'
    }
  }
};
