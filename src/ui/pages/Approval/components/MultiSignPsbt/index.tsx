import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { KEYRING_TYPE } from '@/shared/constant';
import { DecodedPsbt, Inscription, SignPsbtOptions, ToSignInput, TxType } from '@/shared/types';
import { Button, Card, Column, Content, Footer, Header, Icon, Layout, Row, Text } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import { Empty } from '@/ui/components/Empty';
import InscriptionPreview from '@/ui/components/InscriptionPreview';
import WebsiteBar from '@/ui/components/WebsiteBar';
import KeystoneSignScreen from '@/ui/pages/Wallet/KeystoneSignScreen';
import { useAccountAddress, useCurrentAccount } from '@/ui/state/accounts/hooks';
import { colors } from '@/ui/theme/colors';
import { fontSizes } from '@/ui/theme/font';
import { satoshisToAmount, shortAddress, useApproval, useWallet } from '@/ui/utils';
import { LoadingOutlined } from '@ant-design/icons';

import SignPsbt from '../SignPsbt';

interface Props {
    header?: React.ReactNode;
    params: {
        data: {
            psbtHexs: string[];
            options: SignPsbtOptions[];
        };
        session?: {
            origin: string;
            icon: string;
            name: string;
        };
    };
    handleCancel?: () => void;
    handleConfirm?: () => void;
}

interface InputInfo {
    txid: string;
    vout: number;
    address: string;
    value: number;
    inscrip;
}

interface OutputInfo {
    address: string;
    value: number;
}

enum TabState {
    DETAILS,
    DATA,
    HEX
}

interface InscriptioinInfo {
    id: string;
    isSent: boolean;
}

function SignTxDetails({ decodedPsbt }: { decodedPsbt: DecodedPsbt }) {
    const inscriptions = useMemo(() => {
        return decodedPsbt.inputInfos.reduce<Inscription[]>((pre, cur) => cur.inscriptions.concat(pre), []);
    }, [decodedPsbt]);

    const address = useAccountAddress();

    const spendSatoshis = useMemo(() => {
        const inValue = decodedPsbt.inputInfos
            .filter((v) => v.address === address)
            .reduce((pre, cur) => cur.value + pre, 0);
        const outValue = decodedPsbt.outputInfos
            .filter((v) => v.address === address)
            .reduce((pre, cur) => cur.value + pre, 0);
        const spend = inValue - outValue;
        return spend;
    }, [decodedPsbt]);

    const spendAmount = useMemo(() => satoshisToAmount(spendSatoshis), [spendSatoshis]);

    const outputValueSaotoshis = useMemo(
        () => inscriptions.reduce((pre, cur) => pre + cur.outputValue, 0),
        [inscriptions]
    );
    const outputValueAmount = useMemo(() => satoshisToAmount(outputValueSaotoshis), [outputValueSaotoshis]);
    return (
        <Column gap="lg">
            <Text text="Sign Transaction" preset="title-bold" textCenter mt="lg" />
            <Row justifyCenter>
                <Card style={{ backgroundColor: '#272626', maxWidth: 320, width: 320 }}>
                    <Column gap="lg">
                        <Column>
                            {inscriptions.length > 0 && (
                                <Column justifyCenter>
                                    <Text
                                        text={
                                            inscriptions.length === 1
                                                ? 'Spend Inscription'
                                                : `Spend Inscription (${inscriptions.length})`
                                        }
                                        textCenter
                                        color="textDim"
                                    />
                                    <Row overflowX gap="lg" justifyCenter style={{ width: 280 }} pb="lg">
                                        {inscriptions.map((v) => (
                                            <InscriptionPreview key={v.inscriptionId} data={v} preset="small" />
                                        ))}
                                    </Row>
                                </Column>
                            )}
                            {inscriptions.length > 0 && (
                                <Row style={{ borderTopWidth: 1, borderColor: colors.border }} my="md" />
                            )}

                            <Column>
                                <Text text={'Spend Amount'} textCenter color="textDim" />

                                <Column justifyCenter>
                                    <Text text={spendAmount} color="white" preset="bold" textCenter size="xxl" />
                                    {outputValueSaotoshis > 0 && (
                                        <Text text={`${outputValueAmount} (in inscriptions)`} preset="sub" textCenter />
                                    )}
                                </Column>
                            </Column>
                        </Column>
                    </Column>
                </Card>
            </Row>
        </Column>
    );
}

function Section({ title, children }: { title: string; children?: React.ReactNode }) {
    return (
        <Column>
            <Text text={title} preset="bold" />
            <Card>
                <Row full justifyBetween itemsCenter>
                    {children}
                </Row>
            </Card>
        </Column>
    );
}

enum SignState {
    PENDING,
    SUCCESS,
    FAILED
}

// keystone
interface TxInfo {
    psbtHexs: string[];
    txError: string;
    decodedPsbts: DecodedPsbt[];
    toSignInputsArray: ToSignInput[][];
    currentIndex: number;
}

const initTxInfo: TxInfo = {
    psbtHexs: [],
    txError: '',
    decodedPsbts: [],
    toSignInputsArray: [],
    currentIndex: 0
};

export default function MultiSignPsbt({
    params: {
        data: { psbtHexs, options },
        session
    },
    header,
    handleCancel,
    handleConfirm
}: Props) {
    const [getApproval, resolveApproval, rejectApproval] = useApproval();
    const [txInfo, setTxInfo] = useState<TxInfo>(initTxInfo);
    const [loading, setLoading] = useState(true);
    const [viewingPsbtIndex, setViewingPsbtIndex] = useState(-1);
    const [signStates, setSignStates] = useState<SignState[]>(new Array(psbtHexs.length).fill(SignState.PENDING));

    // keystone sign
    const wallet = useWallet();
    const tools = useTools();
    const currentAccount = useCurrentAccount();
    const [isKeystoneSigning, setIsKeystoneSigning] = useState(false);
    const [isWarningVisible, setIsWarningVisible] = useState(false);
    const [signIndex, setSignIndex] = useState(0);

    const init = async () => {
        // keystone
        let txError = '';
        const decodedPsbts: DecodedPsbt[] = [];
        for (let i = 0; i < psbtHexs.length; i++) {
            const psbtHex = psbtHexs[i];
            const decodedPsbt = await wallet.decodePsbt(psbtHex, session?.origin || '');
            decodedPsbts.push(decodedPsbt);
            if (decodedPsbt.risks.length > 0) {
                setIsWarningVisible(true);
            }
        }
        const toSignInputsArray: ToSignInput[][] = [];
        try {
            for (let i = 0; i < psbtHexs.length; i++) {
                const toSignInputs = await wallet.formatOptionsToSignInputs(psbtHexs[i], options[i]);
                toSignInputsArray.push(toSignInputs);
            }
        } catch (e) {
            console.error(e);
            txError = (e as Error).message;
            tools.toastError(txError);
        }

        setTxInfo({
            decodedPsbts,
            psbtHexs,
            toSignInputsArray,
            txError,
            currentIndex: 0
        });
        setLoading(false);
    };

    useEffect(() => {
        init();
    }, []);

    const updateTxInfo = useCallback(
        (params: { currentIndex?: number }) => {
            setTxInfo(Object.assign({}, txInfo, params));
        },
        [txInfo, setTxInfo]
    );
    // keystone
    if (!handleCancel) {
        handleCancel = () => {
            if (txInfo.currentIndex > 0) {
                updateTxInfo({
                    currentIndex: txInfo.currentIndex - 1
                });
                return;
            }
            rejectApproval();
        };
    }

    if (!handleConfirm) {
        handleConfirm = () => {
            resolveApproval({
                psbtHexs: txInfo.psbtHexs
            });
        };
    }

    const originalHandleConfirm = handleConfirm;
    if (currentAccount.type === KEYRING_TYPE.KeystoneKeyring) {
        handleConfirm = () => {
            setIsKeystoneSigning(true);
        };
    }

    const decodedPsbt = useMemo(() => txInfo.decodedPsbts[txInfo.currentIndex], [txInfo]);
    const psbtHex = useMemo(() => txInfo.psbtHexs[txInfo.currentIndex], [txInfo]);
    const toSignInputs = useMemo(() => txInfo.toSignInputsArray[txInfo.currentIndex], [txInfo]);

    const networkFee = useMemo(() => (decodedPsbt ? satoshisToAmount(decodedPsbt.fee) : 0), [decodedPsbt]);
    const detailsComponent = useMemo(() => {
        if (decodedPsbt) {
            return <SignTxDetails decodedPsbt={decodedPsbt} />;
        } else {
            return <Empty />;
        }
    }, [decodedPsbt]);

    const isValidData = useMemo(() => {
        if (psbtHex === '') {
            return false;
        }
        return true;
    }, [psbtHex]);

    const isValid = useMemo(() => {
        if (decodedPsbt && decodedPsbt.inputInfos.length == 0) {
            return false;
        }
        if (!toSignInputs || toSignInputs.length == 0) {
            return false;
        }
        return true;
    }, [decodedPsbt, toSignInputs]);

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

    if (!decodedPsbt) {
        return <Empty />;
    }

    if (!header && session) {
        header = (
            <Header>
                <WebsiteBar session={session} />
            </Header>
        );
    }

    if (viewingPsbtIndex >= 0 && txInfo.psbtHexs) {
        return (
            <>
                <SignPsbt
                    header={
                        <Header
                            onBack={() => {
                                setViewingPsbtIndex(-1);
                            }}
                        />
                    }
                    params={{
                        data: {
                            psbtHex: txInfo.psbtHexs[viewingPsbtIndex],
                            type: TxType.SIGN_TX,
                            options: options ? options[viewingPsbtIndex] : { autoFinalized: false }
                        }
                    }}
                    handleCancel={() => {
                        setViewingPsbtIndex(-1);
                        signStates[viewingPsbtIndex] = SignState.FAILED;
                        setSignStates(signStates);
                    }}
                    handleConfirm={() => {
                        setViewingPsbtIndex(-1);
                        signStates[viewingPsbtIndex] = SignState.SUCCESS;
                        setSignStates(signStates);
                    }}
                />
            </>
        );
    }

    const signedCount = signStates.filter((v) => v === SignState.SUCCESS).length;
    const isAllSigned = signedCount === txInfo.psbtHexs.length;

    // keystone
    const count = txInfo.psbtHexs.length;
    const arr: { label: string; key: number }[] = [];
    for (let i = 0; i < count; i++) {
        arr.push({
            label: `${i + 1}`,
            key: i
        });
    }
    const tabItems = arr;

    if (isKeystoneSigning) {
        return (
            <KeystoneSignScreen
                type="psbt"
                data={txInfo.psbtHexs[signIndex]}
                isFinalize={false}
                signatureText={`Get Signature (${signIndex + 1}/${count})`}
                id={signIndex}
                onSuccess={(data) => {
                    txInfo.psbtHexs[signIndex] = data.psbtHex || '';
                    if (signIndex === txInfo.psbtHexs.length - 1) {
                        setIsKeystoneSigning(false);
                        originalHandleConfirm();
                    } else {
                        tools.toastSuccess(`Get Signature Success (${signIndex + 1}/${count})`);
                        setTimeout(() => {
                            setSignIndex(signIndex + 1);
                        }, 1000);
                    }
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
                <Text text={'Sign Multiple Transactions'} preset="title-bold" textCenter mt="lg" />
                <Column>
                    {txInfo.psbtHexs.map((v, index) => {
                        const signState = signStates[index];
                        let text = 'View';
                        if (signState == SignState.PENDING) {
                            text = 'View';
                        } else if (signState == SignState.SUCCESS) {
                            text = 'Signed';
                        } else if (signState == SignState.FAILED) {
                            text = 'Rejected';
                        }

                        let preset = 'primary';
                        if (signState === SignState.SUCCESS) {
                            preset = 'approval';
                        } else if (signState === SignState.FAILED) {
                            preset = 'danger';
                        }
                        return (
                            <Card key={index}>
                                <Row justifyBetween fullX>
                                    <Column>
                                        <Text text={`Transaction ${index + 1}`} preset="bold" />
                                        <Text text={shortAddress(v, 10)} wrap />
                                    </Column>
                                    <Column>
                                        <Button
                                            preset={preset as any}
                                            textStyle={{ fontSize: fontSizes.sm }}
                                            text={text}
                                            onClick={() => {
                                                setViewingPsbtIndex(index);
                                            }}
                                            style={{ width: 80, height: 25 }}
                                        />
                                    </Column>
                                </Row>
                            </Card>
                        );
                    })}
                </Column>
            </Content>

            <Footer>
                <Row full>
                    <Button preset="default" text={'Reject All'} onClick={handleCancel} full />
                    <Button
                        preset="primary"
                        text={isAllSigned ? 'Submit' : `(${signedCount}/${txInfo.psbtHexs.length}) Signed`}
                        onClick={handleConfirm}
                        full
                        disabled={isAllSigned == false}
                    />
                </Row>
            </Footer>
        </Layout>
    );
}
