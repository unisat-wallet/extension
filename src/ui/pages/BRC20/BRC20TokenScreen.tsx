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
      inscriptionId: '',
      holdersCount: 0,
      historyCount: 0
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

  const shouldUseTwoRowLayout = useMemo(() => {
    return enableTrade && chain.enableBrc20SingleStep;
  }, [enableTrade, chain.enableBrc20SingleStep]);

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

            {shouldUseTwoRowLayout ? (
              <Column gap="lg2" mt="sm">
                <Row gap="sm">
                  <Button
                    text={t('mint')}
                    preset="home"
                    style={!enableMint ? { backgroundColor: 'rgba(255,255,255,0.15)' } : {}}
                    disabled={!enableMint}
                    icon="pencil"
                    onClick={(e) => {
                      window.open(`${unisatWebsite}/inscribe?tick=${encodeURIComponent(ticker)}`);
                    }}
                    full
                  />

                  <Button
                    text={t('send')}
                    preset="home"
                    icon="send"
                    disabled={!enableTransfer}
                    onClick={(e) => {
                      navigate('BRC20SendScreen', {
                        tokenBalance: tokenSummary.tokenBalance,
                        tokenInfo: tokenSummary.tokenInfo
                      });
                    }}
                    style={{
                      width: chain.enableBrc20SingleStep && !enableTrade ? '75px' : 'auto'
                    }}
                    full
                  />

                  <Button
                    text={t('trade')}
                    preset="home"
                    icon="trade"
                    onClick={(e) => {
                      window.open(marketPlaceUrl);
                    }}
                    full
                  />
                </Row>

                <Button
                  text={t('single_step_transfer')}
                  preset="home"
                  icon="brc20-single-step"
                  style={{
                    background: 'linear-gradient(113deg, #EABB5A 5.41%, #E78327 92.85%)',
                    color: 'black',
                    width: enableTrade ? 'auto' : '328px',
                    minHeight: '48px',
                    borderRadius: '12px',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    padding: '0 8px'
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
                />
              </Column>
            ) : (
              <Row gap="sm">
                <Button
                  text={t('mint')}
                  preset="home"
                  disabled={!enableMint}
                  icon="pencil"
                  onClick={(e) => {
                    window.open(`${unisatWebsite}/brc20/${encodeURIComponent(ticker)}`);
                  }}
                  style={{
                    ...(!enableMint ? { backgroundColor: 'rgba(255,255,255,0.15)' } : {}),
                    width: chain.enableBrc20SingleStep && !enableTrade ? '73px' : '101px'
                  }}
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
                  style={{
                    width: chain.enableBrc20SingleStep && !enableTrade ? '73px' : '101px'
                  }}
                />

                {chain.enableBrc20SingleStep ? (
                  <Button
                    text={t('single_step_transfer')}
                    preset="home"
                    icon="brc20-single-step"
                    style={{
                      background: 'linear-gradient(113deg, #EABB5A 5.41%, #E78327 92.85%)',
                      color: 'black',
                      flexShrink: 0,
                      borderRadius: '12px',
                      width: enableTrade ? 'auto' : '155px'
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
                  />
                ) : enableTrade ? (
                  <Button
                    text={t('trade')}
                    preset="home"
                    icon="trade"
                    onClick={(e) => {
                      window.open(marketPlaceUrl);
                    }}
                    style={{
                      width: '101px'
                    }}
                  />
                ) : null}
              </Row>
            )}
          </Column>

          <Column
            gap="lg"
            px="md"
            py="md"
            style={{
              backgroundColor: 'rgba(244, 182, 44, 0.1)',
              borderRadius: 15,
              borderWidth: 1,
              borderColor: 'rgba(244, 182, 44, 0.25)'
            }}>
            {deployInscription ? (
              <Section
                title={t('deploy_inscription')}
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

            <Section
              title={t('available_balance')}
              value={showLongNumber(tokenSummary.tokenBalance.availableBalance)}
              maxLength={100}
            />
            <Line />

            <Section
              title={t('transferable_balance')}
              value={showLongNumber(tokenSummary.tokenBalance.transferableBalance)}
              maxLength={100}
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

              <Section title={t('minted')} value={showLongNumber(tokenSummary.tokenInfo.totalMinted)} maxLength={100} />
              <Line />

              <Section title={t('supply')} value={showLongNumber(tokenSummary.tokenInfo.totalSupply)} maxLength={100} />
              <Line />

              <Section title={t('decimal')} value={tokenSummary.tokenInfo.decimal} />

              <Section title={t('holders_count')} value={tokenSummary.tokenInfo.holdersCount} />

              <Section title={t('history_count')} value={tokenSummary.tokenInfo.historyCount} />
            </Column>
          </Column>
        </Content>
      )}
    </Layout>
  );
}
