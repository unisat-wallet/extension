import BigNumber from 'bignumber.js';

import { OPTokenInfo } from '@/shared/types';
import { bigIntToDecimal } from '@/shared/web3/Web3API';
import { fontSizes } from '@/ui/theme/font';

import { Card } from '../Card';
import { Column } from '../Column';
import { Image } from '../Image';
import { Row } from '../Row';
import { RunesTicker } from '../RunesTicker';
import { Text } from '../Text';

export interface OpNetBalanceCardProps {
    tokenBalance: OPTokenInfo;
    onClick?: () => void;
}

export default function OpNetBalanceCard(props: OpNetBalanceCardProps) {
    const { tokenBalance, onClick } = props;
    const balance = new BigNumber(bigIntToDecimal(tokenBalance.amount, tokenBalance.divisibility)); //runesUtils.toDecimalNumber(tokenBalance.amount, tokenBalance.divisibility);
    const truncatedBalance = Math.floor(Number(balance) * 1e5) / 1e5;
    const str =
        Number(balance) > 0
            ? truncatedBalance.toLocaleString('en-US', { minimumFractionDigits: 5, maximumFractionDigits: 5 })
            : '0';

    return (
        <Card
            style={{
                backgroundColor: '#141414',
                borderColor: 'rgba(255,255,255,0.1)',
                borderWidth: 1,
                marginBottom: 10
            }}
            fullX
            onClick={() => {
                onClick?.();
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
