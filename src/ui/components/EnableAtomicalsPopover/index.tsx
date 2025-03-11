import { Icon } from '@/ui/components';
import { useI18n } from '@/ui/hooks/useI18n';
import { fontSizes } from '@/ui/theme/font';

import { Button } from '../Button';
import { Column } from '../Column';
import { Popover } from '../Popover';
import { Text } from '../Text';

export const EnableAtomicalsPopover = ({ onClose, onConfirm }: { onClose: () => void; onConfirm: () => void }) => {
  const { t } = useI18n();
  return (
    <Popover onClose={onClose}>
      <Column justifyCenter itemsCenter>
        <Text text={t('precautions')} preset="title-bold" />
        <Icon icon={'warning'} color={'icon_yellow'} size={57} />
        <Column gap="zero">
          <div style={{ fontSize: fontSizes.sm, color: '#ddd' }}>
            {t('in_the_current_version_only_the_confirmed_balance_can_be_used_once_atomicals_enabled')}
          </div>
        </Column>

        <Column full mt={'xl'}>
          <Button
            text={t('enable_atomicals')}
            preset="primary"
            full
            onClick={(e) => {
              if (onConfirm) {
                onConfirm();
              }
            }}
          />
          <Button
            text={t('cancel')}
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
