import bitcore from 'bitcore-lib';
import { useEffect, useMemo, useState } from 'react';

import { ADDRESS_TYPES, RESTORE_WALLETS } from '@/shared/constant';
import { AddressType } from '@/shared/types';
import { Button, Column, Icon, Input, Row, Text } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import { AddressTypeCard2 } from '@/ui/components/AddressTypeCard';
import { FooterButtonContainer } from '@/ui/components/FooterButtonContainer';
import { ContextData, UpdateContextDataParams } from '@/ui/pages/Account/createHDWalletComponents/types';
import { useNavigate } from '@/ui/pages/MainRoute';
import { useCreateAccountCallback } from '@/ui/state/global/hooks';
import { satoshisToAmount, useWallet } from '@/ui/utils';
import { LoadingOutlined } from '@ant-design/icons';

export function Step2({
    contextData,
    updateContextData
}: {
    contextData: ContextData;
    updateContextData: (params: UpdateContextDataParams) => void;
}) {
    const wallet = useWallet();
    const tools = useTools();

    const hdPathOptions = useMemo(() => {
        const restoreWallet = RESTORE_WALLETS[contextData.restoreWalletType];
        return ADDRESS_TYPES.filter((v) => {
            if (v.displayIndex < 0) {
                return false;
            }
            if (!restoreWallet.addressTypes.includes(v.value)) {
                return false;
            }

            if (!contextData.isRestore && v.isUnisatLegacy) {
                return false;
            }

            if (contextData.customHdPath && v.isUnisatLegacy) {
                return false;
            }

            return true;
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

    const allHdPathOptions = useMemo(() => {
        return ADDRESS_TYPES.map((v) => v)
            .sort((a, b) => a.displayIndex - b.displayIndex)
            .map((v) => {
                return {
                    label: v.name,
                    hdPath: v.hdPath,
                    addressType: v.value,
                    isUnisatLegacy: v.isUnisatLegacy
                };
            });
    }, []);

    const [previewAddresses, setPreviewAddresses] = useState<string[]>(hdPathOptions.map((v) => ''));

    const [scannedGroups, setScannedGroups] = useState<
        { type: AddressType; address_arr: string[]; satoshis_arr: number[] }[]
    >([]);

    const [addressAssets, setAddressAssets] = useState<{
        [key: string]: { total_btc: string; satoshis: number; total_inscription: number };
    }>({});

    const [error, setError] = useState('');
    const [pathError, setPathError] = useState('');
    const [loading, setLoading] = useState(false);

    const createAccount = useCreateAccountCallback();
    const navigate = useNavigate();

    const [pathText, setPathText] = useState(contextData.customHdPath);

    const [recommendedTypeIndex, setRecommendedTypeIndex] = useState(0);

    useEffect(() => {
        if (scannedGroups.length > 0) {
            const itemIndex = scannedGroups.findIndex((v) => v.address_arr.length > 0);
            const item = scannedGroups[itemIndex];
            updateContextData({ addressType: item.type, addressTypeIndex: itemIndex });
        } else {
            const option = hdPathOptions[recommendedTypeIndex];
            updateContextData({ addressType: option.addressType, addressTypeIndex: recommendedTypeIndex });
        }
    }, [recommendedTypeIndex, scannedGroups]);

    const generateAddress = async () => {
        const addresses: string[] = [];
        for (let i = 0; i < hdPathOptions.length; i++) {
            const options = hdPathOptions[i];
            try {
                const keyring = await wallet.createTmpKeyringWithMnemonics(
                    contextData.mnemonics,
                    contextData.customHdPath || options.hdPath,
                    contextData.passphrase,
                    options.addressType
                );
                // const address = keyring.accounts[0].address;
                // addresses.push(address);
                keyring.accounts.forEach((v) => {
                    addresses.push(v.address);
                });
            } catch (e) {
                console.log(e);
                setError((e as any).message);
                return;
            }
        }
        setPreviewAddresses(addresses);
    };

    const [scanned, setScanned] = useState(false);

    useEffect(() => {
        generateAddress();
        setScanned(false);
    }, [contextData.passphrase, contextData.customHdPath]);

    const fetchAddressesBalance = async () => {
        if (!contextData.isRestore) {
            return;
        }

        const addresses = previewAddresses;
        if (!addresses[0]) return;

        setLoading(true);
        const balances = await wallet.getMultiAddressAssets(addresses.join(','));
        setLoading(false);

        const addressAssets: { [key: string]: { total_btc: string; satoshis: number; total_inscription: number } } = {};
        let maxSatoshis = 0;
        let recommended = 0;
        for (let i = 0; i < addresses.length; i++) {
            const address = addresses[i];
            const balance = balances[i];
            const satoshis = balance.totalSatoshis;
            addressAssets[address] = {
                total_btc: satoshisToAmount(balance.totalSatoshis),
                satoshis,
                total_inscription: balance.inscriptionCount
            };
            if (satoshis > maxSatoshis) {
                maxSatoshis = satoshis;
                recommended = i;
            }
        }
        if (maxSatoshis > 0) {
            setRecommendedTypeIndex(recommended);
        }

        setAddressAssets(addressAssets);
    };

    useEffect(() => {
        fetchAddressesBalance();
    }, [previewAddresses]);

    const submitCustomHdPath = (text: string) => {
        setPathError('');
        setPathText(text);
        if (text !== '') {
            const isValid = bitcore.HDPrivateKey.isValidPath(text);
            if (!isValid) {
                setPathError('Invalid derivation path.');
                return;
            }
            updateContextData({
                customHdPath: text
            });
        } else {
            updateContextData({
                customHdPath: ''
            });
        }
    };

    const disabled = useMemo(() => {
        if (!error && !pathError) {
            return false;
        } else {
            return true;
        }
    }, [error, pathError]);

    const onNext = async () => {
        try {
            if (scannedGroups.length > 0) {
                const option = allHdPathOptions[contextData.addressTypeIndex];
                const hdPath = contextData.customHdPath || option.hdPath;
                const selected = scannedGroups[contextData.addressTypeIndex];

                await createAccount(
                    contextData.mnemonics,
                    hdPath,
                    contextData.passphrase,
                    contextData.addressType,
                    selected.address_arr.length
                );
            } else {
                const option = hdPathOptions[contextData.addressTypeIndex];
                const hdPath = contextData.customHdPath || option.hdPath;
                await createAccount(contextData.mnemonics, hdPath, contextData.passphrase, contextData.addressType, 1);
            }
            navigate('MainScreen');
        } catch (e) {
            tools.toastError((e as any).message);
        }
    };

    const scanVaultAddress = async () => {
        setScanned(true);
        tools.showLoading(true);
        try {
            let groups: {
                type: AddressType;
                address_arr: string[];
                satoshis_arr: number[];
                pubkey_arr: string[];
            }[] = [];
            for (let i = 0; i < allHdPathOptions.length; i++) {
                const options = allHdPathOptions[i];
                const address_arr: string[] = [];
                const satoshis_arr: number[] = [];
                try {
                    const keyring = await wallet.createTmpKeyringWithMnemonics(
                        contextData.mnemonics,
                        contextData.customHdPath || options.hdPath,
                        contextData.passphrase,
                        options.addressType,
                        10
                    );
                    keyring.accounts.forEach((v, j) => {
                        address_arr.push(v.address);
                    });
                } catch (e) {
                    console.log(e);
                    setError((e as any).message);
                    return;
                }

                groups.push({
                    type: options.addressType,
                    address_arr: address_arr,
                    satoshis_arr: satoshis_arr,
                    pubkey_arr: []
                });
            }

            groups = await wallet.findGroupAssets(groups);

            setScannedGroups(groups);
            if (groups.length == 0) {
                tools.showTip('Unable to find any addresses with assets');
            }
        } catch (e) {
            setError((e as any).message);
        } finally {
            tools.showLoading(false);
        }
    };

    return (
        <Column>
            {contextData.isRestore && scanned == false ? (
                <Row justifyBetween>
                    <Text text="Address Type" preset="bold" />
                    <Text
                        text="Scan in more addresses..."
                        preset="link"
                        onClick={() => {
                            scanVaultAddress();
                        }}
                    />
                </Row>
            ) : (
                <Text text="Address Type" preset="bold" />
            )}

            {scannedGroups.length > 0 &&
                scannedGroups.map((item, index) => {
                    const options = allHdPathOptions[index];
                    if (!item.satoshis_arr.find((v) => v > 0)) {
                        // skip group with no vault
                        return null;
                    }
                    return (
                        <AddressTypeCard2
                            key={index}
                            label={`${options.label}`}
                            items={item.address_arr.map((v, index) => ({
                                address: v,
                                satoshis: item.satoshis_arr[index],
                                path: (contextData.customHdPath || options.hdPath) + '/' + index
                            }))}
                            checked={index == contextData.addressTypeIndex}
                            onClick={() => {
                                updateContextData({
                                    addressTypeIndex: index,
                                    addressType: options.addressType
                                });
                            }}
                        />
                    );
                })}
            {scannedGroups.length == 0 &&
                hdPathOptions.map((item, index) => {
                    const address = previewAddresses[index];
                    const assets = addressAssets[address] || {
                        total_btc: '--',
                        satoshis: 0,
                        total_inscription: 0
                    };
                    const hasVault = contextData.isRestore && assets.satoshis > 0;
                    if (item.isUnisatLegacy && !hasVault) {
                        return null;
                    }

                    const hdPath = (contextData.customHdPath || item.hdPath) + '/0';
                    return (
                        <AddressTypeCard2
                            key={index}
                            label={`${item.label}`}
                            items={[
                                {
                                    address,
                                    satoshis: assets.satoshis,
                                    path: hdPath
                                }
                            ]}
                            checked={index == contextData.addressTypeIndex}
                            onClick={() => {
                                updateContextData({
                                    addressTypeIndex: index,
                                    addressType: item.addressType
                                });
                            }}
                        />
                    );
                })}

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

            <Text text="Phrase (Optional)" preset="bold" mt="lg" />

            <Input
                placeholder={'Passphrase'}
                defaultValue={contextData.passphrase}
                onChange={async (e) => {
                    updateContextData({
                        passphrase: e.target.value
                    });
                }}
            />

            <FooterButtonContainer>
                <Button text="Continue" preset="primary" onClick={onNext} disabled={disabled} />
            </FooterButtonContainer>

            {loading && (
                <Icon>
                    <LoadingOutlined />
                </Icon>
            )}
        </Column>
    );
}
