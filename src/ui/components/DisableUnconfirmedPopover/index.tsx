import { Image } from '@/ui/components';
import { useI18n } from '@/ui/hooks/useI18n';

import { Button } from '../Button';
import { Column } from '../Column';
import { Popover } from '../Popover';
import { Text } from '../Text';

export const DisableUnconfirmedsPopover = ({ onClose }: { onClose: () => void }) => {
  const { t } = useI18n();
  return (
    <Popover>
      <Column justifyCenter itemsCenter>
        <Image src="./images/artifacts/security.png" size={80} />
        <Text text={t('security_notice')} color="gold" textCenter size="lg" />

        <Text text={t('unconfirmed_balance_not_spendable')} color="gold" textCenter size="md" />

        <Column gap="zero" mt="sm">
          <Text
            size="sm"
            text={t('this_message_serves_as_a_notice_that_if_runes_assets_are_detected_in_your_address_your')}
          />

          <Text mt="md" preset="sub" size="sm" text={t('to_enable_spending_of_unconfirmed_balances_please_')} />
        </Column>

        <Column full mt={'xl'}>
          <Button
            text={t('i_understand')}
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
