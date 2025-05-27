import { useEffect, useState } from 'react';

import { AlkanesInfo } from '@/shared/types';
import { Card, Column, Content, Header, Layout, Row, Text } from '@/ui/components';
import { Line } from '@/ui/components/Line';
import LoadingPage from '@/ui/components/LoadingPage';
import { Section } from '@/ui/components/Section';
import { useI18n } from '@/ui/hooks/useI18n';
import { useCurrentAccount } from '@/ui/state/accounts/hooks';
import { useLocationState, useWallet } from '@/ui/utils';

import { AlkanesNFTList } from './AlkanesNFTList';

interface LocationState {
  collectionId: string;
}

interface AlkanesCollectionSummary {
  collectionInfo: AlkanesInfo;
  items: AlkanesInfo[];
}

export default function AlkanesCollectionScreen() {
  const { t } = useI18n();
  const { collectionId } = useLocationState<LocationState>();
  const [collectionSummary, setCollectionSummary] = useState<AlkanesCollectionSummary>({
    collectionInfo: {
      alkaneid: '',
      name: '',
      symbol: '',
      totalSupply: '0',
      cap: 0,
      minted: 0,
      mintable: false,
      perMint: '',
      holders: 0,
      nftData: {
        collectionId: '',
        attributes: null
      }
    },
    items: []
  });

  const wallet = useWallet();

  const account = useCurrentAccount();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tokenSummary = await wallet.getAddressAlkanesTokenSummary(account.address, collectionId, false);

        const itemsRes = await wallet.getAlkanesCollectionItems(account.address, collectionId, 1, 100);

        setCollectionSummary({
          collectionInfo: tokenSummary.tokenInfo,
          items: itemsRes.list
        });
      } catch (error) {
        console.error('Failed to fetch collection data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <LoadingPage />;
  }

  if (!collectionSummary || !collectionSummary.collectionInfo || !collectionSummary.collectionInfo.alkaneid) {
    return (
      <Layout>
        <Header
          onBack={() => {
            window.history.go(-1);
          }}
        />
        <Content itemsCenter justifyCenter>
          <Text text={t('collection_not_found')} />
        </Content>
      </Layout>
    );
  }

  return (
    <Layout>
      <Header
        onBack={() => {
          window.history.go(-1);
        }}
      />
      {collectionSummary && (
        <Content>
          <Row py="xl" pb="md">
            <Text text={collectionSummary.collectionInfo.name} preset="title" textCenter size="xl" color="gold" />
          </Row>

          <Card style={{ borderRadius: 15 }}>
            <Column fullX my="sm">
              <Section title={t('collection_id')} value={collectionSummary.collectionInfo.alkaneid} showCopyIcon />
              <Line />
              <Section title={t('name_label')} value={collectionSummary.collectionInfo.name} />
              <Line />
              <Section title={t('symbol_alkanes')} value={collectionSummary.collectionInfo.symbol} />
              <Line />

              <Section title={t('total_supply')} value={collectionSummary.collectionInfo.totalSupply.toString()} />
              <Line />

              <Section
                title={t('holders_alkanes')}
                value={collectionSummary.collectionInfo.collectionData?.holders.toString() || '--'}
              />
            </Column>
          </Card>

          <AlkanesNFTList collectionId={collectionId} />
        </Content>
      )}
    </Layout>
  );
}
