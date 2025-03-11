import moment from 'moment';
import { useEffect, useState } from 'react';

import { Inscription } from '@/shared/types';
import { Button, Column, Content, Header, Layout, Row, Text } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import InscriptionPreview from '@/ui/components/InscriptionPreview';
import { useI18n } from '@/ui/hooks/useI18n';
import { useCurrentAccount } from '@/ui/state/accounts/hooks';
import { useAppDispatch } from '@/ui/state/hooks';
import { useTxExplorerUrl } from '@/ui/state/settings/hooks';
import { transactionsActions } from '@/ui/state/transactions/reducer';
import { copyToClipboard, useLocationState, useWallet } from '@/ui/utils';

import { useNavigate } from '../MainRoute';

export default function AtomicalsNFTScreen() {
  const navigate = useNavigate();
  const { inscription } = useLocationState<{ inscription: Inscription }>();
  const { t } = useI18n();
  const currentAccount = useCurrentAccount();
  const withSend = currentAccount.address === inscription.address;

  const dispatch = useAppDispatch();

  const isUnconfirmed = inscription.timestamp == 0;
  const date = moment(inscription.timestamp * 1000).format('YYYY-MM-DD hh:mm:ss');

  const genesisTxUrl = useTxExplorerUrl(inscription.genesisTransaction);

  const [isMultiStuck, setIsMultiStuck] = useState(false);
  const [splitReason, setSplitReason] = useState('');
  const wallet = useWallet();
  // detect multiple inscriptions
  useEffect(() => {
    wallet.getUtxoByInscriptionId(inscription.inscriptionId).then((v) => {
      if (v.inscriptions.length > 1) {
        setIsMultiStuck(true);
      }
    });
  }, []);

  return (
    <Layout>
      <Header
        onBack={() => {
          window.history.go(-1);
        }}
      />
      <Content>
        <Column>
          <Text
            text={isUnconfirmed ? t('atomicals_inscription_not_confirmed_yet') : t('atomicals_inscription')}
            preset="title-bold"
            textCenter
          />
          <Row justifyCenter>
            <InscriptionPreview data={inscription} preset="large" />
          </Row>
          {withSend && (
            <Row fullX>
              <Button
                text={t('send')}
                icon="send"
                preset="default"
                full
                onClick={(e) => {
                  dispatch(transactionsActions.reset());
                  navigate('SendAtomicalsInscriptionScreen', { inscription });
                }}
              />
            </Row>
          )}

          {isMultiStuck ? (
            <Text color="danger" textCenter text={t('multiple_inscriptions_are_mixed_together_please_sp')} />
          ) : null}

          <Column gap="lg">
            <Section title={t('atomicals_id')} value={inscription.inscriptionId} />
            <Section title={t('atomicals_number')} value={inscription.inscriptionNumber} />
            <Section title={t('address')} value={inscription.address} />
            <Section title={t('output_value')} value={inscription.outputValue} />
            <Section title={t('preview')} value={inscription.preview} link={inscription.preview} />
            <Section title={t('content')} value={inscription.content} link={inscription.content} />
            <Section title={t('content_length')} value={inscription.contentLength} />
            <Section title={t('content_type')} value={inscription.contentType} />
            <Section title={t('timestamp')} value={isUnconfirmed ? t('unconfirmed') : date} />
            <Section title={t('genesis_transaction')} value={inscription.genesisTransaction} link={genesisTxUrl} />
          </Column>
        </Column>
      </Content>
    </Layout>
  );
}

function Section({ value, title, link }: { value: string | number; title: string; link?: string }) {
  const tools = useTools();
  const { t } = useI18n();
  return (
    <Column>
      <Text text={title} preset="sub" />
      <Text
        text={value}
        preset={link ? 'link' : 'regular'}
        size="xs"
        wrap
        onClick={() => {
          if (link) {
            window.open(link);
          } else {
            copyToClipboard(value).then(() => {
              tools.toastSuccess(t('copied'));
            });
          }
        }}
      />
    </Column>
  );
}
