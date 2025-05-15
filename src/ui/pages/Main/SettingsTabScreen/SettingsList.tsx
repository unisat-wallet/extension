import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ADDRESS_TYPES, FEEDBACK_URL, KEYRING_TYPE, REVIEW_URL } from '@/shared/constant';
import { Button, Card, Column, Row, Text } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import { Icon } from '@/ui/components/Icon';
import { getCurrentTab, useExtensionIsInTab, useOpenExtensionInTab } from '@/ui/features/browser/tabs';
import { useI18n } from '@/ui/hooks/useI18n';
import { SwitchChainModal } from '@/ui/pages/Settings/SwitchChainModal';
import { useCurrentAccount } from '@/ui/state/accounts/hooks';
import { useCurrentKeyring } from '@/ui/state/keyrings/hooks';
import { useChain, useVersionInfo } from '@/ui/state/settings/hooks';
import { fontSizes } from '@/ui/theme/font';
import { spacing } from '@/ui/theme/spacing';
import { useWallet } from '@/ui/utils';

import { getSettingsList } from './const';
import { SettingsAction, SettingsItemType } from './types';

export function SettingsList() {
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
  const { t } = useI18n();

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
    return getSettingsList().filter((v) => {
      if (v.action === SettingsAction.MANAGE_WALLET) {
        v.value = currentKeyring.alianName;
      }

      if (v.action === SettingsAction.CONNECTED_SITES) {
        v.value = connected ? t('connected') : t('not_connected');
      }

      if (v.action === SettingsAction.NETWORK_TYPE) {
        v.value = chain.label;
      }

      if (v.action === SettingsAction.ADDRESS_TYPE) {
        const item = ADDRESS_TYPES[currentKeyring.addressType];
        const hdPath = currentKeyring.hdPath || item.hdPath;
        if (currentKeyring.type === KEYRING_TYPE.SimpleKeyring) {
          v.value = `${item.name}`;
        } else {
          v.value = `${item.name} (${hdPath}/${currentAccount.index})`;
        }
      }

      if (v.action === SettingsAction.ABOUT_US) {
        v.badge = hasUpdate ? t('new_version') : undefined;
      }

      if (v.action === SettingsAction.EXPAND_VIEW) {
        if (isInTab) {
          return false;
        }
      }

      return true;
    });
  }, [connected, currentKeyring, currentAccount, chain, isInTab, hasUpdate, t]);

  const onClick = (item: SettingsItemType) => {
    if (item.action === SettingsAction.EXPAND_VIEW) {
      openExtensionInTab();
      return;
    }
    if (item.action === SettingsAction.LOCK_WALLET) {
      wallet.lockWallet();

      // Add small delay to ensure lock state updates before navigation
      // Prevents race condition where unlock screen might redirect back to main
      setTimeout(() => {
        navigate('/account/unlock');
      }, 10);
      return;
    }

    if (item.action === SettingsAction.NETWORK_TYPE) {
      setSwitchChainModalVisible(true);
      return;
    }
    if (item.action === SettingsAction.ADDRESS_TYPE) {
      if (isCustomHdPath) {
        tools.showTip(t('the_wallet_currently_uses_a_custom_hd_path_and_does_not_support_switching_address_types'));
        return;
      }
      navigate('/settings/address-type');
      return;
    }
    if (item.action === SettingsAction.FEEDBACK) {
      const addressParam = currentAccount.address;

      let feedbackUrl = FEEDBACK_URL;
      feedbackUrl += `?address=${addressParam}&category=wallet`;

      window.open(feedbackUrl);
      return;
    }
    if (item.action === SettingsAction.RATE_US) {
      window.open(REVIEW_URL);
      return;
    }
    navigate(item.route);
  };

  const renderSettingsItem = (item: SettingsItemType, groupTop: boolean, groupBottom: boolean) => (
    <Card
      onClick={() => onClick(item)}
      style={{
        height: '64px',
        flexShrink: 0,
        borderRadius:
          groupTop && groupBottom
            ? '12px 12px 12px 12px'
            : groupTop
            ? '12px 12px 0 0'
            : groupBottom
            ? '0 0 12px 12px'
            : '0',
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
            {item.action !== SettingsAction.CONNECTED_SITES && <Text text={item.value} preset="sub" wrap size="xxs" />}
          </Column>
        </Row>
        <Row style={{ alignItems: 'center', gap: spacing.small }}>
          {item.action === SettingsAction.CONNECTED_SITES && (
            <Row style={{ alignItems: 'center', gap: spacing.tiny }}>
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: connected ? '#4CD9AC' : 'rgba(255, 255, 255, 0.3)'
                }}
              />
              <Text text={connected ? t('connected') : t('not_connected')} preset="sub" size="xs" />
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

  const renderGroup = (items: SettingsItemType[]) => (
    <div>
      {items.map((item, index) => (
        <React.Fragment key={item.action}>
          {renderSettingsItem(item, index === 0, index === items.length - 1)}
          {index < items.length - 1 && renderDivider()}
        </React.Fragment>
      ))}
    </div>
  );

  // Group settings
  const connectedSitesGroup = toRenderSettings.filter((item) => item.action === SettingsAction.CONNECTED_SITES);
  const addressBookGroup = toRenderSettings.filter((item) => item.action === SettingsAction.CONTACTS);
  const addressTypeSettingsGroup = toRenderSettings.filter(
    (item) => item.action === SettingsAction.ADDRESS_TYPE || item.action === SettingsAction.ADVANCED
  );
  const feedbackGroup = toRenderSettings.filter((item) =>
    [SettingsAction.FEEDBACK, SettingsAction.RATE_US, SettingsAction.ABOUT_US].includes(item.action)
  );
  const buttonSettings = toRenderSettings.filter((item) =>
    [SettingsAction.EXPAND_VIEW, SettingsAction.LOCK_WALLET].includes(item.action)
  );

  return (
    <Column style={{ alignItems: 'center' }}>
      <Column fullX>
        {renderGroup(connectedSitesGroup)}
        {renderGroup(addressBookGroup)}
        {renderGroup(addressTypeSettingsGroup)}
        {renderGroup(feedbackGroup)}
      </Column>

      <Column>
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
      </Column>

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
