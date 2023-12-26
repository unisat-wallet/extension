import { fontSizes } from '@/ui/theme/font';

import { Button } from '../Button';
import { Column } from '../Column';
import { Popover } from '../Popover';
import { Row } from '../Row';
import { Text } from '../Text';

export const EnableAtomicalsPopover = ({ onClose, onConfirm }: { onClose: () => void; onConfirm: () => void }) => {
  return (
    <Popover onClose={onClose}>
      <Column justifyCenter itemsCenter>
        <Text text="Precautions" preset="title-bold" />

        <Column style={{ marginTop: 20 }} gap="zero">
          <div style={{ fontSize: fontSizes.sm }}>
            <span>- </span>
            Once enabled, the address will be unable to use unconfirmed UTXOs. If you are unsure why your balance is
            unavailable, you can check whether the relevant balance is in an unconfirmed state on mempool.space.
          </div>
        </Column>

        <Row full mt={'xl'}>
          <Button
            text="Cancel"
            full
            onClick={(e) => {
              if (close) {
                close();
              }
            }}
          />
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
        </Row>
      </Column>
    </Popover>
  );
};
