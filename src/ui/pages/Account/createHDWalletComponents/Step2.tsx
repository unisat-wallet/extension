import bitcore from 'bitcore-lib';
import { useEffect, useMemo, useState } from 'react';

import { ADDRESS_TYPES, RESTORE_WALLETS } from '@/shared/constant';
import { AddressType } from '@/shared/types';
import Web3API from '@/shared/web3/Web3API';
import { Button, Column, Icon, Input, Row, Text } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import { AddressTypeCard2 } from '@/ui/components/AddressTypeCard';
import { FooterButtonContainer } from '@/ui/components/FooterButtonContainer';
import { ContextData, UpdateContextDataParams } from '@/ui/pages/Account/createHDWalletComponents/types';
import { RouteTypes, useNavigate } from '@/ui/pages/MainRoute';
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

            return !(contextData.customHdPath && v.isUnisatLegacy);
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

    const [addressAssets, setAddressAssets] = useState<
        Record<
            string,
            {
                total_btc: string;
                satoshis: number;
            }
        >
    >({});

    const [error, setError] = useState('');
    const [pathError, setPathError] = useState('');
    const [loading, setLoading] = useState(false);

    const createAccount = useCreateAccountCallback();
    const navigate = useNavigate();

    const [pathText, setPathText] = useState(contextData.customHdPath);

    const [recommendedTypeIndex, setRecommendedTypeIndex] = useState(ADDRESS_TYPES[AddressType.P2TR].displayIndex);

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
        for (const options of hdPathOptions) {
            try {
                const keyring = await wallet.createTmpKeyringWithMnemonics(
                    contextData.mnemonics,
                    contextData.customHdPath || options.hdPath,
                    contextData.passphrase,
                    options.addressType
                );
                keyring.accounts.forEach((v) => {
                    addresses.push(v.address);
                });
            } catch (e) {
                setError((e as Error).message);
                return;
            }
        }
        setPreviewAddresses(addresses);
    };

    const [scanned, setScanned] = useState(false);

    useEffect(() => {
        void generateAddress();
        setScanned(false);
    }, [contextData.passphrase, contextData.customHdPath]);

    const fetchAddressesBalance = async () => {
        try {
            Web3API.setNetwork(await wallet.getChainType());

            if (!contextData.isRestore) {
                return;
            }

            const addresses = previewAddresses;
            if (!addresses[0]) return;

            setLoading(true);

            let maxSatoshis = 0;
            let recommended = 0;

            const addressAssets: Record<string, { total_btc: string; satoshis: number }> = {};
            for (let i = 0; i < addresses.length; i++) {
                try {
                    const address = addresses[i];
                    const balance = await Web3API.getBalance(address, true);
                    const balanceInSatoshi = Number(balance);

                    const final = satoshisToAmount(balanceInSatoshi);
                    addressAssets[address] = {
                        total_btc: final,
                        satoshis: Number(balance)
                    };

                    if (balanceInSatoshi > maxSatoshis) {
                        maxSatoshis = balanceInSatoshi;
                        recommended = i;
                    }
                } catch {}
            }

            setLoading(false);

            if (maxSatoshis > 0) {
                setRecommendedTypeIndex(recommended);
            }

            setAddressAssets(addressAssets);
        } catch (e) {}
    };

    useEffect(() => {
        void fetchAddressesBalance();
    }, [previewAddresses]);

    const submitCustomHdPath = (text: string) => {
        setPathError('');
        setPathText(text);
        if (text !== '') {
            // @ts-ignore
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
        return !(!error && !pathError);
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
            navigate(RouteTypes.MainScreen);
        } catch (e) {
            tools.toastError((e as Error).message);
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

            for (const options of allHdPathOptions) {
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
                    setError((e as Error).message);
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
            setError((e as Error).message);
        } finally {
            tools.showLoading(false);
        }
    };

    return (
        <Column>
            {contextData.isRestore && !scanned ? (
                <Row justifyBetween>
                    <Text text="Address Type" preset="bold" />
                    <Text
                        text="Scan in more addresses..."
                        preset="link"
                        onClick={async () => {
                            await scanVaultAddress();
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
                                path: `${contextData.customHdPath || options.hdPath}/${index}`
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
                onChange={(e) => {
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
