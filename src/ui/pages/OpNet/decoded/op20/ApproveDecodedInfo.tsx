import BigNumber from 'bignumber.js';

import { ContractInformation } from '@/shared/web3/interfaces/ContractInformation';
import { Card, Column, Image, Row, Text } from '@/ui/components';
import { fontSizes } from '@/ui/theme/font';
import { sliceAddress } from '@/ui/pages/OpNet/decoded/helpper';
import { DecodedApprove } from '@/ui/pages/OpNet/decoded/DecodedTypes';

interface DecodedApproveProps {
    readonly decoded: DecodedApprove;
    readonly contractInfo: Partial<ContractInformation>;
    readonly interactionType: string;
}

export function ApproveDecodedInfo(props: DecodedApproveProps) {
    const { contractInfo } = props;
    const interactionType = props.interactionType;
    const decoded = props.decoded;

    const amount = new BigNumber(decoded.amount.toString()).div(new BigNumber(10).pow(contractInfo.decimals || 8));
    const balanceFormatted = amount.toFormat(6).toString();

    const slicedAddress = sliceAddress(decoded.spender);

    return (
        <Card>
            <Column>
                <Text text={interactionType} preset="sub" textCenter />
                <Row>
                    <Image src={contractInfo.logo} size={fontSizes.logo} />
                    <Text
                        text={`${balanceFormatted} ${(contractInfo.symbol || '').toUpperCase()}`}
                        preset="large"
                        textCenter
                    />
                </Row>
                <Text text={`spender: ✓ ${slicedAddress}`} preset="sub" textCenter />
            </Column>
        </Card>
    );
}
