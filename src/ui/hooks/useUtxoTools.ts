import { TypeChain } from '@/shared/constant';

export const useUtxoTools = (chain: TypeChain) => {
  const openUtxoTools = () => {
    window.open(`${chain.unisatUrl}/utxo?tab=all`);
  };

  return {
    openUtxoTools
  };
};
