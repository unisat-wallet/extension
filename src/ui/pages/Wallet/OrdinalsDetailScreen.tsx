import moment from 'moment';

import { Inscription } from '@/shared/types';
import { Button, Column, Content, Header, Layout, Row, Text } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import InscriptionPreview from '@/ui/components/InscriptionPreview';
import { useCurrentAccount } from '@/ui/state/accounts/hooks';
import { useAppDispatch } from '@/ui/state/hooks';
import { useTxIdUrl } from '@/ui/state/settings/hooks';
import { transactionsActions } from '@/ui/state/transactions/reducer';
import { copyToClipboard, useLocationState } from '@/ui/utils';

import { useNavigate } from '../MainRoute';

export default function OrdinalsDetailScreen() {
  const navigate = useNavigate();
  const { inscription } = useLocationState<{ inscription: Inscription }>();

  const currentAccount = useCurrentAccount();
  const withSend = currentAccount.address === inscription.address;

  const dispatch = useAppDispatch();

  const isUnconfirmed = inscription.timestamp == 0;
  const date = moment(inscription.timestamp * 1000).format('YYYY-MM-DD hh:mm:ss');

  const genesisTxUrl = useTxIdUrl(inscription.genesisTransaction);
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
            <Button
              text="Send"
              icon="send"
              preset="default"
              onClick={(e) => {
                dispatch(transactionsActions.reset());
                navigate('OrdinalsTxCreateScreen', { inscription });
              }}
            />
          )}
          <Column gap="lg">
            <Section title="id" value={inscription.inscriptionId} />
            <Section title="address" value={inscription.address} />
            <Section title="output value" value={inscription.outputValue} />
            <Section title="preview" value={inscription.preview} link={inscription.preview} />
            <Section title="content" value={inscription.content} link={inscription.content} />
            <Section title="content length" value={inscription.contentLength} />
            <Section title="content type" value={inscription.contentType} />
            <Section title="timestamp" value={isUnconfirmed ? 'unconfirmed' : date} />
            <Section title="genesis transaction" value={inscription.genesisTransaction} link={genesisTxUrl} />
          </Column>
        </Column>
      </Content>
    </Layout>
  );
}

function Section({ value, title, link }: { value: string | number; title: string; link?: string }) {
  const tools = useTools();
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
              tools.toastSuccess('Copied');
            });
          }
        }}
      />
    </Column>
  );
}
