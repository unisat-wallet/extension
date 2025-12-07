import { Column, Content, Footer, Header, Icon, Layout, Row, Text } from '@/ui/components';
import { NavTabBar } from '@/ui/components/NavTabBar';
import { SwitchNetworkBar } from '@/ui/components/SwitchNetworkBar';
import { fontSizes } from '@/ui/theme/font';
import { useI18n, useNavigation, useVersionInfo } from '@unisat/wallet-state';

import { DISCORD_URL, GITHUB_URL, TWITTER_URL } from '@unisat/wallet-shared';
import { SettingsList } from './SettingsList';

export default function SettingsTabScreen() {
  const versionInfo = useVersionInfo();
  const nav = useNavigation();
  const { t } = useI18n();

  return (
    <Layout>
      <Header
        type="home"
        LeftComponent={
          <Row>
            <Text preset="title-bold" text={t('settings')} />
          </Row>
        }
        RightComponent={
          <Row itemsCenter gap="md">
            <div
              onClick={() => nav.navigate('LanguageScreen')}
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <Icon icon="language" size={28} color="textDim" />
            </div>
            <SwitchNetworkBar />
          </Row>
        }
      />
      <Content>
        <Column>
          <SettingsList />

          <Row justifyCenter gap="xl" mt="lg">
            <Icon
              icon="discord"
              size={fontSizes.iconMiddle}
              color="textDim"
              onClick={() => {
                nav.navToUrl(DISCORD_URL);
              }}
            />

            <Icon
              icon="twitter"
              size={fontSizes.iconMiddle}
              color="textDim"
              onClick={() => {
                nav.navToUrl(TWITTER_URL);
              }}
            />

            <Icon
              icon="github"
              size={fontSizes.iconMiddle}
              color="textDim"
              onClick={() => {
                nav.navToUrl(GITHUB_URL);
              }}
            />
          </Row>
          <Text text={`${t('version')} ${versionInfo.currentVesion}`} preset="sub" textCenter />
        </Column>
      </Content>
      <Footer px="zero" py="zero">
        <NavTabBar tab="settings" />
      </Footer>
    </Layout>
  );
}
