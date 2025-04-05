import { DISCORD_URL, GITHUB_URL, TWITTER_URL } from '@/shared/constant';
import { Column, Content, Footer, Header, Icon, Layout, Row, Text } from '@/ui/components';
import { NavTabBar } from '@/ui/components/NavTabBar';
import { SwitchNetworkBar } from '@/ui/components/SwitchNetworkBar';
import { useVersionInfo } from '@/ui/state/settings/hooks';
import { fontSizes } from '@/ui/theme/font';

import { SettingList } from './SettingList';

export default function SettingsTabScreen() {
  const versionInfo = useVersionInfo();

  return (
    <Layout>
      <Header
        type="style2"
        LeftComponent={
          <Row>
            <Text preset="title-bold" text={'Settings'} />
          </Row>
        }
        RightComponent={<SwitchNetworkBar />}
      />
      <Content>
        <Column>
          <SettingList />

          <Row justifyCenter gap="xl" mt="lg">
            <Icon
              icon="discord"
              size={fontSizes.iconMiddle}
              color="textDim"
              onClick={() => {
                window.open(DISCORD_URL);
              }}
            />

            <Icon
              icon="twitter"
              size={fontSizes.iconMiddle}
              color="textDim"
              onClick={() => {
                window.open(TWITTER_URL);
              }}
            />

            <Icon
              icon="github"
              size={fontSizes.iconMiddle}
              color="textDim"
              onClick={() => {
                window.open(GITHUB_URL);
              }}
            />
          </Row>
          <Text text={`Version: ${versionInfo.currentVesion}`} preset="sub" textCenter />
          {versionInfo.latestVersion && (
            <Text
              text={`Latest Version: ${versionInfo.latestVersion}`}
              preset="link"
              color="red"
              textCenter
              onClick={() => {
                window.open('https://unisat.io/extension/update');
              }}
            />
          )}
        </Column>
      </Content>
      <Footer px="zero" py="zero">
        <NavTabBar tab="settings" />
      </Footer>
    </Layout>
  );
}
