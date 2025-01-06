import React, { useEffect, useState } from 'react';

import { Card, Column, Image, Row, Text } from '@/ui/components';
import { fontSizes } from '@/ui/theme/font';
import { ContractInformation } from '@/shared/web3/interfaces/ContractInformation';

// Decoded types. Example only—adjust according to your real decode logic
import {
    DecodedAddLiquidityNative,
    DecodedCancelListing,
    DecodedCreatePool,
    DecodedCreatePoolWithSignature,
    DecodedListLiquidity,
    DecodedRemoveLiquidity,
    DecodedReserve,
    DecodedSetFees,
    DecodedSwap
} from '@/ui/pages/OpNet/decoded/DecodedTypes'; // etc.
import { sliceAddress } from '../helpper';
import { BitcoinUtils } from 'opnet';
import Web3API from '@/shared/web3/Web3API';

interface CommonNativeSwapProps {
    readonly contractInfo: Partial<ContractInformation>;
    readonly interactionType: string;
}

/* ----------------------------------
   ReserveDecodedInfo
------------------------------------ */
interface ReserveDecodedProps extends CommonNativeSwapProps {
    readonly decoded: DecodedReserve;
}

export function ReserveDecodedInfo(props: ReserveDecodedProps) {
    const { contractInfo, interactionType, decoded } = props;

    const maxFormatted = BitcoinUtils.formatUnits(decoded.maximumAmountIn, contractInfo.decimals || 8);
    const minFormatted = BitcoinUtils.formatUnits(decoded.minimumAmountOut, contractInfo.decimals || 8);
    const tokenSliced = sliceAddress(decoded.token);

    return (
        <Card>
            <Column>
                <Text text={interactionType} preset="sub" textCenter />
                <Row>
                    <Image src={contractInfo.logo} size={fontSizes.logo} />
                    <Text text={`MaxIn: ${maxFormatted}, MinOut: ${minFormatted}`} preset="large" textCenter />
                </Row>
                <Text text={`token: ${tokenSliced}`} preset="sub" textCenter />
                <Text text={`forLP: ${decoded.forLP}`} preset="sub" textCenter />
            </Column>
        </Card>
    );
}

/* ----------------------------------
   ListLiquidityDecodedInfo
------------------------------------ */
interface ListLiquidityDecodedProps extends CommonNativeSwapProps {
    readonly decoded: DecodedListLiquidity;
}

export function ListLiquidityDecodedInfo(props: ListLiquidityDecodedProps) {
    const { contractInfo, interactionType, decoded } = props;
    const amountFormatted = BitcoinUtils.formatUnits(decoded.amountIn, contractInfo.decimals || 8);

    //const token = await Web3API.queryContractInformation(decoded.token);

    return (
        <Card>
            <Column>
                <Text text={interactionType} preset="sub" textCenter />
                <Text
                    text={`Amount: ${amountFormatted} ${(contractInfo.symbol || '').toUpperCase()}`}
                    preset="large"
                    textCenter
                />
                <Text text={`Token: ${sliceAddress(decoded.token)}`} preset="sub" textCenter />
                <Text text={`Receiver (BTC): ${decoded.receiver}`} preset="sub" textCenter />
                <Text text={`Priority: ${String(decoded.priority)}`} preset="sub" textCenter />
            </Column>
        </Card>
    );
}

/* ----------------------------------
   CancelListingDecodedInfo
------------------------------------ */
interface CancelListingDecodedProps extends CommonNativeSwapProps {
    readonly decoded: DecodedCancelListing;
}

export function CancelListingDecodedInfo(props: CancelListingDecodedProps) {
    const { interactionType, decoded } = props;
    return (
        <Card>
            <Column>
                <Text text={interactionType} preset="sub" textCenter />
                <Text text={`Cancel listing for token: ${sliceAddress(decoded.token)}`} preset="sub" textCenter />
            </Column>
        </Card>
    );
}

/* ----------------------------------
   CreatePoolDecodedInfo
------------------------------------ */
interface CreatePoolDecodedProps extends CommonNativeSwapProps {
    readonly decoded: DecodedCreatePool;
}

export function CreatePoolDecodedInfo(props: CreatePoolDecodedProps) {
    const { interactionType, decoded } = props;
    const [poolCA, setPoolCA] = useState<number | false | undefined>();

    useEffect(() => {
        (async () => {
            setPoolCA(await Web3API.queryDecimal(decoded.token));
        })();
    }, []);

    const floorFormatted = BitcoinUtils.formatUnits(decoded.floorPrice, poolCA ? poolCA : 8); // BTC
    const liqFormatted = BitcoinUtils.formatUnits(decoded.initialLiquidity, poolCA ? poolCA : 8);

    return (
        <Card>
            <Column>
                <Text text={interactionType} preset="sub" textCenter />
                <Text text={`Token: ${sliceAddress(decoded.token)}`} preset="sub" textCenter />
                <Text text={`Initial Quote (t/sat): ${floorFormatted}`} preset="sub" textCenter />
                <Text text={`Initial Liquidity: ${liqFormatted}`} preset="sub" textCenter />
                <Text text={`Receiver (BTC): ${sliceAddress(decoded.receiver)}`} preset="sub" textCenter />
                <Text text={`AntiBot Blocks: ${decoded.antiBotEnabledFor}`} preset="sub" textCenter />
            </Column>
        </Card>
    );
}

/* ----------------------------------
   CreatePoolWithSignatureDecodedInfo
------------------------------------ */
interface CreatePoolWithSignatureDecodedProps extends CommonNativeSwapProps {
    readonly decoded: DecodedCreatePoolWithSignature;
}

export function CreatePoolWithSignatureDecodedInfo(props: CreatePoolWithSignatureDecodedProps) {
    const { contractInfo, interactionType, decoded } = props;
    const approveAmountFormatted = BitcoinUtils.formatUnits(decoded.approveAmount, contractInfo.decimals || 8);
    const floorFormatted = BitcoinUtils.formatUnits(decoded.floorPrice, contractInfo.decimals || 8);
    const liqFormatted = BitcoinUtils.formatUnits(decoded.initialLiquidity, contractInfo.decimals || 8);
    const signatureLen = decoded.signature?.length || 0;

    return (
        <Card>
            <Column>
                <Text text={interactionType} preset="sub" textCenter />
                <Text text={`Signature: ${signatureLen} bytes`} preset="sub" textCenter />
                <Text text={`Approve Amount: ${approveAmountFormatted}`} preset="sub" textCenter />
                <Text text={`Token: ${sliceAddress(decoded.token)}`} preset="sub" textCenter />
                <Text text={`Floor Price: ${floorFormatted}`} preset="sub" textCenter />
                <Text text={`Initial Liquidity: ${liqFormatted}`} preset="sub" textCenter />
                <Text text={`Receiver (BTC): ${decoded.receiver}`} preset="sub" textCenter />
            </Column>
        </Card>
    );
}

/* ----------------------------------
   SetFeesDecodedInfo
------------------------------------ */
interface SetFeesDecodedProps extends CommonNativeSwapProps {
    readonly decoded: DecodedSetFees;
}

export function SetFeesDecodedInfo(props: SetFeesDecodedProps) {
    const { interactionType, decoded } = props;
    // We can just show the raw bigints as strings, or format them
    return (
        <Card>
            <Column>
                <Text text={interactionType} preset="sub" textCenter />
                <Text text={`reservationBaseFee: ${decoded.reservationBaseFee.toString()}`} preset="sub" textCenter />
                <Text
                    text={`priorityQueueBaseFee: ${decoded.priorityQueueBaseFee.toString()}`}
                    preset="sub"
                    textCenter
                />
                <Text
                    text={`pricePerUserInPriorityQueueBTC: ${decoded.pricePerUserInPriorityQueueBTC.toString()}`}
                    preset="sub"
                    textCenter
                />
            </Column>
        </Card>
    );
}

/* ----------------------------------
   AddLiquidityDecodedInfo
------------------------------------ */
interface AddLiquidityDecodedProps extends CommonNativeSwapProps {
    readonly decoded: DecodedAddLiquidityNative;
}

export function AddLiquidityDecodedInfoNative(props: AddLiquidityDecodedProps) {
    const { contractInfo, interactionType, decoded } = props;

    const amountFormatted = BitcoinUtils.formatUnits(decoded.amountIn, contractInfo.decimals || 8);

    return (
        <Card>
            <Column>
                <Text text={interactionType} preset="sub" textCenter />
                <Text
                    text={`Amount: ${amountFormatted} ${(contractInfo.symbol || '').toUpperCase()}`}
                    preset="large"
                    textCenter
                />
                <Text text={`Token: ${sliceAddress(decoded.token)}`} preset="sub" textCenter />
                <Text text={`Receiver (BTC): ${decoded.receiver}`} preset="sub" textCenter />
                <Text text={`Priority: ${String(decoded.priority)}`} preset="sub" textCenter />
            </Column>
        </Card>
    );
}

/* ----------------------------------
   RemoveLiquidityDecodedInfo
------------------------------------ */
interface RemoveLiquidityDecodedProps extends CommonNativeSwapProps {
    readonly decoded: DecodedRemoveLiquidity;
}

export function RemoveLiquidityDecodedInfo(props: RemoveLiquidityDecodedProps) {
    const { contractInfo, interactionType, decoded } = props;
    const amountFormatted = BitcoinUtils.formatUnits(decoded.amount, contractInfo.decimals || 8);

    return (
        <Card>
            <Column>
                <Text text={interactionType} preset="sub" textCenter />
                <Text
                    text={`Remove: ${amountFormatted} ${(contractInfo.symbol || '').toUpperCase()}`}
                    preset="large"
                    textCenter
                />
                <Text text={`Token: ${sliceAddress(decoded.token)}`} preset="sub" textCenter />
            </Column>
        </Card>
    );
}

/* ----------------------------------
   SwapDecodedInfo
------------------------------------ */
interface SwapDecodedProps extends CommonNativeSwapProps {
    readonly decoded: DecodedSwap;
}

export function SwapDecodedInfo(props: SwapDecodedProps) {
    const { interactionType, decoded } = props;

    return (
        <Card>
            <Column>
                <Text text={interactionType} preset="sub" textCenter />
                <Text text={`Swap token: ${sliceAddress(decoded.token)}`} preset="sub" textCenter />
            </Column>
        </Card>
    );
}
