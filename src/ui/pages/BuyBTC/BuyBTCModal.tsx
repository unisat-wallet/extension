import { useEffect, useState } from 'react';

import { PAYMENT_CHANNELS, PaymentChannelType } from '@/shared/constant';
import { Card, Column, Image, Row, Text } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import { BottomModal } from '@/ui/components/BottomModal';
import { colors } from '@/ui/theme/colors';
import { useWallet } from '@/ui/utils';
import { CloseOutlined } from '@ant-design/icons';

import DisclaimerModal from './DisclaimerModal';

function PaymentItem(props: { channelType: PaymentChannelType; onClick }) {
  const channelInfo = PAYMENT_CHANNELS[props.channelType];

  return (
    <Card style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 10 }} mt="lg" onClick={props.onClick}>
      <Row fullX>
        <Row itemsCenter>
          <Image src={channelInfo.img} size={30} />
          <Text text={channelInfo.name} />
        </Row>
      </Row>
    </Card>
  );
}

export const BuyBTCModal = ({ onClose }: { onClose: () => void }) => {
  const [disclaimerModalVisible, setDisclaimerModalVisible] = useState(false);
  const [channelType, setChannelType] = useState<PaymentChannelType>(PaymentChannelType.AlchemyPay);

  const [channels, setChannels] = useState<string[]>([]);
  const wallet = useWallet();
  const tools = useTools();
  useEffect(() => {
    tools.showLoading(true);
    wallet
      .getBuyBtcChannelList()
      .then((list) => {
        setChannels(list.map((v) => v.channel));
      })
      .finally(() => {
        tools.showLoading(false);
      });
  }, []);

  const isMoonpayEnabled = channels.includes(PaymentChannelType.MoonPay);
  const isTransakEnabled = channels.includes(PaymentChannelType.Transak);
  const isAlchemyPayEnabled = channels.includes(PaymentChannelType.AlchemyPay);

  return (
    <BottomModal onClose={onClose}>
      <Column justifyCenter itemsCenter>
        <Row justifyBetween itemsCenter style={{ height: 20 }} fullX>
          <Row />
          <Text text="Buy BTC" textCenter size="md" />
          <Row
            onClick={() => {
              onClose();
            }}>
            <CloseOutlined />
          </Row>
        </Row>

        <Row fullX style={{ borderTopWidth: 1, borderColor: colors.border }} my="md" />

        <Column gap="zero" mt="sm" mb="lg">
          <Text size="sm" color="textDim" text={`Please select a service provider below to buy BTC.`} />

          {isMoonpayEnabled ? (
            <PaymentItem
              channelType={PaymentChannelType.MoonPay}
              onClick={() => {
                setChannelType(PaymentChannelType.MoonPay);
                setDisclaimerModalVisible(true);
              }}
            />
          ) : null}

          {isAlchemyPayEnabled ? (
            <PaymentItem
              channelType={PaymentChannelType.AlchemyPay}
              onClick={() => {
                setChannelType(PaymentChannelType.AlchemyPay);
                setDisclaimerModalVisible(true);
              }}
            />
          ) : null}

          {isTransakEnabled ? (
            <PaymentItem
              channelType={PaymentChannelType.Transak}
              onClick={() => {
                setChannelType(PaymentChannelType.Transak);
                setDisclaimerModalVisible(true);
              }}
            />
          ) : null}
        </Column>
      </Column>
      {disclaimerModalVisible && (
        <DisclaimerModal
          channelType={channelType}
          onClose={() => {
            setDisclaimerModalVisible(false);
          }}
        />
      )}
    </BottomModal>
  );
};
