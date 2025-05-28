import { ColorTypes, colors } from '@/ui/theme/colors';

import { Button } from '../Button';
import { Column } from '../Column';
import { Popover } from '../Popover';
import { Row } from '../Row';
import { Text } from '../Text';

const riskColor: { [key: string]: ColorTypes } = {
  high: 'danger',
  low: 'orange'
};

export const WarningPopover = ({
  risks,
  onClose
}: {
  risks: { color?: ColorTypes; desc: string }[];
  onClose: () => void;
}) => {
  return (
    <Popover onClose={onClose}>
      <Column justifyCenter itemsCenter>
        <Text text={'WARNING'} textCenter preset="title-bold" color="orange" />

        <Column mt="lg">
          {risks.map((risk, index) => (
            <Column key={'risk_' + index}>
              <Row>
                <Text text={risk.desc} />
              </Row>

              <Row style={{ borderTopWidth: 1, borderColor: colors.border }} my="md" />
            </Column>
          ))}
        </Column>

        <Row full mt="lg">
          <Button
            text="OK"
            full
            onClick={(e) => {
              if (onClose) {
                onClose();
              }
            }}
          />
        </Row>
      </Column>
    </Popover>
  );
};
