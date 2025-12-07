import { Button, Column, Content, Header, Input, Layout, Row, Text } from '@/ui/components';
import { FeeRateBar } from '@/ui/components/FeeRateBar';
import { TickUsdWithoutPrice, TokenType } from '@/ui/components/TickUsd';
import { colors } from '@/ui/theme/colors';
import { showLongNumber } from '@/ui/utils';
import { bnUtils } from '@unisat/base-utils';
import { SendAlkanesScreenStep, useSendAlkanesScreenLogic } from '@unisat/wallet-state';

import { SignPsbt } from '../Approval/components';

export default function SendAlkanesScreen() {
  const {
    step,
    t,
    tokenBalance,
    tokenInfo,
    toInfo,
    inputAmount,
    availableBalance,
    disabled,
    error,
    setToInfo,
    setInputAmount,
    onConfirm,
    onSignPsbtHandleConfirm,
    onSignPsbtHandleCancel,
    onSignPsbtHandleBack,
    signPsbtParams
  } = useSendAlkanesScreenLogic();
  if (step == SendAlkanesScreenStep.SIGN_TX) {
    return (
      <SignPsbt
        header={<Header onBack={onSignPsbtHandleBack} />}
        params={signPsbtParams}
        handleCancel={onSignPsbtHandleCancel}
        handleConfirm={onSignPsbtHandleConfirm}
      />
    );
  }

  return (
    <Layout>
      <Header
        onBack={() => {
          window.history.go(-1);
        }}
        title={t('send_alkanes')}
      />
      <Content>
        <Row justifyCenter>
          <Text
            text={`${showLongNumber(bnUtils.toDecimalAmount(tokenBalance.amount, tokenBalance.divisibility))} ${
              tokenInfo.symbol
            }`}
            preset="bold"
            textCenter
            size="xxl"
            wrap
          />
        </Row>
        <Row justifyCenter fullX style={{ marginTop: -12, marginBottom: -12 }}>
          <TickUsdWithoutPrice
            tick={tokenBalance.alkaneid}
            balance={bnUtils.toDecimalAmount(tokenBalance.amount, tokenBalance.divisibility)}
            type={TokenType.ALKANES}
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
            <TickUsdWithoutPrice tick={tokenBalance.name} balance={inputAmount} type={TokenType.RUNES} />
            <Row
              itemsCenter
              onClick={() => {
                setInputAmount(bnUtils.toDecimalAmount(availableBalance, tokenBalance.divisibility));
              }}>
              <Text text={t('max')} preset="sub" style={{ color: colors.white_muted }} />
              <Text
                text={`${showLongNumber(bnUtils.toDecimalAmount(availableBalance, tokenBalance.divisibility))} ${
                  tokenInfo.symbol
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
            runesDecimal={tokenBalance.divisibility}
          />
        </Column>

        <Column mt="lg">
          <FeeRateBar />
        </Column>

        {error && <Text text={error} color="error" />}

        <Button disabled={disabled} preset="primary" text={t('next')} onClick={onConfirm}></Button>
      </Content>
    </Layout>
  );
}
