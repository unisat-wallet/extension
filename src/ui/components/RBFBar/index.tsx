import { useEffect, useState } from 'react';

import { fontSizes } from '@/ui/theme/font';
import { useI18n } from '@unisat/wallet-state';

import { Checkbox } from '../Checkbox';
import { Icon } from '../Icon';
import { Row } from '../Row';
import { Text } from '../Text';
import { Tooltip } from '../Tooltip';

export function RBFBar({ defaultValue, onChange }: { defaultValue?: boolean; onChange: (val: boolean) => void }) {
  const [enableRBF, setEnableRBF] = useState(defaultValue || false);
  const { t } = useI18n();
  useEffect(() => {
    onChange(enableRBF);
  }, [enableRBF]);
  return (
    <Row justifyBetween>
      <Tooltip
        title={t('rbf_tip')}
        overlayStyle={{
          fontSize: fontSizes.xs
        }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Row itemsCenter>
            <Text text="RBF" />
            <Icon icon="circle-question" color="textDim" />
          </Row>
        </div>
      </Tooltip>
      <Checkbox
        onChange={() => {
          setEnableRBF(!enableRBF);
        }}
        checked={enableRBF}></Checkbox>
    </Row>
  );
}
