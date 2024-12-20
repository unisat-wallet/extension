import BigNumber from 'bignumber.js';

import { Decoded, InteractionType } from '@/shared/web3/decoder/CalldataDecoder';
import { ContractInformation } from '@/shared/web3/interfaces/ContractInformation';
import { Card, Column, Image, Row, Text } from '@/ui/components';
import { fontSizes } from '@/ui/theme/font';
import { Address, BinaryReader } from '@btc-vision/transaction';

export function decodeTransfer(selector: InteractionType, reader: BinaryReader): DecodedTransfer {
    let amount = 0n;
    let to = Address.dead();
    switch (selector) {
        case InteractionType.Transfer: {
            to = reader.readAddress();
            amount = reader.readU256();
            break;
        }
    }

    return {
        selector,
        amount,
        to
    };
}

export interface DecodedTransfer extends Decoded {
    readonly amount: bigint;
    readonly to: Address;
}

interface DecodedTransferProps {
    readonly decoded: DecodedTransfer;
    readonly contractInfo: ContractInformation;
    readonly interactionType: string;
}

export function TransferDecodedInfo(props: DecodedTransferProps): JSX.Element {
    const { contractInfo } = props;
    const interactionType = props.interactionType;
    const decoded = props.decoded;

    const amount = new BigNumber(decoded.amount.toString()).div(new BigNumber(10).pow(contractInfo.decimals || 8));
    const balanceFormatted = amount.toFormat(6).toString();

    const slicedAddress = `${decoded.to.slice(0, 8)}...${decoded.to.slice(-12)}`;

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
                <Text text={`➜ ${slicedAddress}`} preset="sub" textCenter />
            </Column>
        </Card>
    );
}
