import { ContractInformation } from '@/shared/web3/interfaces/ContractInformation';
import { Card, Column, Text } from '@/ui/components';
import { Address, BinaryReader } from '@btc-vision/transaction';
import { sliceAddress } from '../helpper';
import { Decoded } from '@/ui/pages/OpNet/decoded/DecodedTypes';

export function decodeAddLiquidityMotoswap(selector: string, reader: BinaryReader): AddLiquidityDecoded {
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
    readonly contractInfo: Partial<ContractInformation>;
    readonly interactionType: string;
}

export function AddLiquidityDecodedInfo(props: AddLiquidityProps) {
    const interactionType = props.interactionType;
    const decoded = props.decoded;

    const slicedToAddress = sliceAddress(decoded.to.toHex());
    const slicedTokenA = sliceAddress(decoded.tokenA.toHex());
    const slicedTokenB = sliceAddress(decoded.tokenB.toHex());

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
