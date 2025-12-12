import { Button, Card, Column, Content, Header, Layout, Row, Text } from '@/ui/components';
import CAT721Preview from '@/ui/components/CAT721Preview';
import { Line } from '@/ui/components/Line';
import { Section } from '@/ui/components/Section';
import { useCAT721NFTScreenLogic } from '@unisat/wallet-state';

export default function CAT721NFTScreen() {
  const {
    // info
    collectionInfo,
    localId,
    version,
    // i18n
    t,

    // actions
    onClickBack,
    onClickSend
  } = useCAT721NFTScreenLogic();

  return (
    <Layout>
      <Header onBack={onClickBack}>
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
        <Button preset="primary" text={t('send')} icon="send" onClick={onClickSend}></Button>
      </Content>
    </Layout>
  );
}
