import { Button, Column, Content, Footer, Header, Icon, Layout, Row, Text } from '@/ui/components';
import { BRC20Ticker } from '@/ui/components/BRC20Ticker';
import { Line } from '@/ui/components/Line';
import { Section } from '@/ui/components/Section';
import { TickUsdWithoutPrice, TokenType } from '@/ui/components/TickUsd';
import { colors } from '@/ui/theme/colors';
import { fontSizes } from '@/ui/theme/font';
import { showLongNumber } from '@/ui/utils';
import { LoadingOutlined } from '@ant-design/icons';
import { bnUtils } from '@unisat/base-utils';
import { useCAT20TokenScreenLogic } from '@unisat/wallet-state';

import { TokenScreenIcon } from '@/ui/components/TokenScreenIcon';

export default function CAT20TokenScreen() {
  const {
    tokenSummary,
    loading,
    tokenUrl,
    iconInfo,
    enableTransfer,
    enableTrade,
    onClickMerge,
    onClickSend,
    onClickTrade,
    onClickBack,
    t
  } = useCAT20TokenScreenLogic();

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

  if (!tokenSummary || !tokenSummary.cat20Balance || !tokenSummary.cat20Info) {
    return (
      <Layout>
        <Header onBack={onClickBack} />
        <Content itemsCenter justifyCenter>
          <Text text={t('token_not_found')} />
        </Content>
      </Layout>
    );
  }

  return (
    <Layout>
      <Header onBack={onClickBack} />
      {tokenSummary && (
        <Content>
          <Column justifyCenter itemsCenter>
            <TokenScreenIcon iconInfo={iconInfo} />
            <Row justifyCenter itemsCenter>
              <BRC20Ticker tick={tokenSummary.cat20Info.name} preset="md" showOrigin color={'ticker_color2'} />
            </Row>
            <Column itemsCenter fullX justifyCenter>
              <Text
                text={`${bnUtils.toDecimalAmount(
                  tokenSummary.cat20Balance.amount,
                  tokenSummary.cat20Balance.decimals
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
                tick={tokenSummary.cat20Info.tokenId}
                balance={bnUtils.toDecimalAmount(tokenSummary.cat20Balance.amount, tokenSummary.cat20Balance.decimals)}
                type={TokenType.CAT20}
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
            <Section title={t('token_id')} value={tokenSummary.cat20Info.tokenId} link={tokenUrl} />
            <Line />
            <Section title={t('name')} value={tokenSummary.cat20Info.name} />
            <Line />

            <Section title={t('symbol')} value={tokenSummary.cat20Info.symbol} />
            <Line />

            <Section title={t('decimals')} value={tokenSummary.cat20Balance.decimals} />
            <Line />

            <Section
              title={t('supply')}
              value={`${showLongNumber(bnUtils.toDecimalAmount(tokenSummary.cat20Info.max, 0))} ${
                tokenSummary.cat20Info.symbol
              }`}
            />
            <Line />

            <Section
              title={t('premine')}
              value={`${showLongNumber(bnUtils.toDecimalAmount(tokenSummary.cat20Info.premine, 0))} ${
                tokenSummary.cat20Info.symbol
              }`}
            />
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
            <Button text={t('merge_utxos')} preset="brc20-action" icon="merge" onClick={onClickMerge} full />

            <Button
              text={t('send')}
              preset="brc20-action"
              icon="send"
              disabled={!enableTransfer}
              onClick={onClickSend}
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
        </Column>
      </Footer>
    </Layout>
  );
}
