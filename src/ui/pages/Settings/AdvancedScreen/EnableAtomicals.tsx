import { Switch } from 'antd';
import { useState } from 'react';

import { AddressFlagType } from '@/shared/constant';
import { checkAddressFlag } from '@/shared/utils';
import { Button, Card, Column, Row, Text } from '@/ui/components';
import { Popover } from '@/ui/components/Popover';
import { useI18n } from '@/ui/hooks/useI18n';
import { useChangeAddressFlagCallback, useCurrentAccount, useReloadAccounts } from '@/ui/state/accounts/hooks';

export function EnableAtomicalsCard() {
  const currentAccount = useCurrentAccount();
  const isEnableAtomicals = checkAddressFlag(currentAccount.flag, AddressFlagType.DISABLE_ARC20) == false;
  const reloadAccounts = useReloadAccounts();
  const { t } = useI18n();

  const [disableAtomicalsPopoverVisible, setDisableAtomicalsPopoverVisible] = useState(false);

  const changeAddressFlag = useChangeAddressFlagCallback();
  const enableAtomicals = async () => {
    await changeAddressFlag(false, AddressFlagType.DISABLE_ARC20);
  };

  const disableAtomicals = async () => {
    await changeAddressFlag(true, AddressFlagType.DISABLE_ARC20);
  };

  return (
    <Card style={{ borderRadius: 10 }}>
      <Column fullX>
        <Row justifyBetween>
          <Text text={t('enable_atomicals_assets')} preset="bold" size="sm" />

          <Switch
            onChange={async () => {
              if (isEnableAtomicals) {
                setDisableAtomicalsPopoverVisible(true);
              } else {
                await enableAtomicals();
                reloadAccounts();
              }
            }}
            checked={isEnableAtomicals}></Switch>
        </Row>
      </Column>

      {disableAtomicalsPopoverVisible ? (
        <DisableAtomicalsPopover
          onNext={async () => {
            await disableAtomicals();
            reloadAccounts();
            setDisableAtomicalsPopoverVisible(false);
          }}
          onCancel={() => {
            setDisableAtomicalsPopoverVisible(false);
          }}
        />
      ) : null}
    </Card>
  );
}

function DisableAtomicalsPopover({ onNext, onCancel }: { onNext: () => void; onCancel: () => void }) {
  const { t } = useI18n();
  return (
    <Popover onClose={onCancel}>
      <Column justifyCenter itemsCenter>
        <Text text={t('use_at_your_own_risk')} textCenter preset="title-bold" color="orange" />

        <Column mt="lg">
          <Column>
            <Row>
              <Text text={t('enable_atomicals_assets_warning')} />
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
            // disabled={!understand}
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
