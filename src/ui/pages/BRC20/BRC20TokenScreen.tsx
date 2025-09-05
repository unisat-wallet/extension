import BigNumber from 'bignumber.js';
import { useEffect, useMemo, useState } from 'react';

import { ChainType } from '@/shared/constant';
import { AddressTokenSummary, BRC20HistoryItem, Inscription } from '@/shared/types';
import { Button, Column, Content, Footer, Header, Icon, Image, Layout, Row, Text } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import { BRC20Ticker } from '@/ui/components/BRC20Ticker';
import { Line } from '@/ui/components/Line';
import { Section } from '@/ui/components/Section';
import { TabBar } from '@/ui/components/TabBar';
import { TickUsdWithoutPrice, TokenType } from '@/ui/components/TickUsd';
import { useI18n } from '@/ui/hooks/useI18n';
import { useCurrentAccount } from '@/ui/state/accounts/hooks';
import {
  useBRC20MarketPlaceWebsite,
  useChain,
  useChainType,
  useGetTxExplorerUrlCallback,
  useUnisatWebsite
} from '@/ui/state/settings/hooks';
import { colors } from '@/ui/theme/colors';
import { shortAddress, showLongNumber, useLocationState, useWallet } from '@/ui/utils';

import { useNavigate } from '../MainRoute';

interface LocationState {
  ticker: string;
}

enum TabKey {
  DETAILS = 'details',
  HISTORY = 'history'
}

const PIZZASWAP_MODULE_ADDRESS = '6a2095ee19329a210f8d5ded9b5cfa55b74fdd3b1e9af1e202072db6d1be82d45bfd';
const BRIDGE_BURN_ADDRESS = '6a20ada13e56859a2ab2eeb93cb4dc19c6e3f5e94d0ed38ed95a30ddc43711a0ff14';

function BRC20TokenHistory(props: { ticker: string }) {
  const wallet = useWallet();
  const { t } = useI18n();

  const account = useCurrentAccount();

  const [items, setItems] = useState<BRC20HistoryItem[]>([]);

  const [failed, setFailed] = useState(false);

  const getTxExplorerUrl = useGetTxExplorerUrlCallback();

  useEffect(() => {
    wallet
      .getBRC20RecentHistory(account.address, props.ticker)
      .then(setItems)
      .catch(() => setFailed(true));
  }, [account.address, props.ticker]);

  const groupedItems = useMemo(() => {
    const groups: { [date: string]: BRC20HistoryItem[] } = {};
    items.forEach((item) => {
      let time = item.blocktime;
      if (item.blocktime == 0) {
        time = Date.now() / 1000;
      }
      const date = new Date(time * 1000).toLocaleDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(item);
    });
    return Object.entries(groups).map(([date, items]) => ({ date, items }));
  }, [items]);

  const displayItems = useMemo(() => {
    return groupedItems.map(({ date, items }) => ({
      date,
      items: items
        .map((item) => {
          const key = item.txid + item.type;

          let mainTitle = item.type;
          let subTitle = '';
          let icon = '';
          let isPending = false;
          if (item.blocktime == 0) {
            isPending = true;
          }

          if (item.type === 'send') {
            mainTitle = t('brc20_history_type_send');
            subTitle = t('brc20_history_to') + ' ' + shortAddress(item.to);
            if (item.to === PIZZASWAP_MODULE_ADDRESS) {
              subTitle = t('brc20_history_to') + ' ' + 'PizzaSwap';
            }
            icon = 'history_send';
          } else if (item.type === 'single-step-transfer') {
            if (item.from === account.address) {
              mainTitle = t('brc20_history_type_send');
              subTitle = t('brc20_history_to') + ' ' + shortAddress(item.to);
              icon = 'history_send';
            } else {
              mainTitle = t('brc20_history_type_receive');
              subTitle = t('brc20_history_from') + ' ' + shortAddress(item.from);
              icon = 'history_receive';
            }
          } else if (item.type === 'receive') {
            mainTitle = t('brc20_history_type_receive');
            subTitle = t('brc20_history_from') + ' ' + shortAddress(item.from);
            icon = 'history_receive';
          } else if (item.type === 'withdraw') {
            mainTitle = t('brc20_history_type_withdraw');
            subTitle = t('brc20_history_from') + ' ' + 'PizzaSwap';
            icon = 'history_receive';
          } else if (item.type === 'inscribe-transfer') {
            mainTitle = t('brc20_history_type_inscribe_transfer');
            icon = 'history_inscribe';
          } else if (item.type === 'inscribe-mint') {
            mainTitle = t('brc20_history_type_inscribe_mint');
            icon = 'history_inscribe';
          } else {
            return null;
          }

          const amount = item.amount;

          return {
            key,
            icon,
            mainTitle,
            subTitle,
            amount,
            pending: isPending,
            txid: item.txid
          };
        })
        .filter((v) => v !== null)
    }));
  }, [t, groupedItems]);

  if (failed) {
    return (
      <Column style={{ minHeight: 150 }} itemsCenter justifyCenter>
        <Text text={t('load_failed')} preset="sub" />
      </Column>
    );
  }

  if (displayItems.length === 0) {
    return (
      <Column style={{ minHeight: 150 }} itemsCenter justifyCenter>
        <Text text={t('empty')} preset="sub" />
      </Column>
    );
  }

  return (
    <Column fullX>
      {displayItems.map(({ date, items }) => (
        <Column key={date} fullX gap="md" mb="md">
          <Text text={date} preset="sub" />
          {items
            .filter((item): item is NonNullable<typeof item> => item != null)
            .map((item) => (
              <Row
                key={item.key}
                fullX
                justifyBetween
                justifyCenter
                py="md"
                style={{ borderBottomWidth: 1, borderColor: colors.border2 }}>
                <Row>
                  <Row
                    onClick={() => {
                      window.open(getTxExplorerUrl(item.txid));
                    }}>
                    <Icon icon={item.icon as any} size={32} />
                  </Row>

                  <Column>
                    <Row style={{ alignItems: 'start' }}>
                      <Text text={item.mainTitle} />

                      {item.pending ? (
                        <Row style={{ backgroundColor: 'rgba(244, 182, 44, 0.15)', borderRadius: 4 }} px="md" py="xs">
                          <Text text={t('history_pending')} style={{ color: 'rgba(244, 182, 44, 0.85)' }} size="xs" />
                        </Row>
                      ) : null}
                    </Row>

                    <Row>
                      <Text text={item.subTitle} preset="sub" />
                    </Row>
                  </Column>
                </Row>

                <Row itemsCenter>
                  <Text text={item.amount} />
                  <Text text={props.ticker} preset="sub" />
                </Row>
              </Row>
            ))}
        </Column>
      ))}
    </Column>
  );
}

export default function BRC20TokenScreen() {
  const { ticker } = useLocationState<LocationState>();
  const { t } = useI18n();

  const [activeTab, setActiveTab] = useState<TabKey>(TabKey.HISTORY);

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
      historyCount: 0,
      logo: 'https://static.unisat.io/icon/brc20/unknown'
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

  const isBrc20Prog = useMemo(() => {
    if (chainType === ChainType.BITCOIN_MAINNET || chainType === ChainType.BITCOIN_SIGNET) {
      if (ticker.length == 6) {
        return true;
      }
    }
    return false;
  }, [ticker, chainType]);

  const enableTrade = useMemo(() => {
    if (isBrc20Prog) {
      return false;
    }
    if (chainType === ChainType.BITCOIN_MAINNET || chainType === ChainType.FRACTAL_BITCOIN_MAINNET) {
      return true;
    } else {
      return false;
    }
  }, [chainType, isBrc20Prog]);

  const enableHistory = isBrc20Prog ? false : true;

  const shouldUseTwoRowLayout = useMemo(() => {
    return enableTrade && chain.enableBrc20SingleStep;
  }, [enableTrade, chain.enableBrc20SingleStep]);

  const marketPlaceUrl = useBRC20MarketPlaceWebsite(ticker);

  const inscribePlaceUrl = useMemo(() => {
    if (isBrc20Prog) {
      return `${unisatWebsite}/inscribe?tab=brc20-prog&tick=${encodeURIComponent(ticker)}`;
    }
    return `${unisatWebsite}/inscribe?tick=${encodeURIComponent(ticker)}`;
  }, [isBrc20Prog, ticker, unisatWebsite]);

  const tabItems = useMemo(() => {
    if (enableHistory) {
      const items = [
        {
          key: TabKey.HISTORY,
          label: t('history')
        },
        {
          key: TabKey.DETAILS,
          label: t('details')
        }
      ];
      return items;
    } else {
      return [
        {
          key: TabKey.DETAILS,
          label: t('details')
        }
      ];
    }
  }, [t, enableHistory]);

  const renderTabChildren = useMemo(() => {
    if (activeTab === TabKey.HISTORY && enableHistory) {
      return <BRC20TokenHistory ticker={ticker} />;
    }

    if (activeTab === TabKey.DETAILS) {
      return (
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
            {deployInscription ? <Line /> : null}

            <Section title={t('minted')} value={showLongNumber(tokenSummary.tokenInfo.totalMinted)} maxLength={100} />
            <Line />

            <Section title={t('supply')} value={showLongNumber(tokenSummary.tokenInfo.totalSupply)} maxLength={100} />
            <Line />

            <Section title={t('decimal')} value={tokenSummary.tokenInfo.decimal} />

            <Section title={t('holders_count')} value={tokenSummary.tokenInfo.holdersCount} />

            <Section title={t('history_count')} value={tokenSummary.tokenInfo.historyCount} />
          </Column>
        </Column>
      );
    }
  }, [activeTab, deployInscription, enableHistory, tokenSummary]);

  const onPizzaSwapBalance = tokenSummary?.tokenBalance?.swapBalance;
  const inWalletBalance = tokenSummary?.tokenBalance?.overallBalance;
  const totalBalance = useMemo(() => {
    if (!inWalletBalance) {
      return '--';
    }
    return onPizzaSwapBalance
      ? new BigNumber(inWalletBalance).plus(new BigNumber(onPizzaSwapBalance!)).toString()
      : inWalletBalance;
  }, [onPizzaSwapBalance, inWalletBalance]);

  return (
    <Layout>
      <Header
        hideLogo
        onBack={() => {
          window.history.go(-1);
        }}
      />

      {tokenSummary && (
        <Content mt="zero">
          <Column justifyCenter itemsCenter>
            <Image src={tokenSummary.tokenInfo.logo} size={48} />
            <Row justifyCenter itemsCenter>
              <BRC20Ticker
                tick={ticker}
                displayName={tokenSummary.tokenBalance.displayName}
                preset="md"
                showOrigin
                color={'ticker_color2'}
              />
              <Row style={{ backgroundColor: 'rgba(244, 182, 44, 0.15)', borderRadius: 4 }} px="md" py="sm">
                {isBrc20Prog ? (
                  <Text text={'brc2.0'} style={{ color: 'rgba(244, 182, 44, 0.85)' }} />
                ) : (
                  <Text text={'brc-20'} style={{ color: 'rgba(244, 182, 44, 0.85)' }} />
                )}
              </Row>
            </Row>
            <Column itemsCenter fullX justifyCenter>
              <Text text={`${totalBalance}`} preset="bold" textCenter size="xxl" wrap digital />
            </Column>
            <Row justifyCenter fullX>
              <TickUsdWithoutPrice tick={ticker} balance={totalBalance} type={TokenType.BRC20} size={'md'} />
            </Row>
          </Column>

          {tokenSummary.tokenBalance.swapBalance ? (
            <Column style={{ backgroundColor: '#FFFFFF14', borderRadius: 12 }} px="md" py="md">
              <Row fullY justifyBetween justifyCenter>
                <Column fullY justifyCenter>
                  <Text text={t('brc20_in_wallet')} color="textDim" size="xs" />
                </Column>

                <Row itemsCenter fullY gap="zero">
                  <Text text={inWalletBalance} size="xs" digital />
                </Row>
              </Row>

              <Line />

              <Row fullY justifyBetween justifyCenter>
                <Column fullY justifyCenter>
                  <Text text={t('brc20_on_pizzaswap')} color="textDim" size="xs" />
                </Column>

                <Row itemsCenter fullY gap="zero">
                  <Text text={onPizzaSwapBalance} size="xs" digital />
                </Row>
              </Row>

              <Row>
                <Button
                  text={t('swap_swap')}
                  preset="swap"
                  icon="swap_swap"
                  onClick={(e) => {
                    window.open(`https://pizzaswap.io/swap?t0=${encodeURIComponent(ticker)}`);
                  }}
                  style={{
                    paddingTop: 5
                  }}
                  iconSize={{
                    width: 12,
                    height: 12
                  }}
                  full
                />
                <Button
                  text={t('swap_deposit')}
                  preset="swap"
                  icon="swap_deposit"
                  onClick={(e) => {
                    window.open(`https://pizzaswap.io/swap?tab=deposit`);
                  }}
                  iconSize={{
                    width: 12,
                    height: 12
                  }}
                  full
                />
                <Button
                  text={t('swap_withdraw')}
                  preset="swap"
                  icon="swap_withdraw"
                  onClick={(e) => {
                    window.open(`https://pizzaswap.io/swap?tab=withdraw&t=${encodeURIComponent(ticker)}`);
                  }}
                  iconSize={{
                    width: 12,
                    height: 12
                  }}
                  full
                />
                <Button
                  text={t('swap_send')}
                  preset="swap"
                  icon="swap_send"
                  onClick={(e) => {
                    window.open(`https://pizzaswap.io/swap/assets/account`);
                  }}
                  iconSize={{
                    width: 12,
                    height: 12
                  }}
                  full
                />
              </Row>
            </Column>
          ) : null}

          <TabBar
            defaultActiveKey={enableHistory ? activeTab : TabKey.DETAILS}
            activeKey={enableHistory ? activeTab : TabKey.DETAILS}
            items={tabItems}
            preset="style3"
            onTabClick={(key) => {
              setActiveTab(key as TabKey);
            }}
          />

          {renderTabChildren}
        </Content>
      )}
      <Footer
        style={{
          borderTopWidth: 1,
          borderColor: colors.border2
        }}>
        {shouldUseTwoRowLayout ? (
          <Column gap="sm" fullX>
            <Row gap="sm" mt="sm">
              <Button
                text={t('mint')}
                preset="home"
                style={!enableMint ? { backgroundColor: 'rgba(255,255,255,0.15)' } : {}}
                disabled={!enableMint}
                icon="pencil"
                onClick={(e) => {
                  window.open(inscribePlaceUrl);
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
          <Row gap="sm" fullX>
            <Button
              text={t('mint')}
              preset="home"
              disabled={!enableMint}
              icon="pencil"
              onClick={(e) => {
                window.open(inscribePlaceUrl);
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
            ) : (
              <Button
                text={t('trade')}
                preset="home"
                icon="trade"
                onClick={(e) => {
                  window.open(marketPlaceUrl);
                }}
                disabled={!enableTrade}
                style={{
                  width: '101px'
                }}
              />
            )}
          </Row>
        )}
      </Footer>
    </Layout>
  );
}
