import { fontSizes } from '@/ui/theme/font';

import { Button } from '../Button';
import { Column } from '../Column';
import { Popover } from '../Popover';
import { Row } from '../Row';
import { Text } from '../Text';
import { Icon } from '@/ui/components';

export const EnableAtomicalsPopover = ({ onClose, onConfirm }: { onClose: () => void; onConfirm: () => void }) => {
  return (
    <Popover onClose={onClose}>
      <Column justifyCenter itemsCenter>
        <Text text="Precautions" preset="title-bold" />
        <Icon icon={'warning'} color={'icon_yellow'} size={57} />
        <Column gap="zero">
          <div style={{ fontSize: fontSizes.sm,color:'#ddd' }}>
            Once enabled, the address will be unable to use unconfirmed UTXOs. If you are unsure why your balance is
            unavailable, you can check whether the relevant balance is in an unconfirmed state on mempool.space.
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
