import { Button, Column, Content, Footer, Header, Icon, Layout, Row, Text } from '@/ui/components';
import { BRC20Ticker } from '@/ui/components/BRC20Ticker';
import { Line } from '@/ui/components/Line';
import { Section } from '@/ui/components/Section';
import { TickUsdWithoutPrice, TokenType } from '@/ui/components/TickUsd';
import { TokenScreenIcon } from '@/ui/components/TokenScreenIcon';
import { colors } from '@/ui/theme/colors';
import { fontSizes } from '@/ui/theme/font';
import { showLongNumber } from '@/ui/utils';
import { LoadingOutlined } from '@ant-design/icons';
import { bnUtils } from '@unisat/base-utils';
import { useRunesTokenScreenLogic } from '@unisat/wallet-state';

export default function RunesTokenScreen() {
  const {
    runeid,
    iconInfo,
    tokenSummary,
    loading,
    t,
    enableMint,
    onClickMint,
    enableTransfer,
    onClickSend,
    ordinalsWebsite,
    txExplorerUrl,
    enableTrade,
    onClickTrade
  } = useRunesTokenScreenLogic();
  if (loading) {
    return (
      <Layout>
        <Content itemsCenter justifyCenter>
          <Icon size={fontSizes.xxxl} color="gold">
            <LoadingOutlined />
          </Icon>
        </Content>
      </Layout>
    );
  }

  return (
    <Layout>
      <Header
        onBack={() => {
          window.history.go(-1);
        }}
      />
      {tokenSummary && (
        <Content>
          <Column justifyCenter itemsCenter>
            <TokenScreenIcon iconInfo={iconInfo} />
            <Row justifyCenter itemsCenter>
              <BRC20Ticker tick={tokenSummary.runeInfo.spacedRune} preset="md" showOrigin color={'ticker_color2'} />
            </Row>
            <Column itemsCenter fullX justifyCenter>
              <Text
                text={`${bnUtils.toDecimalAmount(
                  tokenSummary.runeBalance.amount,
                  tokenSummary.runeBalance.divisibility
                )} `}
                preset="bold"
                textCenter
                size="xxl"
                wrap
                digital
                color="white"
              />
            </Column>
            <Row justifyCenter fullX>
              <TickUsdWithoutPrice
                tick={tokenSummary.runeInfo.spacedRune}
                balance={bnUtils.toDecimalAmount(
                  tokenSummary.runeBalance.amount,
                  tokenSummary.runeBalance.divisibility
                )}
                type={TokenType.RUNES}
                size={'md'}
              />
            </Row>
          </Column>

          <Column
            gap="lg"
            px="md"
            py="md"
            style={{
              backgroundColor: 'rgba(255,255,255,0.08)',
              borderRadius: 15
            }}>
            <Section title={t('runeid')} value={tokenSummary.runeInfo.runeid} />
            <Line />
            <Section title={t('mints')} value={showLongNumber(tokenSummary.runeInfo.mints)} />
            <Line />

            <Section
              title={t('current_supply')}
              value={`${showLongNumber(
                bnUtils.toDecimalAmount(tokenSummary.runeInfo.supply, tokenSummary.runeInfo.divisibility)
              )} ${tokenSummary.runeInfo.symbol}`}
            />
            <Line />

            <Section
              title={t('premine')}
              value={`${showLongNumber(
                bnUtils.toDecimalAmount(tokenSummary.runeInfo.premine, tokenSummary.runeInfo.divisibility)
              )} ${tokenSummary.runeInfo.symbol}`}
            />
            <Line />

            <Section
              title={t('burned')}
              value={`${showLongNumber(
                bnUtils.toDecimalAmount(tokenSummary.runeInfo.burned, tokenSummary.runeInfo.divisibility)
              )} ${tokenSummary.runeInfo.symbol}`}
            />
            <Line />

            <Section title={t('divisibility')} value={tokenSummary.runeInfo.divisibility} />
            <Line />

            <Section title={t('symbol')} value={tokenSummary.runeInfo.symbol} />
            <Line />

            <Section title={t('holders')} value={showLongNumber(tokenSummary.runeInfo.holders)} />
            <Line />

            <Section title={t('transactions')} value={showLongNumber(tokenSummary.runeInfo.transactions)} />
            <Line />

            <Section title={t('etching')} value={tokenSummary.runeInfo.etching} link={txExplorerUrl} />
            {tokenSummary.runeInfo.parent ? <Line /> : null}

            {tokenSummary.runeInfo.parent ? (
              <Section
                title={t('parent')}
                value={tokenSummary.runeInfo.parent}
                link={`${ordinalsWebsite}/inscription/${tokenSummary.runeInfo.parent}`}
              />
            ) : null}
          </Column>
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
              full
            />

            {enableTrade ? (
              <Button
                text={t('trade')}
                preset="brc20-action"
                icon="trade"
                disabled={!enableTrade}
                onClick={onClickTrade}
                full
              />
            ) : null}
          </Row>
        </Column>
      </Footer>
    </Layout>
  );
}
