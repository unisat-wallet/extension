import { AppInfo } from '@/shared/types';
import { Card, Column, Content, Footer, Header, Image, Layout, Row, Text } from '@/ui/components';
import { NavTabBar } from '@/ui/components/NavTabBar';
import { useAppSummary } from '@/ui/state/accounts/hooks';
import { fontSizes } from '@/ui/theme/font';
import { shortDesc } from '@/ui/utils';

function AppItem({ info }: { info: AppInfo }) {
  return (
    <Card
      preset="style1"
      onClick={() => {
        if (info.url) window.open(info.url);
      }}>
      <Row full>
        <Column justifyCenter>
          <Image src={info.logo} size={fontSizes.logo} />
        </Column>

        <Column justifyCenter gap="zero">
          <Text text={info.title} />
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
          {appSummary.apps.map(({ tag, list }) => (
            <Column key={tag}>
              <Text text={tag} preset="regular-bold" />
              {list.map((v) => (
                <AppItem key={v.title} info={v} />
              ))}
            </Column>
          ))}
        </Column>
      </Content>
      <Footer px="zero" py="zero">
        <NavTabBar tab="app" />
      </Footer>
    </Layout>
  );
}
