import { Checkbox } from 'antd';
import { useEffect, useState } from 'react';

import { useI18n } from '@/ui/hooks/useI18n';
import { colors } from '@/ui/theme/colors';
import { fontSizes } from '@/ui/theme/font';

import { Button } from '../Button';
import { Column } from '../Column';
import { Icon } from '../Icon';
import { Popover } from '../Popover';
import { Row } from '../Row';
import { Text } from '../Text';

export const NoticePopover = ({ onClose }: { onClose: () => void }) => {
  const [checked1, setChecked1] = useState(false);
  const [checked2, setChecked2] = useState(false);

  const [enable, setEnable] = useState(false);
  const [coolDown, setCoolDown] = useState(3);
  const { t } = useI18n();

  useEffect(() => {
    if (coolDown > 0) {
      setTimeout(() => {
        setCoolDown(coolDown - 1);
      }, 1000);
    } else {
      setEnable(true);
    }
  }, [coolDown]);

  return (
    <Popover>
      <Column justifyCenter itemsCenter>
        <Text text={t('compatibility_tips')} preset="title-bold" />
        <Icon icon={'info'} color={'icon_yellow'} size={57} />

        <Column gap="zero">
          <Text text={t('please_be_aware_that')} preset={'bold'} />
          <div style={{ marginTop: 8 }}>
            <Checkbox
              checked={checked1}
              onChange={(e) => {
                setChecked1(e.target.checked);
              }}>
              <div style={{ fontSize: fontSizes.sm }}>
                {t('for_ordinals_assets')}
                <span style={{ color: '#EBB94C' }}>{t('rare_sats')}</span> {t('are_not_supported')}
              </div>
            </Checkbox>
          </div>
          <Row style={{ borderTopWidth: 1, borderColor: colors.border }} my="md" />
        </Column>

        <Row full>
          <Button
            text={coolDown > 0 ? `${t('ok')} (${coolDown}s)` : t('ok')}
            preset="primary"
            disabled={!checked1}
            full
            onClick={(e) => {
              if (!enable) return;
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
