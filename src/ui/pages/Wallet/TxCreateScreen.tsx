import { IMAGE_SOURCE_MAP } from '@/shared/constant';
import { Button, Card, Column, Content, Header, Icon, Image, Input, Layout, Row, Text, Tooltip } from '@/ui/components';
import { BtcUsd } from '@/ui/components/BtcUsd';
import { FeeRateBar } from '@/ui/components/FeeRateBar';
import { colors } from '@/ui/theme/colors';
import { fontSizes } from '@/ui/theme/font';
import { useNavigation, useTxCreateScreenLogic } from '@unisat/wallet-state';

export default function TxCreateScreen() {
  const nav = useNavigation();
  const {
    headerTitle,
    chain,

    toInfo,
    onAddressInputChange,

    toSatoshis,
    inputAmount,
    onAmountInputChange,
    onAmountMaxClick,

    showUnavailable,
    availableAmount,
    unavailableAmount,
    unavailableTipText,
    btcUnit,
    t,

    walletConfig,
    isSpecialLocale,

    error,
    disabled,

    onClickNext
  } = useTxCreateScreenLogic();

  return (
    <Layout>
      <Header
        onBack={() => {
          window.history.go(-1);
        }}
        title={headerTitle}
      />
      <Content style={{ padding: '0px 16px 24px' }}>
        <Row justifyCenter>
          <Image src={IMAGE_SOURCE_MAP[chain.icon]} size={50} />
        </Row>

        <Column mt="lg">
          <Input
            preset="address"
            addressInputData={toInfo}
            onAddressInputChange={onAddressInputChange}
            autoFocus={true}
            networkType={chain.enum}
          />
        </Column>

        <Column mt="lg">
          <Row justifyBetween>
            <Text text={t('transfer_amount')} preset="regular" />
            <BtcUsd sats={toSatoshis} />
          </Row>
          <Input
            preset="amount"
            placeholder={t('tx_amount')}
            value={inputAmount}
            onAmountInputChange={onAmountInputChange}
            enableMax={true}
            onMaxClick={onAmountMaxClick}
          />

          <Card
            style={{
              flexDirection: 'column',
              borderRadius: 8
            }}>
            <Row
              justifyBetween
              fullX
              itemsCenter
              style={{
                minHeight: 30
              }}>
              <Text text={t('available')} color="gold" />
              <Row>
                <Text text={`${availableAmount}`} size="sm" color="gold" />
                <Text text={btcUnit} size="sm" color="textDim" />
              </Row>
            </Row>

            {showUnavailable ? (
              <Row
                style={{
                  width: '100%',
                  border: '1px dashed',
                  borderColor: colors.line
                }}></Row>
            ) : null}

            {showUnavailable ? (
              <Row
                justifyBetween
                fullX
                itemsCenter
                style={{
                  minHeight: 30
                }}>
                <Tooltip
                  title={unavailableTipText}
                  placement="top"
                  autoAdjustOverflow={true}
                  align={{
                    overflow: {
                      adjustX: true,
                      adjustY: true
                    }
                  }}
                  overlayStyle={{
                    fontSize: fontSizes.xs,
                    maxWidth: '280px',
                    wordWrap: 'break-word',
                    whiteSpace: 'normal'
                  }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Row itemsCenter>
                      <Text text={t('unavailable')} />
                      <Icon icon="circle-question" color="textDim" />
                    </Row>
                  </div>
                </Tooltip>

                <Row itemsCenter>
                  <Row>
                    <Text text={`${unavailableAmount}`} size="sm" />
                    <Text text={btcUnit} size="sm" color="textDim" />
                  </Row>
                  {walletConfig.disableUtxoTools ? null : (
                    <Button
                      preset="minimal"
                      text={t('unlock')}
                      textStyle={{
                        fontSize: isSpecialLocale ? '8px' : '14px'
                      }}
                      onClick={() => {
                        nav.navToUtxoTools();
                      }}
                    />
                  )}
                </Row>
              </Row>
            ) : null}
          </Card>
        </Column>

        <Column mt="lg">
          <FeeRateBar />
        </Column>

        {error && <Text text={error} color="error" />}

        <Button disabled={disabled} preset="primary" text={t('next')} onClick={onClickNext}></Button>
      </Content>
    </Layout>
  );
}
