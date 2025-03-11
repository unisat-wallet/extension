import { Tooltip } from 'antd';
import { CSSProperties, useMemo } from 'react';

import { BitcoinBalanceV2 } from '@/shared/types';
import { Row, Text } from '@/ui/components';
import { useI18n } from '@/ui/hooks/useI18n';
import { BtcDisplay } from '@/ui/pages/Main/WalletTabScreen/components/BtcDisplay';
import { useBTCUnit } from '@/ui/state/settings/hooks';
import { fontSizes } from '@/ui/theme/font';
import { satoshisToAmount } from '@/ui/utils';

const $noBreakStyle: CSSProperties = {
  whiteSpace: 'nowrap',
  wordBreak: 'keep-all'
};

interface BalanceTooltipProps {
  accountBalance: BitcoinBalanceV2;
  unisatUrl: string;
  disableUtxoTools?: boolean;
}

export const BalanceTooltip = ({ accountBalance, unisatUrl, disableUtxoTools = false }: BalanceTooltipProps) => {
  const balanceValue = useMemo(() => {
    return satoshisToAmount(accountBalance.totalBalance);
  }, [accountBalance.totalBalance]);
  const { t } = useI18n();

  const btcUnit = useBTCUnit();
  const avaiableAmount = satoshisToAmount(accountBalance.availableBalance);
  const unavailableAmount = satoshisToAmount(accountBalance.unavailableBalance);
  const totalAmount = satoshisToAmount(accountBalance.totalBalance);

  return (
    <Tooltip
      placement={'bottom'}
      title={
        <>
          <div style={{ textAlign: 'left' }}>
            <Row>
              <span style={{ ...$noBreakStyle, width: 80 }}>{t('available')}</span>
              <span style={$noBreakStyle}>{` ${avaiableAmount} ${btcUnit}`}</span>
            </Row>
            <Row>
              <span style={{ ...$noBreakStyle, width: 80 }}>{t('unavailable')}</span>
              <span style={$noBreakStyle}>{` ${unavailableAmount} ${btcUnit}`}</span>
              {disableUtxoTools ? null : (
                <div
                  style={{
                    display: 'flex',
                    width: 50,
                    height: 20,
                    padding: 10,
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 10,
                    flexShrink: 0,
                    borderRadius: 4,
                    border: '1px solid rgba(244, 182, 44, 0.15)',
                    background: 'rgba(244, 182, 44, 0.10)',
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    window.open(`${unisatUrl}/utils/utxo`);
                  }}>
                  <Text
                    text={t('unlock')}
                    size="xs"
                    style={{
                      color: '#F4B62C',
                      fontFamily: 'Inter',
                      fontWeight: 500
                    }}
                  />
                </div>
              )}
            </Row>
            <Row>
              <span style={{ ...$noBreakStyle, width: 80 }}>{t('total')}</span>
              <span style={$noBreakStyle}>{` ${totalAmount} ${btcUnit}`}</span>
            </Row>
          </div>
        </>
      }
      overlayStyle={{
        fontSize: fontSizes.xs
      }}>
      <div>
        <Text text={t('total_balance')} textCenter color="textDim" />
        <BtcDisplay balance={balanceValue} />
      </div>
    </Tooltip>
  );
};
