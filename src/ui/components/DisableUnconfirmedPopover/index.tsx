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
                <Text text="Security Notice" color="gold" textCenter size="lg" />

                <Column gap="zero" mt="sm">
                    <Text
                        mt="md"
                        preset="sub"
                        size="sm"
                        text="Please be aware that OP_NET will only spend UTXOs larger than 10,000 satoshis. UTXOs smaller than 10,000 satoshis will not be spendable by OP_NET. This ensures that your Ordinals, Runes, and BRC20 tokens are safe and unaffected."
                    />

                    <Text
                        mt="md"
                        preset="sub"
                        size="sm"
                        text="This is a security measure to protect the network and your assets."
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
