import { Tooltip } from 'antd';
import { CSSProperties, useState } from 'react';

import { BitcoinBalanceV2 } from '@/shared/types';
import { BtcUsd } from '@/ui/components/BtcUsd';
import { Icon } from '@/ui/components/Icon';
import { useI18n } from '@/ui/hooks/useI18n';
import { useBTCUnit, useChain } from '@/ui/state/settings/hooks';
import { satoshisToAmount } from '@/ui/utils';

const $containerStyle: CSSProperties = {
  width: '328px',
  flexShrink: 0,
  padding: '16px',
  borderRadius: '24px',
  display: 'flex',
  flexDirection: 'column',
  cursor: 'pointer',
  position: 'relative',
  background: 'linear-gradient(117deg, #FFCF6D 1.38%, #FF7A00 94.19%)'
};

const $headerStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  color: 'rgba(0, 0, 0, 0.55)',
  marginBottom: '4px',
  fontFamily: 'Inter',
  fontSize: '12px',
  fontStyle: 'normal',
  fontWeight: 600,
  lineHeight: '12px'
};

const $balanceStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  marginBottom: '4px'
};

const $balanceContentStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'baseline'
};

const $balanceNumberStyle: CSSProperties = {
  color: '#000',
  fontFamily: 'Inter',
  fontSize: '28px',
  fontStyle: 'normal',
  fontWeight: 700,
  lineHeight: '38px',
  letterSpacing: '0.56px'
};

const $unitStyle: CSSProperties = {
  ...$balanceNumberStyle,
  marginLeft: '8px',
  marginRight: '16px'
};

const $decimalStyle: CSSProperties = {
  color: 'rgba(0, 0, 0, 0.45)',
  fontFamily: 'DIN-Bold',
  fontSize: '28px',
  fontStyle: 'normal',
  fontWeight: 700,
  lineHeight: '38px',
  letterSpacing: '0.56px'
};

const $usdStyle: CSSProperties = {
  color: 'rgba(0, 0, 0, 0.45)',
  marginBottom: '0px'
};

const $detailsContainerStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',
  padding: '12px 16px',
  background: 'rgba(255, 255, 255, 0.2)',
  borderRadius: '16px',
  width: '312px',
  height: '62px',
  flexShrink: 0,
  boxSizing: 'border-box',
  position: 'relative',
  left: '50%',
  transform: 'translateX(-50%)',
  marginTop: '25px'
};

const $columnStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px'
};

const $labelStyle: CSSProperties = {
  color: 'rgba(0, 0, 0, 0.65)',
  fontFamily: 'Inter',
  fontSize: '12px',
  fontStyle: 'normal',
  fontWeight: 500,
  lineHeight: '16px'
};

const $detailsAmountStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '2px',
  color: '#000',
  fontFamily: 'DIN',
  fontSize: '12px',
  fontStyle: 'normal',
  fontWeight: 700,
  lineHeight: '24px',
  width: '97px',
  minHeight: '24px'
};

const $detailsDecimalStyle: CSSProperties = {
  color: 'rgba(0, 0, 0, 0.45)',
  fontFamily: 'DIN',
  fontSize: '11px',
  fontStyle: 'normal',
  fontWeight: 700,
  lineHeight: '24px'
};

const $unlockButtonStyle: CSSProperties = {
  width: '71px',
  height: '28px',
  flexShrink: 0,
  borderRadius: '25px',
  background: '#000',
  color: '#FFF',
  textAlign: 'center',
  fontFamily: 'Inter',
  fontSize: '12px',
  fontStyle: 'normal',
  fontWeight: 600,
  lineHeight: '16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const $dividerStyle: CSSProperties = {
  width: '1px',
  height: '32px',
  background: 'rgba(109, 65, 0, 0.15)',
  margin: '0 12px',
  flexShrink: 0
};

const $tooltipStyle: CSSProperties = {
  borderRadius: '8px',
  background: '#1D1E23',
  width: '328px',
  height: '110px',
  padding: '16px',
  color: '#fff',
  fontSize: '14px',
  lineHeight: '20px',
  fontFamily: 'Inter'
};

interface BalanceTooltipProps {
  accountBalance: BitcoinBalanceV2;
  unisatUrl: string;
  disableUtxoTools?: boolean;
}

export const BalanceTooltip = ({ accountBalance, unisatUrl, disableUtxoTools = false }: BalanceTooltipProps) => {
  const { t } = useI18n();
  const btcUnit = useBTCUnit();
  const chain = useChain();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isBalanceHidden, setIsBalanceHidden] = useState(false);

  const backgroundImage = chain.isFractal
    ? './images/artifacts/balance-bg-fb.png'
    : './images/artifacts/balance-bg-btc.png';

  const $backgroundImageStyle: CSSProperties = {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '64px',
    height: '64px',
    backgroundImage: `url(${backgroundImage})`,
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    pointerEvents: 'none'
  };

  const totalAmount = satoshisToAmount(accountBalance.totalBalance);
  const availableAmount = satoshisToAmount(accountBalance.availableBalance);
  const unavailableAmount = satoshisToAmount(accountBalance.unavailableBalance);

  const handleClick = () => {
    setIsExpanded(!isExpanded);
  };

  const toggleBalanceVisibility = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsBalanceHidden(!isBalanceHidden);
  };

  const EyeIcon = ({ onClick }: { onClick: (e: React.MouseEvent) => void }) => (
    <div onClick={onClick} style={{ cursor: 'pointer' }}>
      <Icon icon={isBalanceHidden ? 'balance-eyes-closed' : 'balance-eyes'} size={16} />
    </div>
  );

  const handleUnlock = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (disableUtxoTools) return;
    window.open(`${unisatUrl}/utils/utxo`);
  };

  const CollapsedView = () => (
    <div
      style={{
        ...$containerStyle,
        height: '118px'
      }}
      onClick={handleClick}>
      <div style={$backgroundImageStyle} />
      <div style={$headerStyle}>
        {t('total_balance')}
        <EyeIcon onClick={toggleBalanceVisibility} />
      </div>

      <div style={$balanceStyle}>
        <div style={$balanceContentStyle}>
          <span style={$balanceNumberStyle}>{isBalanceHidden ? '*****' : totalAmount.split('.')[0]}</span>
          {!isBalanceHidden && (
            <>
              <span style={$decimalStyle}>.{totalAmount.split('.')[1]}</span>
              <span style={$unitStyle}>{btcUnit}</span>
            </>
          )}
          {isBalanceHidden && (
            <>
              <span style={$unitStyle}>{btcUnit}</span>
            </>
          )}
        </div>
        <Icon
          icon="balance-right"
          size={10}
          style={{
            marginLeft: '16px',
            transform: 'rotate(0deg)',
            transition: 'transform 0.2s ease'
          }}
        />
      </div>

      <div style={$usdStyle}>
        <BtcUsd sats={accountBalance.totalBalance} color="black_muted" size="sm" isHidden={isBalanceHidden} />
      </div>
    </div>
  );

  const ExpandedView = () => (
    <div
      style={{
        ...$containerStyle,
        height: '192px'
      }}
      onClick={handleClick}>
      <div style={$backgroundImageStyle} />
      <div style={$headerStyle}>
        {t('total_balance')}
        <EyeIcon onClick={toggleBalanceVisibility} />
      </div>

      <div style={$balanceStyle}>
        <div style={$balanceContentStyle}>
          <span style={$balanceNumberStyle}>{isBalanceHidden ? '*****' : totalAmount.split('.')[0]}</span>
          {!isBalanceHidden && (
            <>
              <span style={$decimalStyle}>.{totalAmount.split('.')[1]}</span>
              <span style={$unitStyle}>{btcUnit}</span>
            </>
          )}
          {isBalanceHidden && (
            <>
              <span style={$unitStyle}>{btcUnit}</span>
            </>
          )}
        </div>
        <Icon
          icon="balance-right"
          size={10}
          style={{
            marginLeft: '16px',
            transform: 'rotate(-90deg)',
            transition: 'transform 0.2s ease'
          }}
        />
      </div>

      <div style={$usdStyle}>
        <BtcUsd sats={accountBalance.totalBalance} color="black_muted" size="sm" isHidden={isBalanceHidden} />
      </div>

      <div style={$detailsContainerStyle}>
        <div style={$columnStyle}>
          <span style={$labelStyle}>{t('available')}</span>
          <div style={$detailsAmountStyle}>
            <span>{isBalanceHidden ? '*****' : availableAmount.split('.')[0]}</span>
            {!isBalanceHidden && <span style={$detailsDecimalStyle}>.{availableAmount.split('.')[1]}</span>}
            <span>{btcUnit}</span>
          </div>
        </div>

        <div style={$dividerStyle}></div>

        <div style={$columnStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={$labelStyle}>{t('unavailable')}</span>
            <Tooltip
              overlayStyle={{ maxWidth: '328px' }}
              overlayInnerStyle={$tooltipStyle}
              title={t('unavailable_tooltip')}
              placement="top">
              <div>
                <Icon icon="balance-question" style={{ width: 16, height: 16, cursor: 'pointer' }} />
              </div>
            </Tooltip>
          </div>
          <div style={$detailsAmountStyle}>
            <span>{isBalanceHidden ? '*****' : unavailableAmount.split('.')[0]}</span>
            {!isBalanceHidden && <span style={$detailsDecimalStyle}>.{unavailableAmount.split('.')[1]}</span>}
            <span>{btcUnit}</span>
          </div>
        </div>

        <div style={{ ...{ marginLeft: 'auto' } }} onClick={handleUnlock}>
          <div
            style={{
              ...$unlockButtonStyle,
              cursor: disableUtxoTools ? 'default' : 'pointer',
              background: disableUtxoTools ? 'rgba(0, 0, 0, 0.35)' : '#000'
            }}>
            <span>{t('unlock')}</span>
            <Icon icon="balance-unlock-right" size={14} style={{ marginLeft: '4px' }} />
          </div>
        </div>
      </div>
    </div>
  );

  return isExpanded ? <ExpandedView /> : <CollapsedView />;
};
