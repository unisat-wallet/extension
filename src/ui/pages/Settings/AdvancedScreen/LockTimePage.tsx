import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Card, Column, Content, Header, Icon, Layout, Loading, Row, Text } from '@/ui/components';
import { getAutoLockTimes } from '@unisat/wallet-shared';
import {
  settingsActions,
  useAppDispatch,
  useAutoLockTimeId,
  useI18n,
  useLockTimePageLogic,
  useNavigation,
  useTools,
  useWallet
} from '@unisat/wallet-state';

export function LockTimePage() {
  const nav = useNavigation();
  const { t } = useI18n();
  const { autoLockTimeId, autoLockTimes, loading, handleSelectOption } = useLockTimePageLogic();

  return (
    <Layout>
      <Header
        onBack={() => {
          nav.goBack();
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
