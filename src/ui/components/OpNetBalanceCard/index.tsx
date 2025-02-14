import { OPTokenInfo } from '@/shared/types';
import { bigIntToDecimal } from '@/shared/web3/Web3API';
import { fontSizes } from '@/ui/theme/font';
import BigNumber from 'bignumber.js';

import { faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Card } from '../Card';
import { Column } from '../Column';
import { Image } from '../Image';
import { Row } from '../Row';
import { RunesTicker } from '../RunesTicker';
import { Text } from '../Text';

export interface OpNetBalanceCardProps {
    tokenInfo: OPTokenInfo;
    onClick?: () => void;
    handleRemoveToken: (address: string) => void;
}

function formatTruncated(bn: BigNumber, sigDigits = 3): string {
    if (bn.isZero()) return '0';

    if (bn.isGreaterThanOrEqualTo(1)) {
        return bn.decimalPlaces(sigDigits, BigNumber.ROUND_DOWN).toFixed(sigDigits);
    } else {
        let fixed = bn.toFixed(20);
        fixed = fixed.replace(/0+$/, '');
        const parts = fixed.split('.');
        if (parts.length < 2) return fixed;
        const decimals = parts[1];
        const leadingZerosMatch = decimals.match(/^0*/);
        const zerosCount = leadingZerosMatch ? leadingZerosMatch[0].length : 0;
        const requiredDecimals = zerosCount + sigDigits;
        let result = bn.decimalPlaces(requiredDecimals, BigNumber.ROUND_DOWN).toFixed(requiredDecimals);
        result = result.replace(/(\.\d*?[1-9])0+$/, '$1').replace(/\.$/, '');
        return result;
    }
}

function formatBalance(balance: BigNumber, sigDigits = 3): string {
    const units = ['', 'K', 'M', 'B', 'T'];
    let unitIndex = 0;
    let value = new BigNumber(balance);
    while (value.isGreaterThanOrEqualTo(1000) && unitIndex < units.length - 1) {
        value = value.dividedBy(1000);
        unitIndex++;
    }
    const formatted = formatTruncated(value, sigDigits);
    return formatted + units[unitIndex];
}

export default function OpNetBalanceCard(props: OpNetBalanceCardProps) {
    const { tokenInfo, handleRemoveToken, onClick } = props;
    const balance = new BigNumber(bigIntToDecimal(tokenInfo.amount, tokenInfo.divisibility));

    const finalBal = formatBalance(balance, 3);

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
                style={{ height: '1rem', cursor: 'pointer' }}
            />
        </Card>
    );
}
