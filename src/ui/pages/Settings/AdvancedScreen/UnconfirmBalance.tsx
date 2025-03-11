import { Switch } from 'antd';
import { useEffect, useState } from 'react';

import { AddressFlagType } from '@/shared/constant';
import { checkAddressFlag } from '@/shared/utils';
import { Button, Card, Column, Icon, Row, Text } from '@/ui/components';
import { Popover } from '@/ui/components/Popover';
import { useI18n } from '@/ui/hooks/useI18n';
import { useCurrentAccount } from '@/ui/state/accounts/hooks';
import { accountActions } from '@/ui/state/accounts/reducer';
import { useAppDispatch } from '@/ui/state/hooks';
import { colors } from '@/ui/theme/colors';
import { fontSizes } from '@/ui/theme/font';
import { shortAddress, useWallet } from '@/ui/utils';

export function UnconfirmedBalanceCard() {
  const [enableUnconfirmed, setEnableUnconfirmed] = useState(false);
  const { t } = useI18n();
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
        <Text text={t('unconfirmed_balance_not_spendable')} preset="bold" size="sm" />
        <Row>
          <Text preset="sub" size="sm" text={t('unconfirmed_balance_not_spendable_warning')} />
        </Row>
        <Row style={{ borderTopWidth: 1, borderColor: colors.border }} my="md" />

        <Row justifyBetween>
          <Column fullX gap="zero">
            {enableUnconfirmed ? (
              <Text text={t('mandatory_use_of_unconfirmed_balance')} size="xs" />
            ) : (
              <Text text={t('mandatory_use_of_unconfirmed_balance')} size="xs" />
            )}
            <Text
              text={`${t('only_applies_to_current_address')} (${shortAddress(currentAccount.address)})`}
              preset="sub"
            />
          </Column>

          <Switch
            className="custom-switch"
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
            checked={enableUnconfirmed}
          />
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
  const { t } = useI18n();
  return (
    <Popover>
      <Column justifyCenter itemsCenter>
        <Icon icon={'warning'} color={'icon_yellow'} size={57} />

        <Text text={t('enable_unconfirmed_balance')} preset="title-bold" />
        <Column gap="zero">
          <div style={{ fontSize: fontSizes.sm, color: '#ddd', marginTop: 20 }}>
            {t('enable_unconfirmed_balance_warning')}
          </div>
        </Column>

        <Column full mt={'xl'}>
          <Button
            text={t('allow_using_unconfirmed_balance')}
            preset="primaryV2"
            full
            onClick={(e) => {
              if (onConfirm) {
                onConfirm();
              }
            }}
          />
          <Button
            text={t('cancel')}
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
