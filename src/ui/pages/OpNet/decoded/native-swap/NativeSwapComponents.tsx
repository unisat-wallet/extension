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
import { useBTCUnit } from '@/ui/state/settings/hooks';

interface CommonNativeSwapProps {
    // Kept here for type compatibility, but we DO NOT USE this anymore:
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
    const { interactionType, decoded } = props;
    const [tokenCA, setTokenCA] = useState<ContractInformation | false | undefined>();

    useEffect(() => {
        (async () => {
            const info = await Web3API.queryContractInformation(decoded.token);
            setTokenCA(info);
        })();
    }, [decoded.token]);

    const btcUnit = useBTCUnit();
    const decimals = tokenCA ? (tokenCA.decimals ?? 8) : 8;
    const maxFormatted = BitcoinUtils.formatUnits(decoded.maximumAmountIn, 8);
    const minFormatted = BitcoinUtils.formatUnits(decoded.minimumAmountOut, decimals);

    return (
        <Card>
            <Column>
                <Text text={interactionType} preset="sub" textCenter />
                <Row>
                    <Image src={tokenCA ? tokenCA.logo : ''} size={fontSizes.logo} />
                    <Text text={`Reserving for ${maxFormatted} ${btcUnit} worth of tokens.`} preset={'bold'} />
                </Row>

                <br></br>
                {decoded.forLP ? (
                    <Row>
                        <Image src={tokenCA ? tokenCA.logo : ''} size={fontSizes.logo} />

                        <Text
                            text={`Minimum of ${minFormatted} ${tokenCA ? tokenCA.symbol : 'UNKNOWN'} to the pool`}
                            preset={'bold'}
                        />
                    </Row>
                ) : (
                    <Row>
                        <Image src={tokenCA ? tokenCA.logo : ''} size={fontSizes.logo} />
                        <Text
                            text={`Minimum of ${minFormatted} ${tokenCA ? tokenCA.symbol : 'UNKNOWN'} for ${maxFormatted} ${btcUnit}`}
                            preset={'bold'}
                        />
                    </Row>
                )}

                {decoded.forLP ? <Text text={'This reservation is adding liquidity'} preset={'sub'} /> : null}
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
    const { interactionType, decoded } = props;
    const [tokenCA, setTokenCA] = useState<ContractInformation | false | undefined>();

    useEffect(() => {
        (async () => {
            const info = await Web3API.queryContractInformation(decoded.token);
            setTokenCA(info);
        })();
    }, [decoded.token]);

    const decimals = tokenCA ? (tokenCA.decimals ?? 8) : 8;
    const symbol = tokenCA ? tokenCA.symbol : 'UNKNOWN';
    const amountFormatted = BitcoinUtils.formatUnits(decoded.amountIn, decimals);

    return (
        <Card>
            <Column>
                <Text text={interactionType} preset="sub" textCenter />
                <Text text={`Amount: ${amountFormatted} ${symbol.toUpperCase()}`} preset="large" textCenter />
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
    const { interactionType, decoded } = props;
    const [tokenCA, setTokenCA] = useState<ContractInformation | false | undefined>();

    useEffect(() => {
        (async () => {
            const info = await Web3API.queryContractInformation(decoded.token);
            setTokenCA(info);
        })();
    }, [decoded.token]);

    const decimals = tokenCA ? (tokenCA.decimals ?? 8) : 8;
    const approveAmountFormatted = BitcoinUtils.formatUnits(decoded.approveAmount, decimals);
    const floorFormatted = BitcoinUtils.formatUnits(decoded.floorPrice, decimals);
    const liqFormatted = BitcoinUtils.formatUnits(decoded.initialLiquidity, decimals);
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
    const { interactionType, decoded } = props;
    const [tokenCA, setTokenCA] = useState<ContractInformation | false | undefined>();

    useEffect(() => {
        (async () => {
            const info = await Web3API.queryContractInformation(decoded.token);
            setTokenCA(info);
        })();
    }, [decoded.token]);

    return (
        <Card>
            <Column>
                <Text text={interactionType} preset="sub" textCenter />
                <Row>
                    <Image src={tokenCA ? tokenCA.logo : ''} size={fontSizes.logo} />
                    <Text
                        text={`Adding liquidity to ${tokenCA ? tokenCA.name : 'UNKNOWN'} (${tokenCA ? tokenCA.symbol : 'UNK'})`}
                        preset="bold"
                    />
                </Row>

                <Text text={`Token address`} preset="bold" textCenter />
                <Text text={sliceAddress(decoded.token)} preset="sub" textCenter />
                <Text text={`Withdrawal Receiver (BTC)`} preset="bold" textCenter />
                <Text text={sliceAddress(decoded.receiver)} preset="sub" textCenter />
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
    const { interactionType, decoded } = props;
    const [tokenCA, setTokenCA] = useState<ContractInformation | false | undefined>();

    useEffect(() => {
        (async () => {
            const info = await Web3API.queryContractInformation(decoded.token);
            setTokenCA(info);
        })();
    }, [decoded.token]);

    const decimals = tokenCA ? (tokenCA.decimals ?? 8) : 8;
    const symbol = tokenCA ? tokenCA.symbol : 'UNKNOWN';
    const amountFormatted = BitcoinUtils.formatUnits(decoded.amount, decimals);

    return (
        <Card>
            <Column>
                <Text text={interactionType} preset="sub" textCenter />
                <Text text={`Remove: ${amountFormatted} ${symbol.toUpperCase()}`} preset="large" textCenter />
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

    const [tokenCA, setTokenCA] = useState<ContractInformation | false | undefined>();

    useEffect(() => {
        (async () => {
            const info = await Web3API.queryContractInformation(decoded.token);
            setTokenCA(info);
        })();
    }, [decoded.token]);

    return (
        <Card>
            <Column>
                <Text text={interactionType} preset="sub" textCenter />

                <Row>
                    <Image src={tokenCA ? tokenCA.logo : ''} size={fontSizes.logo} />
                    <Text text={`Swapping ${tokenCA ? tokenCA.name : 'UNKNOWN'}`} preset="bold" />
                </Row>

                <Text text={`Swap token: ${sliceAddress(decoded.token)}`} preset="sub" textCenter />
            </Column>
        </Card>
    );
}
