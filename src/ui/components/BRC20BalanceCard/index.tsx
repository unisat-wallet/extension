import { Tooltip } from 'antd';

import { TokenBalance } from '@/shared/types';
import { colors } from '@/ui/theme/colors';
import { fontSizes } from '@/ui/theme/font';
import { InfoCircleOutlined } from '@ant-design/icons';

import { BRC20Ticker } from '../BRC20Ticker';
import { Card } from '../Card';
import { Column } from '../Column';
import { Row } from '../Row';
import { Text } from '../Text';

export interface BRC20BalanceCardProps {
    tokenBalance: TokenBalance;
    onClick?: () => void;
}

export default function BRC20BalanceCard(props: BRC20BalanceCardProps) {
    const {
        tokenBalance: {
            ticker,
            overallBalance,
            transferableBalance,
            availableBalance,
            availableBalanceSafe,
            availableBalanceUnSafe
        },
        onClick
    } = props;
    return (
        <Card
            style={{
                backgroundColor: '#141414',
                borderColor: 'rgba(255,255,255,0.1)',
                borderWidth: 1,
                minHeight: 120
            }}
            fullX
            onClick={onClick}>
            <Column full>
                <Row justifyBetween itemsCenter>
                    <BRC20Ticker tick={ticker} />
                    <Tooltip
                        title="The transferable amount is the balance that has been inscribed into transfer inscriptions but has not yet been sent."
                        overlayStyle={{
                            fontSize: fontSizes.xs
                        }}>
                        <InfoCircleOutlined
                            style={{
                                fontSize: fontSizes.xs,
                                color: colors.textDim
                            }}
                        />
                    </Tooltip>
                </Row>

                <Row justifyBetween>
                    <Text text="Transferable:" color="textDim" size="xs" />
                    <Text text={transferableBalance} size="xs" />
                </Row>

                <Row justifyBetween>
                    <Text text="Available:" color="textDim" size="xs" />
                    <Text text={availableBalanceSafe} size="xs" />
                </Row>
                {availableBalanceUnSafe && parseInt(availableBalanceUnSafe) > 0 && (
                    <Row justifyBetween>
                        <Text text="Available (pending): " color="textDim" size="xs" />
                        <Text text={availableBalanceUnSafe} size="xs" color="textDim" />
                    </Row>
                )}
                <Row style={{ borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }} />
                <Row justifyBetween itemsCenter>
                    <Text text="Balance:" color="textDim" size="xs" />
                    <Text text={overallBalance} size="xs" />
                </Row>
            </Column>
        </Card>
    );
}
