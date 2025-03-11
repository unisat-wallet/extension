import { DecodedPsbt, Risk } from '@/shared/types';
import { useI18n } from '@/ui/hooks/useI18n';
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
  const { t } = useI18n();
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

        <Text text={t('current_fee_rate')} preset="sub" />
        <Text text={`${decodedPsbt.feeRate} sat/vB`} />

        <Text text={t('recommended_fee_rates')} preset="sub" mt="lg" />
        <FeeRateBar readonly />
      </Column>
    </Popover>
  );
};
