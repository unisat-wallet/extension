import BigNumber from 'bignumber.js';

import { runesUtils } from '@/shared/lib/runes-utils';
import { DecodedPsbt } from '@/shared/types';
import { useI18n } from '@/ui/hooks/useI18n';
import { colors } from '@/ui/theme/colors';

import { Column } from '../Column';
import { Icon } from '../Icon';
import { Popover } from '../Popover';
import { Row } from '../Row';
import { Text } from '../Text';

export const RunesBurningList = ({ decodedPsbt, onClose }: { decodedPsbt: DecodedPsbt; onClose: () => void }) => {
  const inputTokenMap: {
    [ticker: string]: {
      amount: string;
      symbol: string;
      divisibility: number;
      spacedRune: string;
    };
  } = {};

  const { t } = useI18n();

  decodedPsbt.inputInfos.forEach((inputInfo) => {
    (inputInfo.runes || []).forEach((balance) => {
      const runeid = balance.runeid || '';
      inputTokenMap[runeid] = inputTokenMap[runeid] || {
        amount: '0',
        symbol: balance.symbol,
        divisibility: balance.divisibility,
        spacedRune: balance.spacedRune
      };
      inputTokenMap[runeid].amount = BigNumber(inputTokenMap[runeid].amount).plus(balance.amount).toString();
    });
  });

  const outputTokenMap: {
    [ticker: string]: {
      amount: string;
      symbol: string;
      divisibility: number;
      spacedRune: string;
    };
  } = {};
  decodedPsbt.outputInfos.forEach((outputInfo) => {
    (outputInfo.runes || []).forEach((balance) => {
      const runeid = balance.runeid || '';
      outputTokenMap[runeid] = outputTokenMap[runeid] || {
        amount: '0',
        symbol: balance.symbol,
        divisibility: balance.divisibility,
        spacedRune: balance.spacedRune
      };
      outputTokenMap[runeid] = outputTokenMap[runeid] || 0;
      outputTokenMap[runeid].amount = BigNumber(outputTokenMap[runeid].amount).plus(balance.amount).toString();
    });
  });

  const burnList: {
    amount: string;
    symbol: string;
    divisibility: number;
    spacedRune: string;
  }[] = [];
  Object.keys(inputTokenMap).forEach((ticker) => {
    if (outputTokenMap[ticker]) {
      const inputAmount = BigNumber(inputTokenMap[ticker].amount);
      const outputAmount = BigNumber(outputTokenMap[ticker].amount);
      if (inputAmount.isGreaterThan(outputAmount)) {
        burnList.push({
          amount: inputAmount.minus(outputAmount).toString(),
          symbol: inputTokenMap[ticker].symbol,
          divisibility: inputTokenMap[ticker].divisibility,
          spacedRune: inputTokenMap[ticker].spacedRune
        });
      }
    } else {
      burnList.push({
        amount: inputTokenMap[ticker].amount,
        symbol: inputTokenMap[ticker].symbol,
        divisibility: inputTokenMap[ticker].divisibility,
        spacedRune: inputTokenMap[ticker].spacedRune
      });
    }
  });

  return (
    <Popover>
      <Column justifyCenter itemsCenter>
        <Row fullX justifyBetween>
          <Row />
          <Text text={t('runes_burn_risk_list')} preset="bold" />
          <Icon
            icon="close"
            onClick={() => {
              onClose();
            }}
          />
        </Row>

        <Row fullX style={{ borderBottomWidth: 1, borderColor: colors.border }} />

        {burnList.map((burn, index) => {
          return (
            <Row
              key={'runes_burn_' + index}
              justifyBetween
              fullX
              px="md"
              py="xl"
              style={{
                backgroundColor: '#1e1a1e',
                borderRadius: 10,
                borderWidth: 1,
                borderColor: '#442326'
              }}>
              <Row>
                <Icon icon="burn" color="red" />
                <Text text={burn.spacedRune} />
              </Row>

              <Text text={`${runesUtils.toDecimalAmount(burn.amount, burn.divisibility)} ${burn.symbol}`} />
            </Row>
          );
        })}
      </Column>
    </Popover>
  );
};
