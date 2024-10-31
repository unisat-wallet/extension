import bitcore from 'bitcore-lib';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { ADDRESS_TYPES } from '@/shared/constant';
import { Button, Card, Column, Content, Footer, Header, Input, Layout, Row, Text } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import { AddressTypeCard2 } from '@/ui/components/AddressTypeCard';
import KeystoneLogo from '@/ui/components/Keystone/Logo';
import KeystoneLogoWithText from '@/ui/components/Keystone/LogoWithText';
import KeystonePopover from '@/ui/components/Keystone/Popover';
import KeystoneScan from '@/ui/components/Keystone/Scan';
import KeystoneProductImg from '@/ui/components/Keystone/imgs/keystone-product.png';
import { useImportAccountsFromKeystoneCallback } from '@/ui/state/global/hooks';
import { colors } from '@/ui/theme/colors';
import { useWallet } from '@/ui/utils';
import { ScanOutlined } from '@ant-design/icons';
import { AddressType } from '@btc-vision/wallet-sdk';

import { isWalletError } from '@/shared/utils/errors';
import { RouteTypes, useNavigate } from '../MainRoute';

interface ContextData {
    ur: {
        type: string;
        cbor: string;
    };
    passphrase: string;
    customHdPath: string;
}

function Step1({ onNext }) {
    const { state } = useLocation();
    const navigate = useNavigate();

    const onBack = useCallback(() => {
        if (state && state.fromUnlock) {
            return navigate(RouteTypes.WelcomeScreen);
        }
        window.history.go(-1);
    }, []);

    return (
        <Layout>
            <Header title="Connect Keystone" onBack={window.history.length === 1 ? undefined : onBack} />
            <Content style={{ marginTop: '24px' }}>
                <Column
                    style={{
                        background: 'linear-gradient(270deg, rgba(4, 5, 7, 0.00) 0.06%, #040507 8.94%)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                    <img
                        src={KeystoneProductImg}
                        style={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            bottom: 0,
                            width: 'auto',
                            height: '100%',
                            zIndex: 1
                        }}
                    />
                    <Column
                        justifyCenter
                        style={{
                            padding: '72px 64px',
                            gap: '24px',
                            position: 'relative',
                            zIndex: 2,
                            width: '50%'
                        }}>
                        <KeystoneLogo width={64} height={64} />
                        <Text text="Keystone hardware wallet" preset="title" />
                        <Text
                            text="The Ultimate Security Solution for Cryptocurrencies"
                            preset="sub"
                            style={{
                                marginBottom: '40px'
                            }}
                        />
                        <Card>100% Air-Gapped</Card>
                        <Card>Open-source</Card>
                        <Card>Exceptional Compatibility</Card>
                        <Row justifyCenter>
                            <a href="https://keyst.one/" target="_blank" rel="noreferrer">
                                Learn more about Keystone
                            </a>
                        </Row>
                    </Column>
                </Column>
                <Button preset="primary" style={{ color: colors.black, marginTop: '24px' }} onClick={onNext}>
                    <ScanOutlined style={{ marginRight: '8px' }} />
                    <Text text="Scan to connect" color="black" />
                </Button>
            </Content>
        </Layout>
    );
}

function Step2({ onBack, onNext }) {
    const onSucceed = useCallback(
        ({ type, cbor }) => {
            onNext({ type, cbor });
        },
        [onNext]
    );
    return (
        <Layout>
            <Header title="Scan the QR Code" onBack={onBack} />
            <Content>
                <Column justifyCenter itemsCenter gap="xxl">
                    <KeystoneLogoWithText width={160} />
                    <Text text="Scan the QR code displayed on your Keystone device" />
                    <KeystoneScan onSucceed={onSucceed} size={360} />
                    <Text text="You need to allow camera access to use this feature." preset="sub" />
                </Column>
            </Content>
        </Layout>
    );
}

function Step3({
    onBack,
    contextData,
    updateContextData
}: {
    contextData: ContextData;
    updateContextData: (data: ContextData) => void;
    onBack: () => void;
}) {
    const importAccounts = useImportAccountsFromKeystoneCallback();
    const navigate = useNavigate();
    const wallet = useWallet();
    const tools = useTools();
    const [addressType, setAddressType] = useState(AddressType.P2WPKH);
    const addressTypes = useMemo(() => {
        return ADDRESS_TYPES.filter((item) => item.displayIndex < 4).sort((a, b) => a.displayIndex - b.displayIndex);
    }, []);

    const [groups, setGroups] = useState<
        { type: AddressType; address_arr: string[]; pubkey_arr: string[]; satoshis_arr: number[] }[]
    >([]);
    const [isScanned, setScanned] = useState(false);
    const [error, setError] = useState('');
    const [pathText, setPathText] = useState(contextData.customHdPath);
    const [pathError, setPathError] = useState('');

    const onConfirm = async () => {
        try {
            if (isScanned) {
                const filteredPubkeys: string[] = [];
                groups.forEach((group) => {
                    if (group.type === addressType) {
                        filteredPubkeys.push(...group.pubkey_arr);
                    }
                });
                const accountCount = filteredPubkeys.length === 0 ? 1 : 10;
                await wallet.getKeyrings();
                await importAccounts(
                    contextData.ur.type,
                    contextData.ur.cbor,
                    addressType,
                    accountCount,
                    contextData.customHdPath,
                    filteredPubkeys
                );
            } else {
                await wallet.getKeyrings();
                await importAccounts(
                    contextData.ur.type,
                    contextData.ur.cbor,
                    addressType,
                    1,
                    contextData.customHdPath
                );
            }
        } catch (e) {
            if (isWalletError(e)) {
                setError(e.message);
            } else {
                setError("An unexpected error occurred.");
                console.error("Non-WalletError caught: ", e);
            }
            return;
        }
        wallet.setShowSafeNotice(true);
        navigate(RouteTypes.MainScreen);
    };

    useEffect(() => {
        scanVaultAddress(1);
    }, []);
    useEffect(() => {
        if (contextData.customHdPath.length >= 13) {
            scanVaultAddress(1);
            setScanned(false);
        }
    }, [contextData.customHdPath]);

    const scanVaultAddress = async (accountCount = 1, isScanned = false) => {
        tools.showLoading(true);
        setGroups([]);
        try {
            let groups: { type: AddressType; address_arr: string[]; pubkey_arr: string[]; satoshis_arr: number[] }[] =
                [];
            let groups2: { type: AddressType; address_arr: string[]; pubkey_arr: string[]; satoshis_arr: number[] }[] =
                [];
            for (let i = 0; i < addressTypes.length; i++) {
                const keyring = await wallet.createTmpKeyringWithKeystone(
                    contextData.ur.type,
                    contextData.ur.cbor,
                    addressTypes[i].value,
                    contextData.customHdPath,
                    accountCount
                );
                groups.push({
                    type: addressTypes[i].value,
                    address_arr: keyring.accounts.map((item) => item.address),
                    pubkey_arr: keyring.accounts.map((item) => item.pubkey),
                    satoshis_arr: keyring.accounts.map(() => 0)
                });
            }
            groups2 = groups;
            const res = await wallet.findGroupAssets(groups);
            res.forEach((item, index) => {
                if (item.address_arr.length === 0) {
                    res[index].address_arr = groups[index].address_arr;
                    res[index].satoshis_arr = groups[index].satoshis_arr;
                    res[index].pubkey_arr = groups[index].pubkey_arr;
                }
            });
            if (isScanned) {
                groups = res;
            } else {
                groups = res.length > 0 ? res : groups;
            }
            //   groups = res.length > 0 ? res : groups;

            groups.forEach((group, index) => {
                const group2 = groups2[index];
                group.pubkey_arr = [];
                group.address_arr.forEach((address) => {
                    const pubkey = group2.pubkey_arr[group2.address_arr.indexOf(address)];
                    if (pubkey !== null && pubkey !== undefined) {
                        group.pubkey_arr.push(pubkey);
                    }
                });
            });

            // only the  customsan path is not empty and click thie scan button , then only show the custom path address type
            if (
                contextData.customHdPath !== null &&
                contextData.customHdPath !== '' &&
                contextData.customHdPath.length >= 13 &&
                isScanned
            ) {
                const saveAddressType = contextData.customHdPath.split('/')[1];
                // find address type index by hdpath contains the saveAddressType
                const saveAddressTypeIndex = addressTypes.findIndex((v) => v.hdPath.includes(saveAddressType));
                // remove the groups which is not equal to saveAddressType
                groups = groups.filter((v) => v.type === saveAddressTypeIndex);
            }

            // if res is empty and groups is empty, then only show the first wallet
            if (res.length === 0 && groups.length === 0 && isScanned) {
                for (let i = 0; i < addressTypes.length; i++) {
                    const keyring = await wallet.createTmpKeyringWithKeystone(
                        contextData.ur.type,
                        contextData.ur.cbor,
                        addressTypes[i].value,
                        contextData.customHdPath,
                        1
                    );
                    groups.push({
                        type: addressTypes[i].value,
                        address_arr: keyring.accounts.map((item) => item.address),
                        pubkey_arr: keyring.accounts.map((item) => item.pubkey),
                        satoshis_arr: keyring.accounts.map(() => 0)
                    });
                }
            }
            setGroups(groups);
        } catch (e) {
            console.error(e);
        }
        tools.showLoading(false);
    };

    const getItems = (groups, addressType) => {
        // if (!groups[addressType]) {
        //   return [];
        // }
        // const group = groups[addressType];
        const group = groups.find((v) => v.type === addressType);
        if (
            contextData.customHdPath !== null &&
            contextData.customHdPath !== '' &&
            contextData.customHdPath.length >= 13
        ) {
            const items = group.address_arr.map((v, index) => ({
                address: v,
                satoshis: group.satoshis_arr[index],
                path: `${contextData.customHdPath}/${index}`
            }));
            const filtItems = items.filter((v) => v.satoshis >= 0);
            if (filtItems.length === 0) {
                filtItems.push(items[0]);
            }
            return filtItems;
        } else {
            const hdPath = addressTypes.find((v) => v.value === addressType)?.hdPath;
            const items = group.address_arr.map((v, index) => ({
                address: v,
                satoshis: group.satoshis_arr[index],
                path: `${hdPath}/${index}`
            }));
            const filtItems = items.filter((v) => v.satoshis >= 0);
            if (filtItems.length === 0) {
                filtItems.push(items[0]);
            }
            return filtItems;
        }
    };

    const submitCustomHdPath = (text: string) => {
        setPathError('');
        setPathText(text);
        if (text !== '') {
            const isValid = new bitcore.HDPrivateKey(text);
            if (!isValid) {
                setPathError('Invalid derivation path.');
                return;
            }
            updateContextData({
                ...contextData,
                customHdPath: text
            });
        } else {
            updateContextData({
                ...contextData,
                customHdPath: ''
            });
        }
    };

    return (
        <Layout>
            <Header onBack={onBack} title="Address Type" />
            <Content>
                {!isScanned && (
                    <Row justifyEnd>
                        <Text
                            text="Scan in more addresses..."
                            preset="link"
                            onClick={() => {
                                setScanned(true);
                                scanVaultAddress(10, true);
                            }}
                        />
                    </Row>
                )}

                <Column>
                    {addressTypes.map((item, index) => {
                        //  if item.value is not find in groups, then return null
                        // if item.value find in goups
                        // check item value is in thie groups or not

                        const show = groups.find((v) => v.type === item.value);
                        if (show !== undefined && show !== null) {
                            return (
                                <AddressTypeCard2
                                    key={index}
                                    label={item.name}
                                    items={getItems(groups, item.value)}
                                    checked={item.value == addressType}
                                    onClick={() => {
                                        setAddressType(item.value);
                                    }}
                                />
                            );
                        }
                        // return (
                        //   <AddressTypeCard2
                        //     key={index}
                        //     label={item.name}
                        //     items={getItems(groups, item.value)}
                        //     checked={item.value == addressType}
                        //     onClick={() => {
                        //       setAddressType(item.value);
                        //     }}
                        //   />
                        // );
                    })}
                </Column>
                <Text text="Custom HdPath (Optional)" preset="bold" mt="lg" />
                <Column>
                    <Input
                        placeholder={'Custom HD Wallet Derivation Path'}
                        value={pathText}
                        onChange={(e) => {
                            submitCustomHdPath(e.target.value);
                        }}
                    />
                </Column>
                {pathError && <Text text={pathError} color="error" />}
                {error && <Text text={error} color="error" />}
            </Content>
            {error && (
                <KeystonePopover
                    msg={error}
                    onClose={() => {
                        setError('');
                    }}
                    onConfirm={() => {
                        setError('');
                        onBack();
                    }}
                />
            )}

            <Footer>
                <Button preset="primary" onClick={onConfirm} text="Continue" />
            </Footer>
        </Layout>
    );
}

export default function CreateKeystoneWalletScreen() {
    const [contextData, setContextData] = useState<ContextData>({
        ur: {
            type: '',
            cbor: ''
        },
        passphrase: '',
        customHdPath: ''
    });

    const updateContextData = (data: ContextData) => {
        setContextData({
            ...contextData,
            ...data
        });
    };

    const [step, setStep] = useState(1);
    if (step === 1) {
        return <Step1 onNext={() => setStep(2)} />;
    }
    if (step === 2) {
        return (
            <Step2
                onBack={() => setStep(1)}
                onNext={({ type, cbor }) => {
                    setStep(3);
                    updateContextData({
                        ur: {
                            type,
                            cbor
                        },
                        passphrase: '',
                        customHdPath: ''
                    });
                }}
            />
        );
    }
    if (step === 3) {
        return <Step3 contextData={contextData} updateContextData={updateContextData} onBack={() => setStep(2)} />;
    }
    return <></>;
}
