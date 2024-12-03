import { useEffect, useState } from 'react';

import { useChainType } from '@/ui/state/settings/hooks';
import { colors } from '@/ui/theme/colors';
import { useWallet } from '@/ui/utils';

import { Card } from '../Card';
import { Column } from '../Column';
import { Icon } from '../Icon';
import { Popover } from '../Popover';
import { Row } from '../Row';
import { Text } from '../Text';

enum FeeRateType {
  SLOW,
  AVG,
  FAST,
  CUSTOM
}

const FEE_TITLES = ['Low Priority', 'Medium Priority', 'High Priority'];

interface FeeOption {
  title: string;
  desc?: string;
  feeRate: number;
}
export function FeeRateIcon() {
  const wallet = useWallet();
  const [feeOptions, setFeeOptions] = useState<FeeOption[]>([]);

  const [feeOptionVisible, setFeeOptionVisible] = useState(false);

  const chainType = useChainType();
  useEffect(() => {
    wallet.getFeeSummary().then((v) => {
      setFeeOptions(v.list);
    });
  }, [chainType]);

  const feeRate = feeOptions[FeeRateType.AVG] ? feeOptions[FeeRateType.AVG].feeRate : 0;

  let color = 'textDim';
  if (feeRate > 100) {
    color = 'red';
  } else if (feeRate > 20) {
    color = 'yellow';
  } else if (feeRate > 0) {
    color = 'green';
  }
  return (
    <Card
      preset="style2"
      style={{
        backgroundColor: 'rgba(255,255,255,0.12)',
        height: 28,
        borderRadius: 8
      }}>
      <Row
        onClick={() => {
          setFeeOptionVisible(true);
        }}>
        <Icon icon="gas" />
        <Text text={feeRate > 0 ? feeRate : '-'} size="xxs" color={color as any} />
      </Row>

      {feeOptionVisible ? (
        <FeeOptionsPopover
          feeOptions={feeOptions}
          onClose={() => {
            setFeeOptionVisible(false);
          }}
        />
      ) : null}
    </Card>
  );
}

function FeeOptionsPopover({ feeOptions, onClose }: { feeOptions: FeeOption[]; onClose: () => void }) {
  return (
    <Popover onClose={onClose}>
      <Column>
        <Row
          justifyCenter
          style={{ borderBottomWidth: 1, borderColor: colors.border, marginBottom: 10, paddingBottom: 10 }}>
          <Text text={'Network Fee'} preset="bold" />
        </Row>
        {feeOptions.map((v, i) => {
          return (
            <Card
              key={i}
              mb="sm"
              preset="style1"
              itemsCenter
              style={{
                height: 50,
                minHeight: 50,
                backgroundColor: 'rgba(255,255,255,0.08)',
                borderBottomColor: colors.transparent,
                borderBottomWidth: 0.2
              }}>
              <Row justifyBetween full itemsCenter>
                <Column>
                  <Text color={'textDim'} size="sm" text={FEE_TITLES[i] || v.title}></Text>
                </Column>

                <Row>
                  <Text color={'white'} size="sm" text={v.feeRate}></Text>
                  <Text color={'textDim'} size="sm" text="sats/vB"></Text>
                </Row>
              </Row>
            </Card>
          );
        })}
      </Column>
    </Popover>
  );
}
