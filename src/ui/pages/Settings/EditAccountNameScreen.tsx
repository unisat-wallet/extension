import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Account } from '@/shared/types';
import { Button, Content, Header, Input, Layout } from '@/ui/components';
import { accountActions } from '@/ui/state/accounts/reducer';
import { useAppDispatch } from '@/ui/state/hooks';
import { keyringsActions } from '@/ui/state/keyrings/reducer';
import { useLocationState, useWallet } from '@/ui/utils';

interface LocationState {
    account: Account;
}

export default function EditAccountNameScreen() {
    const { t } = useTranslation();

    const { account } = useLocationState<LocationState>();

    const wallet = useWallet();
    const [alianName, setAlianName] = useState('');
    const dispatch = useAppDispatch();
    const handleOnClick = async () => {
        const newAccount = await wallet.setAccountAlianName(account, alianName);
        dispatch(keyringsActions.updateAccountName(newAccount));
        dispatch(accountActions.updateAccountName(newAccount));
        window.history.go(-1);
    };

    const handleOnKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if ('Enter' == e.key) {
            handleOnClick();
        }
    };

    const validName = useMemo(() => {
        if (alianName.length == 0) {
            return false;
        }
        return true;
    }, [alianName]);
    return (
        <Layout>
            <Header
                onBack={() => {
                    window.history.go(-1);
                }}
                title={account.alianName}
            />
            <Content>
                <Input
                    placeholder={account.alianName}
                    defaultValue={account.alianName}
                    onChange={(e) => {
                        setAlianName(e.target.value);
                    }}
                    onKeyUp={(e) => handleOnKeyUp(e)}
                    autoFocus={true}
                />
                <Button
                    disabled={!validName}
                    text="Change Account Name"
                    preset="primary"
                    onClick={(e) => {
                        handleOnClick();
                    }}
                />
            </Content>
        </Layout>
    );
}
