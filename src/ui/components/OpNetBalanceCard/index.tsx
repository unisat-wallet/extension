import { runesUtils } from '@/shared/lib/runes-utils';
import { OpNetBalance } from '@/shared/types';
import { fontSizes } from '@/ui/theme/font';

import { Card } from '../Card';
import { Column } from '../Column';
import { Image } from '../Image';
import { Row } from '../Row';
import { RunesTicker } from '../RunesTicker';
import { Text } from '../Text';

export interface OpNetBalanceCardProps {
    tokenBalance: OpNetBalance;
    onClick?: () => void;
}

export default function OpNetBalanceCard(props: OpNetBalanceCardProps) {
    const { tokenBalance, onClick } = props;
    const balance = runesUtils.toDecimalNumber(tokenBalance.amount, tokenBalance.divisibility);
    let str = balance.toFixed(8);
    if (balance.lt(0.0001)) {
        str = '0';
    }
    return (
        <Card
            style={{
                backgroundColor: '#141414',
                borderColor: 'rgba(255,255,255,0.1)',
                borderWidth: 1
            }}
            fullX
            onClick={() => {
                onClick && onClick();
            }}>
            <Column full py="zero" gap="zero">
                <Row itemsCenter fullX justifyBetween>
                    <Row itemsCenter fullX>
                        {tokenBalance.logo && <Image src={tokenBalance.logo} size={fontSizes.tiny} />}
                        <Column fullY justifyCenter>
                            <RunesTicker tick={tokenBalance.name} />
                        </Column>
                    </Row>

                    <Row itemsCenter fullY gap="zero">
                        <Text text={str} size="xs" />
                        <Text text={tokenBalance.symbol} size="xs" mx="sm" />
                    </Row>
                </Row>
            </Column>
        </Card>
    );
}
