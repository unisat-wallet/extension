import { ChainType, TypeChain } from '@/shared/constant';
import { useChainType } from '@/ui/state/settings/hooks';

export const useUtxoTools = (chain: TypeChain) => {
  const chainType = useChainType();

  const openUtxoTools = () => {
    if (chainType === ChainType.BITCOIN_MAINNET) {
      window.open(`${chain.unisatUrl}/utils/utxo-v2`);
    } else {
      window.open(`${chain.unisatUrl}/utils/utxo`);
    }
  };

  return {
    openUtxoTools
  };
};
