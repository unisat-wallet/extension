import { Button, Column, Content, Footer, Header, Icon, Layout, Row, Text } from '@/ui/components';
import { BRC20Ticker } from '@/ui/components/BRC20Ticker';
import { Line } from '@/ui/components/Line';
import { Section } from '@/ui/components/Section';
import { TickUsdWithoutPrice, TokenType } from '@/ui/components/TickUsd';
import { TokenScreenIcon } from '@/ui/components/TokenScreenIcon';
import { WarningPopover } from '@/ui/components/WarningPopover';
import { colors } from '@/ui/theme/colors';
import { fontSizes } from '@/ui/theme/font';
import { showLongNumber } from '@/ui/utils';
import { LoadingOutlined } from '@ant-design/icons';
import { bnUtils } from '@unisat/base-utils';
import { useAlkanesTokenScreenLogic } from '@unisat/wallet-state';

export default function AlkanesTokenScreen() {
  const {
    tokenSummary,
    loading,
    enableMint,
    enableTransfer,
    enableTrade,
    warning,
    iconInfo,
    t,
    setWarning,
    onClickMint,
    onClickSend,
    onClickTrade
  } = useAlkanesTokenScreenLogic();

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
              <BRC20Ticker tick={tokenSummary.tokenInfo.name} preset="md" showOrigin color={'ticker_color2'} />
            </Row>
            <Column itemsCenter fullX justifyCenter>
              <Text
                text={`${bnUtils.toDecimalAmount(
                  tokenSummary.tokenBalance.amount,
                  tokenSummary.tokenBalance.divisibility
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
                tick={tokenSummary.tokenInfo.alkaneid}
                balance={bnUtils.toDecimalAmount(
                  tokenSummary.tokenBalance.amount,
                  tokenSummary.tokenBalance.divisibility
                )}
                type={TokenType.ALKANES}
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
            <Section title={'Alkanes ID'} value={tokenSummary.tokenBalance.alkaneid} />
            <Line />

            <Section title={t('name_label')} value={tokenSummary.tokenBalance.name} />
            <Line />

            <Section title={t('symbol_alkanes')} value={tokenSummary.tokenBalance.symbol} />
            <Line />

            <Section title={t('decimals_alkanes')} value={tokenSummary.tokenBalance.divisibility} />
            <Line />

            <Section title={t('holders_alkanes')} value={showLongNumber(tokenSummary.tokenInfo.holders)} />
            <Line />

            <Section
              title={t('total_supply')}
              value={`${
                tokenSummary.tokenInfo.totalSupply
                  ? showLongNumber(
                      bnUtils.toDecimalAmount(
                        tokenSummary.tokenInfo.totalSupply.toString(),
                        tokenSummary.tokenBalance.divisibility
                      )
                    )
                  : '--'
              }/${
                tokenSummary.tokenInfo.maxSupply && tokenSummary.tokenInfo.maxSupply !== '0'
                  ? showLongNumber(
                      bnUtils.toDecimalAmount(
                        tokenSummary.tokenInfo.maxSupply.toString(),
                        tokenSummary.tokenBalance.divisibility
                      )
                    )
                  : '--'
              }`}
              maxLength={100}
            />
            <Line />

            <Section
              title={t('minted_alkanes')}
              value={`${showLongNumber(tokenSummary.tokenInfo.minted)}/${showLongNumber(tokenSummary.tokenInfo.cap)}`}
            />
            <Line />

            <Section
              title={t('per_mint')}
              value={
                tokenSummary.tokenInfo.perMint
                  ? `${showLongNumber(
                      bnUtils.toDecimalAmount(tokenSummary.tokenInfo.perMint, tokenSummary.tokenBalance.divisibility)
                    )} `
                  : '--'
              }
            />

            <Line />
          </Column>

          {warning && (
            <WarningPopover
              risks={[
                {
                  desc: t('important_to_not_transfer_this_token')
                }
              ]}
              onClose={() => {
                setWarning(false);
              }}
            />
          )}
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
