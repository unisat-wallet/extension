import { useCallback } from 'react';

import { AlkanesInfo } from '@/shared/types';
import AlkanesNFTPreview from '@/ui/components/AlkanesNFTPreview';
import { VirtualList } from '@/ui/components/VirtualList';
import { useChainType, useCurrentAccount, useDevice, useI18n, useTools, useWallet } from '@unisat/wallet-state';

import { useNavigate } from '../MainRoute';

export function AlkanesNFTList(props: { collectionId: string }) {
  const navigate = useNavigate();
  const wallet = useWallet();
  const currentAccount = useCurrentAccount();
  const chainType = useChainType();
  const tools = useTools();

  const { isDesktopScreenSize } = useDevice();
  const { t } = useI18n();

  const fetchAlkanesNFT = useCallback(
    async (params: any, page: number, pageSize: number) => {
      return wallet.getAlkanesCollectionItems(params.address, params.collectionId, page, pageSize);
    },
    [wallet]
  );

  const renderItem = useCallback(
    (item: AlkanesInfo, index: number) => (
      <AlkanesNFTPreview
        key={item.alkaneid}
        preset="medium"
        alkanesInfo={item}
        onClick={() => {
          navigate('AlkanesNFTScreen', {
            alkanesInfo: item
          });
        }}
      />
    ),
    [navigate]
  );

  const handleError = useCallback(
    (error: Error) => {
      tools.toastError(error.message);
    },
    [tools]
  );

  const itemsPerRow = isDesktopScreenSize ? 9 : 2;

  return (
    <VirtualList<AlkanesInfo>
      fetchParams={{ collectionId: props.collectionId, address: currentAccount.address }}
      chainType={chainType}
      fetchData={fetchAlkanesNFT}
      renderItem={renderItem}
      onError={handleError}
      emptyText={t('no_inscriptions_found')}
      itemsPerRow={itemsPerRow}
    />
  );
}
