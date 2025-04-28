import { Tooltip } from 'antd';
import classNames from 'classnames';
import { useState } from 'react';

import { BtcUsd } from '@/ui/components/BtcUsd';
import { Icon } from '@/ui/components/Icon';
import { useI18n } from '@/ui/hooks/useI18n';
import { useBTCUnit, useChain } from '@/ui/state/settings/hooks';
import { satoshisToAmount } from '@/ui/utils';

import styles from './BalanceCard.module.less';
import { BalanceCardProps } from './interface';

const tooltipStyle = {
  maxWidth: '328px',
  borderRadius: '8px',
  background: '#1D1E23',
  width: '328px',
  padding: '12px 16px',
  color: '#FFF',
  fontSize: '14px',
  lineHeight: '20px',
  fontFamily: 'Inter',
  boxShadow: '0px 12px 20px 0px rgba(0, 0, 0, 0.25)',
  marginLeft: '-50px'
};

export function BalanceCard({ accountBalance, unisatUrl, disableUtxoTools = false }: BalanceCardProps) {
  const { t } = useI18n();
  const btcUnit = useBTCUnit();
  const chain = useChain();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isBalanceHidden, setIsBalanceHidden] = useState(false);

  const backgroundImage = chain.isFractal
    ? './images/artifacts/balance-bg-fb.png'
    : './images/artifacts/balance-bg-btc.png';

  const totalAmount = satoshisToAmount(accountBalance.totalBalance);
  const availableAmount = satoshisToAmount(accountBalance.availableBalance);
  const unavailableAmount = satoshisToAmount(accountBalance.unavailableBalance);

  const handleExpandToggle = () => {
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
      className={classNames(styles.container, styles.collapsed)}
      onClick={handleExpandToggle}
      style={{ margin: '0 auto' }}>
      <div className={styles.backgroundImage} style={{ backgroundImage: `url(${backgroundImage})` }} />
      <div className={styles.header}>
        {t('total_balance')}
        <EyeIcon onClick={toggleBalanceVisibility} />
      </div>

      <div className={styles.balanceWrapper}>
        <div className={styles.balanceContent}>
          <span className={styles.balanceNumber}>{isBalanceHidden ? '*****' : totalAmount.split('.')[0]}</span>
          {!isBalanceHidden && (
            <>
              <span className={styles.decimal}>.{totalAmount.split('.')[1]}</span>
              <span className={styles.unit}>{btcUnit}</span>
            </>
          )}
          {isBalanceHidden && <span className={styles.unit}>{btcUnit}</span>}
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

      <div className={styles.usdValue}>
        <BtcUsd sats={accountBalance.totalBalance} color="black_muted" size="sm" isHidden={isBalanceHidden} />
      </div>
    </div>
  );

  const ExpandedView = () => (
    <div
      className={classNames(styles.container, styles.expanded)}
      onClick={handleExpandToggle}
      style={{ margin: '0 auto' }}>
      <div className={styles.backgroundImage} style={{ backgroundImage: `url(${backgroundImage})` }} />
      <div className={styles.header}>
        {t('total_balance')}
        <EyeIcon onClick={toggleBalanceVisibility} />
      </div>

      <div className={styles.balanceWrapper}>
        <div className={styles.balanceContent}>
          <span className={styles.balanceNumber}>{isBalanceHidden ? '*****' : totalAmount.split('.')[0]}</span>
          {!isBalanceHidden && (
            <>
              <span className={styles.decimal}>.{totalAmount.split('.')[1]}</span>
              <span className={styles.unit}>{btcUnit}</span>
            </>
          )}
          {isBalanceHidden && <span className={styles.unit}>{btcUnit}</span>}
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

      <div className={styles.usdValue}>
        <BtcUsd sats={accountBalance.totalBalance} color="black_muted" size="sm" isHidden={isBalanceHidden} />
      </div>

      <div className={styles.detailsContainer}>
        <div className={styles.column}>
          <span className={styles.label}>{t('available')}</span>
          <div className={styles.detailsAmount}>
            <span>{isBalanceHidden ? '*****' : availableAmount.split('.')[0]}</span>
            {!isBalanceHidden && <span className={styles.detailsDecimal}>.{availableAmount.split('.')[1]}</span>}
            <span>{btcUnit}</span>
          </div>
        </div>

        <div className={styles.divider} />

        <div className={styles.column}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span className={styles.label}>{t('unavailable')}</span>
            <Tooltip
              overlayStyle={{
                maxWidth: '328px',
                padding: 0
              }}
              autoAdjustOverflow={false}
              arrowPointAtCenter={true}
              align={{
                points: ['bc', 'tc'],
                offset: [0, 0],
                overflow: {
                  adjustX: true,
                  adjustY: true
                }
              }}
              overlayInnerStyle={tooltipStyle}
              title={t('unavailable_tooltip')}
              placement="top"
              destroyTooltipOnHide={true}>
              <span className={styles.questionIconWrapper}>
                <Icon icon="balance-question" style={{ width: 16, height: 16, cursor: 'pointer' }} />
              </span>
            </Tooltip>
          </div>
          <div className={styles.detailsAmount}>
            <span>{isBalanceHidden ? '*****' : unavailableAmount.split('.')[0]}</span>
            {!isBalanceHidden && <span className={styles.detailsDecimal}>.{unavailableAmount.split('.')[1]}</span>}
            <span>{btcUnit}</span>
          </div>
        </div>

        <div style={{ marginLeft: 'auto' }} onClick={handleUnlock}>
          <div className={classNames(styles.unlockButton, { [styles.disabled]: disableUtxoTools })}>
            <span>{t('unlock')}</span>
            <Icon icon="balance-unlock-right" size={14} style={{ marginLeft: '4px' }} />
          </div>
        </div>
      </div>
    </div>
  );

  return isExpanded ? <ExpandedView /> : <CollapsedView />;
}
