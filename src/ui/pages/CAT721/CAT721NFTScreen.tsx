import { useLocation } from 'react-router-dom';

import { CAT721CollectionInfo } from '@/shared/types';
import { Button, Card, Column, Content, Header, Layout, Row, Text } from '@/ui/components';
import CAT721Preview from '@/ui/components/CAT721Preview';
import { Line } from '@/ui/components/Line';
import { Section } from '@/ui/components/Section';
import { useI18n } from '@/ui/hooks/useI18n';
import { useNavigate } from '@/ui/pages/MainRoute';

export default function CAT721NFTScreen() {
  const { state } = useLocation();
  const props = state as {
    collectionInfo: CAT721CollectionInfo;
    localId: string;
  };
  const { t } = useI18n();

  const collectionInfo = props.collectionInfo;
  const localId = props.localId;

  const navigate = useNavigate();

  return (
    <Layout>
      <Header
        onBack={() => {
          window.history.go(-1);
        }}>
        <Row>
          <Text text={`${collectionInfo.name} `} />
          <Text text={`#${localId}`} color="gold" />
        </Row>
      </Header>
      <Content>
        <Row justifyCenter>
          <CAT721Preview
            preset="large"
            collectionId={collectionInfo.collectionId}
            contentType={collectionInfo.contentType}
            localId={localId}
          />
        </Row>

        <Card style={{ borderRadius: 15 }}>
          <Column fullX my="sm">
            <Section title={t('collection_id')} value={collectionInfo.collectionId} showCopyIcon />
            <Line />
            <Section title={t('collection')} value={collectionInfo.name} />
          </Column>
        </Card>
        <Button
          preset="primary"
          text={t('send')}
          icon="send"
          onClick={(e) => {
            navigate('SendCAT721Screen', {
              collectionInfo: collectionInfo,
              localId: localId
            });
          }}></Button>
      </Content>
    </Layout>
  );
}
