import moment from 'moment';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';

import { Inscription } from '@/shared/types';
import { Button, Column, Content, Header, Icon, Layout, Row, Text } from '@/ui/components';
import InscriptionPreview from '@/ui/components/InscriptionPreview';
import { Line } from '@/ui/components/Line';
import { Section } from '@/ui/components/Section';
import { Tabs } from '@/ui/components/Tabs';
import { useI18n } from '@/ui/hooks/useI18n';
import { useCurrentAccount } from '@/ui/state/accounts/hooks';
import { useAppDispatch } from '@/ui/state/hooks';
import { useTxExplorerUrl } from '@/ui/state/settings/hooks';
import { transactionsActions } from '@/ui/state/transactions/reducer';
import { fontSizes } from '@/ui/theme/font';
import { useLocationState, useWallet } from '@/ui/utils';
import { LoadingOutlined } from '@ant-design/icons';

import { useNavigate } from '../MainRoute';

const HIGH_BALANCE = 10000;

enum TabKey {
  DETAILS = 'DETAILS',
  PROVENANCE = 'PROVENANCE'
}

export default function OrdinalsInscriptionScreen() {
  const navigate = useNavigate();
  const location = useLocation();

  const { inscriptionId } = useParams();
  const locationState = useLocationState<{ inscription: Inscription }>();
  const [inscription, setInscription] = useState<Inscription>(locationState?.inscription);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(!locationState?.inscription);

  const currentAccount = useCurrentAccount();

  const dispatch = useAppDispatch();

  const { t } = useI18n();

  const [isNeedToSplit, setIsNeedToSplit] = useState(false);
  const [isMultiStuck, setIsMultiStuck] = useState(false);
  const wallet = useWallet();

  const [tabKey, setTabKey] = useState(TabKey.DETAILS);

  const resetState = useCallback(() => {
    setIsNeedToSplit(false);
    setIsMultiStuck(false);
    setIsLoadingDetails(false);
    setIsInitialLoading(!locationState?.inscription);
    setTabKey(TabKey.DETAILS);
  }, [locationState?.inscription]);

  const fetchInscriptionData = async (id: string) => {
    if (!id) return;

    // If we already have basic inscription data, show it immediately
    // and load details in the background
    const isBackgroundLoading = !!inscription;

    if (isBackgroundLoading) {
      setIsLoadingDetails(true);
    } else {
      setIsInitialLoading(true);
    }

    try {
      const data = await wallet.getInscriptionInfo(id);
      setInscription(data);
      setTabKey(TabKey.DETAILS);

      if (data.multipleNFT) {
        setIsMultiStuck(true);

        if (data.sameOffset) {
          setIsNeedToSplit(false);
        } else {
          if (data.outputValue > HIGH_BALANCE) {
            setIsNeedToSplit(true);
          }
        }
      } else {
        if (data.outputValue > HIGH_BALANCE) {
          setIsNeedToSplit(true);
        }
      }
    } catch (e) {
      console.error('Failed to fetch inscription data:', e);
    } finally {
      setIsLoadingDetails(false);
      setIsInitialLoading(false);
    }
  };

  useEffect(() => {
    if (inscriptionId) {
      resetState();

      // Always fetch the latest data, but we'll show what we have immediately
      fetchInscriptionData(inscriptionId);
    }
  }, [inscriptionId, location.key]);

  if (!inscriptionId) {
    return (
      <Layout>
        <Header
          onBack={() => {
            window.history.back();
          }}
        />
        <Content>
          <Column>
            <Text text={t('inscription_not_found')} preset="title-bold" textCenter />
          </Column>
        </Content>
      </Layout>
    );
  }

  if (isInitialLoading) {
    return (
      <Layout>
        <Content itemsCenter justifyCenter>
          <Icon size={fontSizes.xxxl} color="gold">
            <LoadingOutlined />
          </Icon>
        </Content>
      </Layout>
    );
  }

  if (!inscription) {
    return (
      <Layout>
        <Header
          onBack={() => {
            window.history.back();
          }}
        />
        <Content>
          <Column>
            <Text text={t('failed_to_load_inscription')} preset="title-bold" textCenter />
          </Column>
        </Content>
      </Layout>
    );
  }

  const isUnconfirmed = inscription.timestamp == 0;

  const withSend = currentAccount.address === inscription.address;

  const children = inscription.children || [];
  const parents = inscription.parents || [];

  const hasProvenance = children.length > 0 || parents.length > 0;
  const shouldShowTabs = hasProvenance === true;

  return (
    <Layout>
      <Header
        onBack={() => {
          window.history.back();
        }}
      />
      <Content>
        <Column>
          <Text
            text={
              isUnconfirmed
                ? t('inscription_not_confirmed_yet')
                : `${t('inscription')} ${inscription.inscriptionNumber}`
            }
            preset="title-bold"
            textCenter
          />
          <Row justifyCenter>
            <InscriptionPreview data={inscription} preset="large" />
          </Row>

          {isLoadingDetails && (
            <Row justifyCenter my="sm" gap="xs">
              <Icon size={fontSizes.lg} color="gold">
                <LoadingOutlined />
              </Icon>
              <Text text={t('loading_details')} color="white_muted" />
            </Row>
          )}

          {withSend && (
            <Row fullX>
              {isNeedToSplit && (
                <Button
                  text={t('split')}
                  icon="split"
                  preset="default"
                  full
                  onClick={(e) => {
                    dispatch(transactionsActions.reset());
                    navigate('SplitOrdinalsInscriptionScreen', { inscription });
                  }}
                />
              )}
              {
                <Button
                  text={t('send')}
                  icon="send"
                  preset="default"
                  full
                  onClick={(e) => {
                    dispatch(transactionsActions.reset());
                    navigate('SendOrdinalsInscriptionScreen', { inscription });
                  }}
                />
              }
            </Row>
          )}

          {isNeedToSplit &&
            (isMultiStuck ? (
              <Text
                color="warning"
                textCenter
                text={t('multiple_inscriptions_are_mixed_together_you_can_split_them_first_or_send_them_once')}
              />
            ) : (
              <Text
                color="warning"
                textCenter
                text={`${t('this_inscription_carries_a_high_balance')}(>${HIGH_BALANCE} sats)`}
              />
            ))}
        </Column>

        {shouldShowTabs ? (
          <Tabs
            defaultActiveKey={tabKey}
            activeKey={tabKey}
            items={[
              {
                key: TabKey.DETAILS,
                label: t('details'),
                children: <Details inscription={inscription} isLoading={isLoadingDetails} />
              },
              {
                key: TabKey.PROVENANCE,
                label: t('provenance'),
                children: <Provenance inscription={inscription} />
              }
            ]}
            onTabClick={(key) => {
              setTabKey(key as TabKey);
            }}
          />
        ) : (
          <Details inscription={inscription} isLoading={isLoadingDetails} />
        )}
      </Content>
    </Layout>
  );
}

function Details({ inscription, isLoading }: { inscription: Inscription; isLoading: boolean }) {
  const isUnconfirmed = inscription.timestamp == 0;
  const date = moment(inscription.timestamp * 1000).format('YYYY-MM-DD hh:mm:ss');

  const genesisTxUrl = useTxExplorerUrl(inscription.genesisTransaction);
  const { t } = useI18n();

  return (
    <Column
      gap="lg"
      px="md"
      py="md"
      style={{
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 15
      }}>
      <Section title={t('inscription_id')} value={inscription.inscriptionId} />
      <Line />
      <Section title={t('inscription_address')} value={inscription.address} />
      <Line />
      <Section title={t('inscription_output_value')} value={inscription.outputValue} />
      <Line />
      <Section title={t('inscription_preview')} value={inscription.preview} link={inscription.preview} />
      <Line />
      <Section title={t('inscription_content')} value={inscription.content} link={inscription.content} />
      <Line />
      <Section title={t('inscription_content_length')} value={inscription.contentLength} />
      <Line />
      <Section title={t('inscription_content_type')} value={inscription.contentType} />
      <Line />
      <Section title={t('inscription_timestamp')} value={isUnconfirmed ? t('unconfirmed') : date} />
      <Line />
      <Section
        title={t('inscription_genesis_transaction')}
        value={inscription.genesisTransaction}
        link={genesisTxUrl}
      />
    </Column>
  );
}

function Provenance({ inscription }: { inscription: Inscription }) {
  const parents = useMemo(() => {
    return inscription.parents || [];
  }, [inscription.parents]);

  const children = useMemo(() => {
    return inscription.children || [];
  }, [inscription.children]);

  const [inscriptionsMap, setInscriptionsMap] = useState<Record<string, Inscription>>({});
  const wallet = useWallet();

  const uniqueInscriptionIds = useMemo(() => {
    const originalParents = inscription.parents || [];
    const originalChildren = inscription.children || [];
    return [...new Set([...originalParents, ...originalChildren])];
  }, [inscription.parents, inscription.children]);

  useEffect(() => {
    const fetchInscriptionInfo = async () => {
      if (uniqueInscriptionIds.length === 0) return;

      try {
        const promises = uniqueInscriptionIds.map(async (id) => {
          try {
            const info = await wallet.getInscriptionInfo(id);
            return { id, info };
          } catch (e) {
            console.error(`Failed to fetch inscription info for ${id}:`, e);
            return { id, info: null };
          }
        });

        const results = await Promise.all(promises);
        const newInscriptionsMap: Record<string, Inscription> = {};

        results.forEach(({ id, info }) => {
          if (info) {
            newInscriptionsMap[id] = info;
          }
        });

        setInscriptionsMap(newInscriptionsMap);
      } catch (error) {
        console.error('Error fetching inscription info:', error);
      }
    };

    fetchInscriptionInfo();
  }, [uniqueInscriptionIds]);

  const previewStyle = {
    borderRadius: '12px',
    overflow: 'hidden',
    width: '100%',
    display: 'flex',
    justifyContent: 'center'
  };

  const containerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    padding: '0 8px',
    boxSizing: 'border-box' as const,
    marginBottom: '24px'
  };

  const itemStyle = {
    width: 'calc(50% - 4px)',
    boxSizing: 'border-box' as const,
    display: 'flex',
    justifyContent: 'center',
    minWidth: 156
  };

  const renderInscriptionList = (inscriptionIds: string[], title: string) => {
    if (inscriptionIds.length === 0) return null;

    const rows: string[][] = [];
    for (let i = 0; i < inscriptionIds.length; i += 2) {
      rows.push(inscriptionIds.slice(i, i + 2));
    }

    return (
      <>
        <Text text={title} preset="default" mb="md" />
        {rows.map((row, rowIndex) => (
          <div key={`row-${rowIndex}`} style={containerStyle} className="inscription-row">
            {row.map((id) => (
              <div key={id} style={itemStyle} className="inscription-item">
                <div style={previewStyle}>
                  <InscriptionPreview
                    data={inscriptionsMap[id] || ({ inscriptionId: id } as any)}
                    preset="medium"
                    onClick={() => {
                      window.location.href = `#/inscription/${id}`;
                    }}
                  />
                </div>
              </div>
            ))}
            {row.length === 1 && <div style={itemStyle} />}
          </div>
        ))}
      </>
    );
  };

  return (
    <Column gap="sm">
      {renderInscriptionList(parents, 'PARENT')}
      {renderInscriptionList(children, 'CHILDREN')}
    </Column>
  );
}
