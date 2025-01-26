import { Switch } from 'antd';
import { useState } from 'react';

import { AddressFlagType } from '@/shared/constant';
import { checkAddressFlag } from '@/shared/utils';
import { Button, Card, Column, Row, Text } from '@/ui/components';
import { Popover } from '@/ui/components/Popover';
import { useChangeAddressFlagCallback, useCurrentAccount, useReloadAccounts } from '@/ui/state/accounts/hooks';

export function EnableAtomicalsCard() {
  const currentAccount = useCurrentAccount();
  const isEnableAtomicals = checkAddressFlag(currentAccount.flag, AddressFlagType.DISABLE_ARC20) == false;
  const reloadAccounts = useReloadAccounts();

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
          <Text text={'Enable Atomicals Assets'} preset="bold" size="sm" />

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
  return (
    <Popover onClose={onCancel}>
      <Column justifyCenter itemsCenter>
        <Text text={'Use at your own risk'} textCenter preset="title-bold" color="orange" />

        <Column mt="lg">
          <Column>
            <Row>
              <Text
                text={
                  'The atomicals assets will no longer be displayed in the wallet, and they can be spent as regular balance. Please proceed with caution.'
                }
              />
            </Row>
          </Column>
        </Column>

        <Row full mt="lg">
          <Button
            text="Cancel"
            full
            preset="default"
            onClick={(e) => {
              if (onCancel) {
                onCancel();
              }
            }}
          />
          <Button
            text="Continue"
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
