import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { Account, OpNetBalance } from '@/shared/types';
import { Button, Column, Content, Header, Layout, Text } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import { FeeRateBar } from '@/ui/components/FeeRateBar';
import { useCurrentAccount } from '@/ui/state/accounts/hooks';
import { useCurrentKeyring } from '@/ui/state/keyrings/hooks';

import { useNavigate } from '../MainRoute';

interface ItemData {
    key: string;
    account?: Account;
}

export default function DeployContractOpnet() {
    const { state } = useLocation();
    const props = state as {
        OpNetBalance: OpNetBalance;
    };

    const account = useCurrentAccount();

    const navigate = useNavigate();
    const [inputAmount, setInputAmount] = useState('');
    const [disabled, setDisabled] = useState(true);
    const [OpnetRateInputVal, adjustFeeRateInput] = useState('5000');
    const [getFile, setFile] = useState<File | null>(null);

    const [error, setError] = useState('');
    const tools = useTools();

    const [file, ç] = useState<File | null>(null);

    const [feeRate, setFeeRate] = useState(5);
    const keyring = useCurrentKeyring();
    const items = useMemo(() => {
        const _items: ItemData[] = keyring.accounts.map((v) => {
            return {
                key: v.address,
                account: v
            };
        });
        return _items;
    }, []);

    useEffect(() => {
        setError('');
        setDisabled(false);
        if (!getFile) {
            setDisabled(true);
        }

        // }
    }, [getFile]);

    return (
        <Layout>
            <Header
                onBack={() => {
                    window.history.go(-1);
                }}
                title={'Deploy Contract'}
            />
            <Content>
                <Text text="Upload Contract" color="textDim" />
                <Text text={getFile?.name} />

                <Column>
                    <Text text="Fee Rate" color="textDim" />
                    <FeeRateBar
                        onChange={(val) => {
                            setFeeRate(val);
                        }}
                    />
                </Column>

                <div
                    style={{
                        border: '2px dashed #ccc',
                        borderRadius: '4px',
                        padding: '20px',
                        textAlign: 'center',
                        cursor: 'pointer'
                    }}
                    onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                    }}
                    onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const files = e.dataTransfer.files;
                        if (files.length > 0 && files[0].name.endsWith('.wasm')) {
                            // Handle the dropped file here
                            setFile(files[0]);
                            console.log(files[0]);
                            console.log('File dropped:', files[0].name);
                        } else {
                            tools.toastError('Please drop a .wasm file');
                        }
                    }}>
                    <input
                        type="file"
                        accept=".wasm"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                            const files = e.target.files;
                            if (files && files.length > 0) {
                                // Handle the selected file here
                                setFile(files[0]);
                                console.log(files[0]);
                                console.log('File selected:', files[0].name);
                            }
                        }}
                        id="fileInput"
                    />
                    <label htmlFor="fileInput" style={{ cursor: 'pointer' }}>
                        <Text text="Click to select or drag and drop a .wasm file here" />
                    </label>
                </div>
                {error && <Text text={error} color="error" />}

                <Button
                    disabled={disabled}
                    preset="primary"
                    text="Deploy"
                    onClick={(e) => {
                        navigate('TxOpnetConfirmScreen', {
                            rawTxInfo: {
                                items: items,
                                account: account, // replace with actual account
                                inputAmount: inputAmount, // replace with actual inputAmount
                                address: '', // replace with actual address
                                feeRate: feeRate, // replace with actual feeRate
                                priorityFee: BigInt(OpnetRateInputVal), // replace with actual OpnetRateInputVal
                                header: 'Deploy Contract', // replace with actual header
                                networkFee: feeRate, // replace with actual networkFee
                                features: {
                                    rbf: false // replace with actual rbf value
                                },
                                automine: true,
                                file: getFile,
                                inputInfos: [], // replace with actual inputInfos
                                isToSign: false, // replace with actual isToSign value
                                opneTokens: [],
                                action: 'deploy' // replace with actual opneTokens
                            }
                        });
                    }}></Button>
            </Content>
        </Layout>
    );
}
