import { Icon } from '@/ui/components';
import { fontSizes } from '@/ui/theme/font';

import { Button } from '../Button';
import { Column } from '../Column';
import { Popover } from '../Popover';
import { Text } from '../Text';

export const EnableAtomicalsPopover = ({ onClose, onConfirm }: { onClose: () => void; onConfirm: () => void }) => {
    return (
        <Popover onClose={onClose}>
            <Column justifyCenter itemsCenter>
                <Text text="Precautions" preset="title-bold" />
                <Icon icon={'warning'} color={'icon_yellow'} size={57} />
                <Column gap="zero">
                    <div style={{ fontSize: fontSizes.sm, color: '#ddd' }}>
                        In the current version, only <span style={{ color: '#EBB94C' }}>the confirmed balance</span> can
                        be used once atomicals enabled.
                    </div>
                </Column>

                <Column full mt={'xl'}>
                    <Button
                        text="Enable Atomicals"
                        preset="primary"
                        full
                        onClick={(e) => {
                            if (onConfirm) {
                                onConfirm();
                            }
                        }}
                    />
                    <Button
                        text="Cancel"
                        full
                        onClick={(e) => {
                            if (onClose) {
                                onClose();
                            }
                        }}
                    />
                </Column>
            </Column>
        </Popover>
    );
};
