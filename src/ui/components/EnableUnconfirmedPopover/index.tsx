import { Icon } from '@/ui/components';
import { fontSizes } from '@/ui/theme/font';

import { Button } from '../Button';
import { Column } from '../Column';
import { Popover } from '../Popover';
import { Text } from '../Text';

export const EnableUnconfirmedPopover = ({ onClose, onConfirm }: { onClose: () => void; onConfirm: () => void }) => {
    return (
        <Popover>
            <Column justifyCenter itemsCenter>
                <Icon icon={'warning'} color={'icon_yellow'} size={57} />

                <Text text="Enable Unconfirmed Balance" preset="title-bold" />
                <Column gap="zero">
                    <div style={{ fontSize: fontSizes.sm, color: '#ddd', marginTop: 20 }}>
                        OP_NET filters out ordinals and runes based UTXOs by skipping all UTXOs that are bellow 10,000
                        sat.
                    </div>
                </Column>

                <Column full mt={'xl'}>
                    <Button
                        text="Allow using Unconfirmed Balance"
                        preset="primaryV2"
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
                        preset="defaultV2"
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
