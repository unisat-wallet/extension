import { Switch } from 'antd';
import { useEffect, useState } from 'react';

import { AddressFlagType } from '@/shared/constant';
import { checkAddressFlag } from '@/shared/utils';
import { Button, Card, Column, Icon, Row, Text } from '@/ui/components';
import { Popover } from '@/ui/components/Popover';
import { useCurrentAccount } from '@/ui/state/accounts/hooks';
import { accountActions } from '@/ui/state/accounts/reducer';
import { useAppDispatch } from '@/ui/state/hooks';
import { colors } from '@/ui/theme/colors';
import { fontSizes } from '@/ui/theme/font';
import { shortAddress, useWallet } from '@/ui/utils';

export function UnconfirmedBalanceCard() {
  const [enableUnconfirmed, setEnableUnconfirmed] = useState(false);

  const wallet = useWallet();

  const [unconfirmedPopoverVisible, setUnconfirmedPopoverVisible] = useState(false);
  const currentAccount = useCurrentAccount();

  const dispatch = useAppDispatch();

  useEffect(() => {
    const only_confirmed = checkAddressFlag(currentAccount.flag, AddressFlagType.CONFIRMED_UTXO_MODE);
    if (only_confirmed) {
      setEnableUnconfirmed(false);
    } else {
      setEnableUnconfirmed(true);
    }
  }, []);

  return (
    <Card style={{ borderRadius: 10 }}>
      <Column fullX>
        <Text text={'Unconfirmed Balance Not Spendable'} preset="bold" size="sm" />
        <Row>
          <Text
            preset="sub"
            size="sm"
            text={`To protect your assets, only confirmed balances are spendable when holding Runes (or ARC-20) assets. This is to prevent accidental asset burning.`}
          />
        </Row>
        <Row style={{ borderTopWidth: 1, borderColor: colors.border }} my="md" />

        <Row justifyBetween>
          <Column fullX gap="zero">
            {enableUnconfirmed ? (
              <Text text={`Mandatory use of unconfirmed balance `} size="xs" />
            ) : (
              <Text text={`Mandatory use of unconfirmed balance`} size="xs" />
            )}
            <Text text={`Only applies to current address (${shortAddress(currentAccount.address)})`} preset="sub" />
          </Column>

          <Switch
            onChange={async () => {
              if (enableUnconfirmed) {
                let _currentAccount = currentAccount;
                _currentAccount = await wallet.addAddressFlag(_currentAccount, AddressFlagType.CONFIRMED_UTXO_MODE);
                dispatch(accountActions.setCurrent(_currentAccount));
                setEnableUnconfirmed(false);
              } else {
                setUnconfirmedPopoverVisible(true);
              }
            }}
            checked={enableUnconfirmed}></Switch>
        </Row>
      </Column>

      {unconfirmedPopoverVisible ? (
        <EnableUnconfirmedPopover
          onClose={() => setUnconfirmedPopoverVisible(false)}
          onConfirm={async () => {
            let _currentAccount = currentAccount;
            _currentAccount = await wallet.addAddressFlag(
              _currentAccount,
              AddressFlagType.DISABLE_AUTO_SWITCH_CONFIRMED
            );
            _currentAccount = await wallet.removeAddressFlag(_currentAccount, AddressFlagType.CONFIRMED_UTXO_MODE);
            dispatch(accountActions.setCurrent(_currentAccount));
            setEnableUnconfirmed(true);
            setUnconfirmedPopoverVisible(false);
          }}
        />
      ) : null}
    </Card>
  );
}

function EnableUnconfirmedPopover({ onClose, onConfirm }: { onClose: () => void; onConfirm: () => void }) {
  return (
    <Popover>
      <Column justifyCenter itemsCenter>
        <Icon icon={'warning'} color={'icon_yellow'} size={57} />

        <Text text="Enable Unconfirmed Balance" preset="title-bold" />
        <Column gap="zero">
          <div style={{ fontSize: fontSizes.sm, color: '#ddd', marginTop: 20 }}>
            If Runes (or ARC20) assets are detected in the given address, the unconfirmed UTXOs are explicitly not
            allowed to be spent until it's confirmed. Forcely spending these unconfirmed assets will incur the risks of
            losing assets.
          </div>
        </Column>

        <Column full mt={'xl'}>
          <Button
            text="Allow using Unconfirmed Balance"
            preset="primaryV2"
            full
            onClick={(e) => {
              if (onConfirm) {
                onConfirm();
              }
            }}
          />
          <Button
            text="Cancel"
            full
            preset="defaultV2"
            onClick={(e) => {
              if (onClose) {
                onClose();
              }
            }}
          />
        </Column>
      </Column>
    </Popover>
  );
}
