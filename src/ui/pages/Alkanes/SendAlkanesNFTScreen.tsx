import { Button, Column, Content, Header, Input, Layout, Row, Text } from '@/ui/components';
import AlkanesNFTPreview from '@/ui/components/AlkanesNFTPreview';
import { FeeRateBar } from '@/ui/components/FeeRateBar';
import { SendAlkanesNFTScreenStep, useSendAlkanesNFTScreenLogic } from '@unisat/wallet-state';

import { SignPsbt } from '../Approval/components';

export default function SendAlkanesNFTScreen() {
  const {
    step,
    t,
    alkanesInfo,
    toInfo,
    disabled,
    error,
    setToInfo,
    onCreateTxHandleConfirm,
    onCreateTxHandleBack,

    onSignPsbtHandleConfirm,
    onSignPsbtHandleCancel,
    onSignPsbtHandleBack,
    signPsbtParams
  } = useSendAlkanesNFTScreenLogic();

  if (step == SendAlkanesNFTScreenStep.SIGN_TX) {
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
      <Header onBack={onCreateTxHandleBack} title={t('send_alkanes')} />
      <Content>
        <Row justifyCenter>
          <AlkanesNFTPreview alkanesInfo={alkanesInfo} preset="medium" />
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
          <FeeRateBar />
        </Column>

        {error && <Text text={error} color="error" />}

        <Button disabled={disabled} preset="primary" text={t('next')} onClick={onCreateTxHandleConfirm} />
      </Content>
    </Layout>
  );
}
