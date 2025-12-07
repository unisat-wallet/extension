import { useState } from 'react';

import { useI18n, useWallet } from '@unisat/wallet-state';

import { Button } from '../Button';
import { Checkbox } from '../Checkbox';
import { Column } from '../Column';
import { Icon } from '../Icon';
import { Line } from '../Line';
import { Popover } from '../Popover';
import { Row } from '../Row';
import { Text } from '../Text';

export const LowFeeModePopover = ({ onConfirm, onClose }: { onClose: () => void; onConfirm: () => void }) => {
  const [understand, setUnderstand] = useState(false);

  const { t } = useI18n();

  const wallet = useWallet();

  return (
    <Popover onClose={onClose}>
      <Column justifyCenter itemsCenter>
        <Row itemsCenter>
          <Icon icon={'alert'} color={'yellow'} size={16} />
          <Text text={t('low_fee_mode_title')} preset="title" />
        </Row>

        <Line />
        <Column gap="md" fullX mb="md">
          <Text text={t('low_fee_mode_description')} mt="md" />

          <Row
            justifyCenter
            mt="md"
            onClick={() => {
              setUnderstand(!understand);
            }}>
            <Checkbox checked={understand} />
            <Text text={t('low_fee_mode_aggreement')} preset="sub" />
          </Row>
        </Column>

        <Row full>
          <Button
            text={t('cancel')}
            preset="default"
            full
            onClick={(e) => {
              if (onClose) {
                onClose();
              }
            }}
          />

          <Button
            text={t('confirm')}
            preset="primaryV2"
            disabled={!understand}
            full
            onClick={async (e) => {
              await wallet.setAcceptLowFeeMode(true);
              if (onConfirm) {
                onConfirm();
              }
            }}
          />
        </Row>
      </Column>
    </Popover>
  );
};
