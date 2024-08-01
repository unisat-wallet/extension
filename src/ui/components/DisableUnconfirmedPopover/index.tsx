import { Image } from '@/ui/components';

import { Button } from '../Button';
import { Column } from '../Column';
import { Popover } from '../Popover';
import { Text } from '../Text';

export const DisableUnconfirmedsPopover = ({ onClose }: { onClose: () => void }) => {
    return (
        <Popover>
            <Column justifyCenter itemsCenter>
                <Image src="./images/artifacts/security.png" size={80} />
                <Text text="Security Notice:" color="gold" textCenter size="lg" />

                <Text text="Unconfirmed Balance Not Spendable" color="gold" textCenter size="md" />

                <Column gap="zero" mt="sm">
                    <Text
                        size="sm"
                        text={`This message serves as a notice that if Runes (or ARC-20) assets are detected in your address, your
          unconfirmed balances will not be spendable. You don't need to do anything.`}
                    />

                    <Text
                        mt="md"
                        preset="sub"
                        size="sm"
                        text="To enable spending of unconfirmed balances, please visit the advanced options in settings."
                    />
                </Column>

                <Column full mt={'xl'}>
                    <Button
                        text="I understand"
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
