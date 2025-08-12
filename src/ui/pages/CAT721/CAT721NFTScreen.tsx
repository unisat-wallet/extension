import { CAT721CollectionInfo, CAT_VERSION } from '@/shared/types';
import { Button, Card, Column, Content, Header, Layout, Row, Text } from '@/ui/components';
import CAT721Preview from '@/ui/components/CAT721Preview';
import { Line } from '@/ui/components/Line';
import { Section } from '@/ui/components/Section';
import { useI18n } from '@/ui/hooks/useI18n';
import { useNavigate } from '@/ui/pages/MainRoute';
import { useLocationState } from '@/ui/utils';

interface LocationState {
  version: CAT_VERSION;
  collectionInfo: CAT721CollectionInfo;
  localId: string;
}
export default function CAT721NFTScreen() {
  const props = useLocationState<LocationState>();
  const { version, collectionInfo, localId } = props;
  const { t } = useI18n();

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
            version={version}
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
              version: version,
              collectionInfo: collectionInfo,
              localId: localId
            });
          }}></Button>
      </Content>
    </Layout>
  );
}
