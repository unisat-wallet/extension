import React from 'react';

import { ContractInformation } from '@/shared/web3/interfaces/ContractInformation';
import { Card, Column, Image, Row, Text } from '@/ui/components';
import { fontSizes } from '@/ui/theme/font';

// These interfaces match your decoded objects
import {
    DecodedAirdrop,
    DecodedAirdropWithAmount,
    DecodedApprove,
    DecodedApproveFrom,
    DecodedBurn,
    DecodedMint,
    DecodedTransfer,
    DecodedTransferFrom
} from '@/ui/pages/OpNet/decoded/DecodedTypes';
import { BitcoinUtils } from 'opnet';
import { sliceAddress } from '@/ui/pages/OpNet/decoded/helpper';

interface CommonProps {
    readonly contractInfo: Partial<ContractInformation>;
    readonly interactionType: string;
}

/* -------------------------------
   Transfer (transfer(address,uint256))
----------------------------------- */
interface TransferDecodedProps extends CommonProps {
    readonly decoded: DecodedTransfer;
}

export function TransferDecodedInfo(props: TransferDecodedProps) {
    const { contractInfo, interactionType, decoded } = props;

    const balanceFormatted = BitcoinUtils.formatUnits(decoded.amount, contractInfo.decimals || 8);
    const slicedRecipient = sliceAddress(decoded.recipient);

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
                <Text text={`recipient: ✓ ${slicedRecipient}`} preset="sub" textCenter />
            </Column>
        </Card>
    );
}

/* ---------------------------------
   TransferFrom (transferFrom(address,address,uint256))
------------------------------------- */
interface TransferFromDecodedProps extends CommonProps {
    readonly decoded: DecodedTransferFrom;
}

export function TransferFromDecodedInfo(props: TransferFromDecodedProps) {
    const { contractInfo, interactionType, decoded } = props;

    const balanceFormatted = BitcoinUtils.formatUnits(decoded.amount, contractInfo.decimals || 8);
    const slicedSender = sliceAddress(decoded.sender);
    const slicedRecipient = sliceAddress(decoded.recipient);

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
                <Text text={`sender: ✗ ${slicedSender}`} preset="sub" textCenter />
                <Text text={`recipient: ✓ ${slicedRecipient}`} preset="sub" textCenter />
            </Column>
        </Card>
    );
}

/* -------------------------------
   Approve (approve(address,uint256))
----------------------------------- */
interface ApproveDecodedProps extends CommonProps {
    readonly decoded: DecodedApprove;
}

export function ApproveDecodedInfo(props: ApproveDecodedProps) {
    const { contractInfo, interactionType, decoded } = props;

    const balanceFormatted = BitcoinUtils.formatUnits(decoded.amount, contractInfo.decimals || 8);
    const slicedSpender = sliceAddress(decoded.spender);

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
                <Text text={`spender: ✓ ${slicedSpender}`} preset="sub" textCenter />
            </Column>
        </Card>
    );
}

/* -------------------------------
   ApproveFrom (approveFrom(address,uint256,bytes))
----------------------------------- */
interface ApproveFromDecodedProps extends CommonProps {
    readonly decoded: DecodedApproveFrom;
}

export function ApproveFromDecodedInfo(props: ApproveFromDecodedProps) {
    const { contractInfo, interactionType, decoded } = props;

    const balanceFormatted = BitcoinUtils.formatUnits(decoded.amount, contractInfo.decimals || 8);
    const slicedSpender = sliceAddress(decoded.spender);

    // If you want to display the signature, do so here
    // For simplicity, we just show its length
    const signatureLength = decoded.signature?.length || 0;

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
                <Text text={`spender: ✓ ${slicedSpender}`} preset="sub" textCenter />
                <Text text={`signature length: ${signatureLength} bytes`} preset="sub" textCenter />
            </Column>
        </Card>
    );
}

/* -------------------------------
   Burn (burn(uint256))
----------------------------------- */
interface BurnDecodedProps extends CommonProps {
    readonly decoded: DecodedBurn;
}

export function BurnDecodedInfo(props: BurnDecodedProps) {
    const { contractInfo, interactionType, decoded } = props;

    const balanceFormatted = BitcoinUtils.formatUnits(decoded.value, contractInfo.decimals || 8);

    return (
        <Card>
            <Column>
                <Text text={interactionType} preset="sub" textCenter />
                <Row>
                    <Image src={contractInfo.logo} size={fontSizes.logo} />
                    <Text
                        text={`${balanceFormatted} ${(contractInfo.symbol || '').toUpperCase()} burned`}
                        preset="large"
                        textCenter
                    />
                </Row>
            </Column>
        </Card>
    );
}

/* -------------------------------
   Mint (mint(address,uint256))
----------------------------------- */
interface MintDecodedProps extends CommonProps {
    readonly decoded: DecodedMint;
}

export function MintDecodedInfo(props: MintDecodedProps) {
    const { contractInfo, interactionType, decoded } = props;

    const balanceFormatted = BitcoinUtils.formatUnits(decoded.value, contractInfo.decimals || 8);
    const slicedAddr = sliceAddress(decoded.address);

    return (
        <Card>
            <Column>
                <Text text={interactionType} preset="sub" textCenter />
                <Row>
                    <Image src={contractInfo.logo} size={fontSizes.logo} />
                    <Text
                        text={`${balanceFormatted} ${(contractInfo.symbol || '').toUpperCase()} minted`}
                        preset="large"
                        textCenter
                    />
                </Row>
                <Text text={`to: ✓ ${slicedAddr}`} preset="sub" textCenter />
            </Column>
        </Card>
    );
}

/* -------------------------------
   Airdrop (airdrop(AddressMap<bigint>))
----------------------------------- */
interface AirdropDecodedProps extends CommonProps {
    readonly decoded: DecodedAirdrop;
}

export function AirdropDecodedInfo(props: AirdropDecodedProps) {
    const { interactionType } = props;
    // The data might be complex. For simplicity, just show JSON
    return (
        <Card>
            <Column>
                <Text text={interactionType} preset="sub" textCenter />
                <Text text="Airdrop data (AddressMap<bigint>):" preset="large" textCenter />
                <Text
                    text={JSON.stringify(props.decoded.addressMapData, null, 2)}
                    preset="sub"
                    style={{ textAlign: 'left' }}
                />
            </Column>
        </Card>
    );
}

/* -------------------------------
   AirdropWithAmount (airdropWithAmount(uint256,address[]))
----------------------------------- */
interface AirdropWithAmountProps extends CommonProps {
    readonly decoded: DecodedAirdropWithAmount;
}

export function AirdropWithAmountDecodedInfo(props: AirdropWithAmountProps) {
    const { contractInfo, interactionType, decoded } = props;
    const balanceFormatted = BitcoinUtils.formatUnits(decoded.amount, contractInfo.decimals || 8);

    return (
        <Card>
            <Column>
                <Text text={interactionType} preset="sub" textCenter />
                <Text
                    text={`Airdrop with Amount: ${balanceFormatted} ${(contractInfo.symbol || '').toUpperCase()}`}
                    preset="large"
                    textCenter
                />
                <Text text={`Addresses:`} preset="sub-bold" textCenter />
                {decoded.addresses?.map((addr, i) => (
                    <Text key={i} text={sliceAddress(addr)} preset="sub" textCenter />
                ))}
            </Column>
        </Card>
    );
}
