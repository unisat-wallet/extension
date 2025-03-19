import { useEffect, useState } from 'react';

import { ChainType, TypeChain } from '@/shared/constant';
import { Row, Text } from '@/ui/components';
import { Button } from '@/ui/components/Button';
import { Icon } from '@/ui/components/Icon';
import { useNavigate } from '@/ui/pages/MainRoute';
import { useChainType } from '@/ui/state/settings/hooks';
import { useResetUiTxCreateScreen } from '@/ui/state/ui/hooks';

interface WalletActionsProps {
  onBuyClick: () => void;
  chain: TypeChain;
  addressExplorerUrl: string;
}

export const WalletActions = ({ onBuyClick, chain, addressExplorerUrl }: WalletActionsProps) => {
  const [moreExpanded, setMoreExpanded] = useState(false);
  const [utxoClicked, setUtxoClicked] = useState(false);
  const isFractal = chain.isFractal;
  const navigate = useNavigate();
  const resetUiTxCreateScreen = useResetUiTxCreateScreen();
  const chainType = useChainType();

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

  return (
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
              {!utxoClicked && (
                <div
                  style={{
                    position: 'absolute',
                    top: -16,
                    right: -10,
                    padding: '0px 5px',
                    borderRadius: 4,
                    backgroundColor: 'rgba(176, 37, 37, 0.25)',
                    zIndex: 10
                  }}>
                  <Text text="new!" color="red_light2" size="xxxs" />
                </div>
              )}

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
            <Button
              text="UTXO"
              preset="home"
              icon="utxo"
              onClick={handleUtxoClick}
              style={{
                border: '1px solid rgba(244, 182, 44, 0.25)',
                background: 'rgba(244, 182, 44, 0.10)'
              }}
            />
            {!utxoClicked && (
              <div
                style={{
                  position: 'absolute',
                  top: -5,
                  right: -5,
                  padding: '0px 5px',
                  borderRadius: 4,
                  backgroundColor: 'rgba(176, 37, 37, 0.25)',
                  zIndex: 10
                }}>
                <Text text="new!" color="red_light2" size="xxxs" />
              </div>
            )}
          </div>
          <Button
            text="Buy"
            preset="home"
            icon={isFractal ? 'fb' : 'bitcoin'}
            iconSize={
              isFractal
                ? {
                    width: 24,
                    height: 11
                  }
                : undefined
            }
            onClick={onBuyClick}
            disabled={chainType !== ChainType.BITCOIN_MAINNET && chainType !== ChainType.FRACTAL_BITCOIN_MAINNET}
            style={{
              border: '1px solid rgba(244, 182, 44, 0.25)',
              background: 'rgba(244, 182, 44, 0.10)'
            }}
          />
        </Row>
      )}
    </>
  );
};
