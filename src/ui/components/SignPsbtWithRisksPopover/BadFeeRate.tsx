import { DecodedPsbt, Risk } from '@/shared/types';
import { colors } from '@/ui/theme/colors';

import { Column } from '../Column';
import { FeeRateBar } from '../FeeRateBar';
import { Icon } from '../Icon';
import { Popover } from '../Popover';
import { Row } from '../Row';
import { Text } from '../Text';

export const BadFeeRate = ({
  decodedPsbt,
  risk,
  onClose
}: {
  decodedPsbt: DecodedPsbt;
  risk: Risk;
  onClose: () => void;
}) => {
  return (
    <Popover>
      <Column justifyCenter itemsCenter>
        <Row fullX justifyBetween>
          <Row />
          <Text text={risk.title} preset="bold" />
          <Icon
            icon="close"
            onClick={() => {
              onClose();
            }}
          />
        </Row>

        <Row fullX style={{ borderBottomWidth: 1, borderColor: colors.border }} />

        <Text text={`Current fee rate:`} preset="sub" />
        <Text text={`${decodedPsbt.feeRate} sat/vB`} />

        <Text text={`Recommended fee rates:`} preset="sub" mt="lg" />
        <FeeRateBar readonly />
      </Column>
    </Popover>
  );
};
