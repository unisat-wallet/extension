import { Pagination } from '../types/api';
import { DelegationV2, getDelegationV2StakingState } from '../types/delegationsV2';
import { apiWrapper } from './apiWrapper';

export interface PaginatedDelegations {
  delegations: DelegationV2[];
  pagination: Pagination;
}

interface DelegationV2API {
  finality_provider_btc_pks_hex: string[];
  params_version: number;
  staker_btc_pk_hex: string;
  delegation_staking: {
    staking_tx_hex: string;
    staking_tx_hash_hex: string;
    staking_timelock: number;
    staking_amount: number;
    start_height: number;
    end_height: number;
    bbn_inception_height: number;
    bbn_inception_time: string;
    slashing: {
      slashing_tx_hex: string;
      spending_height: number;
    };
  };
  delegation_unbonding: {
    unbonding_timelock: number;
    unbonding_tx: string;
    covenant_unbonding_signatures?: {
      covenant_btc_pk_hex: string;
      signature_hex: string;
    }[];
    slashing: {
      unbonding_slashing_tx_hex: string;
      spending_height: number;
    };
  };
  state: string;
}

export const getDelegationV2 = async (baseUrl: string, stakingTxHashHex: string): Promise<DelegationV2 | null> => {
  try {
    const params = {
      staking_tx_hash_hex: stakingTxHashHex
    };

    const { data: delegationAPIResponse } = await apiWrapper(
      baseUrl,
      'GET',
      '/v2/delegation',
      'Error getting delegation v2',
      {
        query: params
      }
    );

    return apiToDelegationV2(delegationAPIResponse.data);
  } catch {
    return null;
  }
};

export const getDelegationsV2 = async (
  baseUrl: string,
  publicKeyNoCoord: string,
  pageKey?: string
): Promise<PaginatedDelegations> => {
  const params = {
    staker_pk_hex: publicKeyNoCoord,
    pagination_key: pageKey ? pageKey : ''
  };

  const { data: delegationsAPIResponse } = await apiWrapper(
    baseUrl,
    'GET',
    '/v2/delegations',
    'Error getting delegations v2',
    {
      query: params
    }
  );

  const pagination: Pagination = {
    next_key: delegationsAPIResponse.pagination.next_key
  };
  return {
    delegations: delegationsAPIResponse.data.map(apiToDelegationV2),
    pagination
  };
};

const apiToDelegationV2 = (apiDelegation: DelegationV2API): DelegationV2 => {
  const state = getDelegationV2StakingState(apiDelegation.state);

  return {
    finalityProviderBtcPksHex: apiDelegation.finality_provider_btc_pks_hex,
    stakingTxHex: apiDelegation.delegation_staking.staking_tx_hex,
    paramsVersion: apiDelegation.params_version,
    stakerBtcPkHex: apiDelegation.staker_btc_pk_hex,
    stakingAmount: apiDelegation.delegation_staking.staking_amount,
    stakingTimelock: apiDelegation.delegation_staking.staking_timelock,
    stakingTxHashHex: apiDelegation.delegation_staking.staking_tx_hash_hex,
    startHeight: apiDelegation.delegation_staking.start_height,
    endHeight: apiDelegation.delegation_staking.end_height,
    bbnInceptionHeight: apiDelegation.delegation_staking.bbn_inception_height,
    bbnInceptionTime: apiDelegation.delegation_staking.bbn_inception_time,
    state,
    unbondingTimelock: apiDelegation.delegation_unbonding.unbonding_timelock,
    unbondingTxHex: apiDelegation.delegation_unbonding.unbonding_tx,
    slashing: {
      stakingSlashingTxHex: apiDelegation.delegation_staking.slashing.slashing_tx_hex,
      unbondingSlashingTxHex: apiDelegation.delegation_unbonding.slashing.unbonding_slashing_tx_hex,
      spendingHeight: apiDelegation.delegation_unbonding.slashing.spending_height
    },
    covenantUnbondingSignatures: apiDelegation.delegation_unbonding.covenant_unbonding_signatures?.map((signature) => ({
      covenantBtcPkHex: signature.covenant_btc_pk_hex,
      signatureHex: signature.signature_hex
    }))
  };
};
