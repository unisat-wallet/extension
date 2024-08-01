import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { Inscription, RawTxInfo } from '@/shared/types';
import { Button, Column, Content, Header, Layout, Row, Text } from '@/ui/components';
import { FeeRateBar } from '@/ui/components/FeeRateBar';
import InscriptionPreview from '@/ui/components/InscriptionPreview';
import { OutputValueBar } from '@/ui/components/OutputValueBar';
import { RBFBar } from '@/ui/components/RBFBar';
import { useCurrentAccount } from '@/ui/state/accounts/hooks';
import { useCreateSplitTxCallback, useOrdinalsTx } from '@/ui/state/transactions/hooks';
import { useWallet } from '@/ui/utils';
import { getAddressUtxoDust } from '@unisat/wallet-sdk/lib/transaction';

import { useNavigate } from '../MainRoute';

export default function SplitOrdinalsInscriptionScreen() {
    const [disabled, setDisabled] = useState(true);
    const navigate = useNavigate();

    const { state } = useLocation();
    const { inscription } = state as {
        inscription: Inscription;
    };
    const ordinalsTx = useOrdinalsTx();

    const [error, setError] = useState('');
    const createSplitTx = useCreateSplitTxCallback();

    const [feeRate, setFeeRate] = useState(5);
    const [enableRBF, setEnableRBF] = useState(false);
    const defaultOutputValue = inscription ? inscription.outputValue : 10000;

    const account = useCurrentAccount();
    const minOutputValue = getAddressUtxoDust(account.address);
    const [outputValue, setOutputValue] = useState(defaultOutputValue);

    const [rawTxInfo, setRawTxInfo] = useState<RawTxInfo>();

    const [inscriptions, setInscriptions] = useState<Inscription[]>([]);

    const [splitedCount, setSplitedCount] = useState(0);
    const wallet = useWallet();
    useEffect(() => {
        wallet.getInscriptionUtxoDetail(inscription.inscriptionId).then((v) => {
            setInscriptions(v.inscriptions);
        });
    }, []);

    useEffect(() => {
        setDisabled(true);
        setError('');
        setSplitedCount(0);

        if (feeRate <= 0) {
            setError('Invalid fee rate');
            return;
        }

        if (!outputValue) {
            return;
        }

        if (outputValue < minOutputValue) {
            setError(`OutputValue must be at least ${minOutputValue}`);
            return;
        }

        if (
            feeRate == ordinalsTx.feeRate &&
            outputValue == ordinalsTx.outputValue &&
            enableRBF == ordinalsTx.enableRBF
        ) {
            //Prevent repeated triggering caused by setAmount
            setDisabled(false);
            return;
        }

        createSplitTx({ inscriptionId: inscription.inscriptionId, feeRate, outputValue, enableRBF })
            .then((data) => {
                setRawTxInfo(data.rawTxInfo);
                setSplitedCount(data.splitedCount);
                setDisabled(false);
            })
            .catch((e) => {
                console.log(e);
                setError(e.message);
            });
    }, [feeRate, outputValue, enableRBF]);

    return (
        <Layout>
            <Header
                onBack={() => {
                    window.history.go(-1);
                }}
                title="Split Inscriptions"
            />
            <Content>
                <Text
                    color="red"
                    textCenter
                    text={
                        'This feature is currently under experimentation. Please confirm the inscription splitting status of the transaction when signing the transaction.'
                    }
                />
                <Column>
                    <Text text={`Inscriptions (${inscriptions.length})`} color="textDim" />
                    <Row justifyBetween>
                        <Row overflowX gap="lg" pb="md">
                            {inscriptions.map((v) => (
                                <InscriptionPreview key={v.inscriptionId} data={v} preset="small" />
                            ))}
                        </Row>
                    </Row>

                    <Text text="Each OutputValue" color="textDim" />

                    <OutputValueBar
                        defaultValue={minOutputValue}
                        minValue={minOutputValue}
                        onChange={(val) => {
                            setOutputValue(val);
                        }}
                    />
                    <Column mt="lg">
                        <Text text="Fee" color="textDim" />
                        <FeeRateBar
                            onChange={(val) => {
                                setFeeRate(val);
                            }}
                        />
                    </Column>

                    <Column mt="lg">
                        <RBFBar
                            onChange={(val) => {
                                setEnableRBF(val);
                            }}
                        />
                    </Column>

                    {error && <Text text={error} color="error" />}

                    {inscriptions.length > 1 && splitedCount > 0 && (
                        <Text text={`Spliting to ${splitedCount} UTXO`} color="primary" />
                    )}

                    <Button
                        disabled={disabled}
                        preset="primary"
                        text="Next"
                        onClick={(e) => {
                            navigate('SignOrdinalsTransactionScreen', { rawTxInfo });
                        }}
                    />
                </Column>
            </Content>
        </Layout>
    );
}
