import { Tooltip } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';

import { KEYRING_TYPE } from '@/shared/constant';
import { DecodedPsbt, ParsedSignPsbtUr, RawTxInfo, TickPriceItem, ToSignInput, TxType } from '@/shared/types';
import { SignPsbtApprovalParams } from '@/shared/types/Approval';
import { isWalletError } from '@/shared/utils/errors';
import { Button, Card, Column, Content, Footer, Header, Icon, Image, Layout, Row, Text } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import { AddressText } from '@/ui/components/AddressText';
import { BtcUsd } from '@/ui/components/BtcUsd';
import WebsiteBar from '@/ui/components/WebsiteBar';
import KeystoneSignScreen from '@/ui/pages/Wallet/KeystoneSignScreen';
import { useAccountAddress, useCurrentAccount } from '@/ui/state/accounts/hooks';
import { useBTCUnit, useChain } from '@/ui/state/settings/hooks';
import { colors } from '@/ui/theme/colors';
import { fontSizes } from '@/ui/theme/font';
import { amountToSatoshis, copyToClipboard, satoshisToAmount, shortAddress, useApproval, useWallet } from '@/ui/utils';
import { LoadingOutlined } from '@ant-design/icons';

export interface Props {
    header?: React.ReactNode;
    params: SignPsbtApprovalParams;
    handleCancel?: () => void;
    handleConfirm?: (rawTxInfo?: RawTxInfo) => void;
}

interface InscriptioinInfo {
    id: string;
    isSent: boolean;
}

function SignTxDetails({
    txInfo,
    type,
    rawTxInfo,
}: {
    txInfo: TxInfo;
    rawTxInfo?: RawTxInfo;
    type: TxType;
}) {
    const address = useAccountAddress();
    const chain = useChain();
    const btcUnit = useBTCUnit();

    const isCurrentToPayFee = useMemo(() => type !== TxType.SIGN_TX, [type]);

    const spendSatoshis = useMemo(() => {
        const inValue = txInfo.decodedPsbt.inputs
            .filter((v) => v.address === address)
            .reduce((pre, cur) => cur.value + pre, 0);
        const outValue = txInfo.decodedPsbt.outputs
            .filter((v) => v.address === address)
            .reduce((pre, cur) => cur.value + pre, 0);
        const spend = inValue - outValue;
        return spend;
    }, [txInfo.decodedPsbt]);

    const sendingSatoshis = useMemo(() => {
        const inValue = txInfo.decodedPsbt.inputs
            .filter((v) => v.address === address)
            .reduce((pre, cur) => cur.value + pre, 0);
        return inValue;
    }, [txInfo.decodedPsbt]);

    const receivingSatoshis = useMemo(() => {
        const outValue = txInfo.decodedPsbt.outputs
            .filter((v) => v.address === address)
            .reduce((pre, cur) => cur.value + pre, 0);
        return outValue;
    }, [txInfo.decodedPsbt]);

    const spendAmount = useMemo(() => satoshisToAmount(spendSatoshis), [spendSatoshis]);
    const balanceChangedAmount = useMemo(
        () => satoshisToAmount(receivingSatoshis - sendingSatoshis),
        [sendingSatoshis, receivingSatoshis]
    );

    const feeAmount = useMemo(() => satoshisToAmount(txInfo.decodedPsbt.fee), [txInfo.decodedPsbt]);

    if (type === TxType.SIGN_TX) {
        return (
            <Column gap="lg">
                <Row itemsCenter justifyCenter fullX py={'sm'}>
                    <Text text="Sign Transaction" preset="title-bold" textCenter />
                </Row>
                <Row justifyCenter fullX>
                    <Card style={{ backgroundColor: '#272626', flex: '1' }}>
                        <Column fullX itemsCenter>
                            <Row itemsCenter>
                                <Image src={chain.icon} size={24} />
                                <Text text={chain.label} />
                            </Row>
                            <Row
                                style={{
                                    borderTopWidth: 1,
                                    borderColor: colors.border,
                                    borderStyle: 'dashed',
                                    alignSelf: 'stretch'
                                }}
                                my="md"
                            />
                            <Column justifyCenter>
                                <Row itemsCenter>
                                    <Text
                                        text={(receivingSatoshis > sendingSatoshis ? '+' : '') + balanceChangedAmount}
                                        color="white"
                                        preset="bold"
                                        textCenter
                                        size="xxl"
                                    />
                                    <Text text={btcUnit} color="textDim" />
                                    <BtcUsd sats={Math.abs(receivingSatoshis - sendingSatoshis)} bracket />
                                </Row>
                            </Column>
                        </Column>
                    </Card>
                </Row>
                <div />
            </Column>
        );
    }

    return (
        <Column gap="lg" style={{ position: 'relative' }}>
            <Row itemsCenter justifyCenter fullX py={'sm'}>
                <Text text="Sign Transaction" preset="title-bold" textCenter />
            </Row>
            <Row justifyCenter>
                <Card style={{ backgroundColor: '#272626', flex: '1' }}>
                    <Column fullX itemsCenter>
                        <Row itemsCenter justifyCenter>
                            <Image src={chain.icon} size={24} />
                            <Text text={chain.label} />
                        </Row>
                        <Row
                            style={{
                                borderTopWidth: 1,
                                borderColor: colors.border,
                                borderStyle: 'dashed',
                                alignSelf: 'stretch'
                            }}
                            my="md"
                        />
                        {rawTxInfo && (
                            <Column>
                                <Text text={'Send to'} textCenter color="textDim" />
                                <Row justifyCenter>
                                    <AddressText addressInfo={rawTxInfo.toAddressInfo} textCenter />
                                </Row>
                            </Column>
                        )}
                        {rawTxInfo && (
                            <Row
                                style={{
                                    borderTopWidth: 1,
                                    borderColor: colors.border,
                                    borderStyle: 'dashed',
                                    alignSelf: 'stretch'
                                }}
                                my="md"
                            />
                        )}

                        <Column>
                            <Text text={'Spend Amount'} textCenter color="textDim" />

                            <Column justifyCenter>
                                <Row itemsCenter>
                                    <Text
                                        text={spendAmount + ' ' + btcUnit}
                                        color="white"
                                        preset="bold"
                                        textCenter
                                        size="xxl"
                                    />
                                </Row>
                                <BtcUsd sats={spendSatoshis} textCenter bracket style={{ marginTop: -8 }} />

                                {isCurrentToPayFee && (
                                    <Text text={`${feeAmount} ${btcUnit} (network fee)`} preset="sub" textCenter />
                                )}
                            </Column>
                        </Column>
                    </Column>
                </Card>
            </Row>
        </Column>
    );
}

function Section({ title, children, extra }: { title: string; children?: React.ReactNode; extra?: React.ReactNode }) {
    return (
        <Column>
            <Row justifyBetween>
                <Text text={title} preset="bold" />
                {extra}
            </Row>
            <Card>
                <Row full justifyBetween itemsCenter>
                    {children}
                </Row>
            </Card>
        </Column>
    );
}

interface TxInfo {
    changedBalance: number;
    changedInscriptions: InscriptioinInfo[];
    rawtx: string;
    psbtHex: string;
    toSignInputs: ToSignInput[];
    txError: string;
    decodedPsbt: DecodedPsbt;
}

const initTxInfo: TxInfo = {
    changedBalance: 0,
    changedInscriptions: [],
    rawtx: '',
    psbtHex: '',
    toSignInputs: [],
    txError: '',
    decodedPsbt: {
        inputs: [],
        outputs: [],
        fee: 0,
        feeRate: 0,
        rbfEnabled: false,
        transactionSize: 0,
        shouldWarnFeeRate: false,
        recommendedFeeRate: 1
    }
};

export default function SignPsbt({
    params: {
        data: { psbtHex, options, type, sendBitcoinParams, sendInscriptionParams, sendRunesParams, rawTxInfo, ...rest },
        session
    },
    header,
    handleCancel,
    handleConfirm
}: Props) {
    const [txInfo, setTxInfo] = useState<TxInfo>(initTxInfo);

    const [getApproval, resolveApproval, rejectApproval] = useApproval();

    const btcUnit = useBTCUnit();

    const wallet = useWallet();
    const [loading, setLoading] = useState(true);

    const tools = useTools();

    const address = useAccountAddress();
    const currentAccount = useCurrentAccount();

    const [isKeystoneSigning, setIsKeystoneSigning] = useState(false);

    const [brc20PriceMap, setBrc20PriceMap] = useState<Record<string, TickPriceItem>>();
    const [runesPriceMap, setRunesPriceMap] = useState<Record<string, TickPriceItem>>();

    useEffect(() => {
        if (txInfo?.decodedPsbt?.inputs) {
            const runesMap: Record<string, boolean> = {};
            const brc20Map: Record<string, boolean> = {};
            if (Object.keys(runesMap).length > 0) {
                wallet
                    .getRunesPrice(Object.keys(runesMap))
                    .then(setRunesPriceMap)
                    .catch((e: unknown) => tools.toastError((e as Error).message));
            }
            if (Object.keys(brc20Map).length > 0) {
                wallet
                    .getBrc20sPrice(Object.keys(brc20Map))
                    .then(setBrc20PriceMap)
                    .catch((e: unknown) => tools.toastError((e as Error).message));
            }
        }
    }, [txInfo]);
    const init = async () => {
        let txError = '';
        if (type === TxType.SIGN_TX) {
            if (psbtHex && currentAccount.type === KEYRING_TYPE.KeystoneKeyring) {
                try {
                    const toSignInputs = await wallet.formatOptionsToSignInputs(psbtHex, options);
                    psbtHex = await wallet.signPsbtWithHex(psbtHex, toSignInputs, false);
                } catch (e: unknown) {
                    console.error(e);
                    if (isWalletError(e)) {
                        tools.toastError(txError);
                    } else {
                        tools.toastError("An unexpected error occurred.");
                        console.error("Non-WalletError caught: ", e);
                    }
                }
            }
        } else {
            throw new Error('Not supported');
        }

        if (!psbtHex) {
            setLoading(false);
            setTxInfo(Object.assign({}, initTxInfo, { txError }));
            return;
        }

        const decodedPsbt = await wallet.decodePsbt(psbtHex);

        let toSignInputs: ToSignInput[] = [];
        // @ts-expect-error
        if (type === TxType.SEND_BITCOIN) {
            toSignInputs = decodedPsbt.inputs.map((_, index) => ({
                index,
                publicKey: currentAccount.pubkey
            }));
        } else {
            try {
                toSignInputs = await wallet.formatOptionsToSignInputs(psbtHex, options);
            } catch (e) {
                txError = (e as Error).message;
                tools.toastError(txError);
            }
        }

        setTxInfo({
            decodedPsbt,
            changedBalance: 0,
            changedInscriptions: [],
            psbtHex,
            rawtx: '',
            toSignInputs,
            txError
        });

        setLoading(false);
    };

    useEffect(() => {
        init();
    }, []);

    if (!handleCancel) {
        handleCancel = () => {
            rejectApproval();
        };
    }

    if (!handleConfirm) {
        handleConfirm = (res) => {
            let signed = true;
            if (type === TxType.SIGN_TX && currentAccount.type !== KEYRING_TYPE.KeystoneKeyring) {
                signed = false;
            }
            resolveApproval({
                psbtHex: (res ?? txInfo).psbtHex,
                signed
            });
        };
    }

    const originalHandleConfirm = handleConfirm;
    if (currentAccount.type === KEYRING_TYPE.KeystoneKeyring) {
        handleConfirm = () => {
            setIsKeystoneSigning(true);
        };
    }

    const networkFee = useMemo(() => satoshisToAmount(txInfo.decodedPsbt.fee), [txInfo.decodedPsbt]);

    const detailsComponent = useMemo(() => {
        return <SignTxDetails txInfo={txInfo} rawTxInfo={rawTxInfo} type={type} />;
    }, [txInfo, brc20PriceMap, runesPriceMap]);

    const isValidData = useMemo(() => {
        if (txInfo.psbtHex === '') {
            return false;
        }
        return true;
    }, [txInfo.psbtHex]);

    const isValid = useMemo(() => {
        if (txInfo.toSignInputs.length == 0) {
            return false;
        }
        if (txInfo.decodedPsbt.inputs.length == 0) {
            return false;
        }
        return true;
    }, [txInfo.decodedPsbt, txInfo.toSignInputs]);

    const canChanged = useMemo(() => {
        let val = true;
        txInfo.decodedPsbt.inputs.forEach((v) => {
            if (v.address == address && (!v.sighashType || v.sighashType === 1)) {
                val = false;
            }
        });
        return val;
    }, [txInfo.decodedPsbt]);

    if (loading) {
        return (
            <Layout>
                <Content itemsCenter justifyCenter>
                    <Icon size={fontSizes.xxxl} color="gold">
                        <LoadingOutlined />
                    </Icon>
                </Content>
            </Layout>
        );
    }

    if (!header && session) {
        header = (
            <Header>
                <WebsiteBar session={session} />
            </Header>
        );
    }

    if (isKeystoneSigning) {
        return (
            <KeystoneSignScreen
                type="psbt"
                data={txInfo.psbtHex}
                isFinalize={type !== TxType.SIGN_TX}
                onSuccess={(data: ParsedSignPsbtUr) => {
                    originalHandleConfirm(data);
                }}
                onBack={() => {
                    setIsKeystoneSigning(false);
                }}
            />
        );
    }

    return (
        <Layout>
            {header}
            <Content>
                <Column gap="xl">
                    {detailsComponent}
                    {/*this div is used to double gap*/}
                    <div />
                    {!canChanged && (
                        <Section title="Network Fee:" extra={<BtcUsd sats={amountToSatoshis(networkFee)} />}>
                            <Text text={networkFee} />
                            <Text text={btcUnit} color="textDim" />
                        </Section>
                    )}

                    {!canChanged && (
                        <Section title="Network Fee Rate:">
                            {txInfo.decodedPsbt.shouldWarnFeeRate ? (
                                <Tooltip
                                    title={
                                        txInfo.decodedPsbt.recommendedFeeRate > txInfo.decodedPsbt.feeRate
                                            ? `The fee rate is much lower than recommended fee rate (${txInfo.decodedPsbt.recommendedFeeRate} sat/vB)`
                                            : `The fee rate is much higher than recommended fee rate (${txInfo.decodedPsbt.recommendedFeeRate} sat/vB)`
                                    }
                                    overlayStyle={{
                                        fontSize: fontSizes.xs
                                    }}>
                                    <div>
                                        <Row>
                                            <Text text={txInfo.decodedPsbt.feeRate.toString()} />
                                            <Icon icon="alert" color="warning" />
                                        </Row>
                                    </div>
                                </Tooltip>
                            ) : (
                                <Text text={txInfo.decodedPsbt.feeRate.toString()} />
                            )}

                            <Text text="sat/vB" color="textDim" />
                        </Section>
                    )}

                    <Section title="Features:">
                        <Row>
                            {txInfo.decodedPsbt.rbfEnabled ? (
                                <Text
                                    text="RBF"
                                    color="white"
                                    style={{ backgroundColor: 'green', padding: 5, borderRadius: 5 }}
                                />
                            ) : (
                                <Text
                                    text="RBF"
                                    color="white"
                                    style={{
                                        backgroundColor: '#F55454',
                                        padding: 5,
                                        borderRadius: 5,
                                        textDecoration: 'line-through'
                                    }}
                                />
                            )}
                        </Row>
                    </Section>

                    {isValidData && (
                        <Column gap="xl">
                            <Column>
                                <Text text={`Inputs: (${txInfo.decodedPsbt.inputs.length})`} preset="bold" />
                                <Card>
                                    <Column full justifyCenter>
                                        {txInfo.decodedPsbt.inputs.map((v, index) => {
                                            const isToSign = !!txInfo.toSignInputs.find((v) => v.index === index);
                                            return (
                                                <Row
                                                    key={`output_${index}`}
                                                    style={
                                                        index === 0
                                                            ? {}
                                                            : {
                                                                  borderColor: colors.border,
                                                                  borderTopWidth: 1,
                                                                  paddingTop: 10
                                                              }
                                                    }
                                                    itemsCenter>
                                                    <Column fullX>
                                                        <Row fullX justifyBetween>
                                                            <Column>
                                                                <Row>
                                                                    <AddressText
                                                                        address={v.address}
                                                                        color={isToSign ? 'white' : 'textDim'}
                                                                    />
                                                                    {isToSign && (
                                                                        <Row
                                                                            style={{
                                                                                borderWidth: 1,
                                                                                borderColor: 'gold',
                                                                                borderRadius: 5,
                                                                                padding: 2
                                                                            }}>
                                                                            <Text
                                                                                text="to sign"
                                                                                color="gold"
                                                                                size="xs"
                                                                            />
                                                                        </Row>
                                                                    )}
                                                                </Row>
                                                            </Column>
                                                            <Row>
                                                                <Text
                                                                    text={satoshisToAmount(v.value)}
                                                                    color={isToSign ? 'white' : 'textDim'}
                                                                />
                                                                <Text text={btcUnit} color="textDim" />
                                                            </Row>
                                                        </Row>
                                                    </Column>
                                                </Row>
                                            );
                                        })}
                                    </Column>
                                </Card>
                            </Column>

                            <Column>
                                <Text text={`Outputs: (${txInfo.decodedPsbt.outputs.length})`} preset="bold" />
                                <Card>
                                    <Column full justifyCenter gap="lg">
                                        {txInfo.decodedPsbt.outputs.map((v, index) => {
                                            const isMyAddress = v.address == currentAccount.address;
                                            return (
                                                <Column
                                                    key={`output_${index}`}
                                                    style={
                                                        index === 0
                                                            ? {}
                                                            : {
                                                                  borderColor: colors.border,
                                                                  borderTopWidth: 1,
                                                                  paddingTop: 10
                                                              }
                                                    }>
                                                    <Column>
                                                        <Row justifyBetween>
                                                            <AddressText
                                                                address={v.address}
                                                                color={isMyAddress ? 'white' : 'textDim'}
                                                            />
                                                            <Row>
                                                                <Text
                                                                    text={satoshisToAmount(v.value)}
                                                                    color={isMyAddress ? 'white' : 'textDim'}
                                                                />
                                                                <Text text={btcUnit} color="textDim" />
                                                            </Row>
                                                        </Row>
                                                    </Column>
                                                </Column>
                                            );
                                        })}
                                    </Column>
                                </Card>
                            </Column>
                        </Column>
                    )}

                    <Section title="PSBT Data:">
                        <Text text={shortAddress(txInfo.psbtHex, 10)} />
                        <Row
                            itemsCenter
                            onClick={async () => {
                                await copyToClipboard(txInfo.psbtHex);
                                tools.toastSuccess('Copied');
                            }}>
                            <Text text={`${txInfo.psbtHex.length / 2} bytes`} color="textDim" />
                            <Icon icon="copy" color="textDim" />
                        </Row>
                    </Section>
                </Column>
            </Content>

            <Footer>
                <Row full>
                    <Button preset="default" text="Reject" onClick={handleCancel} full />
                    <Button
                        preset="primary"
                        text={type == TxType.SIGN_TX ? 'Sign' : 'Sign & Pay'}
                        onClick={() => {
                            handleConfirm?.();
                        }}
                        disabled={!isValid}
                        full
                    />
                </Row>
            </Footer>
        </Layout>
    );
}
