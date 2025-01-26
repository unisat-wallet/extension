import moment from 'moment';
import { useEffect, useState } from 'react';

import { Inscription } from '@/shared/types';
import { Button, Column, Content, Header, Layout, Row, Text } from '@/ui/components';
import InscriptionPreview from '@/ui/components/InscriptionPreview';
import { Line } from '@/ui/components/Line';
import { Section } from '@/ui/components/Section';
import { useCurrentAccount } from '@/ui/state/accounts/hooks';
import { useAppDispatch } from '@/ui/state/hooks';
import { useTxExplorerUrl } from '@/ui/state/settings/hooks';
import { transactionsActions } from '@/ui/state/transactions/reducer';
import { useLocationState, useWallet } from '@/ui/utils';

import { useNavigate } from '../MainRoute';

const HIGH_BALANCE = 10000;
export default function OrdinalsInscriptionScreen() {
  const navigate = useNavigate();
  const { inscription } = useLocationState<{ inscription: Inscription }>();

  const currentAccount = useCurrentAccount();
  const withSend = currentAccount.address === inscription.address;

  const dispatch = useAppDispatch();

  const isUnconfirmed = inscription.timestamp == 0;
  const date = moment(inscription.timestamp * 1000).format('YYYY-MM-DD hh:mm:ss');

  const genesisTxUrl = useTxExplorerUrl(inscription.genesisTransaction);

  const [isNeedToSplit, setIsNeedToSplit] = useState(false);
  const [isMultiStuck, setIsMultiStuck] = useState(false);
  const wallet = useWallet();
  // detect multiple inscriptions
  useEffect(() => {
    wallet.getUtxoByInscriptionId(inscription.inscriptionId).then((v) => {
      const offsetSet = new Set(v.inscriptions.map((v) => v.offset));
      if (offsetSet.size > 1) {
        setIsNeedToSplit(true);
        setIsMultiStuck(true);
      }
    });
    if (inscription.outputValue > HIGH_BALANCE) {
      setIsNeedToSplit(true);
    }
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
            text={isUnconfirmed ? 'Inscription (not confirmed yet)' : `Inscription ${inscription.inscriptionNumber}`}
            preset="title-bold"
            textCenter
          />
          <Row justifyCenter>
            <InscriptionPreview data={inscription} preset="large" />
          </Row>

          {withSend && (
            <Row fullX>
              {isNeedToSplit && (
                <Button
                  text="Split"
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
                  text="Send"
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
                text={'Multiple inscriptions are mixed together. You can split them first or send them once.'}
              />
            ) : (
              <Text
                color="warning"
                textCenter
                text={`This inscription carries a high balance! (>${HIGH_BALANCE} sats)`}
              />
            ))}

          <Column
            gap="lg"
            px="md"
            py="md"
            style={{
              backgroundColor: 'rgba(255,255,255,0.08)',
              borderRadius: 15
            }}>
            <Section title="id" value={inscription.inscriptionId} />
            <Line />
            <Section title="address" value={inscription.address} />
            <Line />
            <Section title="output value" value={inscription.outputValue} />
            <Line />
            <Section title="preview" value={inscription.preview} link={inscription.preview} />
            <Line />
            <Section title="content" value={inscription.content} link={inscription.content} />
            <Line />
            <Section title="content length" value={inscription.contentLength} />
            <Line />
            <Section title="content type" value={inscription.contentType} />
            <Line />
            <Section title="timestamp" value={isUnconfirmed ? 'unconfirmed' : date} />
            <Line />
            <Section title="genesis transaction" value={inscription.genesisTransaction} link={genesisTxUrl} />
          </Column>
        </Column>
      </Content>
    </Layout>
  );
}
