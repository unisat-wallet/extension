import { colors } from '@/ui/theme/colors';
import { CloseCircleFilled } from '@ant-design/icons';

import { Button } from '../Button';
import { Column } from '../Column';
import { Popover } from '../Popover';
import { Row } from '../Row';
import { Text } from '../Text';

export default function KeystonePopover({
    onClose,
    onConfirm,
    msg
}: {
    onClose: () => void;
    onConfirm: () => void;
    msg: string;
}) {
    return (
        <Popover onClose={onClose}>
            <Column justifyCenter itemsCenter gap="lg">
                <CloseCircleFilled
                    style={{
                        color: colors.red,
                        fontSize: 40
                    }}
                />

                <Text textCenter text={msg} />

                <a href="https://keyst.one/" target="_blank" rel="noreferrer" style={{ fontSize: 13 }}>
                    Tutorial
                </a>

                <Row full mt="lg">
                    <Button
                        text="Cancel"
                        full
                        preset="default"
                        onClick={() => {
                            onClose();
                        }}
                    />
                    <Button
                        text="Try again"
                        full
                        preset="primary"
                        onClick={() => {
                            onConfirm();
                        }}
                    />
                </Row>
            </Column>
        </Popover>
    );
}
