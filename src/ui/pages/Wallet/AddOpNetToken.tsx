import { useEffect, useState } from 'react';

import { PAYMENT_CHANNELS, PaymentChannelType } from '@/shared/constant';
import { Button, Card, Column, Image, Input, Row, Text } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import { BottomModal } from '@/ui/components/BottomModal';
import { useWallet } from '@/ui/utils';
import { CloseOutlined } from '@ant-design/icons';

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

export const AddOpNetToken = ({
    onClose,
    setImportTokenBool,
    fetchData
}: {
    onClose: () => void;
    setImportTokenBool: (value: boolean) => void;
    fetchData: () => void;
}) => {
    const [tokenState, setTokenState] = useState<string>('');
    const [channels, setChannels] = useState<string[]>([]);
    const wallet = useWallet();
    const tools = useTools();

    const saveToLocalStorage = async () => {
        const getChain = await wallet.getChainType();
        const tokensImported = localStorage.getItem('tokensImported_' + getChain);
        let parsedTokens: string[] = [];
        if (tokensImported) {
            parsedTokens = JSON.parse(tokensImported);
            if (!parsedTokens.includes(tokenState)) {
                parsedTokens.push(tokenState);
                fetchData();
                setImportTokenBool(false);
            }
        } else {
            parsedTokens = [tokenState];
            tools.toastError('Token Exists');
        }
        localStorage.setItem('tokensImported_' + getChain, JSON.stringify(parsedTokens));
        tools.toastSuccess('Added token');
    };
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

    return (
        <BottomModal onClose={onClose}>
            <Column justifyCenter itemsCenter>
                <Row justifyBetween itemsCenter style={{ height: 20 }} fullX>
                    <Row />
                    <Text text="Add Token" textCenter size="md" />
                    <Row
                        onClick={() => {
                            onClose();
                        }}
                    >
                        <CloseOutlined />
                    </Row>
                </Row>
                <Column mt="lg" style={{ width: '100%', marginBottom: '20px' }}>
                    <Text text="Token Address" preset="regular" color="textDim" />
                    <Input
                        preset="text"
                        value={tokenState}
                        onChange={(e) => {
                            setTokenState(e.target.value);
                        }}
                        autoFocus={true}
                    />
                </Column>
            </Column>
            <Button
                disabled={false}
                preset="primary"
                text="Next"
                onClick={() => {
                    void saveToLocalStorage();
                }}
            ></Button>
        </BottomModal>
    );
};
