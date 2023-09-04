import { Tooltip, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { useEffect, useMemo, useState } from 'react';

import { KEYRING_TYPE } from '@/shared/constant';
import { TokenBalance, NetworkType, Inscription } from '@/shared/types';
import { Card, Column, Content, Footer, Header, Icon, Layout, Row, Text } from '@/ui/components';
import AccountSelect from '@/ui/components/AccountSelect';
import { useTools } from '@/ui/components/ActionComponent';
import { AddressBar } from '@/ui/components/AddressBar';
import BRC20BalanceCard from '@/ui/components/BRC20BalanceCard';
import { Button } from '@/ui/components/Button';
import { Empty } from '@/ui/components/Empty';
import { svgRegistry } from '@/ui/components/Icon';
import InscriptionPreview from '@/ui/components/InscriptionPreview';
import { NavTabBar } from '@/ui/components/NavTabBar';
import { Pagination } from '@/ui/components/Pagination';
import { TabBar } from '@/ui/components/TabBar';
import { UpgradePopver } from '@/ui/components/UpgradePopver';
import { getCurrentTab } from '@/ui/features/browser/tabs';
import { useAccountBalance, useCurrentAccount } from '@/ui/state/accounts/hooks';
import { useAppDispatch } from '@/ui/state/hooks';
import { useCurrentKeyring } from '@/ui/state/keyrings/hooks';
import {
  useBlockstreamUrl,
  useNetworkType,
  useSkipVersionCallback,
  useVersionInfo,
  useWalletConfig
} from '@/ui/state/settings/hooks';
import { useWalletTabScreenState } from '@/ui/state/ui/hooks';
import { WalletTabScreenTabKey, uiActions } from '@/ui/state/ui/reducer';
import { fontSizes } from '@/ui/theme/font';
import { useWallet } from '@/ui/utils';
import { LoadingOutlined } from '@ant-design/icons';

import { useNavigate } from '../MainRoute';

type BalanceType = 'amount' | 'btc_amount' | 'inscription_amount' | 'expired';

export default function WalletTabScreen() {
  const navigate = useNavigate();

  const accountBalance = useAccountBalance();
  const networkType = useNetworkType();
  const isTestNetwork = networkType === NetworkType.TESTNET;

  const currentKeyring = useCurrentKeyring();
  const currentAccount = useCurrentAccount();
  const balanceValue = useMemo(() => {
    if (accountBalance.amount === '0') {
      return '--';
    } else {
      return accountBalance.amount;
    }
  }, [accountBalance.amount]);

  const wallet = useWallet();
  const [connected, setConnected] = useState(false);

  const dispatch = useAppDispatch();
  const { tabKey } = useWalletTabScreenState();

  // const skipVersion = useSkipVersionCallback();

  const walletConfig = useWalletConfig();
  // const versionInfo = useVersionInfo();

  useEffect(() => {
    const run = async () => {
      const activeTab = await getCurrentTab();
      if (!activeTab) return;
      const site = await wallet.getCurrentConnectedSite(activeTab.id);

      if (site) {
        setConnected(site.isConnected);
      }
    };
    run();
  }, []);

  const tabItems = [
    {
      key: WalletTabScreenTabKey.ALL,
      label: 'ALL',
      children: <InscriptionList />
    },
    {
      key: WalletTabScreenTabKey.ORCCASH,
      label: 'ORC-CASH',
      children: <BRC20List type="orc-cash" key="orc-cash" />
    },
    {
      key: WalletTabScreenTabKey.BRC20,
      label: 'BRC-20',
      children: <BRC20List type="brc" key="brc" />
    },
    {
      key: WalletTabScreenTabKey.ORC20,
      label: 'ORC-20',
      children: <BRC20List type="orc-20" key="orc-20" />
    }
  ];

  const balanceOptions = [
    {
      key: 'btc_amount',
      title: 'Balance'
    },
    {
      key: 'inscription_amount',
      title: 'Inscription Balance'
    }
  ];

  const [balanceType, setBalanceType] = useState<BalanceType>(balanceOptions[0]?.key as BalanceType);

  const blockstreamUrl = useBlockstreamUrl();

  return (
    <Layout>
      <Header
        LeftComponent={
          <Column>
            <Row
              itemsCenter
              onClick={() => {
                navigate('ConnectedSitesScreen');
              }}
            >
              <div className="connect-globle">
                <img src={svgRegistry.connect} className="connect-icon" />
                <div className={`connect-status ${connected && 'green'}`} />
              </div>
              {/* <Text text="Dapp Connected" size="xxs" /> */}
            </Row>
          </Column>
        }
        RightComponent={
          <Card
            preset="style2"
            onClick={() => {
              navigate('SwitchKeyringScreen');
            }}
          >
            <Text text={currentKeyring.alianName} size="xxs" />
          </Card>
        }
      />
      <Content>
        <Column gap="sm">
          {currentKeyring.type === KEYRING_TYPE.HdKeyring && <AccountSelect />}

          {isTestNetwork && <Text text="Bitcoin Testnet is used for testing." color="danger" textCenter />}

          {walletConfig.statusMessage && <Text text={walletConfig.statusMessage} color="danger" textCenter />}
          <Dropdown
            menu={{
              items: balanceOptions.map((item) => ({
                ...item,
                label: (
                  <Row justifyCenter>
                    <Text size="sm" text={item?.title} />
                  </Row>
                )
              })),
              onClick: (item) => {
                setBalanceType(item.key as BalanceType);
              }
            }}
            placement="bottomCenter"
            trigger={['click']}
          >
            <Row justifyCenter px="md" py="md" rounded>
              <Text text={balanceOptions.find((item) => item?.key === balanceType)?.title ?? ''} color="textDim" />
              <Icon icon="down" color="textDim" />
            </Row>
          </Dropdown>
          <Text text={accountBalance[balanceType] + '  BTC'} preset="title-bold" textCenter size="xxxl" />

          <AddressBar />

          <Row style={{ margin: '10px 0' }} justifyBetween>
            <Button
              text="Receive"
              preset="default"
              icon="receive"
              onClick={(e) => {
                navigate('ReceiveScreen');
              }}
              full
            />

            <Button
              text="Send"
              preset="default"
              icon="send"
              onClick={(e) => {
                navigate('TxCreateScreen');
              }}
              full
            />
            {/* {walletConfig.moonPayEnabled && (
              <Button
                text="Buy"
                preset="default"
                icon="wallet"
                onClick={(e) => {
                  navigate('MoonPayScreen');
                }}
                full
              />
            )} */}
          </Row>

          <Row justifyBetween>
            <TabBar
              defaultActiveKey={tabKey}
              activeKey={tabKey}
              items={tabItems}
              onTabClick={(key) => {
                dispatch(uiActions.updateWalletTabScreen({ tabKey: key }));
              }}
            />
            <Row
              itemsCenter
              onClick={() => {
                window.open(`${blockstreamUrl}/address/${currentAccount.address}`);
              }}
            >
              <Icon icon="link" size={fontSizes.xs} />
            </Row>
          </Row>

          {tabItems[tabKey].children}
        </Column>
        {/* {!versionInfo.skipped && (
          <UpgradePopver
            onClose={() => {
              skipVersion(versionInfo.newVersion);
            }}
          />
        )} */}
      </Content>
      <Footer px="zero" py="zero">
        <NavTabBar tab="home" />
      </Footer>
    </Layout>
  );
}

function InscriptionList() {
  const navigate = useNavigate();
  const wallet = useWallet();
  const currentAccount = useCurrentAccount();

  const [inscriptions, setInscriptions] = useState<Inscription[]>([]);
  const [total, setTotal] = useState(-1);
  const [pagination, setPagination] = useState({ currentPage: 1, pageSize: 100 });

  const tools = useTools();

  const fetchData = async () => {
    try {
      // tools.showLoading(true);
      const { list, total } = await wallet.getAllInscriptionList(
        currentAccount.address,
        pagination.currentPage,
        pagination.pageSize
      );
      setInscriptions(list);
      setTotal(total);
    } catch (e) {
      tools.toastError((e as Error).message);
    } finally {
      // tools.showLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [pagination]);

  if (total === -1) {
    return (
      <Column style={{ minHeight: 150 }} itemsCenter justifyCenter>
        <LoadingOutlined />
      </Column>
    );
  }

  if (total === 0) {
    return (
      <Column style={{ minHeight: 150 }} itemsCenter justifyCenter>
        <Empty text="Empty" />
      </Column>
    );
  }

  return (
    <Column>
      <Row style={{ flexWrap: 'wrap' }} gap="lg">
        {inscriptions.map((data, index) => (
          <InscriptionPreview
            key={index}
            data={data}
            preset="medium"
            onClick={() => {
              navigate('OrdinalsDetailScreen', { inscription: data, withSend: true });
            }}
          />
        ))}
      </Row>
      <Row justifyCenter mt="lg">
        <Pagination
          pagination={pagination}
          total={total}
          onChange={(pagination) => {
            setPagination(pagination);
          }}
        />
      </Row>
    </Column>
  );
}

function BRC20List({ type = 'brc' }: { type: 'brc' | 'orc-20' | 'orc-cash' }) {
  const navigate = useNavigate();
  const wallet = useWallet();
  const currentAccount = useCurrentAccount();

  const [tokens, setTokens] = useState<TokenBalance[]>([]);
  const [total, setTotal] = useState(-1);
  const [pagination, setPagination] = useState({ currentPage: 1, pageSize: 100 });

  const tools = useTools();
  const fetchData = async () => {
    try {
      // tools.showLoading(true);
      if (type === 'brc') {
        const { list, total } = await wallet.getBRC20List(
          currentAccount.address,
          pagination.currentPage,
          pagination.pageSize
        );
        setTokens(list);
        setTotal(total);
      } else {
        const { list, total } = await wallet.getORC20List(
          currentAccount.address,
          pagination.currentPage,
          pagination.pageSize,
          type
        );
        setTokens(list);
        setTotal(total);
      }
    } catch (e) {
      tools.toastError((e as Error).message);
    } finally {
      // tools.showLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [pagination]);

  if (total === -1) {
    return (
      <Column style={{ minHeight: 150 }} itemsCenter justifyCenter>
        <LoadingOutlined />
      </Column>
    );
  }

  if (total === 0) {
    return (
      <Column style={{ minHeight: 150 }} itemsCenter justifyCenter>
        <Empty text="Empty" />
      </Column>
    );
  }

  return (
    <Column>
      <Row style={{ flexWrap: 'wrap' }} gap="sm">
        {tokens.map((data, index) => (
          <BRC20BalanceCard
            key={index}
            tokenBalance={data}
            type={type}
            onClick={() => {
              if (type === 'brc') navigate('BRC20TokenScreen', { tokenBalance: data, ticker: data.ticker });
              else {
                navigate('ORC20TokenScreen', {
                  tokenBalance: data,
                  ticker: data.ticker,
                  inscriptionNumber: data.inscriptionNumber,
                  protocol: type
                });
              }
            }}
          />
        ))}
      </Row>

      <Row justifyCenter mt="lg">
        <Pagination
          pagination={pagination}
          total={total}
          onChange={(pagination) => {
            setPagination(pagination);
          }}
        />
      </Row>
    </Column>
  );
}
