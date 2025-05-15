import { ReactEventHandler, useState } from 'react';

import { useI18n } from '@/ui/hooks/useI18n';
import { ReloadOutlined } from '@ant-design/icons';

import { Row } from '../Row';
import { Text } from '../Text';
import styles from './index.module.less';

export function RefreshButton({
  onClick,
  hideText = false
}: {
  onClick: ReactEventHandler<HTMLDivElement>;
  hideText?: boolean;
}) {
  const [leftTime, setLeftTime] = useState(0);
  const [disabled, setDisabled] = useState(false);
  const [isRotating, setIsRotating] = useState(false);

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
        setIsRotating(true);

        setTimeout(() => {
          setIsRotating(false);
        }, 1000);

        wait(5);
        onClick(e);
      }}>
      <ReloadOutlined className={isRotating ? styles.rotate : ''} style={{ fontSize: 12 }} />
      {!hideText && (
        <Text text={disabled ? `${leftTime} ${t('secs')}` : t('refresh')} color="white" size="sm" textCenter />
      )}
    </Row>
  );
}
