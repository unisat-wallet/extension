import { useCallback, useEffect, useState } from 'react';

import { AlkanesInfo } from '@/shared/types';
import { useTools } from '@/ui/components/ActionComponent';
import AlkanesNFTPreview from '@/ui/components/AlkanesNFTPreview';
import { VirtualList } from '@/ui/components/VirtualList';
import { useExtensionIsInTab } from '@/ui/features/browser/tabs';
import { useI18n } from '@/ui/hooks/useI18n';
import { useCurrentAccount } from '@/ui/state/accounts/hooks';
import { useChainType } from '@/ui/state/settings/hooks';
import { useWallet } from '@/ui/utils';

import { useNavigate } from '../MainRoute';

export function AlkanesNFTList(props: { collectionId: string }) {
  const navigate = useNavigate();
  const wallet = useWallet();
  const currentAccount = useCurrentAccount();
  const chainType = useChainType();
  const tools = useTools();
  const isInTab = useExtensionIsInTab();
  const [isMobile, setIsMobile] = useState(false);
  const { t } = useI18n();

  useEffect(() => {
    const checkMobile = () => {
      const mobileCheck = window.innerWidth <= 768;
      setIsMobile(mobileCheck);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

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

  const itemsPerRow = isInTab && !isMobile ? 9 : 2;

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
