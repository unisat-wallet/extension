import { useState } from 'react';

import { AUTO_LOCKTIMES, DEFAULT_LOCKTIME_ID } from '@/shared/constant';
import { Card, Column, Icon, Row, Text } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import { Loading } from '@/ui/components/ActionComponent/Loading';
import { Popover } from '@/ui/components/Popover';
import { useAppDispatch } from '@/ui/state/hooks';
import { useAutoLockTimeId } from '@/ui/state/settings/hooks';
import { settingsActions } from '@/ui/state/settings/reducer';
import { colors } from '@/ui/theme/colors';
import { useWallet } from '@/ui/utils';

export function LockTimeCard() {
  const [lockTimePopoverVisible, setLockTimePopoverVisible] = useState(false);
  const autoLockTimeId = useAutoLockTimeId();
  const lockTimeConfig = AUTO_LOCKTIMES[autoLockTimeId] || AUTO_LOCKTIMES[DEFAULT_LOCKTIME_ID];

  return (
    <Card style={{ borderRadius: 10 }}>
      <Row
        onClick={() => {
          setLockTimePopoverVisible(true);
        }}
        justifyCenter
        itemsCenter
        full>
        <Column>
          <Icon size={16} icon="overview"></Icon>
        </Column>
        <Column>
          <Text size="sm" text={'Automatic Lock Time'} preset="bold"></Text>
        </Column>
        <Column style={{ marginLeft: 'auto' }}>
          <Row justifyCenter itemsCenter>
            <Text size="sm" color="gold" text={lockTimeConfig.label}></Text>
            <Icon icon="down" size={18}></Icon>
          </Row>
        </Column>
      </Row>

      {lockTimePopoverVisible ? (
        <LockTimePopover
          onNext={() => {
            setLockTimePopoverVisible(false);
          }}
          onCancel={() => {
            setLockTimePopoverVisible(false);
          }}
        />
      ) : null}
    </Card>
  );
}
function LockTimePopover({ onNext, onCancel }: { onNext: () => void; onCancel: () => void }) {
  const [loading, setLoading] = useState(false);

  const autoLockTimeId = useAutoLockTimeId();
  const dispatch = useAppDispatch();
  const wallet = useWallet();
  const tools = useTools();
  return (
    <Popover onClose={onCancel}>
      <Column>
        {AUTO_LOCKTIMES.map((v, i) => {
          const check = v.id === autoLockTimeId;
          return (
            <Card
              key={i}
              mb="sm"
              preset="style1"
              style={{
                height: 50,
                minHeight: 50,
                backgroundColor: 'rgba(255,255,255,0.01)',
                borderBottomColor: colors.transparent,
                borderBottomWidth: 0.2
              }}>
              <Row
                onClick={async () => {
                  const lockTimeId = v.id;
                  await wallet.setAutoLockTimeId(lockTimeId);
                  dispatch(settingsActions.updateSettings({ autoLockTimeId: lockTimeId }));
                  tools.toastSuccess(`The auto-lock time has been changed to ${v.label}`);
                  onNext();
                }}
                itemsCenter
                full>
                <Column>
                  <Text color={check ? 'white' : 'textDim'} size="sm" text={v.label}></Text>
                </Column>
                <Column style={{ marginLeft: 'auto' }}>
                  {check && !loading && <Icon icon="check"></Icon>}
                  {check && loading && <Loading />}
                </Column>
              </Row>
            </Card>
          );
        })}
        <Row></Row>
      </Column>
    </Popover>
  );
}
