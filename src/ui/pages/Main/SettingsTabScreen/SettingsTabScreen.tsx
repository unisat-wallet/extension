import { useNavigate } from 'react-router-dom';

import { DISCORD_URL, GITHUB_URL, TWITTER_URL } from '@/shared/constant';
import { Column, Content, Footer, Header, Icon, Layout, Row, Text } from '@/ui/components';
import { NavTabBar } from '@/ui/components/NavTabBar';
import { SwitchNetworkBar } from '@/ui/components/SwitchNetworkBar';
import { useI18n } from '@/ui/hooks/useI18n';
import { useVersionInfo } from '@/ui/state/settings/hooks';
import { fontSizes } from '@/ui/theme/font';

import { SettingsList } from './SettingsList';

export default function SettingsTabScreen() {
  const versionInfo = useVersionInfo();
  const navigate = useNavigate();
  const { t } = useI18n();

  const navigateToLanguageSettings = () => {
    navigate('/settings/language');
  };

  return (
    <Layout>
      <Header
        type="style2"
        LeftComponent={
          <Row>
            <Text preset="title-bold" text={t('settings')} />
          </Row>
        }
        RightComponent={
          <Row itemsCenter gap="md">
            <div
              onClick={navigateToLanguageSettings}
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
          <Text text={`${t('version')} ${versionInfo.currentVesion}`} preset="sub" textCenter />
        </Column>
      </Content>
      <Footer px="zero" py="zero">
        <NavTabBar tab="settings" />
      </Footer>
    </Layout>
  );
}
