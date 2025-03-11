import { useEffect, useState } from 'react';

import { AddressCAT721CollectionSummary } from '@/shared/types';
import { Card, Column, Content, Header, Icon, Layout, Row, Text } from '@/ui/components';
import CAT721Preview from '@/ui/components/CAT721Preview';
import { Line } from '@/ui/components/Line';
import { Section } from '@/ui/components/Section';
import { useI18n } from '@/ui/hooks/useI18n';
import { useCurrentAccount } from '@/ui/state/accounts/hooks';
import { useIsInExpandView } from '@/ui/state/ui/hooks';
import { colors } from '@/ui/theme/colors';
import { fontSizes } from '@/ui/theme/font';
import { useLocationState, useWallet } from '@/ui/utils';
import { LoadingOutlined } from '@ant-design/icons';

import { useNavigate } from '../MainRoute';

interface LocationState {
  collectionId: string;
}

export default function CAT721CollectionScreen() {
  const { t } = useI18n();
  const { collectionId } = useLocationState<LocationState>();
  const [collectionSummary, setCollectionSummary] = useState<AddressCAT721CollectionSummary>({
    collectionInfo: {
      collectionId: '',
      name: '',
      symbol: '',
      description: '',
      max: '0',
      premine: '0',
      contentType: ''
    },
    localIds: []
  });

  const wallet = useWallet();

  const account = useCurrentAccount();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    wallet.getAddressCAT721CollectionSummary(account.address, collectionId).then((collectionSummary) => {
      setCollectionSummary(collectionSummary);
      setLoading(false);
    });
  }, []);

  const navigate = useNavigate();

  const inExpandView = useIsInExpandView();
  const justifyContent = inExpandView ? 'left' : 'space-between';

  if (loading) {
    return (
      <Layout>
        <Content itemsCenter justifyCenter>
          <Icon size={fontSizes.xxxl} color="gold">
            <LoadingOutlined />
          </Icon>
        </Content>
      </Layout>
    );
  }

  if (!collectionSummary || !collectionSummary.collectionInfo) {
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
              <Section title={t('collection_id')} value={collectionSummary.collectionInfo.collectionId} showCopyIcon />
              <Line />
              <Section title={t('collection')} value={collectionSummary.collectionInfo.name} />
              <Line />
              <Section title={t('symbol')} value={collectionSummary.collectionInfo.symbol} />
              <Line />

              <Section title={t('max_supply')} value={collectionSummary.collectionInfo.max} />
              <Line />

              <Section title={t('premine')} value={collectionSummary.collectionInfo.premine} />

              {collectionSummary.collectionInfo.description ? (
                <Row
                  style={{
                    backgroundColor: colors.border,
                    height: 1
                  }}></Row>
              ) : null}

              {collectionSummary.collectionInfo.description ? (
                <Row>
                  <Text text={collectionSummary.collectionInfo.description} preset="sub" />
                </Row>
              ) : null}
            </Column>
          </Card>

          {collectionSummary.localIds.length > 0 && (
            <Row style={{ flexWrap: 'wrap', justifyContent }}>
              {collectionSummary.localIds.map((localId, index) => (
                <CAT721Preview
                  key={localId}
                  preset="medium"
                  collectionId={collectionSummary.collectionInfo.collectionId}
                  contentType={collectionSummary.collectionInfo.contentType}
                  localId={localId}
                  onClick={() => {
                    navigate('CAT721NFTScreen', {
                      collectionInfo: collectionSummary.collectionInfo,
                      localId
                    });
                  }}
                />
              ))}
            </Row>
          )}
        </Content>
      )}
    </Layout>
  );
}
