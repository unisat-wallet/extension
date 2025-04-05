import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ADDRESS_TYPES, KEYRING_TYPE, REVIEW_URL } from '@/shared/constant';
import { Button, Card, Column, Row, Text } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import { Icon } from '@/ui/components/Icon';
import { getCurrentTab, useExtensionIsInTab, useOpenExtensionInTab } from '@/ui/features/browser/tabs';
import { SwitchChainModal } from '@/ui/pages/Settings/SwitchChainModal';
import { useCurrentAccount } from '@/ui/state/accounts/hooks';
import { useCurrentKeyring } from '@/ui/state/keyrings/hooks';
import { useChain, useVersionInfo } from '@/ui/state/settings/hooks';
import { fontSizes } from '@/ui/theme/font';
import { spacing } from '@/ui/theme/spacing';
import { useWallet } from '@/ui/utils';

import { SettingListConst } from './const';
import { SettingAction, SettingItemType } from './types';

export function SettingList() {
  const navigate = useNavigate();
  const currentKeyring = useCurrentKeyring();
  const currentAccount = useCurrentAccount();
  const chain = useChain();
  const wallet = useWallet();
  const tools = useTools();
  const openExtensionInTab = useOpenExtensionInTab();
  const isInTab = useExtensionIsInTab();
  const [connected, setConnected] = useState(false);
  const [switchChainModalVisible, setSwitchChainModalVisible] = useState(false);
  const versionInfo = useVersionInfo();
  const hasUpdate = versionInfo.latestVersion && versionInfo.latestVersion !== versionInfo.currentVesion;

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

  const toRenderSettings = useMemo(() => {
    return SettingListConst.filter((v) => {
      if (v.action === SettingAction.MANAGE_WALLET) {
        v.value = currentKeyring.alianName;
      }

      if (v.action === SettingAction.CONNECTED_SITES) {
        v.value = connected ? 'Connected' : 'Not connected';
      }

      if (v.action === SettingAction.NETWORK_TYPE) {
        v.value = chain.label;
      }

      if (v.action === SettingAction.ADDRESS_TYPE) {
        const item = ADDRESS_TYPES[currentKeyring.addressType];
        const hdPath = currentKeyring.hdPath || item.hdPath;
        if (currentKeyring.type === KEYRING_TYPE.SimpleKeyring) {
          v.value = `${item.name}`;
        } else {
          v.value = `${item.name} (${hdPath}/${currentAccount.index})`;
        }
      }

      if (v.action === SettingAction.ABOUT_US) {
        v.badge = hasUpdate ? 'New version!' : undefined;
      }

      if (v.action === SettingAction.EXPAND_VIEW) {
        if (isInTab) {
          return false;
        }
      }

      return true;
    });
  }, [connected, currentKeyring, currentAccount, chain, isInTab, hasUpdate]);

  const onClick = (item: SettingItemType) => {
    if (item.action === SettingAction.EXPAND_VIEW) {
      openExtensionInTab();
      return;
    }
    if (item.action === SettingAction.LOCK_WALLET) {
      wallet.lockWallet();
      navigate('/account/unlock');
      return;
    }

    if (item.action === SettingAction.NETWORK_TYPE) {
      setSwitchChainModalVisible(true);
      return;
    }
    if (item.action === SettingAction.ADDRESS_TYPE) {
      if (isCustomHdPath) {
        tools.showTip('The wallet currently uses a custom HD path and does not support switching address types.');
        return;
      }
      navigate('/settings/address-type');
      return;
    }
    if (item.action === SettingAction.RATE_US) {
      window.open(REVIEW_URL);
      return;
    }
    navigate(item.route);
  };

  const renderSettingItem = (item: SettingItemType) => (
    <Card
      onClick={() => onClick(item)}
      style={{
        width: '328px',
        height: '64px',
        flexShrink: 0,
        borderRadius: '12px',
        background: 'rgba(255, 255, 255, 0.06)',
        padding: '0 16px',
        margin: 0
      }}>
      <Row full justifyBetween style={{ height: '100%', alignItems: 'center' }}>
        <Row style={{ minWidth: 0, alignItems: 'center' }}>
          <Icon icon={item.icon} size={fontSizes.logo} color="textDim" />
          <Column style={{ gap: spacing.tiny, minWidth: 0, flex: 1, marginLeft: spacing.tiny }}>
            <Row justifyBetween>
              <Text text={item.label || item.desc} preset="regular" size="sm" style={{ color: 'white' }} />
              {item.badge && (
                <Text
                  text={item.badge}
                  preset="badge"
                  style={{
                    marginLeft: '6px'
                  }}
                />
              )}
            </Row>
            {item.action !== SettingAction.CONNECTED_SITES && <Text text={item.value} preset="sub" wrap size="xxs" />}
          </Column>
        </Row>
        <Row style={{ alignItems: 'center', gap: spacing.small }}>
          {item.action === SettingAction.CONNECTED_SITES && (
            <Row style={{ alignItems: 'center', gap: spacing.tiny }}>
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: connected ? '#4CD9AC' : 'rgba(255, 255, 255, 0.3)'
                }}
              />
              <Text text={connected ? 'Connected' : 'Not connected'} preset="sub" size="xs" />
            </Row>
          )}
          {item.right && <Icon icon="right" size={fontSizes.lg} color="textDim" />}
        </Row>
      </Row>
    </Card>
  );

  const renderDivider = () => (
    <div
      style={{
        height: '1px',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        margin: '0'
      }}
    />
  );

  const renderGroup = (items: SettingItemType[]) => (
    <div>
      {items.map((item, index) => (
        <React.Fragment key={item.action}>
          {renderSettingItem(item)}
          {index < items.length - 1 && renderDivider()}
        </React.Fragment>
      ))}
    </div>
  );

  // Group settings
  const connectedSitesGroup = toRenderSettings.filter((item) => item.action === SettingAction.CONNECTED_SITES);
  const addressBookGroup = toRenderSettings.filter((item) => item.action === SettingAction.CONTACTS);
  const addressTypeSettingsGroup = toRenderSettings.filter(
    (item) => item.action === SettingAction.ADDRESS_TYPE || item.action === SettingAction.ADVANCED
  );
  const feedbackGroup = toRenderSettings.filter((item) =>
    [SettingAction.RATE_US, SettingAction.ABOUT_US].includes(item.action)
  );
  const buttonSettings = toRenderSettings.filter((item) =>
    [SettingAction.EXPAND_VIEW, SettingAction.LOCK_WALLET].includes(item.action)
  );

  return (
    <Column style={{ alignItems: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
        {renderGroup(connectedSitesGroup)}
        {renderGroup(addressBookGroup)}
        {renderGroup(addressTypeSettingsGroup)}
        {renderGroup(feedbackGroup)}
      </div>

      <div
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', gap: spacing.small }}>
        {buttonSettings.map((item) => (
          <Button
            key={item.action}
            style={{
              height: 50,
              backgroundColor: 'rgba(20, 20, 20, 0.8)',
              width: '328px',
              margin: '0 auto',
              borderRadius: 8,
              border: '1px solid rgba(255, 255, 255, 0.45)'
            }}
            text={item.desc}
            onClick={() => onClick(item)}
          />
        ))}
      </div>

      {switchChainModalVisible && (
        <SwitchChainModal
          onClose={() => {
            setSwitchChainModalVisible(false);
          }}
        />
      )}
    </Column>
  );
}
