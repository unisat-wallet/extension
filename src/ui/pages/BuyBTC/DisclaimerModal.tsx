import { Checkbox } from 'antd';
import { useState } from 'react';

import { PAYMENT_CHANNELS, PaymentChannelType } from '@/shared/constant';
import { Button, Column, Row, Text } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import { BottomModal } from '@/ui/components/BottomModal';
import { useCurrentAccount } from '@/ui/state/accounts/hooks';
import { colors } from '@/ui/theme/colors';
import { fontSizes } from '@/ui/theme/font';
import { useWallet } from '@/ui/utils';
import { CloseOutlined } from '@ant-design/icons';

const disclaimStr = `Please note that you are about to buy Bitcoin through a third-party platform. Credit card payment services are provided by our partners. UniSat Wallet acts solely as an intermediary platform and assumes no liability for any potential losses or damages that may arise from using the credit card payment service.

`;
export default function DisclaimerModal({ channelType, onClose }: { channelType: PaymentChannelType; onClose: any }) {
    const currentAccount = useCurrentAccount();
    const wallet = useWallet();

    const [understand, setUnderstand] = useState(false);

    const channelInfo = PAYMENT_CHANNELS[channelType];
    const tools = useTools();
    return (
        <BottomModal onClose={onClose}>
            <Column>
                <Row justifyBetween itemsCenter style={{ height: 20 }}>
                    <Row />
                    <Text text="Disclaimer" textCenter size="md" />
                    <Row
                        onClick={() => {
                            onClose();
                        }}>
                        <CloseOutlined />
                    </Row>
                </Row>

                <Row fullX style={{ borderTopWidth: 1, borderColor: colors.border }} my="md" />

                <Column justifyCenter rounded mb="lg" style={{ maxHeight: '50vh', overflow: 'auto' }}>
                    <Text style={{ fontSize: fontSizes.sm, lineHeight: 2 }} text={disclaimStr} />

                    <Text
                        mt="lg"
                        style={{ fontSize: fontSizes.sm, lineHeight: 2 }}
                        text={
                            "Risk Warning: Don't invest unless you're prepared to lose all the money you invest."
                        }></Text>
                    <Text
                        mt="lg"
                        style={{ fontSize: fontSizes.sm, lineHeight: 2 }}
                        text={
                            "Additional transaction fees apply when purchasing through third-party platforms. Rates vary by country and payment method. Please review each platform's fees before proceeding with transactions."
                        }></Text>
                    <Text
                        mt="lg"
                        style={{ fontSize: fontSizes.sm, lineHeight: 2 }}
                        text={'Before proceeding, please carefully read and accept the disclaimer.'}></Text>
                </Column>

                <Row justifyCenter>
                    <Checkbox
                        onChange={() => {
                            setUnderstand(!understand);
                        }}
                        checked={understand}
                        style={{ fontSize: fontSizes.sm }}>
                        <Text text="I have read and agree to the above disclaimer" />
                    </Checkbox>
                </Row>

                <Button
                    text={`Continue with ${channelInfo.name}`}
                    preset="primaryV2"
                    disabled={!understand}
                    onClick={() => {
                        tools.showLoading(true);
                        wallet
                            .createPaymentUrl(currentAccount.address, channelType)
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
