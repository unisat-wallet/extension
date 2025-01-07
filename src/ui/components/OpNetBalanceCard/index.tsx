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
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashCan } from '@fortawesome/free-solid-svg-icons';

export interface OpNetBalanceCardProps {
    tokenInfo: OPTokenInfo;
    onClick?: () => void;
    handleRemoveToken: (address: string) => void;
}

export default function OpNetBalanceCard(props: OpNetBalanceCardProps) {
    const { tokenInfo, handleRemoveToken, onClick } = props;
    const balance = new BigNumber(bigIntToDecimal(tokenInfo.amount, tokenInfo.divisibility)); //runesUtils.toDecimalNumber(tokenBalance.amount, tokenBalance.divisibility);
    const truncatedBalance = Math.floor(Number(balance) * 1e5) / 1e5;
    const str =
        Number(balance) > 0
            ? truncatedBalance.toLocaleString('en-US', { minimumFractionDigits: 5, maximumFractionDigits: 5 })
            : '0';

    let finalBal = str.slice(0, 16);
    if (finalBal !== str) {
        finalBal += '...';
    }

    return (
        <Card
            style={{
                backgroundColor: '#141414',
                borderColor: 'rgba(255,255,255,0.1)',
                borderWidth: 1,
                marginBottom: 10
            }}
            fullX
            onClick={(e) => {
                onClick?.();
            }}>
            <Column full py="zero" gap="zero">
                <Row itemsCenter fullX justifyBetween>
                    <Row itemsCenter fullX>
                        {tokenInfo.logo && <Image src={tokenInfo.logo} size={fontSizes.tiny} />}
                        <Column fullY justifyCenter style={{ flex: '0 0 auto' }}>
                            <RunesTicker tick={tokenInfo.name} />
                        </Column>
                    </Row>

                    <Row itemsCenter fullY gap="zero">
                        <Text text={finalBal} size="xs" />
                        <Text text={tokenInfo.symbol} size="xs" mx="sm" />
                    </Row>
                </Row>
            </Column>

            <FontAwesomeIcon
                onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveToken(tokenInfo.address);
                }}
                icon={faTrashCan}
                style={{ height: '1rem', cursor: 'pointer', zIndex: '100000' }}
            />
        </Card>
    );
}
