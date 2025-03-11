import { Checkbox, Tooltip } from 'antd';
import { useEffect, useState } from 'react';

import { useI18n } from '@/ui/hooks/useI18n';
import { fontSizes } from '@/ui/theme/font';

import { Icon } from '../Icon';
import { Row } from '../Row';
import { Text } from '../Text';

export function RBFBar({ defaultValue, onChange }: { defaultValue?: boolean; onChange: (val: boolean) => void }) {
  const [enableRBF, setEnableRBF] = useState(defaultValue || false);
  const { t } = useI18n();
  useEffect(() => {
    onChange(enableRBF);
  }, [enableRBF]);
  return (
    <Row justifyBetween>
      <Tooltip
        title={t('a_feature_allows_the_transaction_to_be_replaced')}
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
