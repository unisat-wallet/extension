import { useEffect, useState } from 'react';

import { ChainType, TypeChain } from '@/shared/constant';
import { Row, Text } from '@/ui/components';
import { Button } from '@/ui/components/Button';
import { Icon } from '@/ui/components/Icon';
import { BuyBTCModal } from '@/ui/pages/BuyBTC/BuyBTCModal';
import { useNavigate } from '@/ui/pages/MainRoute';
import { useAddressExplorerUrl, useChainType } from '@/ui/state/settings/hooks';
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

  const shouldUseMoreExpandedLayout = () => {
    if (chain.enum === ChainType.FRACTAL_BITCOIN_MAINNET) return true;
    return false;
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
      <Text text="new!" color="red_light2" size="xxs" />
    </div>
  );

  return (
    <>
      {!shouldUseMoreExpandedLayout() ? (
        <Row justifyCenter mt="md">
          <Button
            text="Receive"
            preset="home"
            icon="receive"
            onClick={(e) => {
              navigate('ReceiveScreen');
            }}
          />

          <Button
            text="Send"
            preset="home"
            icon="send"
            onClick={(e) => {
              resetUiTxCreateScreen();
              navigate('TxCreateScreen');
            }}
          />
          <Button
            text="History"
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
            text="Buy"
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
            <Button text="Receive" preset="home" icon="receive" onClick={onReceiveClick} />

            <Button text="Send" preset="home" icon="send" onClick={onSendClick} />
            <Button text="History" preset="home" icon="history" onClick={onHistoryClick} />
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
              <Text text="More" color="white" size="xs" />
            </div>
          </Row>

          {moreExpanded && (
            <Row justifyEnd mt="md">
              <div style={{ position: 'relative' }}>
                <Button text="UTXO" preset="homeGold" icon="utxo" onClick={handleUtxoClick} />
                {!utxoClicked && <NewBadge top={-5} right={-5} />}
              </div>
              <Button
                text="Buy"
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
