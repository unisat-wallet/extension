import { ContractInformation } from '@/shared/web3/interfaces/ContractInformation';
import { Card, Column, Text } from '@/ui/components';
import { sliceAddress } from '../helpper';
import { DecodedCreatePool } from '@/ui/pages/OpNet/decoded/DecodedTypes';
import { BitcoinUtils } from 'opnet';

interface CreatePoolProps {
    readonly decoded: DecodedCreatePool;
    readonly contractInfo: ContractInformation;
    readonly interactionType: string;
}

export function CreatePoolNativeSwapDecodedInfo(props: CreatePoolProps) {
    const interactionType = props.interactionType;

    const tokenAddy = props.decoded.token;
    const floorPrice = BitcoinUtils.formatUnits(props.decoded.floorPrice, props.contractInfo.decimals);
    const initialLiquidity = BitcoinUtils.formatUnits(props.decoded.initialLiquidity, props.contractInfo.decimals);
    const receiver = props.decoded.receiver;
    const antiBotEnabledFor = props.decoded.antiBotEnabledFor;
    const antiBotMaximumTokensPerReservation = props.decoded.antiBotMaximumTokensPerReservation;
    const maxReservesIn5BlocksPercent = props.decoded.maxReservesIn5BlocksPercent;

    return (
        <Card>
            <Column>
                <Text
                    text={interactionType}
                    preset="sub"
                    textCenter
                    style={{ maxWidth: 300, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}
                />

                <Text text="Token Address" preset="sub" />
                <Text text={sliceAddress(tokenAddy)} />

                <Text text="Floor Price" preset="sub" />
                <Text text={floorPrice} />

                <Text text="Initial Liquidity" preset="sub" />
                <Text text={initialLiquidity} />

                <Text text="Receiver" preset="sub" />
                <Text text={receiver} />

                <Text text="Anti-Bot Enabled For" preset="sub" />
                <Text text={antiBotEnabledFor} />

                <Text text="Anti-Bot Maximum Tokens Per Reservation" preset="sub" />
                <Text text={antiBotMaximumTokensPerReservation.toString()} />

                <Text text="Max Reserves In 5 Blocks Percent" preset="sub" />
                <Text text={maxReservesIn5BlocksPercent} />
            </Column>
        </Card>
    );
}
