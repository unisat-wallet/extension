import BigNumber from 'bignumber.js';
import { useEffect, useMemo, useState } from 'react';

import { ChainType } from '@/shared/constant';
import { AddressTokenSummary, Inscription } from '@/shared/types';
import { Button, Column, Content, Header, Icon, Layout, Row, Text } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import BRC20Preview from '@/ui/components/BRC20Preview';
import { BRC20Ticker } from '@/ui/components/BRC20Ticker';
import { Empty } from '@/ui/components/Empty';
import { TickUsdWithoutPrice, TokenType } from '@/ui/components/TickUsd';
import { useCurrentAccount } from '@/ui/state/accounts/hooks';
import { useBRC20MarketPlaceWebsite, useChainType, useUnisatWebsite } from '@/ui/state/settings/hooks';
import { useLocationState, useWallet } from '@/ui/utils';
import { LoadingOutlined } from '@ant-design/icons';

import { useNavigate } from '../MainRoute';

interface LocationState {
  ticker: string;
}

export default function BRC20TokenScreen() {
  const { ticker } = useLocationState<LocationState>();

  const [tokenSummary, setTokenSummary] = useState<AddressTokenSummary>({
    tokenBalance: {
      ticker,
      overallBalance: '',
      availableBalance: '',
      transferableBalance: '',
      availableBalanceSafe: '',
      availableBalanceUnSafe: '',
      selfMint: false
    },
    tokenInfo: {
      totalSupply: '',
      totalMinted: '',
      decimal: 18,
      holder: '',
      inscriptionId: ''
    },
    historyList: [],
    transferableList: []
  });

  const wallet = useWallet();

  const account = useCurrentAccount();

  const [loading, setLoading] = useState(true);

  const [deployInscription, setDeployInscription] = useState<Inscription>();

  useEffect(() => {
    wallet.getBRC20Summary(account.address, ticker).then((tokenSummary) => {
      if (tokenSummary.tokenInfo.holder == account.address) {
        wallet
          .getInscriptionInfo(tokenSummary.tokenInfo.inscriptionId)
          .then((data) => {
            setDeployInscription(data);
          })
          .finally(() => {
            setTokenSummary(tokenSummary);
            setLoading(false);
          });
      } else {
        setTokenSummary(tokenSummary);
        setLoading(false);
      }
    });
  }, []);

  const balance = useMemo(() => {
    if (!tokenSummary) {
      return '--';
    }
    return tokenSummary?.tokenBalance.overallBalance;
  }, [tokenSummary]);

  const navigate = useNavigate();

  const unisatWebsite = useUnisatWebsite();

  const enableMint = useMemo(() => {
    let enable = false;
    if (tokenSummary.tokenBalance.selfMint) {
      if (tokenSummary.tokenInfo.holder == account.address) {
        if (tokenSummary.tokenInfo.totalMinted != tokenSummary.tokenInfo.totalSupply) {
          enable = true;
        }
      }
    } else {
      if (tokenSummary.tokenInfo.totalMinted != tokenSummary.tokenInfo.totalSupply) {
        enable = true;
      }
    }
    return enable;
  }, [tokenSummary]);

  const enableTransfer = useMemo(() => {
    let enable = false;
    if (tokenSummary.tokenBalance.overallBalance !== '0' && tokenSummary.tokenBalance.overallBalance !== '') {
      enable = true;
    }
    return enable;
  }, [tokenSummary]);

  const tools = useTools();
  const chainType = useChainType();

  const enableTrade = useMemo(() => {
    if (chainType === ChainType.BITCOIN_MAINNET || chainType === ChainType.FRACTAL_BITCOIN_MAINNET) {
      return true;
    } else {
      return false;
    }
  }, [chainType]);
  const marketPlaceUrl = useBRC20MarketPlaceWebsite(ticker);
  return (
    <Layout>
      <Header
        onBack={() => {
          window.history.go(-1);
        }}
      />
      {tokenSummary && (
        <Content>
          <Column py="xl">
            <Column itemsCenter fullX justifyCenter>
              <Text text={`${balance}`} preset="bold" textCenter size="xxl" wrap digital />
              <BRC20Ticker tick={ticker} displayName={tokenSummary.tokenBalance.displayName} preset="lg" showOrigin />
            </Column>
            <Row justifyCenter fullX>
              <TickUsdWithoutPrice tick={ticker} balance={balance} type={TokenType.BRC20} size={'md'} />
            </Row>

            <Row justifyBetween mt="lg">
              <Button
                text="Mint"
                preset="home"
                style={!enableMint ? { backgroundColor: 'rgba(255,255,255,0.15)' } : {}}
                disabled={!enableMint}
                icon="pencil"
                onClick={(e) => {
                  window.open(`${unisatWebsite}/brc20/${encodeURIComponent(ticker)}`);
                }}
                full
              />

              <Button
                text="Transfer"
                preset="home"
                icon="send"
                disabled={!enableTransfer}
                onClick={(e) => {
                  // todo
                  const defaultSelected = tokenSummary.transferableList.slice(0, 1);
                  const selectedInscriptionIds = defaultSelected.map((v) => v.inscriptionId);
                  const selectedAmount = defaultSelected.reduce(
                    (pre, cur) => new BigNumber(cur.amount).plus(pre),
                    new BigNumber(0)
                  );
                  navigate('BRC20SendScreen', {
                    tokenBalance: tokenSummary.tokenBalance,
                    selectedInscriptionIds,
                    selectedAmount: selectedAmount.toString()
                  });
                }}
                full
              />

              {enableTrade ? (
                <Button
                  text="Trade"
                  preset="home"
                  icon="trade"
                  onClick={(e) => {
                    window.open(marketPlaceUrl);
                  }}
                  full
                />
              ) : null}
            </Row>
          </Column>
          <Row style={{ borderTopWidth: 1, borderColor: '#FFFFFF1F', alignSelf: 'stretch', width: '100%' }} my="md" />

          <Column>
            <Column>
              <Text text="Transferable" preset="bold" size="md" />
              <Row itemsCenter>
                <Text text={`${tokenSummary.tokenBalance.transferableBalance}`} size="md" wrap digital />
                <BRC20Ticker tick={ticker} displayName={tokenSummary.tokenBalance.displayName} />
              </Row>
            </Column>
            <Row style={{ borderTopWidth: 1, borderColor: '#FFFFFF1F', alignSelf: 'stretch' }} my="md" />

            {deployInscription || tokenSummary.transferableList.length > 0 ? (
              <Row>
                <Icon icon="circle-info" />
                <Text text={'You may click on the inscription to send it directly.'} preset="sub" textCenter />
              </Row>
            ) : null}

            {tokenSummary.transferableList.length == 0 && !deployInscription && (
              <Column style={{ minHeight: 130 }} itemsCenter justifyCenter>
                {loading ? (
                  <Icon>
                    <LoadingOutlined />
                  </Icon>
                ) : (
                  <Empty text="Empty" />
                )}
              </Column>
            )}

            <Row overflowX>
              {deployInscription ? (
                <BRC20Preview
                  tick={ticker}
                  inscriptionNumber={deployInscription.inscriptionNumber}
                  timestamp={deployInscription.timestamp}
                  type="DEPLOY"
                  onClick={async () => {
                    try {
                      tools.showLoading(true);
                      navigate('OrdinalsInscriptionScreen', { inscription: deployInscription, withSend: true });
                    } catch (e) {
                      console.log(e);
                    } finally {
                      tools.showLoading(false);
                    }
                  }}
                />
              ) : null}
              {tokenSummary.transferableList.map((v) => (
                <BRC20Preview
                  key={v.inscriptionId}
                  tick={ticker}
                  balance={v.amount}
                  inscriptionNumber={v.inscriptionNumber}
                  timestamp={v.timestamp}
                  confirmations={v.confirmations}
                  type="TRANSFER"
                  onClick={async () => {
                    try {
                      tools.showLoading(true);
                      const data = await wallet.getInscriptionInfo(v.inscriptionId);
                      navigate('OrdinalsInscriptionScreen', { inscription: data, withSend: true });
                    } catch (e) {
                      console.log(e);
                    } finally {
                      tools.showLoading(false);
                    }
                  }}
                />
              ))}
            </Row>
          </Column>
        </Content>
      )}
    </Layout>
  );
}
