import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { getAutoLockTimes } from '@/shared/constant';
import { Card, Column, Content, Header, Icon, Layout, Row, Text } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import { Loading } from '@/ui/components/ActionComponent/Loading';
import { useI18n } from '@/ui/hooks/useI18n';
import { useAppDispatch } from '@/ui/state/hooks';
import { useAutoLockTimeId } from '@/ui/state/settings/hooks';
import { settingsActions } from '@/ui/state/settings/reducer';
import { useWallet } from '@/ui/utils';

export function LockTimePage() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const autoLockTimeId = useAutoLockTimeId();
  const autoLockTimes = getAutoLockTimes();
  const dispatch = useAppDispatch();
  const wallet = useWallet();
  const tools = useTools();
  const [loading, setLoading] = useState(false);

  const handleSelectOption = async (option) => {
    if (loading) return;

    setLoading(true);
    try {
      const lockTimeId = option.id;
      await wallet.setAutoLockTimeId(lockTimeId);
      dispatch(settingsActions.updateSettings({ autoLockTimeId: lockTimeId }));
      tools.toastSuccess(`${t('the_auto_lock_time_has_been_changed_to')} ${option.label}`);

      setTimeout(() => {
        navigate(-1);
      }, 300);
    } catch (error) {
      console.error('Failed to set lock time:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Header
        onBack={() => {
          navigate(-1);
        }}
        title={t('automatic_lock_time')}
      />
      <Content>
        <Column
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 16,
            paddingBottom: 16
          }}>
          <Card
            style={{
              width: '328px',
              borderRadius: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              padding: 0
            }}>
            <div
              style={{
                width: '100%',
                overflow: 'auto',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
              }}>
              <Column fullX>
                {autoLockTimes.map((option, index) => {
                  const check = option.id === autoLockTimeId;
                  return (
                    <Column key={index} fullX>
                      {index > 0 && <Row style={{ height: 1, backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />}
                      <Row
                        onClick={() => handleSelectOption(option)}
                        itemsCenter
                        justifyBetween
                        style={{
                          padding: '10px 16px',
                          cursor: 'pointer',
                          minHeight: '34px'
                        }}
                        full>
                        <Text color={check ? 'white' : 'textDim'} size="sm" text={option.label} />
                        {check && !loading && <Icon icon="checked" color="gold" size={20} />}
                        {check && loading && <Loading />}
                      </Row>
                    </Column>
                  );
                })}
              </Column>
            </div>
          </Card>
        </Column>
      </Content>
    </Layout>
  );
}
