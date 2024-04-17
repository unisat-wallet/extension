import { Icon } from '@/ui/components';
import { fontSizes } from '@/ui/theme/font';

import { Button } from '../Button';
import { Column } from '../Column';
import { Popover } from '../Popover';
import { Text } from '../Text';

export const DisableUnconfirmedsPopover = ({ onClose }: { onClose: () => void }) => {
  return (
    <Popover onClose={onClose}>
      <Column justifyCenter itemsCenter>
        <Icon icon={'warning'} color={'icon_yellow'} size={57} />
        <Text text="Unconfirmed Balance Disabled" preset="title-bold" />

        <Column gap="zero">
          <div style={{ fontSize: fontSizes.sm, color: '#ddd' }}>
            You are holding ARC-20 or Runes assets. To prevent asset burning, your unconfirmed balance have been
            disabled.
          </div>

          <div style={{ fontSize: fontSizes.sm, color: '#ddd', marginTop: 10 }}>
            You can adjust it in the advanced features of the settings.
          </div>
        </Column>

        <Column full mt={'xl'}>
          <Button
            text="Close"
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
