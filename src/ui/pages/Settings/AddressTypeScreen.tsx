import { useEffect, useMemo, useRef, useState } from 'react';

import { ADDRESS_TYPES, KEYRING_TYPE } from '@/shared/constant';
import { Column, Content, Header, Layout } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import { AddressTypeCard } from '@/ui/components/AddressTypeCard';
import { useExtensionIsInTab } from '@/ui/features/browser/tabs';
import { useCurrentAccount, useReloadAccounts } from '@/ui/state/accounts/hooks';
import { useAppDispatch } from '@/ui/state/hooks';
import { useCurrentKeyring } from '@/ui/state/keyrings/hooks';
import { satoshisToAmount, useWallet } from '@/ui/utils';

import { useNavigate } from '../MainRoute';

export default function AddressTypeScreen() {
    const isInTab = useExtensionIsInTab();

    const wallet = useWallet();
    const currentKeyring = useCurrentKeyring();
    const account = useCurrentAccount();

    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const reloadAccounts = useReloadAccounts();
    const [addresses, setAddresses] = useState<string[]>([]);
    const [addressAssets, setAddressAssets] = useState<{
        [key: string]: { total_btc: string; satoshis: number; total_inscription: number };
    }>({});

    const selfRef = useRef<{
        addressAssets: { [key: string]: { total_btc: string; satoshis: number; total_inscription: number } };
    }>({
        addressAssets: {}
    });
    const self = selfRef.current;

    const tools = useTools();
    const loadAddresses = async () => {
        tools.showLoading(true);

        const _res = await wallet.getAllAddresses(currentKeyring, account.index || 0);
        setAddresses(_res);
        const balances = await wallet.getMultiAddressAssets(_res.join(','));
        for (let i = 0; i < _res.length; i++) {
            const address = _res[i];
            const balance = balances[i];
            const satoshis = balance.totalSatoshis;
            self.addressAssets[address] = {
                total_btc: satoshisToAmount(balance.totalSatoshis),
                satoshis,
                total_inscription: balance.inscriptionCount
            };
        }
        setAddressAssets(self.addressAssets);

        tools.showLoading(false);
    };

    useEffect(() => {
        loadAddresses();
    }, []);

    const addressTypes = useMemo(() => {
        if (currentKeyring.type === KEYRING_TYPE.HdKeyring) {
            return ADDRESS_TYPES.filter((v) => {
                if (v.displayIndex < 0) {
                    return false;
                }
                const address = addresses[v.value];
                const balance = addressAssets[address];
                if (v.isUnisatLegacy) {
                    if (!balance || balance.satoshis == 0) {
                        return false;
                    }
                }
                return true;
            }).sort((a, b) => a.displayIndex - b.displayIndex);
        } else {
            return ADDRESS_TYPES.filter((v) => v.displayIndex >= 0 && v.isUnisatLegacy != true).sort(
                (a, b) => a.displayIndex - b.displayIndex
            );
        }
    }, [currentKeyring.type, addressAssets, addresses]);
    return (
        <Layout>
            <Header
                onBack={() => {
                    window.history.go(-1);
                }}
                title="Address Type"
            />
            <Content>
                <Column>
                    {addressTypes.map((item, index) => {
                        const address = addresses[item.value];
                        const assets = addressAssets[address] || {
                            total_btc: '--',
                            satoshis: 0,
                            total_inscription: 0
                        };
                        let name = `${item.name} (${item.hdPath}/${account.index})`;
                        if (currentKeyring.type === KEYRING_TYPE.SimpleKeyring) {
                            name = `${item.name}`;
                        }
                        return (
                            <AddressTypeCard
                                key={index}
                                label={name}
                                address={address}
                                assets={assets}
                                checked={item.value == currentKeyring.addressType}
                                onClick={async () => {
                                    if (item.value == currentKeyring.addressType) {
                                        return;
                                    }
                                    await wallet.changeAddressType(item.value);
                                    reloadAccounts();
                                    navigate('MainScreen');
                                    tools.toastSuccess('Address type changed');
                                }}
                            />
                        );
                    })}
                </Column>
            </Content>
        </Layout>
    );
}
