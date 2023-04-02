import { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';

import { KEYRING_TYPE } from '@/shared/constant';
import { NetworkType } from '@/shared/types';
import { Card, Column, Content, Footer, Header, Layout, Row, Text } from '@/ui/components';
import AccountSelect from '@/ui/components/AccountSelect';
import { AddressBar } from '@/ui/components/AddressBar';
import { Button } from '@/ui/components/Button';
import { Empty } from '@/ui/components/Empty';
import InscriptionPreview from '@/ui/components/InscriptionPreview';
import { NavTabBar } from '@/ui/components/NavTabBar';
import { getCurrentTab } from '@/ui/features/browser/tabs';
import { useAccountBalance, useAccountInscriptions } from '@/ui/state/accounts/hooks';
import { useCurrentKeyring } from '@/ui/state/keyrings/hooks';
import { useNetworkType } from '@/ui/state/settings/hooks';
import { transactionsActions } from '@/ui/state/transactions/reducer';
import { useWallet } from '@/ui/utils';

import { useNavigate } from '../MainRoute';

export default function WalletTabScreen() {
  const navigate = useNavigate();

  const accountBalance = useAccountBalance();
  const accountInscriptions = useAccountInscriptions();
  const networkType = useNetworkType();
  const isTestNetwork = networkType === NetworkType.TESTNET;

  const currentKeyring = useCurrentKeyring();
  const dispatch = useDispatch();
  const balanceValue = useMemo(() => {
    if (accountBalance.amount === '0') {
      return '--';
    } else {
      return accountBalance.amount;
    }
  }, [accountBalance.amount]);

  const wallet = useWallet();
  const [connected, setConnected] = useState(false);
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

  return (
    <Layout>
      <Header
        LeftComponent={
          <Column>
            {!connected && (
              <Row
                itemsCenter
                onClick={() => {
                  navigate('ConnectedSitesScreen');
                }}>
                <Text text="·" color="green" size="xxl" />
                <Text text="Dapp Connected" size="xxs" />
              </Row>
            )}
          </Column>
        }
        RightComponent={
          <Card
            preset="style2"
            onClick={() => {
              navigate('SwitchKeyringScreen');
            }}>
            <Text text={currentKeyring.alianName} size="xxs" />
          </Card>
        }
      />
      <Content>
        <Column gap="xl">
          {currentKeyring.type === KEYRING_TYPE.HdKeyring && <AccountSelect />}

          {isTestNetwork && <Text text="Bitcoin Testnet is used for testing." color="danger" textCenter />}

          <Text text={balanceValue + '  BTC'} preset="title-bold" textCenter size="xxxl" />

          <AddressBar />

          <Row justifyBetween>
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
                dispatch(transactionsActions.reset());
                navigate('TxCreateScreen');
              }}
              full
            />
            <Button
              text="History"
              preset="default"
              icon="history"
              onClick={(e) => {
                navigate('HistoryScreen');
              }}
              full
            />
          </Row>

          {accountInscriptions.list.length === 0 ? (
            <Column style={{ minHeight: 200 }} itemsCenter justifyCenter>
              <Empty text="Inscription list is empty" />
            </Column>
          ) : (
            <Row>
              {accountInscriptions.list.map((data, index) => (
                <InscriptionPreview
                  key={index}
                  data={data}
                  preset="medium"
                  onClick={(inscription) => {
                    navigate('OrdinalsDetailScreen', { inscription, withSend: true });
                  }}
                />
              ))}
            </Row>
          )}
        </Column>
      </Content>
      <Footer px="zero" py="zero">
        <NavTabBar tab="home" />
      </Footer>
    </Layout>
  );
}
