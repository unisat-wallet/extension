export interface DelegationLike {
  stakingAmount: number;
  stakingTxHashHex: string;
  startHeight: number;
  state: DelegationV2StakingState;
}

export interface DelegationV2 extends DelegationLike {
  stakingTxHex: string;
  paramsVersion: number;
  finalityProviderBtcPksHex: string[];
  stakerBtcPkHex: string;
  stakingTimelock: number;
  bbnInceptionHeight: number;
  bbnInceptionTime: string;
  startHeight: number;
  endHeight: number;
  unbondingTimelock: number;
  unbondingTxHex: string;
  covenantUnbondingSignatures?: {
    covenantBtcPkHex: string;
    signatureHex: string;
  }[];
  slashing: {
    stakingSlashingTxHex: string;
    unbondingSlashingTxHex: string;
    spendingHeight: number;
  };
}

export enum DelegationV2StakingState {
  // Basic states
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  ACTIVE = 'ACTIVE',

  // Unbonding states
  TIMELOCK_UNBONDING = 'TIMELOCK_UNBONDING',
  EARLY_UNBONDING = 'EARLY_UNBONDING',

  // Withdrawable states
  TIMELOCK_WITHDRAWABLE = 'TIMELOCK_WITHDRAWABLE',
  EARLY_UNBONDING_WITHDRAWABLE = 'EARLY_UNBONDING_WITHDRAWABLE',
  TIMELOCK_SLASHING_WITHDRAWABLE = 'TIMELOCK_SLASHING_WITHDRAWABLE',
  EARLY_UNBONDING_SLASHING_WITHDRAWABLE = 'EARLY_UNBONDING_SLASHING_WITHDRAWABLE',

  // Withdrawn states
  TIMELOCK_WITHDRAWN = 'TIMELOCK_WITHDRAWN',
  EARLY_UNBONDING_WITHDRAWN = 'EARLY_UNBONDING_WITHDRAWN',
  TIMELOCK_SLASHING_WITHDRAWN = 'TIMELOCK_SLASHING_WITHDRAWN',
  EARLY_UNBONDING_SLASHING_WITHDRAWN = 'EARLY_UNBONDING_SLASHING_WITHDRAWN',

  // Slashed states
  SLASHED = 'SLASHED',

  // Intermediate states
  INTERMEDIATE_PENDING_VERIFICATION = 'INTERMEDIATE_PENDING_VERIFICATION',
  INTERMEDIATE_PENDING_BTC_CONFIRMATION = 'INTERMEDIATE_PENDING_BTC_CONFIRMATION',
  INTERMEDIATE_UNBONDING_SUBMITTED = 'INTERMEDIATE_UNBONDING_SUBMITTED',
  INTERMEDIATE_EARLY_UNBONDING_WITHDRAWAL_SUBMITTED = 'INTERMEDIATE_EARLY_UNBONDING_WITHDRAWAL_SUBMITTED',
  INTERMEDIATE_EARLY_UNBONDING_SLASHING_WITHDRAWAL_SUBMITTED = 'INTERMEDIATE_EARLY_UNBONDING_SLASHING_WITHDRAWAL_SUBMITTED',
  INTERMEDIATE_TIMELOCK_WITHDRAWAL_SUBMITTED = 'INTERMEDIATE_TIMELOCK_WITHDRAWAL_SUBMITTED',
  INTERMEDIATE_TIMELOCK_SLASHING_WITHDRAWAL_SUBMITTED = 'INTERMEDIATE_TIMELOCK_SLASHING_WITHDRAWAL_SUBMITTED'
}

export const DELEGATION_STATUSES = {
  [DelegationV2StakingState.PENDING]: 0,
  [DelegationV2StakingState.INTERMEDIATE_PENDING_VERIFICATION]: 0.5,
  [DelegationV2StakingState.VERIFIED]: 1,
  [DelegationV2StakingState.INTERMEDIATE_PENDING_BTC_CONFIRMATION]: 1.5,
  [DelegationV2StakingState.ACTIVE]: 2,

  [DelegationV2StakingState.INTERMEDIATE_UNBONDING_SUBMITTED]: 2.5,
  [DelegationV2StakingState.EARLY_UNBONDING]: 3,
  [DelegationV2StakingState.EARLY_UNBONDING_WITHDRAWABLE]: 4,
  [DelegationV2StakingState.INTERMEDIATE_EARLY_UNBONDING_WITHDRAWAL_SUBMITTED]: 4.5,
  [DelegationV2StakingState.EARLY_UNBONDING_WITHDRAWN]: 5,

  [DelegationV2StakingState.SLASHED]: 4,
  [DelegationV2StakingState.EARLY_UNBONDING_SLASHING_WITHDRAWABLE]: 5,
  [DelegationV2StakingState.INTERMEDIATE_EARLY_UNBONDING_SLASHING_WITHDRAWAL_SUBMITTED]: 5.5,
  [DelegationV2StakingState.EARLY_UNBONDING_SLASHING_WITHDRAWN]: 6,

  [DelegationV2StakingState.TIMELOCK_UNBONDING]: 3,
  [DelegationV2StakingState.TIMELOCK_WITHDRAWABLE]: 4,
  [DelegationV2StakingState.INTERMEDIATE_TIMELOCK_WITHDRAWAL_SUBMITTED]: 4.5,
  [DelegationV2StakingState.TIMELOCK_WITHDRAWN]: 5,

  [DelegationV2StakingState.TIMELOCK_SLASHING_WITHDRAWABLE]: 5,
  [DelegationV2StakingState.INTERMEDIATE_TIMELOCK_SLASHING_WITHDRAWAL_SUBMITTED]: 5.5,
  [DelegationV2StakingState.TIMELOCK_SLASHING_WITHDRAWN]: 6
} as const;

export const getDelegationV2StakingState = (state: string): DelegationV2StakingState => {
  const validState = Object.values(DelegationV2StakingState).find((enumState) => enumState === state);

  if (!validState) {
    throw new Error(`Invalid delegation state: ${state}`);
  }

  return validState;
};

export interface DelegationV2Params {
  currentTime: number;
}
