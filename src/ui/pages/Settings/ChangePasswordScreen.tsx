import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button, Column, Content, Header, Input, Layout, Row, Text } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import { useWallet } from '@/ui/utils';
import { getPasswordStrengthWord, MIN_PASSWORD_LENGTH } from '@/ui/utils/password-utils';

import { isWalletError } from '@/shared/utils/errors';
import { RouteTypes, useNavigate } from '../MainRoute';

export default function ChangePasswordScreen() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [originPassword, setOriginPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [disabled, setDisabled] = useState(true);
    const wallet = useWallet();
    const tools = useTools();

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

    useEffect(() => {
        if (originPassword.length > 0 && newPassword.length >= MIN_PASSWORD_LENGTH && newPassword === confirmPassword) {
            setDisabled(false);
        } else {
            setDisabled(true);
        }
    }, [originPassword, newPassword, confirmPassword]);

    const verify = async () => {
        try {
            await wallet.changePassword(originPassword, newPassword);
            tools.toastSuccess('Success');
            navigate(RouteTypes.MainScreen);
        } catch (err) {
            if (isWalletError(err)) {
                tools.toastError(err.message);
            } else {
                tools.toastError("An unexpected error occurred.");
                console.error("Non-WalletError caught: ", err);
            }        
        }
    };
    return (
        <Layout>
            <Header
                onBack={() => {
                    window.history.go(-1);
                }}
                title="Change Password"
            />
            <Content>
                <Column gap="lg">
                    <Input
                        preset="password"
                        placeholder="Current Password"
                        onChange={(e) => {
                            setOriginPassword(e.target.value);
                        }}
                        autoFocus={true}
                    />
                    <Input
                        preset="password"
                        placeholder="New Password"
                        onChange={(e) => {
                            setNewPassword(e.target.value);
                        }}
                    />
                    {strongText}
                    <Input
                        preset="password"
                        placeholder="Confirm Password"
                        onChange={(e) => {
                            setConfirmPassword(e.target.value);
                        }}
                    />
                    {matchText}
                    <Button
                        disabled={disabled}
                        text="Change Password"
                        preset="primary"
                        onClick={() => {
                            verify();
                        }}
                    />
                </Column>
            </Content>
        </Layout>
    );
}
