import { AppInfo } from '@/shared/types';
import { Card, Column, Content, Footer, Header, Image, Layout, Row, Text } from '@/ui/components';
import { NavTabBar } from '@/ui/components/NavTabBar';
import { useAppSummary, useReadApp } from '@/ui/state/accounts/hooks';
import { fontSizes } from '@/ui/theme/font';
import { shortDesc } from '@/ui/utils';

function AppItem({ info }: { info: AppInfo }) {
  const readApp = useReadApp();
  return (
    <Card
      preset="style1"
      onClick={() => {
        if (info.url) window.open(info.url);
        readApp(info.id);
      }}>
      <Row full>
        <Column justifyCenter>
          <Image src={info.logo} size={fontSizes.logo} />
        </Column>

        <Column justifyCenter gap="zero">
          <Row itemsCenter>
            <Text text={info.title} />
            <Card preset="style2" style={{ backgroundColor: info.tagColor }}>
              <Text text={info.tag} size="xxs" />
            </Card>
            {info.new && <Text text="new!" color="red" />}
          </Row>

          <Text text={shortDesc(info.desc)} preset="sub" />
        </Column>
      </Row>
    </Card>
  );
}

export default function AppTabScrren() {
  const appSummary = useAppSummary();
  return (
    <Layout>
      <Header />
      <Content>
        <Column gap="lg">
          {appSummary.apps.map((v) => (
            <AppItem key={v.title} info={v} />
          ))}
        </Column>
      </Content>
      <Footer px="zero" py="zero">
        <NavTabBar tab="app" />
      </Footer>
    </Layout>
  );
}
