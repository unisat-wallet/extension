import { useEffect, useState } from 'react';

import { ParsedSignMsgUr, ParsedSignPsbtUr } from '@/shared/types';
import { isWalletError } from '@/shared/utils/errors';
import { Button, Column, Content, Footer, Header, Layout, Row, Text } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import KeystoneDisplay from '@/ui/components/Keystone/Display';
import KeystoneLogoWithText from '@/ui/components/Keystone/LogoWithText';
import KeystoneScan from '@/ui/components/Keystone/Scan';
import { $textPresets } from '@/ui/components/Text';
import { colors } from '@/ui/theme/colors';
import { useWallet } from '@/ui/utils';

interface BaseProps {
    data: string;
    isFinalize?: boolean;
    signatureText?: string;
    id?: number;
    onBack: () => void;
}

interface MsgProps extends BaseProps {
    type: 'msg' | 'bip322-simple';
    onSuccess?: (data: ParsedSignMsgUr) => void;
}

interface PsbtProps extends BaseProps {
    type: 'psbt';
    onSuccess?: (data: ParsedSignPsbtUr) => void;
}

type Props = MsgProps | PsbtProps;

function Step1(props: Props) {
    const wallet = useWallet();
    const [ur, setUr] = useState({
        type: '',
        cbor: ''
    });
    const tools = useTools();

    useEffect(() => {
        const p =
            props.type === 'psbt' ? wallet.genSignPsbtUr(props.data) : wallet.genSignMsgUr(props.data, props.type);
        p.then((ur) => {
            setUr(ur);
        }).catch((err: unknown) => {
            console.error(err);
            if (isWalletError(err)){
                tools.toastError(err.message);
            } else {
                tools.toastError("An unexpected error occurred.");
            }
        });
    }, [props]);

    return (
        <Column itemsCenter gap="xl" style={{ maxWidth: 306 }}>
            <KeystoneLogoWithText width={160} height={38} />
            <Text text="Scan the QR code via your Keystone device" preset="title" textCenter />
            <KeystoneDisplay type={ur.type} cbor={ur.cbor} />
            <div style={{ ...$textPresets.sub, textAlign: 'center' }}>
                Click on the <span style={{ color: colors.primary }}>&#39;Get Signature&#39;</span> button after signing
                the transaction with your Keystone device.
            </div>
        </Column>
    );
}

function Step2(props: Props) {
    const wallet = useWallet();

    const onSucceed = async ({ type, cbor }: {type: string; cbor: string}) => {
        if (props.type === 'psbt') {
            const res = await wallet.parseSignPsbtUr(type, cbor, props.isFinalize === false ? false : true);
            if (props.onSuccess) {
                props.onSuccess(res);
            } else {
                throw new Error('onSuccess Not implemented');
            }
        } else {
            const res = await wallet.parseSignMsgUr(type, cbor, props.type);
            if (props.onSuccess) {
                props.onSuccess(res);
            } else {
                throw new Error('onSuccess Not implemented');
            }
        }
    };
    return (
        <Column itemsCenter gap="xl" style={{ maxWidth: 306 }}>
            <KeystoneLogoWithText width={160} height={38} />
            <Text text="Scan the QR code displayed on your Keystone device" preset="title" textCenter />
            <KeystoneScan onSucceed={onSucceed} size={250} />
            <Text
                text="Position the QR code in front of your camera. The screen is blurred but this will not affect the scan."
                textCenter
                preset="sub"
            />
        </Column>
    );
}

export default function KeystoneSignScreen(props: Props) {
    const [step, setStep] = useState(1);

    useEffect(() => {
        setStep(1);
    }, [props.id]);

    return (
        <Layout>
            <Header
                onBack={() => {
                    if (step === 1) {
                        window.history.go(-1);
                    } else {
                        setStep(1);
                    }
                }}
            />
            <Content itemsCenter>
                {step === 1 && <Step1 {...props} />}
                {step === 2 && <Step2 {...props} />}
            </Content>
            {step === 1 && (
                <Footer>
                    <Row full>
                        <Button preset="default" full text="Reject" onClick={props.onBack} />
                        <Button
                            preset="primary"
                            full
                            text={props.signatureText ?? 'Get Signature'}
                            onClick={() => setStep(2)}
                        />
                    </Row>
                </Footer>
            )}
        </Layout>
    );
}
