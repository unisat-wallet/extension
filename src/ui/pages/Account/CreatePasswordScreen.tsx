import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { Button, Column, Content, Input, Layout, Row, Text } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import { useWallet, useWalletRequest } from '@/ui/utils';
import { getPasswordStrengthWord, MIN_PASSWORD_LENGTH } from '@/ui/utils/password-utils';

import { RouteTypes, useNavigate } from '../MainRoute';

interface LocationState {
    isNewAccount?: boolean;
    isKeystone?: boolean;
}

export default function CreatePasswordScreen() {
    const navigate = useNavigate();
    const wallet = useWallet();
    const loc = useLocation();
    const params = new URLSearchParams(loc.search);

    let state: LocationState = {};
    if (loc.state) {
        state = loc.state as LocationState;
    }

    if (Array.from(params).length > 0) {
        params.forEach((value, key) => {
            state[key as keyof LocationState] = (value === 'true');
        });
    }

    const { isNewAccount, isKeystone } = state;
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [disabled, setDisabled] = useState(true);

    const tools = useTools();
    const [run, _] = useWalletRequest(wallet.boot.bind(wallet), {
        onSuccess() {
            if (isKeystone) {
                navigate(RouteTypes.CreateKeystoneWalletScreen, { fromUnlock: true });
            } else if (isNewAccount) {
                navigate(RouteTypes.CreateHDWalletScreen, { isImport: false, fromUnlock: true });
            } else {
                navigate(RouteTypes.CreateHDWalletScreen, { isImport: true, fromUnlock: true });
            }
        },
        onError(err) {
            tools.toastError(err);
        }
    });

    const btnClick = () => {
        void run(newPassword.trim());
    };

    useEffect(() => {
        setDisabled(true);

        if (newPassword && newPassword.length >= MIN_PASSWORD_LENGTH && newPassword === confirmPassword) {
            setDisabled(false);
            return;
        }
    }, [newPassword, confirmPassword]);

    const strongText = useMemo(() => {
        if (!newPassword) {
            return;
        }
        const { text, color, tip } = getPasswordStrengthWord(newPassword);

        return (
            <Column>
                <Row>
                    <Text size="xs" text={'Password strength: '} />
                    <Text size="xs" text={text} style={{ color: color }} />
                </Row>
                {tip ? <Text size="xs" preset="sub" text={tip} /> : null}
            </Column>
        );
    }, [newPassword]);

    const matchText = useMemo(() => {
        if (!confirmPassword) {
            return;
        }

        if (newPassword !== confirmPassword) {
            return (
                <Row>
                    <Text size="xs" text={"Passwords don't match"} color="red" />
                </Row>
            );
        } else {
            return;
        }
    }, [newPassword, confirmPassword]);

    const handleOnKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!disabled && 'Enter' == e.key) {
            btnClick();
        }
    };

    return (
        <Layout>
            <Content preset="middle">
                <Column fullX fullY>
                    <Column gap="xl" style={{ marginTop: 200 }}>
                        <Text text="Create a password" preset="title-bold" textCenter />
                        <Text text="You will use this to unlock your wallet" preset="sub" textCenter />
                        <Column>
                            <Input
                                preset="password"
                                onChange={(e) => {
                                    setNewPassword(e.target.value);
                                }}
                                autoFocus={true}
                            />
                            {strongText}
                        </Column>

                        <Column>
                            <Input
                                preset="password"
                                placeholder="Confirm Password"
                                onChange={(e) => {
                                    setConfirmPassword(e.target.value);
                                }}
                                onKeyUp={(e) => handleOnKeyUp(e)}
                            />
                            {matchText}
                        </Column>

                        <Button disabled={disabled} text="Continue" preset="primary" onClick={btnClick} />
                    </Column>
                </Column>
            </Content>
        </Layout>
    );
}
