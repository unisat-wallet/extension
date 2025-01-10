import { Dispatch, SetStateAction, useState } from 'react';
import { CloseOutlined } from '@ant-design/icons';

import { Button, Column, Input, Row, Text } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import { BottomModal } from '@/ui/components/BottomModal';
import { useWallet } from '@/ui/utils';
import { useCurrentAccount } from '@/ui/state/accounts/hooks';

// Simple interface for tokens in localStorage
interface StoredToken {
    address: string;
    hidden: boolean;
}

export const AddOpNetToken = ({
    onClose,
    setImportTokenBool,
    fetchData
}: {
    onClose: () => void;
    setImportTokenBool: Dispatch<SetStateAction<boolean>>;
    fetchData: () => Promise<void>;
}) => {
    const [tokenState, setTokenState] = useState<string>('');
    const wallet = useWallet();
    const tools = useTools();
    const currentAccount = useCurrentAccount();

    const saveToLocalStorage = async () => {
        try {
            if (!tokenState.trim()) {
                tools.toastError('Please enter a valid token address.');
                return;
            }

            const chain = await wallet.getChainType();
            const accountAddr = currentAccount.pubkey;
            const storageKey = `opnetTokens_${chain}_${accountAddr}`;

            // Load existing tokens for this chain+account
            const tokensImported = localStorage.getItem(storageKey);
            const parsedTokens: (StoredToken | string)[] = tokensImported
                ? (JSON.parse(tokensImported) as (StoredToken | string)[])
                : [];

            // Check if token already exists
            const isDuplicate = parsedTokens.some((t) =>
                typeof t === 'object' ? t.address === tokenState : t === tokenState
            );
            
            if (isDuplicate) {
                tools.toastError('Token already imported.');
                return;
            }

            // Add new token as an object
            parsedTokens.unshift({ address: tokenState.trim(), hidden: false });
            localStorage.setItem(storageKey, JSON.stringify(parsedTokens));

            // Refresh token list in parent
            await fetchData();

            // Close modal
            setImportTokenBool(false);
        } catch (err) {
            tools.toastError('Failed to import token.');
            console.error(err);
        }
    };

    return (
        <BottomModal onClose={onClose}>
            <Column justifyCenter itemsCenter>
                <Row justifyBetween itemsCenter style={{ height: 20 }} fullX>
                    <Row />
                    <Text text="Add Token" textCenter size="md" />
                    <Row onClick={onClose}>
                        <CloseOutlined />
                    </Row>
                </Row>

                <Column mt="lg" style={{ width: '100%', marginBottom: '20px' }}>
                    <Text text="Token Address" preset="regular" color="textDim" />
                    <Input
                        preset="text"
                        value={tokenState}
                        onChange={(e) => {
                            setTokenState(e.target.value);
                        }}
                        autoFocus
                    />
                </Column>
            </Column>

            <Button disabled={false} preset="primary" text="Next" onClick={() => void saveToLocalStorage()} />
        </BottomModal>
    );
};
