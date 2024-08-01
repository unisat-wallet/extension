import { Arc20Balance } from '@/shared/types';

import { Card } from '../Card';
import { Column } from '../Column';
import { Row } from '../Row';
import { Text } from '../Text';

export interface Arc2020BalanceCardProps {
    arc20Balance: Arc20Balance;
    onClick?: () => void;
}

export default function Arc20BalanceCard(props: Arc2020BalanceCardProps) {
    const {
        arc20Balance: { ticker, balance, confirmedBalance, unconfirmedBalance },
        onClick
    } = props;
    return (
        <Card
            style={{
                backgroundColor: '#141414',
                borderColor: 'rgba(255,255,255,0.1)',
                borderWidth: 1
            }}
            fullX
            onClick={onClick}>
            <Column full py="zero" gap="zero">
                <Row fullY justifyBetween justifyCenter>
                    <Column fullY justifyCenter>
                        <Text text={ticker} color="gold" />
                    </Column>

                    <Row itemsCenter fullY gap="zero">
                        <Text text={balance} size="xs" digital />
                    </Row>
                </Row>
            </Column>
        </Card>
    );
}
