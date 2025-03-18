import { useCallback, useEffect, useState } from 'react';

import { Inscription } from '@/shared/types';
import { useTools } from '@/ui/components/ActionComponent';
import { CachedList } from '@/ui/components/CachedVirtualList';
import InscriptionPreview from '@/ui/components/InscriptionPreview';
import { useExtensionIsInTab } from '@/ui/features/browser/tabs';
import { useCurrentAccount } from '@/ui/state/accounts/hooks';
import { useChainType } from '@/ui/state/settings/hooks';
import { useWallet } from '@/ui/utils';

import { useNavigate } from '../../MainRoute';

export function InscriptionList() {
  const navigate = useNavigate();
  const wallet = useWallet();
  const currentAccount = useCurrentAccount();
  const chainType = useChainType();
  const tools = useTools();
  const isInTab = useExtensionIsInTab();
  const [isMobile, setIsMobile] = useState(false);

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

  const fetchInscriptions = useCallback(
    async (address: string, page: number, pageSize: number) => {
      return wallet.getOrdinalsInscriptions(address, page, pageSize);
    },
    [wallet]
  );

  const renderInscription = useCallback(
    (inscription: Inscription, index: number) => (
      <InscriptionPreview
        key={inscription.inscriptionId || `inscription-${index}`}
        data={inscription}
        style={{ width: '100%' }}
        preset="medium"
        onClick={() => {
          navigate(
            'OrdinalsInscriptionScreen',
            {
              inscription
            },
            {
              inscriptionId: inscription.inscriptionId
            }
          );
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
    <CachedList<Inscription>
      namespace="inscriptions"
      address={currentAccount.address}
      chainType={chainType}
      fetchData={fetchInscriptions}
      renderItem={renderInscription}
      onError={handleError}
      emptyText="No inscriptions found"
      itemsPerRow={itemsPerRow}
    />
  );
}
