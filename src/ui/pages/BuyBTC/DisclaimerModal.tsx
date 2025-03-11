import { Checkbox } from 'antd';
import { useState } from 'react';

import { ChainType, PAYMENT_CHANNELS, PaymentChannelType } from '@/shared/constant';
import { Button, Column, Row, Text } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import { BottomModal } from '@/ui/components/BottomModal';
import { useI18n } from '@/ui/hooks/useI18n';
import { useCurrentAccount } from '@/ui/state/accounts/hooks';
import { useChain } from '@/ui/state/settings/hooks';
import { colors } from '@/ui/theme/colors';
import { fontSizes } from '@/ui/theme/font';
import { useWallet } from '@/ui/utils';
import { CloseOutlined } from '@ant-design/icons';

export default function DisclaimerModal({ channelType, onClose }: { channelType: PaymentChannelType; onClose: any }) {
  const currentAccount = useCurrentAccount();
  const wallet = useWallet();
  const { t } = useI18n();

  const chain = useChain();

  const [understand, setUnderstand] = useState(false);

  const channelInfo = PAYMENT_CHANNELS[channelType];
  const tools = useTools();

  const isFractal =
    chain.enum === ChainType.FRACTAL_BITCOIN_MAINNET || chain.enum === ChainType.FRACTAL_BITCOIN_TESTNET;

  return (
    <BottomModal onClose={onClose}>
      <Column>
        <Row justifyBetween itemsCenter style={{ height: 20 }}>
          <Row />
          <Text text={t('disclaimer')} textCenter size="md" />
          <Row
            onClick={() => {
              onClose();
            }}>
            <CloseOutlined />
          </Row>
        </Row>

        <Row fullX style={{ borderTopWidth: 1, borderColor: colors.border }} my="md" />

        <div
          style={{
            maxHeight: '40vh',
            overflow: 'auto',
            padding: '0 0 10px 0',
            marginBottom: 16
          }}>
          <Text
            style={{ fontSize: fontSizes.sm, lineHeight: 2 }}
            text={!isFractal ? t('disclaimStr') : t('disclaimStrFb')}
          />

          <Text mt="lg" style={{ fontSize: fontSizes.sm, lineHeight: 2 }} text={t('risk_warning')}></Text>
          <Text
            mt="lg"
            style={{ fontSize: fontSizes.sm, lineHeight: 2 }}
            text={t('additional_transaction_fees')}></Text>
          <Text mt="lg" style={{ fontSize: fontSizes.sm, lineHeight: 2 }} text={t('before_proceeding')}></Text>
        </div>

        <Row justifyCenter>
          <Checkbox
            onChange={() => {
              setUnderstand(!understand);
            }}
            checked={understand}
            style={{ fontSize: fontSizes.sm }}>
            <Text text={t('i_have_read_and_agree_to_the_above_disclaimer')} />
          </Checkbox>
        </Row>

        <Button
          text={`${t('continue_with')} ${channelInfo.name}`}
          preset="primaryV2"
          disabled={!understand}
          onClick={() => {
            tools.showLoading(true);
            wallet
              .createBuyCoinPaymentUrl(chain.unit, currentAccount.address, channelType)
              .then((url) => {
                window.open(url);
              })
              .catch((e) => {
                tools.toastError(e.message);
              })
              .finally(() => {
                tools.showLoading(false);
              });
          }}
        />
      </Column>
    </BottomModal>
  );
}
