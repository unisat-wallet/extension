import { Checkbox, Switch } from 'antd';
import { useEffect, useState } from 'react';

import { Button, Card, Column, Icon, Row, Text } from '@/ui/components';
import { Popover } from '@/ui/components/Popover';
import { useI18n } from '@/ui/hooks/useI18n';
import { colors } from '@/ui/theme/colors';
import { useWallet } from '@/ui/utils';

export function EnableSignDataCard() {
  const wallet = useWallet();
  const [enableSignData, setEnableSignData] = useState(false);
  const { t } = useI18n();
  const [enableSignDataPopoverVisible, setEnableSignDataPopoverVisible] = useState(false);

  useEffect(() => {
    wallet
      .getEnableSignData()
      .then((v) => {
        setEnableSignData(v);
      })
      .finally(() => {
        // setInit(true);
      });
  }, []);

  return (
    <Card style={{ borderRadius: 10 }}>
      <Column>
        <Text text={t('sign_data_requests')} preset="bold" size="sm" />
        <Row>
          <Text preset="sub" size="sm" text={t('enable_sign_data_warning')} />
        </Row>

        <Row style={{ borderTopWidth: 1, borderColor: colors.border }} my="md" />

        <Row justifyBetween>
          <Text text={t('allow_sign_data_requests')} size="xs" />

          <Switch
            onChange={() => {
              if (enableSignData) {
                wallet.setEnableSignData(false).then(() => {
                  setEnableSignData(false);
                });
              } else {
                setEnableSignDataPopoverVisible(true);
              }
            }}
            checked={enableSignData}></Switch>
        </Row>
      </Column>
      {enableSignDataPopoverVisible ? (
        <EnableSignDataPopover
          onNext={() => {
            wallet.setEnableSignData(true).then(() => {
              setEnableSignData(true);
              setEnableSignDataPopoverVisible(false);
            });
          }}
          onCancel={() => {
            setEnableSignDataPopoverVisible(false);
          }}
        />
      ) : null}
    </Card>
  );
}
function EnableSignDataPopover({ onNext, onCancel }: { onNext: () => void; onCancel: () => void }) {
  const [understand, setUnderstand] = useState(false);
  const { t } = useI18n();
  return (
    <Popover onClose={onCancel}>
      <Column justifyCenter itemsCenter>
        <Text text={t('use_at_your_own_risk')} textCenter preset="title-bold" color="orange" />

        <Column mt="lg">
          <Column>
            <Row>
              <Text text={t('enable_sign_data_popover_warning')} />
            </Row>

            <Row style={{ borderTopWidth: 1, borderColor: colors.border }} my="md" />

            <Row style={{ backgroundColor: 'darkred', padding: 5, borderRadius: 5 }}>
              <Row>
                <Icon icon="info" size={40} color="white" />
                <Text text={t('enable_sign_data_popover_warning_2')} />
              </Row>
            </Row>

            <Row>
              <Row>
                <Checkbox
                  onChange={() => {
                    setUnderstand(!understand);
                  }}
                  checked={understand}></Checkbox>
                <Text text={t('understand_sign_data_warning')} />
              </Row>
            </Row>
          </Column>
        </Column>

        <Row full mt="lg">
          <Button
            text={t('cancel')}
            full
            preset="default"
            onClick={(e) => {
              if (onCancel) {
                onCancel();
              }
            }}
          />
          <Button
            text={t('continue')}
            full
            disabled={!understand}
            preset="primary"
            onClick={(e) => {
              if (onNext) {
                onNext();
              }
            }}
          />
        </Row>
      </Column>
    </Popover>
  );
}
