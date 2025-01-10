import VirtualList from 'rc-virtual-list';
import React, { forwardRef, useMemo, useState } from 'react';

import { KEYRING_CLASS, KEYRING_TYPE } from '@/shared/constant';
import { Account } from '@/shared/types';
import { Card, Column, Content, Header, Icon, Layout, Row, Text } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import { useCurrentAccount } from '@/ui/state/accounts/hooks';
import { accountActions } from '@/ui/state/accounts/reducer';
import { useAppDispatch } from '@/ui/state/hooks';
import { useCurrentKeyring } from '@/ui/state/keyrings/hooks';
import { colors } from '@/ui/theme/colors';
import { copyToClipboard, shortAddress, useWallet } from '@/ui/utils';
import {
    CheckCircleFilled,
    CopyOutlined,
    EditOutlined,
    EllipsisOutlined,
    KeyOutlined,
    PlusCircleOutlined
} from '@ant-design/icons';

import { RouteTypes, useNavigate } from '../MainRoute';

export interface ItemData {
    key: string;
    account?: Account;
}

interface MyItemProps {
    account?: Account;
    autoNav?: boolean;
}

export function MyItem({ account, autoNav }: MyItemProps) {
    // 1. Always call Hooks unconditionally at the top:
    const navigate = useNavigate();
    const currentAccount = useCurrentAccount();
    const wallet = useWallet();
    const dispatch = useAppDispatch();
    const keyring = useCurrentKeyring();
    const [optionsVisible, setOptionsVisible] = useState(false);
    const tools = useTools();

    // 2. After calling Hooks, handle "no account" scenario:
    if (!account) {
        // We still render something here, but the Hooks are
        // already called above.
        return <div />;
    }

    const selected = currentAccount.pubkey === account.pubkey;

    let path = '';
    if (keyring.type !== KEYRING_CLASS.PRIVATE_KEY && account.index !== undefined) {
        path = ` (${keyring.hdPath}/${account.index})`;
    }

    const handleSelectAccount = async () => {
        if (currentAccount.pubkey !== account.pubkey) {
            await wallet.changeKeyring(keyring, account.index);
            const newCurrentAccount = await wallet.getCurrentAccount();
            dispatch(accountActions.setCurrent(newCurrentAccount));
        }
        if (autoNav) {
            navigate(RouteTypes.MainScreen);
        }
    };

    const handleEditName = () => {
        navigate(RouteTypes.EditAccountNameScreen, { account });
    };

    const handleCopyAddress = async () => {
        await copyToClipboard(account.address);
        tools.toastSuccess('Copied');
        setOptionsVisible(false);
    };

    const handleExportPrivateKey = () => {
        navigate(RouteTypes.ExportPrivateKeyScreen, { account });
    };

    return (
        <Card justifyBetween mt="md">
            <Row>
                <Column style={{ width: 20 }} selfItemsCenter>
                    {selected && (
                        <Icon>
                            <CheckCircleFilled />
                        </Icon>
                    )}
                </Column>
                <Column onClick={handleSelectAccount}>
                    <Text text={account.alianName} />
                    <Text text={`${shortAddress(account.address)}${path}`} preset="sub" />
                </Column>
            </Row>
            <Column relative>
                {/* Click-away area for closing the options */}
                {optionsVisible && (
                    <div
                        style={{
                            position: 'fixed',
                            zIndex: 10,
                            left: 0,
                            right: 0,
                            top: 0,
                            bottom: 0
                        }}
                        onTouchStart={() => setOptionsVisible(false)}
                        onMouseDown={() => setOptionsVisible(false)}
                    />
                )}

                <Icon onClick={() => setOptionsVisible((v) => !v)}>
                    <EllipsisOutlined />
                </Icon>

                {optionsVisible && (
                    <Column
                        style={{
                            backgroundColor: colors.black,
                            width: 160,
                            position: 'absolute',
                            right: 0,
                            padding: 5,
                            zIndex: 10
                        }}>
                        <Row onClick={handleEditName}>
                            <EditOutlined />
                            <Text text="Edit Name" size="sm" />
                        </Row>

                        <Row onClick={handleCopyAddress}>
                            <CopyOutlined />
                            <Text text="Copy address" size="sm" />
                        </Row>

                        {account.type !== KEYRING_TYPE.KeystoneKeyring && (
                            <Row onClick={handleExportPrivateKey}>
                                <KeyOutlined />
                                <Text text="Export Private Key" size="sm" />
                            </Row>
                        )}
                    </Column>
                )}
            </Column>
        </Card>
    );
}

export default function SwitchAccountScreen() {
    const navigate = useNavigate();
    const keyring = useCurrentKeyring();

    const items = useMemo<ItemData[]>(() => {
        return keyring.accounts.map((acc) => ({
            key: acc.address,
            account: acc
        }));
    }, [keyring.accounts]);

    // This is okay—`forwardRef` is not a Hook, so no violation here
    const ForwardMyItem = forwardRef(MyItem);

    return (
        <Layout>
            <Header
                onBack={() => window.history.back()}
                title="Switch Account"
                RightComponent={
                    keyring.type === KEYRING_CLASS.PRIVATE_KEY ? null : (
                        <Icon onClick={() => navigate(RouteTypes.CreateAccountScreen)}>
                            <PlusCircleOutlined />
                        </Icon>
                    )
                }
            />
            <Content>
                <VirtualList data={items} data-id="list" itemHeight={20} itemKey={(item) => item.key}>
                    {(item) => <ForwardMyItem account={item.account} autoNav />}
                </VirtualList>
            </Content>
        </Layout>
    );
}
