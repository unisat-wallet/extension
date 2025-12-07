import { Button, Column, Content, Header, Input, Layout, Row, Text } from '@/ui/components';
import { FeeRateBar } from '@/ui/components/FeeRateBar';
import { OutputValueBar } from '@/ui/components/OutputValueBar';
import { TickUsdWithoutPrice, TokenType } from '@/ui/components/TickUsd';
import { colors } from '@/ui/theme/colors';
import { showLongNumber } from '@/ui/utils';
import { bnUtils } from '@unisat/base-utils';
import { useSendRunesScreenLogic } from '@unisat/wallet-state';

export default function SendRunesScreen() {
  const {
    runeBalance,
    runeInfo,
    inputAmount,
    setInputAmount,
    disabled,
    toInfo,
    setToInfo,
    availableBalance,
    error,
    defaultOutputValue,
    minOutputValue,
    setOutputValue,
    t,
    onClickNext
  } = useSendRunesScreenLogic();

  return (
    <Layout>
      <Header
        onBack={() => {
          window.history.go(-1);
        }}
        title={t('send_runes')}
      />
      <Content>
        <Row justifyCenter>
          <Text
            text={`${showLongNumber(bnUtils.toDecimalAmount(runeBalance.amount, runeBalance.divisibility))} ${
              runeInfo.symbol
            }`}
            preset="bold"
            textCenter
            size="xxl"
            wrap
          />
        </Row>
        <Row justifyCenter fullX style={{ marginTop: -12, marginBottom: -12 }}>
          <TickUsdWithoutPrice
            tick={runeInfo.spacedRune}
            balance={bnUtils.toDecimalAmount(runeBalance.amount, runeBalance.divisibility)}
            type={TokenType.RUNES}
            size={'md'}
          />
        </Row>

        <Column mt="lg">
          <Input
            preset="address"
            addressInputData={toInfo}
            onAddressInputChange={(val) => {
              setToInfo(val);
            }}
            recipientLabel={<Text text={t('recipient')} preset="regular" color="textDim" />}
            autoFocus={true}
          />
        </Column>

        <Column mt="lg">
          <Row justifyBetween>
            <Text text={t('balance')} color="textDim" />
            <TickUsdWithoutPrice tick={runeInfo.spacedRune} balance={inputAmount} type={TokenType.RUNES} />
            <Row
              itemsCenter
              onClick={() => {
                setInputAmount(bnUtils.toDecimalAmount(availableBalance, runeBalance.divisibility));
              }}>
              <Text text={t('max')} preset="sub" style={{ color: colors.white_muted }} />
              <Text
                text={`${showLongNumber(bnUtils.toDecimalAmount(availableBalance, runeBalance.divisibility))} ${
                  runeInfo.symbol
                }`}
                preset="bold"
                size="sm"
                wrap
              />
            </Row>
          </Row>
          <Input
            preset="amount"
            placeholder={t('amount')}
            value={inputAmount.toString()}
            onAmountInputChange={(amount) => {
              setInputAmount(amount);
            }}
            runesDecimal={runeInfo.divisibility}
          />
        </Column>

        {toInfo.address ? (
          <Column mt="lg">
            <Text text={t('output_value')} color="textDim" />

            <OutputValueBar
              defaultValue={defaultOutputValue}
              minValue={minOutputValue}
              onChange={(val) => {
                setOutputValue(val);
              }}
            />
          </Column>
        ) : null}

        <Column mt="lg">
          <FeeRateBar />
        </Column>

        {error && <Text text={error} color="error" />}

        <Button disabled={disabled} preset="primary" text={t('next')} onClick={onClickNext}></Button>
      </Content>
    </Layout>
  );
}
