import { useEffect, useState } from 'react';

import { Button, Column, Content, Header, Icon, Input, Layout, Text } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import { FeeRateBar } from '@/ui/components/FeeRateBar';
import { RBFBar } from '@/ui/components/RBFBar';
import { useCurrentAccount } from '@/ui/state/accounts/hooks';
import { fontSizes } from '@/ui/theme/font';
import { copyToClipboard, useWallet } from '@/ui/utils';
import { LoadingOutlined } from '@ant-design/icons';

import { useNavigate } from '../MainRoute';

interface LocationState {
    address: string;
}

export default function SplitUtxoScreen() {
    const navigate = useNavigate();
    const [amount, setAmount] = useState('');
    const [feeRate, setFeeRate] = useState(5);
    const [OpnetRateInputVal, adjustFeeRateInput] = useState('5000');

    const [enableRBF, setEnableRBF] = useState(false);
    const handleAmountChange = (value: string) => {
        // Remove any non-numeric characters except for decimal point
        const numericValue = value.replace(/[^0-9.]/g, '');

        // Ensure only one decimal point
        const parts = numericValue.split('.');
        if (parts.length > 2) {
            parts.pop();
        }

        // Limit to 8 decimal places
        if (parts[1] && parts[1].length > 8) {
            parts[1] = parts[1].substring(0, 8);
        }

        const formattedValue = parts.join('.');
        setAmount(formattedValue);
    };

    const account = useCurrentAccount();
    const [loading, setLoading] = useState(true);

    const wallet = useWallet();

    useEffect(() => {
        tools.showLoading(false);
        setLoading(false);
    }, []);

    const tools = useTools();
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
            <Content>
                <Column mt="lg">
                    <Text text="Amount" preset="regular" color="textDim" />
                    <Input
                        preset="amount"
                        value={amount}
                        onAmountInputChange={(amount) => {
                            setAmount(amount);
                        }}
                        autoFocus={true}
                    />
                </Column>
                <Column mt="lg">
                    <Text text="Fee" color="textDim" />

                    <FeeRateBar
                        onChange={(val) => {
                            setFeeRate(val);
                        }}
                    />
                </Column>
                <Text text="Priority Fee" color="textDim" />
                <Input
                    preset="amount"
                    placeholder={'sat/vB'}
                    value={OpnetRateInputVal}
                    onAmountInputChange={(amount) => {
                        adjustFeeRateInput(amount);
                    }}
                    // onBlur={() => {
                    //   const val = parseInt(feeRateInputVal) + '';
                    //   setFeeRateInputVal(val);
                    // }}
                    autoFocus={true}
                />
                <Column mt="lg">
                    <RBFBar
                        onChange={(val) => {
                            setEnableRBF(val);
                        }}
                    />
                </Column>
                <Button
                    preset="primary"
                    text="Next"
                    onClick={(e) => {
                        console.log(e);
                    }}></Button>
            </Content>
        </Layout>
    );
}

function Section({ value, title, link }: { value: string | number; title: string; link?: string }) {
    const tools = useTools();
    return (
        <Column>
            <Text text={title} preset="sub" />
            <Text
                text={value}
                preset={link ? 'link' : 'regular'}
                size="xs"
                wrap
                onClick={() => {
                    if (link) {
                        window.open(link);
                    } else {
                        copyToClipboard(value).then(() => {
                            tools.toastSuccess('Copied');
                        });
                    }
                }}
            />
        </Column>
    );
}
