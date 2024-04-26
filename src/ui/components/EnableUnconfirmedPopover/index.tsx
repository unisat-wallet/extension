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
          <div style={{ fontSize: fontSizes.sm, color: '#ddd' }}>
            Once unconfirmed balance are enabled, you will be able to utilize and send them. Nevertheless, please be
            mindful of the following risks:
          </div>

          <div style={{ fontSize: fontSizes.sm, color: '#ddd', fontWeight: 'bold', marginTop: 20 }}>
            If you hold either ARC-20 or Runes assets, you cannot enable unconfirmed balance. Doing so might result in
            asset burning.
          </div>
        </Column>

        <Column full mt={'xl'}>
          <Button
            text="Enable"
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
