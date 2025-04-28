import { useEffect, useMemo, useState } from 'react';

import { ChainType } from '@/shared/constant';
import { AddressTokenSummary, Inscription } from '@/shared/types';
import { Button, Column, Content, Header, Layout, Row, Text } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import { BRC20Ticker } from '@/ui/components/BRC20Ticker';
import { Line } from '@/ui/components/Line';
import { Section } from '@/ui/components/Section';
import { TickUsdWithoutPrice, TokenType } from '@/ui/components/TickUsd';
import { useI18n } from '@/ui/hooks/useI18n';
import { useCurrentAccount } from '@/ui/state/accounts/hooks';
import { useBRC20MarketPlaceWebsite, useChain, useChainType, useUnisatWebsite } from '@/ui/state/settings/hooks';
import { shortAddress, showLongNumber, useLocationState, useWallet } from '@/ui/utils';

import { useNavigate } from '../MainRoute';

interface LocationState {
  ticker: string;
}

export default function BRC20TokenScreen() {
  const { ticker } = useLocationState<LocationState>();
  const { t } = useI18n();

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
  const chain = useChain();

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
                text={t('mint')}
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
                text={t('transfer')}
                preset="home"
                icon="send"
                disabled={!enableTransfer}
                onClick={(e) => {
                  navigate('BRC20SendScreen', {
                    tokenBalance: tokenSummary.tokenBalance,
                    tokenInfo: tokenSummary.tokenInfo
                  });
                }}
                full
              />

              {chain.enableBrc20SingleStep ? (
                <Button
                  text={t('single-step transfer')}
                  preset="home"
                  icon="send"
                  style={{
                    background: 'linear-gradient(103.92deg, #EBB94C 0%, #E97E00 100%)',
                    color: 'black'
                  }}
                  textStyle={{
                    color: 'black'
                  }}
                  disabled={!enableTransfer}
                  onClick={(e) => {
                    navigate('BRC20SingleStepScreen', {
                      tokenBalance: tokenSummary.tokenBalance,
                      tokenInfo: tokenSummary.tokenInfo
                    });
                  }}
                  full
                />
              ) : null}

              {enableTrade ? (
                <Button
                  text={t('trade')}
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

          <Column
            gap="lg"
            px="md"
            py="md"
            style={{
              backgroundColor: 'rgba(244, 182, 44, 0.12)',
              borderRadius: 15,
              borderWidth: 1,
              borderColor: 'rgba(244, 182, 44, 0.12)'
            }}>
            {deployInscription ? (
              <Section
                title={t('deploy inscription')}
                value={''}
                rightComponent={
                  <Text
                    text={shortAddress(deployInscription.inscriptionId, 10)}
                    color={'gold'}
                    preset="link"
                    size="xs"
                    onClick={() => {
                      navigate('OrdinalsInscriptionScreen', { inscription: deployInscription, withSend: true });
                    }}
                  />
                }
              />
            ) : null}
            <Line />

            <Section
              title={t('available Balance')}
              value={showLongNumber(tokenSummary.tokenBalance.availableBalance)}
            />
            <Line />

            <Section
              title={t('transferable Balance')}
              value={showLongNumber(tokenSummary.tokenBalance.transferableBalance)}
            />
          </Column>

          <Column>
            <Column
              gap="lg"
              px="md"
              py="md"
              style={{
                backgroundColor: 'rgba(255,255,255,0.08)',
                borderRadius: 15,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.08)'
              }}>
              <Section title={t('ticker')} value={ticker} />
              <Line />

              <Section title={t('mints')} value={showLongNumber(tokenSummary.tokenInfo.totalMinted)} />
              <Line />

              <Section
                title={t('supply')}
                maxLength={40}
                value={`${showLongNumber(tokenSummary.tokenInfo.totalSupply)} ${tokenSummary.tokenBalance.ticker}`}
              />
              <Line />

              <Section title={t('divisibility')} value={tokenSummary.tokenInfo.decimal} />
            </Column>
          </Column>
        </Content>
      )}
    </Layout>
  );
}
