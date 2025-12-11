import { useMemo } from 'react';

import { Button, Column, Content, Footer, Header, Layout, Row, Text } from '@/ui/components';
import { BRC20Ticker } from '@/ui/components/BRC20Ticker';
import { Line } from '@/ui/components/Line';
import { TabBar } from '@/ui/components/TabBar';
import { TickUsdWithoutPrice, TokenType } from '@/ui/components/TickUsd';
import { TokenScreenIcon } from '@/ui/components/TokenScreenIcon';
import { colors } from '@/ui/theme/colors';
import { BRC20TokenScreenTabKey, useBRC20TokenScreenLogic, useNavigation } from '@unisat/wallet-state';
import { BRC20TokenDetail } from './components/BRC20TokenDetail';
import { BRC20TokenHistory } from './components/BRC20TokenHistory';

export default function BRC20TokenScreen() {
  const nav = useNavigation();
  const {
    totalBalance,
    onSwapBalance,
    onProgBalance,
    inWalletBalance,
    hasOutWalletBalance,
    enableHistory,
    enableTrade,
    enableMint,
    enableTransfer,
    loading,
    tokenSummary,
    deployInscription,
    activeTab,
    setActiveTab,
    tabItems,
    t,
    ticker,
    chain,
    iconInfo,
    isBrc20Prog,
    onClickWrapBrc20Prog,
    onClickUnwrapBrc20Prog,
    onClickSendBrc20Prog,

    onClickSwapInSwap,
    onClickWrapInSwap,
    onClickUnwrapInSwap,
    onClickSendInSwap,

    onClickMint,
    onClickSend,
    onClickTrade,
    onClickSingleStepSend
  } = useBRC20TokenScreenLogic();

  const renderTabChildren = useMemo(() => {
    if (activeTab === BRC20TokenScreenTabKey.HISTORY && enableHistory) {
      return <BRC20TokenHistory ticker={ticker} displayName={tokenSummary?.tokenBalance?.displayName} />;
    }

    if (activeTab === BRC20TokenScreenTabKey.DETAILS) {
      return <BRC20TokenDetail ticker={ticker} tokenSummary={tokenSummary!} deployInscription={deployInscription!} />;
    }
  }, [activeTab, deployInscription, enableHistory, tokenSummary]);

  return (
    <Layout>
      <Header hideLogo onBack={() => nav.goBack()} />

      {tokenSummary && (
        <Content mt="zero">
          <Column justifyCenter itemsCenter>
            <TokenScreenIcon iconInfo={iconInfo} />
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
              <Text text={`${totalBalance}`} preset="bold" textCenter size="xxl" wrap digital color="white" />
            </Column>
            <Row justifyCenter fullX>
              <TickUsdWithoutPrice tick={ticker} balance={totalBalance} type={TokenType.BRC20} size={'md'} />
            </Row>
          </Column>

          {hasOutWalletBalance ? (
            <Column style={{ backgroundColor: '#FFFFFF14', borderRadius: 12 }} px="md" py="md" mb="md">
              <Row fullY justifyBetween justifyCenter mt="sm">
                <Column fullY justifyCenter>
                  <Text text={t('brc20_in_wallet')} color="textDim" size="xs" />
                </Column>

                <Row itemsCenter fullY gap="zero">
                  <Text text={inWalletBalance} size="xs" digital />
                </Row>
              </Row>

              <Line />

              {onProgBalance ? (
                <Row fullY justifyBetween justifyCenter>
                  <Column fullY justifyCenter>
                    <Text text={t('brc20_on_prog')} color="textDim" size="xs" />
                  </Column>

                  <Row itemsCenter fullY gap="zero">
                    <Text text={onProgBalance} size="xs" digital />
                  </Row>
                </Row>
              ) : null}

              {onProgBalance ? (
                <Row gap="sm">
                  <Button
                    text={t('swap_wrap')}
                    preset="swap"
                    icon="swap_wrap"
                    onClick={onClickWrapBrc20Prog}
                    iconSize={{
                      width: 12,
                      height: 12
                    }}
                    full
                  />
                  <Button
                    text={t('swap_unwrap')}
                    preset="swap"
                    icon="swap_unwrap"
                    onClick={onClickUnwrapBrc20Prog}
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
                    onClick={onClickSendBrc20Prog}
                    iconSize={{
                      width: 12,
                      height: 12
                    }}
                    full
                  />
                </Row>
              ) : null}

              {onSwapBalance ? (
                <Row fullY justifyBetween justifyCenter>
                  <Column fullY justifyCenter>
                    <Text text={t('brc20_on_swap')} color="textDim" size="xs" />
                  </Column>

                  <Row itemsCenter fullY gap="zero">
                    <Text text={onSwapBalance} size="xs" digital />
                  </Row>
                </Row>
              ) : null}

              {onSwapBalance ? (
                <Row gap="sm">
                  <Button
                    text={t('swap_swap')}
                    preset="swap"
                    icon="swap_swap"
                    onClick={onClickSwapInSwap}
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
                    text={t('swap_wrap')}
                    preset="swap"
                    icon="swap_wrap"
                    onClick={onClickWrapInSwap}
                    iconSize={{
                      width: 12,
                      height: 12
                    }}
                    full
                  />
                  <Button
                    text={t('swap_unwrap')}
                    preset="swap"
                    icon="swap_unwrap"
                    onClick={onClickUnwrapInSwap}
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
                    onClick={onClickSendInSwap}
                    iconSize={{
                      width: 12,
                      height: 12
                    }}
                    full
                  />
                </Row>
              ) : null}
            </Column>
          ) : null}

          <TabBar
            defaultActiveKey={enableHistory ? activeTab : BRC20TokenScreenTabKey.DETAILS}
            activeKey={enableHistory ? activeTab : BRC20TokenScreenTabKey.DETAILS}
            items={tabItems}
            preset="style3"
            onTabClick={(key) => {
              setActiveTab(key as BRC20TokenScreenTabKey);
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
        <Column gap="sm" fullX>
          <Row gap="sm" mt="sm" mb="md">
            <Button
              text={t('mint')}
              preset="brc20-action"
              style={!enableMint ? { backgroundColor: 'rgba(255,255,255,0.15)' } : {}}
              disabled={!enableMint}
              icon="pencil"
              onClick={onClickMint}
              full
            />

            <Button
              text={t('send')}
              preset="brc20-action"
              icon="send"
              disabled={!enableTransfer}
              onClick={onClickSend}
              style={{
                width: chain.enableBrc20SingleStep && !enableTrade ? '75px' : 'auto'
              }}
              full
            />

            <Button
              text={t('trade')}
              preset="brc20-action"
              icon="trade"
              disabled={!enableTrade}
              onClick={onClickTrade}
              full
            />
          </Row>

          {chain.enableBrc20SingleStep ? (
            <Button
              text={t('single_step_transfer')}
              preset="home"
              icon="brc20-single-step"
              style={{
                background: 'linear-gradient(113deg, #EABB5A 5.41%, #E78327 92.85%)',
                color: 'black',
                width: enableTrade ? 'auto' : '328px',
                minHeight: '42px',
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
              onClick={onClickSingleStepSend}
            />
          ) : null}
        </Column>
      </Footer>
    </Layout>
  );
}
