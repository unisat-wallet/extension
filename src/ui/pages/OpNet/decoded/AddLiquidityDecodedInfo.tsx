import { Decoded } from '@/shared/web3/decoder/CalldataDecoder';
import { ContractInformation } from '@/shared/web3/interfaces/ContractInformation';
import { Card, Column, Text } from '@/ui/components';
import { Address, BinaryReader } from '@btc-vision/bsi-binary';

export function decodeAddLiquidity(selector: string, reader: BinaryReader): AddLiquidityDecoded {
    const tokenA: Address = reader.readAddress();
    const tokenB: Address = reader.readAddress();
    const amountADesired: bigint = reader.readU256();
    const amountBDesired: bigint = reader.readU256();
    const amountAMin: bigint = reader.readU256();
    const amountBMin: bigint = reader.readU256();
    const to: Address = reader.readAddress();
    const deadline: bigint = reader.readU64();

    return {
        selector,
        tokenA,
        tokenB,
        amountADesired,
        amountBDesired,
        amountAMin,
        amountBMin,
        to,
        deadline
    };
}

export interface AddLiquidityDecoded extends Decoded {
    readonly tokenA: Address;
    readonly tokenB: Address;
    readonly amountADesired: bigint;
    readonly amountBDesired: bigint;
    readonly amountAMin: bigint;
    readonly amountBMin: bigint;
    readonly to: Address;
    readonly deadline: bigint;
}

interface AddLiquidityProps {
    readonly decoded: AddLiquidityDecoded;
    readonly contractInfo: ContractInformation;
    readonly interactionType: string;
}

function sliceAddress(address: Address): string {
    return `${address.slice(0, 8)}...${address.slice(-12)}`;
}

export function AddLiquidityDecodedInfo(props: AddLiquidityProps): JSX.Element {
    const interactionType = props.interactionType;
    const decoded = props.decoded;

    const slicedToAddress = sliceAddress(decoded.to);
    const slicedTokenA = sliceAddress(decoded.tokenA);
    const slicedTokenB = sliceAddress(decoded.tokenB);

    return (
        <Card>
            <Column>
                <Text
                    text={interactionType}
                    preset="sub"
                    textCenter
                    style={{ maxWidth: 300, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}
                />
                <Text text={`Token A: ➜ ${slicedTokenA}`} preset="sub" textCenter />
                <Text text={`Token B: ➜ ${slicedTokenB}`} preset="sub" textCenter />

                <Text text={`Amount A Desired: ${decoded.amountADesired}`} preset="sub" textCenter />
                <Text text={`Amount B Desired: ${decoded.amountBDesired}`} preset="sub" textCenter />

                <Text text={`Amount A Min: ${decoded.amountAMin}`} preset="sub" textCenter />
                <Text text={`Amount B Min: ${decoded.amountBMin}`} preset="sub" textCenter />

                <Text text={`To: ➜ ${slicedToAddress}`} preset="sub" textCenter />
                <Text text={`Deadline: ${decoded.deadline}`} preset="sub" textCenter />
            </Column>
        </Card>
    );
}
