import { useEffect, useState } from 'react';

import { ChainType, TypeChain } from '@/shared/constant';
import { Row, Text } from '@/ui/components';
import { Button } from '@/ui/components/Button';
import { Icon } from '@/ui/components/Icon';
import { useI18n } from '@/ui/hooks/useI18n';
import { BuyBTCModal } from '@/ui/pages/BuyBTC/BuyBTCModal';
import { useNavigate } from '@/ui/pages/MainRoute';
import { useAddressExplorerUrl, useChainType, useWalletConfig } from '@/ui/state/settings/hooks';
import { useResetUiTxCreateScreen } from '@/ui/state/ui/hooks';

interface WalletActionsProps {
  chain: TypeChain;
  address: string;
}

export const WalletActions = ({ chain, address }: WalletActionsProps) => {
  const [moreExpanded, setMoreExpanded] = useState(false);
  const [utxoClicked, setUtxoClicked] = useState(false);
  const isFractal = chain.isFractal;
  const navigate = useNavigate();
  const resetUiTxCreateScreen = useResetUiTxCreateScreen();
  const chainType = useChainType();
  const addressExplorerUrl = useAddressExplorerUrl(address);
  const [buyBtcModalVisible, setBuyBtcModalVisible] = useState(false);
  const walletConfig = useWalletConfig();
  const { t } = useI18n();

  const shouldUseMoreExpandedLayout = () => {
    if (walletConfig.disableUtxoTools) return false;
    return true;
  };

  useEffect(() => {
    const checkUtxoClicked = async () => {
      const hasClickedUtxo = localStorage.getItem('utxo_clicked');
      if (hasClickedUtxo === 'true') {
        setUtxoClicked(true);
      }
    };
    checkUtxoClicked();
  }, []);

  // Reset moreExpanded state when chain changes
  useEffect(() => {
    setMoreExpanded(false);
  }, [chain.enum]);

  const handleUtxoClick = () => {
    setUtxoClicked(true);
    localStorage.setItem('utxo_clicked', 'true');
    window.open(`${chain.unisatUrl}/utils/utxo`);
  };

  const onHistoryClick = () => {
    if (chain.isViewTxHistoryInternally) {
      navigate('HistoryScreen');
    } else {
      window.open(addressExplorerUrl);
    }
  };

  const onReceiveClick = () => {
    navigate('ReceiveScreen');
  };

  const onSendClick = () => {
    resetUiTxCreateScreen();
    navigate('TxCreateScreen');
  };

  const NewBadge = ({ top = -16, right = -14 }: { top?: number; right?: number }) => (
    <div
      style={{
        position: 'absolute',
        top,
        right,
        padding: '0px 5px',
        borderRadius: 4,
        backgroundColor: 'rgba(176, 37, 37, 0.25)',
        zIndex: 10
      }}>
      <Text text={t('new')} color="red_light2" size="xxs" />
    </div>
  );

  return (
    <>
      {!shouldUseMoreExpandedLayout() ? (
        <Row justifyCenter mt="md">
          <Button
            text={t('receive')}
            preset="home"
            icon="receive"
            onClick={(e) => {
              navigate('ReceiveScreen');
            }}
          />

          <Button
            text={t('send')}
            preset="home"
            icon="send"
            onClick={(e) => {
              resetUiTxCreateScreen();
              navigate('TxCreateScreen');
            }}
          />
          <Button
            text={t('history')}
            preset="home"
            icon="history"
            onClick={(e) => {
              if (chain.isViewTxHistoryInternally) {
                navigate('HistoryScreen');
              } else {
                window.open(addressExplorerUrl);
              }
            }}
          />
          <Button
            text={t('buy')}
            preset="home"
            icon={chain.isFractal ? 'fb' : 'bitcoin'}
            iconSize={
              chain.isFractal
                ? {
                    width: 24,
                    height: 11
                  }
                : undefined
            }
            onClick={(e) => {
              setBuyBtcModalVisible(true);
            }}
            disabled={chainType !== ChainType.BITCOIN_MAINNET && chainType !== ChainType.FRACTAL_BITCOIN_MAINNET}
          />
        </Row>
      ) : (
        <>
          <Row justifyCenter mt="md">
            <Button text={t('receive')} preset="home" icon="receive" onClick={onReceiveClick} />

            <Button text={t('send')} preset="home" icon="send" onClick={onSendClick} />
            <Button text={t('history')} preset="home" icon="history" onClick={onHistoryClick} />
            {/* Custom div used to avoid Button component's style merging issues with toggle states */}
            <div
              style={{
                display: 'flex',
                minWidth: 64,
                minHeight: 64,
                flexDirection: 'column',
                borderRadius: 16,
                border: moreExpanded ? '1px solid rgba(244, 182, 44, 0.25)' : '1px solid #FFFFFF4D',
                background: moreExpanded ? 'rgba(244, 182, 44, 0.10)' : '#2a2626',
                padding: 5,
                marginRight: 5,
                marginLeft: 5,
                justifyContent: 'center',
                alignItems: 'center',
                cursor: 'pointer',
                position: 'relative'
              }}
              onClick={() => setMoreExpanded(!moreExpanded)}>
              {!moreExpanded && (
                <>
                  {!utxoClicked && <NewBadge />}

                  <div
                    style={{
                      position: 'absolute',
                      top: -12,
                      right: -12,
                      zIndex: 5
                    }}>
                    <Icon icon="utxobg" size={32} />
                  </div>
                </>
              )}
              <Icon icon="more" style={{ marginBottom: 7 }} />
              <Text text={t('more')} color="white" size="xs" />
            </div>
          </Row>

          {moreExpanded && (
            <Row justifyCenter mt="md">
              <div style={{ display: 'flex', width: '100%', maxWidth: 300, justifyContent: 'space-between' }}>
                <Button preset="home" style={{ opacity: 0 }}></Button>
                <Button preset="home" style={{ opacity: 0 }}></Button>
                <div style={{ position: 'relative', marginRight: 7, marginLeft: 8 }}>
                  <Button text="UTXO" preset="homeGold" icon="utxo" onClick={handleUtxoClick} />
                  {!utxoClicked && <NewBadge top={-5} right={-5} />}
                </div>
                <Button
                  text={t('buy')}
                  preset="homeGold"
                  icon={isFractal ? 'fb' : 'bitcoin'}
                  iconSize={
                    isFractal
                      ? {
                          width: 24,
                          height: 11
                        }
                      : undefined
                  }
                  onClick={() => setBuyBtcModalVisible(true)}
                  disabled={chainType !== ChainType.BITCOIN_MAINNET && chainType !== ChainType.FRACTAL_BITCOIN_MAINNET}
                />
              </div>
            </Row>
          )}
        </>
      )}

      {buyBtcModalVisible && (
        <BuyBTCModal
          onClose={() => {
            setBuyBtcModalVisible(false);
          }}
        />
      )}
    </>
  );
};
