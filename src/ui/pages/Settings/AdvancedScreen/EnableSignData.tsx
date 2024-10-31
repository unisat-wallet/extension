import { Checkbox, Switch } from 'antd';
import { useEffect, useState } from 'react';

import { Button, Card, Column, Icon, Row, Text } from '@/ui/components';
import { Popover } from '@/ui/components/Popover';
import { colors } from '@/ui/theme/colors';
import { useWallet } from '@/ui/utils';

export function EnableSignDataCard() {
  const wallet = useWallet();
  const [enableSignData, setEnableSignData] = useState(false);

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
}
