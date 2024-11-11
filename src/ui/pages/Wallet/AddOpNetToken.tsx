import { Dispatch, SetStateAction, useState } from 'react';

import { Button, Column, Input, Row, Text } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import { BottomModal } from '@/ui/components/BottomModal';
import { useWallet } from '@/ui/utils';
import { CloseOutlined } from '@ant-design/icons';

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

    const saveToLocalStorage = async () => {
        const getChain = await wallet.getChainType();
        const tokensImported = localStorage.getItem('opnetTokens_' + getChain);
        let parsedTokens: string[] = [];
        if (tokensImported) {
            parsedTokens = JSON.parse(tokensImported) as string[];

            if (parsedTokens.includes(tokenState)) {
                tools.toastError('Token already imported.');

                return;
            }
        }

        parsedTokens.push(tokenState);
        localStorage.setItem('opnetTokens_' + getChain, JSON.stringify(parsedTokens));

        await fetchData();
        setImportTokenBool(false);
    };

    return (
        <BottomModal onClose={onClose}>
            <Column justifyCenter itemsCenter>
                <Row justifyBetween itemsCenter style={{ height: 20 }} fullX>
                    <Row />
                    <Text text="Add Token" textCenter size="md" />
                    <Row
                        onClick={() => {
                            onClose();
                        }}>
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
                        autoFocus={true}
                    />
                </Column>
            </Column>
            <Button
                disabled={false}
                preset="primary"
                text="Next"
                onClick={() => {
                    void saveToLocalStorage();
                }}></Button>
        </BottomModal>
    );
};
