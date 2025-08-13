import { useCallback, useEffect, useState } from 'react';

import { ADDRESS_TYPES } from '@/shared/constant';
import { Button, Card, Column, Content, Footer, Header, Layout, Row, Text } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import { useI18n } from '@/ui/hooks/useI18n';
import { useCreateColdWalletCallback } from '@/ui/state/global/hooks';
import { colors } from '@/ui/theme/colors';
import { useWallet } from '@/ui/utils';
import { ScanOutlined } from '@ant-design/icons';
import { AddressType } from '@unisat/wallet-sdk';

import { useNavigate } from '../../../MainRoute';
import { DEFAULT_DISPLAY_COUNT, DEFAULT_HD_PATH, LOAD_MORE_BATCH_SIZE, cardStyle, footerStyle } from '../constants';
import { GeneratedAddress, Step3Props } from '../types';
import AddressItem from './AddressItem';

export default function Step3({ onBack, contextData }: Step3Props) {
  const createColdWallet = useCreateColdWalletCallback();
  const navigate = useNavigate();
  const tools = useTools();
  const { t } = useI18n();
  const wallet = useWallet();

  const addressType = contextData.addressType || AddressType.P2WPKH;
  const [generatedAddresses, setGeneratedAddresses] = useState<GeneratedAddress[]>([]);
  const [displayCount, setDisplayCount] = useState(DEFAULT_DISPLAY_COUNT);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalAddressCount, setTotalAddressCount] = useState(0);
  const [addressBalances, setAddressBalances] = useState<Record<string, number>>({});
  const [loadingBalances, setLoadingBalances] = useState(false);

  const fetchAddressBalances = useCallback(
    async (addresses: { address: string }[]) => {
      try {
        setLoadingBalances(true);
        const balances: Record<string, number> = {};

        if (addresses.length === 0) {
          setAddressBalances(balances);
          setLoadingBalances(false);
          return;
        }

        for (const addr of addresses) {
          try {
            const balance = await wallet.getAddressBalance(addr.address);
            balances[addr.address] = parseFloat(balance.btc_amount) || 0;
          } catch (error) {
            console.warn(`Failed to get balance for ${addr.address}:`, error);
            balances[addr.address] = 0;
          }
        }

        addresses.forEach((addr) => {
          if (balances[addr.address] === undefined) {
            balances[addr.address] = 0;
          }
        });

        setAddressBalances(balances);
      } catch (error) {
        console.error('Failed to fetch address balances:', error);
        const balances: Record<string, number> = {};
        addresses.forEach((addr) => {
          balances[addr.address] = 0;
        });
        setAddressBalances(balances);
      } finally {
        setLoadingBalances(false);
      }
    },
    [wallet]
  );

  const generateAddresses = useCallback(
    async (count = DEFAULT_DISPLAY_COUNT) => {
      try {
        const addresses = await wallet.deriveAccountsFromXpub(contextData.xpub, addressType, contextData.hdPath, count);
        setGeneratedAddresses(addresses);

        const actualTotal = contextData.accountCount || addresses.length;
        setTotalAddressCount(actualTotal);

        fetchAddressBalances(addresses);
      } catch (e) {
        console.error('Failed to generate addresses:', e);
        const errorMessage = t('Unable to generate addresses, please check xpub and path configuration');
        tools.toastError(errorMessage);
      }
    },
    [
      wallet,
      contextData.xpub,
      addressType,
      contextData.hdPath,
      contextData.accountCount,
      t,
      fetchAddressBalances,
      tools
    ]
  );

  useEffect(() => {
    const initialCount = Math.min(contextData.accountCount || DEFAULT_DISPLAY_COUNT, DEFAULT_DISPLAY_COUNT);
    setDisplayCount(initialCount);
    generateAddresses(initialCount);
  }, [generateAddresses, contextData.accountCount]);

  const handleLoadMore = async () => {
    setLoadingMore(true);
    const newCount = Math.min(
      displayCount + LOAD_MORE_BATCH_SIZE,
      totalAddressCount || displayCount + LOAD_MORE_BATCH_SIZE
    );
    setDisplayCount(newCount);
    await generateAddresses(newCount);
    setLoadingMore(false);
  };

  // Get address type label
  const getAddressTypeLabel = () => {
    const addressTypeConfig = ADDRESS_TYPES.find((t) => t.value === addressType);
    return addressTypeConfig?.label || 'Unknown';
  };

  // Generate derive path
  const getDerivePath = useCallback(
    (index: number) => {
      const addressTypeConfig = ADDRESS_TYPES.find((t) => t.value === addressType);
      if (!addressTypeConfig) {
        console.warn(`Unknown address type: ${addressType}, using default P2WPKH path`);
      }
      const basePath = addressTypeConfig?.hdPath || DEFAULT_HD_PATH;
      return `(${basePath}/0/${index})`;
    },
    [addressType]
  );

  const onConfirm = async () => {
    try {
      tools.showLoading(true);
      const walletName = contextData.walletName || 'Cold Wallet';
      const accountCount = contextData.accountCount || displayCount;
      await createColdWallet(contextData.xpub, addressType, walletName, contextData.hdPath, accountCount);

      navigate('MainScreen');
    } catch (e) {
      const errorMessage = (e as Error).message;
      tools.toastError(errorMessage);
    } finally {
      tools.showLoading(false);
    }
  };

  return (
    <Layout>
      <Header title={t('Cold Wallet Addresses')} onBack={onBack} />
      <Content style={{ padding: '16px 12px' }}>
        <Column gap="lg">
          <Text
            text={t('These addresses are watch-only and generated from your linked cold wallet.')}
            preset="sub"
            textCenter
            style={{ marginBottom: '16px', lineHeight: '20px' }}
          />

          <Row justifyBetween itemsCenter style={{ marginBottom: '8px' }}>
            <Row itemsCenter gap="sm">
              <ScanOutlined style={{ color: colors.white, fontSize: '16px' }} />
              <Text text={t('Address Type')} preset="bold" size="sm" />
            </Row>
            {displayCount < (totalAddressCount || 100) && displayCount >= DEFAULT_DISPLAY_COUNT && (
              <Row itemsCenter gap="xs" onClick={handleLoadMore} style={{ cursor: 'pointer' }}>
                {loadingMore ? (
                  <Text
                    text="⟳"
                    size="xs"
                    color="primary"
                    style={{
                      animation: 'rotateRefresh 1s linear infinite',
                      display: 'inline-block',
                      fontSize: '12px'
                    }}
                  />
                ) : (
                  <Text text="⟳" size="xs" color="primary" style={{ fontSize: '12px' }} />
                )}
                <Text text={t('Load More Addresses')} color="primary" size="xs" />
              </Row>
            )}
          </Row>

          <Card style={cardStyle}>
            <Column>
              <Row
                style={{
                  padding: '16px 12px 8px 12px',
                  borderBottom: `1px solid ${colors.line}`
                }}>
                <Text
                  text={getAddressTypeLabel()}
                  size="xs"
                  style={{
                    color: 'rgba(255,255,255,0.85)',
                    fontWeight: 500
                  }}
                />
              </Row>

              {generatedAddresses.slice(0, displayCount).map((account, index) => (
                <AddressItem
                  key={index}
                  address={account.address}
                  index={index}
                  balance={addressBalances[account.address]}
                  isLoadingBalance={loadingBalances && addressBalances[account.address] === undefined}
                  getDerivePath={getDerivePath}
                  showDivider={index < Math.min(displayCount, generatedAddresses.length) - 1}
                />
              ))}
            </Column>
          </Card>
        </Column>
      </Content>

      <Footer style={footerStyle}>
        <Button
          preset="primary"
          onClick={onConfirm}
          text={t('Continue')}
          style={{
            backgroundColor: colors.primary,
            color: colors.black,
            fontWeight: 600,
            fontSize: '15px'
          }}
        />
      </Footer>
    </Layout>
  );
}
