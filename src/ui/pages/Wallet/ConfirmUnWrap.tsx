import { useState } from 'react';

import { Button, Column, Row, Text } from '@/ui/components';
import { BottomModal } from '@/ui/components/BottomModal';
import { CloseOutlined } from '@ant-design/icons';

export const ConfirmUnWrap = ({
    acceptWrapMessage,
    onClose,
    setAcceptWrap
}: {
    acceptWrapMessage: string;
    onClose: () => void;
    setAcceptWrap: (value: boolean) => void;
}) => {
    const [tokenState, setTokenState] = useState<string>('');

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
                    <Text text={acceptWrapMessage} preset="regular" color="textDim" />
                </Column>
            </Column>
            <Row full>
                <Button preset="default" text="Reject" onClick={() => onClose()} full />

                <Button
                    disabled={false}
                    preset="primary"
                    text="Next"
                    onClick={(e) => {
                        setAcceptWrap(true);
                    }}
                    full></Button>
            </Row>
        </BottomModal>
    );
};
