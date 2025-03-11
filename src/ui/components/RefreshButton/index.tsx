import { ReactEventHandler, useState } from 'react';

import { useI18n } from '@/ui/hooks/useI18n';
import { ReloadOutlined } from '@ant-design/icons';

import { Row } from '../Row';
import { Text } from '../Text';

export function RefreshButton({ onClick }: { onClick: ReactEventHandler<HTMLDivElement> }) {
  const [leftTime, setLeftTime] = useState(0);
  const [disabled, setDisabled] = useState(false);
  const wait = (seconds: number) => {
    if (seconds > 0) {
      setLeftTime(seconds);
      setTimeout(() => {
        wait(seconds - 1);
      }, 1000);
      return;
    }
    setDisabled(false);
  };
  const { t } = useI18n();

  return (
    <Row
      mx="md"
      itemsCenter
      onClick={(e) => {
        if (disabled) {
          return;
        }
        setDisabled(true);
        wait(5);
        onClick(e);
      }}>
      <ReloadOutlined style={{ fontSize: 12 }} />
      <Text text={disabled ? `${leftTime} ${t('secs')}` : t('refresh')} color="white" size="sm" textCenter />
    </Row>
  );
}
