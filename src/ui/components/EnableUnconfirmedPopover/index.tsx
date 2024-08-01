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
                        If Runes (or ARC20) assets are detected in the given address, the unconfirmed UTXOs are
                        explicitly not allowed to be spent until it's confirmed. Forcely spending these unconfirmed
                        assets will incur the risks of losing assets.
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
