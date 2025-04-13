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
}

export interface BabylonConfigV2 {
  chainId: string;
  phase1: {
    state: BabylonPhaseState;
    title: string;
    stakingUrl: string;
    stakingApi: string;
  };
  phase2: {
    state: BabylonPhaseState;
    title: string;
    stakingUrl: string;
    stakingApi: string;

    stakingStatus: {
      active_tvl: number;
      active_delegations: number;
      active_stakers: number;
      active_finality_providers: number;
      total_finality_providers: number;
    };
  };
  showClaimed?: boolean;
}

export const BABYLON_CONFIG_MAP: { [key: string]: BabylonConfig } = {
  [ChainType.BITCOIN_MAINNET]: {
    chainId: 'bbn-1'
  },
  [ChainType.BITCOIN_SIGNET]: {
    chainId: 'bbn-test-5'
  }
};
