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
                        text={`This message is here to remind you that OP_NET spend all UTXOs that are bigger than 10,000. All UTXOs under 10,000 sat won't be spendable by OP_NET. This means that your Ordinals /Runes/BRC20 are safe.`}
                    />

                    <Text
                        mt="md"
                        preset="sub"
                        size="sm"
                        text="Please be aware that this is a security measure to protect the network and your assets."
                    />
                </Column>

                <Column full mt={'xl'}>
                    <Button
                        text="I understand"
                        full
                        preset="defaultV2"
                        onClick={() => {
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
