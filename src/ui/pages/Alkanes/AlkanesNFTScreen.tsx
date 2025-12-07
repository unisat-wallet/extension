import { Button, Card, Column, Content, Header, Layout, Row, Text } from '@/ui/components';
import AlkanesNFTPreview from '@/ui/components/AlkanesNFTPreview';
import { Line } from '@/ui/components/Line';
import { Section } from '@/ui/components/Section';
import { useAlkanesNFTScreenLogic } from '@unisat/wallet-state';

export default function AlkanesNFTScreen() {
  const { alkanesInfo, t, onClickSend, onClickBack, disabledSend } = useAlkanesNFTScreenLogic();

  return (
    <Layout>
      <Header onBack={onClickBack}>
        <Row>
          <Text text={`${alkanesInfo.name} `} />
        </Row>
      </Header>
      <Content>
        <Row justifyCenter>
          <AlkanesNFTPreview preset="large" alkanesInfo={alkanesInfo} />
        </Row>

        <Card style={{ borderRadius: 15 }}>
          <Column fullX my="sm">
            <Section title={t('name_label')} value={alkanesInfo.name} />
            <Line />

            <Section title={t('symbol_alkanes')} value={alkanesInfo.symbol} />
            <Line />
            <Section title={'Alkanes ID'} value={alkanesInfo.alkaneid} showCopyIcon />
          </Column>
        </Card>
        <Button text={t('send')} icon="send" preset="default" disabled={disabledSend} onClick={onClickSend}></Button>
      </Content>
    </Layout>
  );
}
