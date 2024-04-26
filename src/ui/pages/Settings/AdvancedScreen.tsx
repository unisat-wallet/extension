import { Checkbox, Switch } from 'antd';
import { useEffect, useState } from 'react';

import { AddressFlagType } from '@/shared/constant';
import { checkAddressFlag } from '@/shared/utils';
import { Button, Card, Column, Content, Header, Icon, Layout, Row, Text } from '@/ui/components';
import { EnableUnconfirmedPopover } from '@/ui/components/EnableUnconfirmedPopover';
import { Popover } from '@/ui/components/Popover';
import { useCurrentAccount } from '@/ui/state/accounts/hooks';
import { accountActions } from '@/ui/state/accounts/reducer';
import { useAppDispatch } from '@/ui/state/hooks';
import { ColorTypes, colors } from '@/ui/theme/colors';
import { shortAddress, useWallet } from '@/ui/utils';

export default function AdvancedScreen() {
  const wallet = useWallet();
  const [enableSignData, setEnableSignData] = useState(false);

  const [enableSignDataPopoverVisible, setEnableSignDataPopoverVisible] = useState(false);

  const [enableUnconfirmed, setEnableUnconfirmed] = useState(false);
  const [unconfirmedPopoverVisible, setUnconfirmedPopoverVisible] = useState(false);

  const currentAccount = useCurrentAccount();

  const dispatch = useAppDispatch();
  const [init, setInit] = useState(false);
  useEffect(() => {
    wallet
      .getEnableSignData()
      .then((v) => {
        setEnableSignData(v);
      })
      .finally(() => {
        setInit(true);
      });

    const only_confirmed = checkAddressFlag(currentAccount.flag, AddressFlagType.CONFIRMED_UTXO_MODE);
    if (only_confirmed) {
      setEnableUnconfirmed(false);
    } else {
      setEnableUnconfirmed(true);
    }
  }, []);

  if (!init) {
    return <Layout></Layout>;
  }

  return (
    <Layout>
      <Header
        onBack={() => {
          window.history.go(-1);
        }}
        title="Advanced"
      />
      <Content>
        <Column>
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
                  <Text
                    text={`Only applies to current address (${shortAddress(currentAccount.address)})`}
                    preset="sub"
                  />
                </Column>

                <Switch
                  onChange={async () => {
                    if (enableUnconfirmed) {
                      let _currentAccount = currentAccount;
                      _currentAccount = await wallet.addAddressFlag(
                        _currentAccount,
                        AddressFlagType.CONFIRMED_UTXO_MODE
                      );
                      dispatch(accountActions.setCurrent(_currentAccount));
                      setEnableUnconfirmed(false);
                    } else {
                      setUnconfirmedPopoverVisible(true);
                    }
                  }}
                  checked={enableUnconfirmed}></Switch>
              </Row>
            </Column>
          </Card>
        </Column>

        <Column>
          <Card style={{ borderRadius: 10 }}>
            <Column>
              <Text text={'signData requests'} preset="bold" size="sm" />
              <Row>
                <Text
                  preset="sub"
                  size="sm"
                  text={`If you enable this setting, you might get signature requests that aren't readable. By signing a message you don't understand, you could be agreeing to give away your funds and NFTs.You're at risk for phishing attacks. Protect yourself by turning off signData.`}
                />
              </Row>

              <Row style={{ borderTopWidth: 1, borderColor: colors.border }} my="md" />

              <Row justifyBetween>
                <Text text={'Allow signData requests'} size="xs" />

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
          </Card>
        </Column>
      </Content>
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
    </Layout>
  );
}

const riskColor: { [key: string]: ColorTypes } = {
  high: 'danger',
  low: 'orange'
};

export const EnableSignDataPopover = ({ onNext, onCancel }: { onNext: () => void; onCancel: () => void }) => {
  const [understand, setUnderstand] = useState(false);
  return (
    <Popover onClose={onCancel}>
      <Column justifyCenter itemsCenter>
        <Text text={'Use at your own risk'} textCenter preset="title-bold" color="orange" />

        <Column mt="lg">
          <Column>
            <Row>
              <Text
                text={
                  'Allowing signData requests can make you vulnerable to phishing attacks. Always review the URL and be careful when signing messages that contain code.'
                }
              />
            </Row>

            <Row style={{ borderTopWidth: 1, borderColor: colors.border }} my="md" />

            <Row style={{ backgroundColor: 'darkred', padding: 5, borderRadius: 5 }}>
              <Row>
                <Icon icon="info" size={40} color="white" />
                <Text text={"If you've been asked to turn this setting on, you might be getting scammed"} />
              </Row>
            </Row>

            <Row>
              <Row>
                <Checkbox
                  onChange={() => {
                    setUnderstand(!understand);
                  }}
                  checked={understand}></Checkbox>
                <Text text={'I understand that I can lose all of my funds and NFTs if I enable signData requests.'} />
              </Row>
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
};
