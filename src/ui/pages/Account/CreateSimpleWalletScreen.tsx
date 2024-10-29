import { ECPairFactory } from 'ecpair';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { ADDRESS_TYPES } from '@/shared/constant';
import { AddressAssets, AddressType } from '@/shared/types';
import { getBitcoinLibJSNetwork } from '@/shared/web3/Web3API';
import { Button, Column, Content, Header, Input, Layout, Row, Text } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import { AddressTypeCard } from '@/ui/components/AddressTypeCard';
import { FooterButtonContainer } from '@/ui/components/FooterButtonContainer';
import { TabBar } from '@/ui/components/TabBar';
import { satoshisToAmount, useWallet } from '@/ui/utils';
import * as ecc from '@bitcoinerlab/secp256k1';
import { EcKeyPair, Wallet } from '@btc-vision/transaction';

import { RouteTypes, useNavigate } from '../MainRoute';


const ECPair = ECPairFactory(ecc);

/*const _res = await wallet.createTmpKeyringWithPrivateKey(wif, AddressType.P2TR);
if (_res.accounts.length == 0) {
    throw new Error('Invalid PrivateKey');
}*/

/*const address = Wallet.fromWif(contextData.wif, bitcoinNetwork); //keyring.accounts[0].address;
if (!address.p2tr) {
    throw new Error('Invalid PrivateKey');
}*/

function Step1({
    updateContextData
}: {
    contextData: ContextData;
    updateContextData: (params: UpdateContextDataParams) => void;
}) {
    const [wif, setWif] = useState('');
    const [disabled, setDisabled] = useState(true);
    const wallet = useWallet();
    useEffect(() => {
        setDisabled(true);

        if (!wif) {
            return;
        }

        setDisabled(false);
    }, [wif]);

    const onChange = (e) => {
        const val = e.target.value;
        setWif(val);
        updateContextData({ step1Completed: val });
    };

    const tools = useTools();

    const btnClick = async () => {
        const network = await wallet.getNetworkType();
        const bitcoinNetwork = getBitcoinLibJSNetwork(network);

        let validWIF: boolean = false;
        let validPrivateKey: boolean = false;
        try {
            ECPair.fromWIF(wif, bitcoinNetwork);
            validWIF = true;
        } catch {}

        try {
            ECPair.fromPrivateKey(Buffer.from(wif.replace('0x', ''), 'hex'), { network: bitcoinNetwork });
            validPrivateKey = true;
        } catch {}

        if (!validWIF && !validPrivateKey) {
            tools.toastError(`Invalid wif/private key (Are you on the right network?)`);
            return;
        }

        updateContextData({
            wif,
            tabType: TabType.STEP2
        });
    };

    return (
        <Column gap="lg">
            <Text text="Private Key" textCenter preset="bold" />

            <Input
                placeholder={'WIF Private Key or Hex Private Key'}
                onKeyUp={(e: React.KeyboardEvent<HTMLInputElement>) => {
                    if ('Enter' == e.key) {
                        void btnClick();
                    }
                }}
                onChange={onChange}
                autoFocus={true}
            />
            <FooterButtonContainer>
                <Button disabled={disabled} text="Continue" preset="primary" onClick={btnClick} />
            </FooterButtonContainer>
        </Column>
    );
}

function Step2({
    contextData,
    updateContextData
}: {
    contextData: ContextData;
    updateContextData: (params: UpdateContextDataParams) => void;
}) {
    const wallet = useWallet();
    const tools = useTools();

    const hdPathOptions = useMemo(() => {
        return ADDRESS_TYPES.filter((v) => {
            if (v.displayIndex < 0) {
                return false;
            }
            return !v.isUnisatLegacy;
        })
            .sort((a, b) => a.displayIndex - b.displayIndex)
            .map((v) => {
                return {
                    label: v.name,
                    hdPath: v.hdPath,
                    addressType: v.value,
                    isUnisatLegacy: v.isUnisatLegacy
                };
            });
    }, [contextData]);

    const [previewAddresses, setPreviewAddresses] = useState<string[]>(hdPathOptions.map((v) => ''));
    const [addressAssets, setAddressAssets] = useState<Record<string, AddressAssets>>({});

    const selfRef = useRef({
        maxSatoshis: 0,
        recommended: 0,
        count: 0,
        addressBalances: {}
    });

    const self = selfRef.current;
    const run = async () => {
        const addresses: string[] = [];
        const network = await wallet.getNetworkType();
        const bitcoinNetwork = getBitcoinLibJSNetwork(network);

        for (const options of hdPathOptions) {
            try {
                const address = Wallet.fromWif(contextData.wif, bitcoinNetwork);

                if (options.addressType == AddressType.P2TR) {
                    addresses.push(address.p2tr);
                } else if (options.addressType == AddressType.P2SH_P2WPKH) {
                    addresses.push(address.segwitLegacy);
                } else if (options.addressType == AddressType.P2WPKH) {
                    addresses.push(address.p2wpkh);
                } else {
                    addresses.push(
                        EcKeyPair.getLegacyAddress(ECPair.fromWIF(contextData.wif, bitcoinNetwork), bitcoinNetwork)
                    );
                }
            } catch (e) {}

            try {
                const bufferPrivateKey = Buffer.from(contextData.wif.replace('0x', ''), 'hex');
                const keypair = EcKeyPair.fromPrivateKey(bufferPrivateKey, bitcoinNetwork);

                if (options.addressType == AddressType.P2TR) {
                    addresses.push(EcKeyPair.getTaprootAddress(keypair, bitcoinNetwork));
                } else if (options.addressType == AddressType.P2SH_P2WPKH) {
                    addresses.push(EcKeyPair.getLegacySegwitAddress(keypair, bitcoinNetwork));
                } else if (options.addressType == AddressType.P2WPKH) {
                    addresses.push(EcKeyPair.getP2WPKHAddress(keypair, bitcoinNetwork));
                } else {
                    addresses.push(EcKeyPair.getLegacyAddress(keypair, bitcoinNetwork));
                }
            } catch (e) {}
        }

        const balances = await wallet.getMultiAddressAssets(addresses.join(','));
        for (let i = 0; i < addresses.length; i++) {
            const address = addresses[i];

            const balance = balances[i];
            const satoshis = balance.totalSatoshis;
            self.addressBalances[address] = {
                total_btc: satoshisToAmount(balance.totalSatoshis),
                satoshis
            };

            if (satoshis > self.maxSatoshis) {
                self.maxSatoshis = satoshis;
                self.recommended = i;
            }
        }

        let recommended: AddressType = hdPathOptions[self.recommended].addressType;
        if (self.maxSatoshis == 0) {
            recommended = AddressType.P2TR;
        }

        updateContextData({ addressType: recommended });

        setAddressAssets(self.addressBalances);
        setPreviewAddresses(addresses);
    };

    useEffect(() => {
        void run();
    }, [contextData.wif]);

    const pathIndex = useMemo(() => {
        return hdPathOptions.findIndex((v) => v.addressType === contextData.addressType);
    }, [hdPathOptions, contextData.addressType]);

    const navigate = useNavigate();

    const onNext = async () => {
        try {
            await wallet.createKeyringWithPrivateKey(contextData.wif, contextData.addressType);
            navigate(RouteTypes.MainScreen);
        } catch (e) {
            tools.toastError((e as Error).message);
        }
    };
    return (
        <Column gap="lg">
            <Text text="Address Type" preset="bold" />

            {hdPathOptions.map((item, index) => {
                const address = previewAddresses[index];
                const assets = addressAssets[address] || {
                    total_btc: '--',
                    satoshis: 0
                };

                const hasVault = assets.satoshis > 0;
                if (item.isUnisatLegacy && !hasVault) {
                    return null;
                }
                return (
                    <AddressTypeCard
                        key={index}
                        label={`${item.label}`}
                        address={address}
                        assets={assets}
                        checked={index == pathIndex}
                        onClick={() => {
                            updateContextData({ addressType: item.addressType });
                        }}
                    />
                );
            })}

            <FooterButtonContainer>
                <Button text="Continue" preset="primary" onClick={onNext} />
            </FooterButtonContainer>
        </Column>
    );
}

enum TabType {
    STEP1 = 'STEP1',
    STEP2 = 'STEP2',
    STEP3 = 'STEP3'
}

interface ContextData {
    wif: string;
    addressType: AddressType;
    step1Completed: boolean;
    tabType: TabType;
}

interface UpdateContextDataParams {
    wif?: string;
    addressType?: AddressType;
    step1Completed?: boolean;
    tabType?: TabType;
}

export default function CreateSimpleWalletScreen() {
    const [contextData, setContextData] = useState<ContextData>({
        wif: '',
        addressType: AddressType.P2WPKH,
        step1Completed: false,
        tabType: TabType.STEP1
    });

    const updateContextData = useCallback(
        (params: UpdateContextDataParams) => {
            setContextData(Object.assign({}, contextData, params));
        },
        [contextData, setContextData]
    );

    const items = [
        {
            key: TabType.STEP1,
            label: 'Step 1',
            children: <Step1 contextData={contextData} updateContextData={updateContextData} />
        },
        {
            key: TabType.STEP2,
            label: 'Step 2',
            children: <Step2 contextData={contextData} updateContextData={updateContextData} />
        }
    ];

    const renderChildren = items.find((v) => v.key == contextData.tabType)?.children;

    return (
        <Layout>
            <Header
                onBack={() => {
                    window.history.go(-1);
                }}
                title="Create Single Wallet"
            />
            <Content>
                <Row justifyCenter>
                    <TabBar
                        progressEnabled
                        defaultActiveKey={TabType.STEP1}
                        items={items}
                        activeKey={contextData.tabType}
                        onTabClick={(key) => {
                            const toTabType = key as TabType;
                            if (toTabType === TabType.STEP2) {
                                if (!contextData.step1Completed) {
                                    setTimeout(() => {
                                        updateContextData({ tabType: contextData.tabType });
                                    }, 200);
                                    return;
                                }
                            }
                            updateContextData({ tabType: toTabType });
                        }}
                    />
                </Row>

                {renderChildren}
            </Content>
        </Layout>
    );
}
