import { Tooltip } from 'antd';
import { CSSProperties, useEffect, useMemo, useState } from 'react';

import { AddressFlagType, ChainType } from '@/shared/constant';
import { checkAddressFlag } from '@/shared/utils';
import { Card, Column, Content, Footer, Header, Layout, Row, Text } from '@/ui/components';
import AccountSelect from '@/ui/components/AccountSelect';
import { BtcUsd } from '@/ui/components/BtcUsd';
import { Button } from '@/ui/components/Button';
import { DisableUnconfirmedsPopover } from '@/ui/components/DisableUnconfirmedPopover';
import { FeeRateIcon } from '@/ui/components/FeeRateIcon';
import { NavTabBar } from '@/ui/components/NavTabBar';
import { NoticePopover } from '@/ui/components/NoticePopover';
import { SwitchNetworkBar } from '@/ui/components/SwitchNetworkBar';
import { Tabs } from '@/ui/components/Tabs';
import { UpgradePopover } from '@/ui/components/UpgradePopover';
import { getCurrentTab } from '@/ui/features/browser/tabs';
import { BtcDisplay } from '@/ui/pages/Main/WalletTabScreen/components/BtcDisplay';
import { useAccountBalance, useAddressSummary, useCurrentAccount } from '@/ui/state/accounts/hooks';
import { accountActions } from '@/ui/state/accounts/reducer';
import { useAppDispatch } from '@/ui/state/hooks';
import { useCurrentKeyring } from '@/ui/state/keyrings/hooks';
import {
  useAddressExplorerUrl,
  useAddressTips,
  useBTCUnit,
  useChain,
  useChainType,
  useSkipVersionCallback,
  useVersionInfo,
  useWalletConfig
} from '@/ui/state/settings/hooks';
import { useAssetTabKey, useResetUiTxCreateScreen, useSupportedAssets } from '@/ui/state/ui/hooks';
import { AssetTabKey, uiActions } from '@/ui/state/ui/reducer';
import { fontSizes } from '@/ui/theme/font';
import { satoshisToAmount, useWallet } from '@/ui/utils';

import { BuyBTCModal } from '../../BuyBTC/BuyBTCModal';
import { useNavigate } from '../../MainRoute';
import { SwitchChainModal } from '../../Settings/SwitchChainModal';
import { AtomicalsTab } from './AtomicalsTab';
import { CATTab } from './CATTab';
import { OrdinalsTab } from './OrdinalsTab';
import { RunesList } from './RunesList';

const $noBreakStyle: CSSProperties = {
  whiteSpace: 'nowrap',
  wordBreak: 'keep-all'
};

export default function WalletTabScreen() {
  const navigate = useNavigate();

  const accountBalance = useAccountBalance();

  const chain = useChain();
  const chainType = useChainType();
  const addressTips = useAddressTips();

  const currentKeyring = useCurrentKeyring();
  const currentAccount = useCurrentAccount();
  const balanceValue = useMemo(() => {
    return satoshisToAmount(accountBalance.totalBalance);
  }, [accountBalance.totalBalance]);

  const wallet = useWallet();
  const [connected, setConnected] = useState(false);

  const dispatch = useAppDispatch();
  const assetTabKey = useAssetTabKey();

  const skipVersion = useSkipVersionCallback();

  const walletConfig = useWalletConfig();
  const versionInfo = useVersionInfo();

  const [showSafeNotice, setShowSafeNotice] = useState(false);
  const [showDisableUnconfirmedUtxoNotice, setShowDisableUnconfirmedUtxoNotice] = useState(false);

  const avaiableAmount = satoshisToAmount(accountBalance.availableBalance);
  const unavailableAmount = satoshisToAmount(accountBalance.unavailableBalance);
  const totalAmount = satoshisToAmount(accountBalance.totalBalance);

  const addressSummary = useAddressSummary();

  useEffect(() => {
    if (currentAccount.address === addressSummary.address) {
      if (addressSummary.arc20Count > 0 || addressSummary.runesCount > 0) {
        if (!checkAddressFlag(currentAccount.flag, AddressFlagType.CONFIRMED_UTXO_MODE)) {
          if (!checkAddressFlag(currentAccount.flag, AddressFlagType.DISABLE_AUTO_SWITCH_CONFIRMED)) {
            wallet.addAddressFlag(currentAccount, AddressFlagType.CONFIRMED_UTXO_MODE).then((account) => {
              dispatch(accountActions.setCurrent(account));
            });
            setShowDisableUnconfirmedUtxoNotice(true);
          }
        }
      }
    }
  }, [addressSummary, currentAccount]);

  useEffect(() => {
    const run = async () => {
      const show = await wallet.getShowSafeNotice();
      setShowSafeNotice(show);

      const activeTab = await getCurrentTab();
      if (!activeTab) return;
      const site = await wallet.getCurrentConnectedSite(activeTab.id);
      if (site) {
        setConnected(site.isConnected);
      }
    };
    run();
  }, []);

  const supportedAssets = useSupportedAssets();

  const tabItems = useMemo(() => {
    const items: {
      key: AssetTabKey;
      label: string;
      children: JSX.Element;
    }[] = [];
    if (supportedAssets.assets.ordinals) {
      items.push({
        key: AssetTabKey.ORDINALS,
        label: 'Ordinals',
        children: <OrdinalsTab />
      });
    }
    if (supportedAssets.assets.atomicals) {
      items.push({
        key: AssetTabKey.ATOMICALS,
        label: 'Atomicals',
        children: <AtomicalsTab />
      });
    }
    if (supportedAssets.assets.runes) {
      items.push({
        key: AssetTabKey.RUNES,
        label: 'Runes',
        children: <RunesList />
      });
    }
    if (supportedAssets.assets.CAT20) {
      items.push({
        key: AssetTabKey.CAT,
        label: 'CAT',
        children: <CATTab />
      });
    }
    return items;
  }, [supportedAssets.key]);

  const finalAssetTabKey = useMemo(() => {
    if (!supportedAssets.tabKeys.includes(assetTabKey)) {
      return AssetTabKey.ORDINALS;
    }
    return assetTabKey;
  }, [assetTabKey, supportedAssets.key]);

  const addressExplorerUrl = useAddressExplorerUrl(currentAccount.address);
  const resetUiTxCreateScreen = useResetUiTxCreateScreen();
  const btcUnit = useBTCUnit();

  const [buyBtcModalVisible, setBuyBtcModalVisible] = useState(false);

  const [switchChainModalVisible, setSwitchChainModalVisible] = useState(false);

  return (
    <Layout>
      <Header
        type="style2"
        LeftComponent={
          <Card
            preset="style2"
            style={{ height: 28 }}
            onClick={() => {
              navigate('SwitchKeyringScreen');
            }}>
            <Text text={currentKeyring.alianName} size="xxs" />
          </Card>
        }
        RightComponent={
          <Row>
            <FeeRateIcon />
            <SwitchNetworkBar />
          </Row>
        }
      />

      <Content style={{ overflowY: 'auto' }}>
        <AccountSelect />

        <Column gap="lg2" mt="md">
          {(walletConfig.chainTip || walletConfig.statusMessage || addressTips.homeTip) && (
            <Column
              py={'lg'}
              px={'md'}
              gap={'lg'}
              style={{
                borderRadius: 12,
                border: '1px solid rgba(245, 84, 84, 0.35)',
                background: 'rgba(245, 84, 84, 0.08)'
              }}>
              {walletConfig.chainTip && <Text text={walletConfig.chainTip} color="text" textCenter />}
              {walletConfig.statusMessage && <Text text={walletConfig.statusMessage} color="danger" textCenter />}
              {addressTips.homeTip && <Text text={addressTips.homeTip} color="warning" textCenter />}
            </Column>
          )}

          <Tooltip
            placement={'bottom'}
            title={
              <>
                <Row justifyBetween>
                  <span style={$noBreakStyle}>{'Available '}</span>
                  <span style={$noBreakStyle}>{` ${avaiableAmount} ${btcUnit}`}</span>
                </Row>
                <Row justifyBetween>
                  <span style={$noBreakStyle}>{'Unavailable '}</span>
                  <span style={$noBreakStyle}>{` ${unavailableAmount} ${btcUnit}`}</span>
                </Row>
                <Row justifyBetween>
                  <span style={$noBreakStyle}>{'Total '}</span>
                  <span style={$noBreakStyle}>{` ${totalAmount} ${btcUnit}`}</span>
                </Row>
              </>
            }
            overlayStyle={{
              fontSize: fontSizes.xs
            }}>
            <div>
              <Text text={'TOTAL BALANCE'} textCenter color="textDim" />
              <BtcDisplay balance={balanceValue} />
            </div>
          </Tooltip>

          <BtcUsd
            sats={accountBalance.totalBalance}
            textCenter
            size={'md'}
            style={{
              marginTop: -16,
              marginBottom: -8
            }}
          />
          {/*
          <Column
            py={'lg'}
            px={'md'}
            gap={'lg'}
            style={{
              borderRadius: 12,
              border: '1px solid rgba(245, 84, 84, 0.35)',
              background: 'rgba(245, 84, 84, 0.08)'
            }}>
            {
              <Row
                style={{
                  borderBottomWidth: 1,
                  color: '#FA701A'
                }}>
                <Text
                  text={'1 FB is locked by inscription,\n click to go to unlock.'}
                  color="warning"
                  textCenter
                  style={{}}
                />
              </Row>
            }
          </Column> */}

          <Row justifyCenter mt="md">
            <Button
              text="Receive"
              preset="home"
              icon="receive"
              onClick={(e) => {
                navigate('ReceiveScreen');
              }}
            />

            <Button
              text="Send"
              preset="home"
              icon="send"
              onClick={(e) => {
                resetUiTxCreateScreen();
                navigate('TxCreateScreen');
              }}
            />
            <Button
              text="History"
              preset="home"
              icon="history"
              onClick={(e) => {
                if (chain.isViewTxHistoryInternally) {
                  navigate('HistoryScreen');
                } else {
                  window.open(addressExplorerUrl);
                }
              }}
            />
            <Button
              text="Buy"
              preset="home"
              icon={chain.isFractal ? 'fb' : 'bitcoin'}
              iconSize={
                chain.isFractal
                  ? {
                      width: 24,
                      height: 11
                    }
                  : undefined
              }
              onClick={(e) => {
                setBuyBtcModalVisible(true);
              }}
              disabled={chainType !== ChainType.BITCOIN_MAINNET && chainType !== ChainType.FRACTAL_BITCOIN_MAINNET}
            />
          </Row>

          <Tabs
            defaultActiveKey={finalAssetTabKey as unknown as string}
            activeKey={finalAssetTabKey as unknown as string}
            items={tabItems as unknown as any[]}
            onTabClick={(key) => {
              dispatch(uiActions.updateAssetTabScreen({ assetTabKey: key as unknown as AssetTabKey }));
            }}
          />
        </Column>
        {showSafeNotice && (
          <NoticePopover
            onClose={() => {
              wallet.setShowSafeNotice(false);
              setShowSafeNotice(false);
            }}
          />
        )}
        {!versionInfo.skipped && (
          <UpgradePopover
            onClose={() => {
              skipVersion(versionInfo.newVersion);
            }}
          />
        )}

        {showDisableUnconfirmedUtxoNotice && (
          <DisableUnconfirmedsPopover onClose={() => setShowDisableUnconfirmedUtxoNotice(false)} />
        )}
        {buyBtcModalVisible && (
          <BuyBTCModal
            onClose={() => {
              setBuyBtcModalVisible(false);
            }}
          />
        )}
        {switchChainModalVisible && (
          <SwitchChainModal
            onClose={() => {
              setSwitchChainModalVisible(false);
            }}
          />
        )}
      </Content>
      <Footer px="zero" py="zero">
        <NavTabBar tab="home" />
      </Footer>
    </Layout>
  );
}
