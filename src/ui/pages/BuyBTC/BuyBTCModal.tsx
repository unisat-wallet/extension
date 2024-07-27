import { useEffect, useState } from 'react';

import { PAYMENT_CHANNELS, PaymentChannelType } from '@/shared/constant';
import { Card, Column, Image, Row, Text } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import { BottomModal } from '@/ui/components/BottomModal';
import { colors } from '@/ui/theme/colors';
import { useWallet } from '@/ui/utils';
import { CloseOutlined } from '@ant-design/icons';

import DisclaimerModal from './DisclaimerModal';
import { BtcChannelItem } from '@/shared/types';
import { Skeleton } from 'antd';

function SupportPaymentList({ list }: { list: string[] }) {
  if(!list || list.length === 0)
    return <></>
  return <Row itemsCenter>
    {list.map((item) => {
      return <Image key={item} src={`./images/artifacts/${item.replaceAll(' ','').toLowerCase()}.png`} width={28} height={19} />
      }
    )}
  </Row>;
}

function PaymentItem({ channel, onClick }: { channel: BtcChannelItem; onClick: () => void }) {
  const channelInfo = PAYMENT_CHANNELS[channel.channel];
  if (!channelInfo) return <></>;
  return (
    <Card style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 10 }} mt="lg" onClick={onClick}>
      <Column fullX gap={'md'}>
        <Row fullX justifyBetween>
          <Row itemsCenter>
            <Image src={channelInfo.img} size={32} />
            <Text text={channelInfo.name} />
          </Row>
          <SupportPaymentList list={channel.payType} />
        </Row>
        {
          channel.quote > 0 &&   <Row fullX justifyBetween>
            <Text size="sm" color="textDim" text={'$300'} />
            <Text text={`≈ ${channel.quote?.toFixed(8)} BTC`} style={{ fontWeight: 'bold' }} />
          </Row>
        }
      </Column>
    </Card>
  );
}

export const BuyBTCModal = ({ onClose }: { onClose: () => void }) => {
  const [disclaimerModalVisible, setDisclaimerModalVisible] = useState(false);
  const [channelType, setChannelType] = useState<PaymentChannelType>(PaymentChannelType.AlchemyPay);

  const [channels, setChannels] = useState<BtcChannelItem[] | undefined>(undefined);
  const wallet = useWallet();
  const tools = useTools();
  useEffect(() => {
    tools.showLoading(true);
    wallet
      .getBuyBtcChannelList()
      .then(setChannels)
      .catch(_ => {
        setChannels([]);
      })
      .finally(() => {
        tools.showLoading(false);
      });
  }, []);

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
          {
            !channels ? <Skeleton active />
              : channels.length <= 0
                ? <Text size="sm" color="textDim" text={`No service provider available.`} />
                : channels.map((channel, index) => (
                  <PaymentItem
                    key={index}
                    channel={channel}
                    onClick={() => {
                      setChannelType(channel.channel);
                      setDisclaimerModalVisible(true);
                    }}
                  />
                ))
          }
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
