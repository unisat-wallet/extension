import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ADDRESS_TYPES, DISCORD_URL, GITHUB_URL, KEYRING_TYPE, TELEGRAM_URL, X_URL } from '@/shared/constant';
import { ADDRESS_TYPES, DISCORD_URL, GITHUB_URL, KEYRING_TYPE, TWITTER_URL } from '@/shared/constant';
import { Card, Column, Content, Footer, Header, Layout, Row, Text } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import { Button } from '@/ui/components/Button';
import { Icon } from '@/ui/components/Icon';
import { NavTabBar } from '@/ui/components/NavTabBar';
import { SwitchNetworkBar } from '@/ui/components/SwitchNetworkBar';
import { getCurrentTab, useExtensionIsInTab, useOpenExtensionInTab } from '@/ui/features/browser/tabs';
import { useCurrentAccount } from '@/ui/state/accounts/hooks';
import { useCurrentKeyring } from '@/ui/state/keyrings/hooks';
import { useChain, useVersionInfo } from '@/ui/state/settings/hooks';
import { fontSizes } from '@/ui/theme/font';
import { spacing } from '@/ui/theme/spacing';
import { useWallet } from '@/ui/utils';

import { SwitchChainModal } from '../Settings/SwitchChainModal';

interface Setting {
  label?: string;
  value?: string;
  desc?: string;
  danger?: boolean;
  action: string;
  route: string;
  right: boolean;
}

const SettingList: Setting[] = [
  // {
  //   label: 'Manage Wallet',
  //   value: '',
  //   desc: '',
  //   action: 'manage-wallet',
  //   route: '/settings/manage-wallet',
  //   right: true
  // },

  {
    label: 'Address Type',
    value: 'Taproot',
    desc: '',
    action: 'addressType',
    route: '/settings/address-type',
    right: true
  },

  {
    label: 'Advanced',
    value: 'Advanced settings',
    desc: '',
    action: 'advanced',
    route: '/settings/advanced',
    right: true
  },

  {
    label: 'Connected Sites',
    value: '',
    desc: '',
    action: 'connected-sites',
    route: '/connected-sites',
    right: true
  },
  {
    label: 'Network',
    value: 'MAINNET',
    desc: '',
    action: 'networkType',
    route: '/settings/network-type',
    right: true
  },

  {
    label: 'Change Password',
    value: 'Change your lockscreen password',
    desc: '',
    action: 'password',
    route: '/settings/password',
    right: true
  },
  {
    label: '',
    value: '',
    desc: 'Expand View ',
    action: 'expand-view',
    route: '/settings/export-privatekey',
    right: false
  },
  {
    label: '',
    value: '',
    desc: 'Lock Immediately',
    action: 'lock-wallet',
    route: '',
    right: false
  }
];

export default function SettingsTabScreen() {
  const navigate = useNavigate();
  const chain = useChain();

  const isInTab = useExtensionIsInTab();

  const [connected, setConnected] = useState(false);

  const currentKeyring = useCurrentKeyring();
  const currentAccount = useCurrentAccount();
  const versionInfo = useVersionInfo();
  const wallet = useWallet();

  const [switchChainModalVisible, setSwitchChainModalVisible] = useState(false);

  useEffect(() => {
    const run = async () => {
      const res = await getCurrentTab();
      if (!res || !res.url) return;

      const origin = new URL(res.url).origin;

      if (origin === 'https://unisat.io') {
        setConnected(true);
      } else {
        const sites = await wallet.getConnectedSites();

        if (sites.find((i) => i.origin === origin)) {
          setConnected(true);
        }
      }
    };
    run();
  }, []);

  const isCustomHdPath = useMemo(() => {
    const item = ADDRESS_TYPES[currentKeyring.addressType];
    return currentKeyring.hdPath !== '' && item.hdPath !== currentKeyring.hdPath;
  }, [currentKeyring]);

  const toRenderSettings = SettingList.filter((v) => {
    if (v.action == 'manage-wallet') {
      v.value = currentKeyring.alianName;
    }

    if (v.action == 'connected-sites') {
      v.value = connected ? 'Connected' : 'Not connected';
    }

    if (v.action == 'networkType') {
      v.value = chain.label;
    }

    if (v.action == 'addressType') {
      const item = ADDRESS_TYPES[currentKeyring.addressType];
      const hdPath = currentKeyring.hdPath || item.hdPath;
      if (currentKeyring.type === KEYRING_TYPE.SimpleKeyring) {
        v.value = `${item.name}`;
      } else {
        v.value = `${item.name} (${hdPath}/${currentAccount.index})`;
      }
    }

    if (v.action == 'expand-view') {
      if (isInTab) {
        return false;
      }
    }

    return true;
  });

  const tools = useTools();
  const openExtensionInTab = useOpenExtensionInTab();

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
          <div>
            {toRenderSettings.map((item) => {
              const onClick = () => {
                if (item.action == 'expand-view') {
                  openExtensionInTab();
                  return;
                }
                if (item.action == 'lock-wallet') {
                  wallet.lockWallet();
                  navigate('/account/unlock');
                  return;
                }

                if (item.action == 'networkType') {
                  setSwitchChainModalVisible(true);
                  return;
                }
                if (item.action == 'addressType') {
                  if (isCustomHdPath) {
                    tools.showTip(
                      'The wallet currently uses a custom HD path and does not support switching address types.'
                    );
                    return;
                  }
                  navigate('/settings/address-type');
                  return;
                }
                navigate(item.route);
              };
              if (!item.label) {
                return (
                  <Button
                    key={item.action}
                    style={{ marginTop: spacing.small, height: 50 }}
                    text={item.desc}
                    onClick={onClick}
                  />
                );
              }
              return (
                <Card key={item.action} mt="lg" onClick={onClick}>
                  <Row full justifyBetween>
                    <Column justifyCenter>
                      <Text text={item.label || item.desc} preset="regular-bold" />
                      <Text text={item.value} preset="sub" />
                    </Column>

                    <Column justifyCenter>
                      {item.right && <Icon icon="right" size={fontSizes.lg} color="textDim" />}
                    </Column>
                  </Row>
                </Card>
              );
            })}
          </div>
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
              icon="X"
              size={fontSizes.iconMiddle}
              color="textDim"
              onClick={() => {
                window.open(X_URL);
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

        {switchChainModalVisible && (
          <SwitchChainModal
            onClose={() => {
              setSwitchChainModalVisible(false);
            }}
          />
        )}
      </Content>
      <Footer px="zero" py="zero">
        <NavTabBar tab="settings" />
      </Footer>
    </Layout>
  );
}
