import { useLocation } from 'react-router-dom';

import { Inscription } from '@/shared/types';
import { Button, Column, Content, Header, Layout, Row, Text } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import InscriptionPreview from '@/ui/components/InscriptionPreview';
import { useAppDispatch } from '@/ui/state/hooks';
import { transactionsActions } from '@/ui/state/transactions/reducer';
import { copyToClipboard } from '@/ui/utils';

import { useNavigate } from '../MainRoute';

export default function OrdinalsDetailScreen() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { inscription, withSend } = state as {
    inscription: Inscription;
    withSend: boolean;
  };
  const dispatch = useAppDispatch();

  const detail = inscription.detail;
  if (!detail) {
    return <div></div>;
  }
  const date = new Date(detail.timestamp);
  const isUnconfirmed = date.getTime() < 100;

  const { toast } = useTools();
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
            text={isUnconfirmed ? 'Inscription (not confirmed yet)' : `Inscription ${inscription.num}`}
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
            {detail &&
              Object.keys(detail).map((k, i) => {
                const keyName = k.split('_').join(' ');
                const isLink = k === 'preview' || k === 'content';
                if (detail[k] === '') return <div />;
                return (
                  <Column key={k}>
                    <Text text={keyName} preset="sub" />
                    <Text
                      text={detail[k]}
                      preset={isLink ? 'link' : 'regular'}
                      size="xs"
                      wrap
                      onClick={() => {
                        if (k === 'preview' || k === 'content') {
                          window.open(detail[k]);
                        } else {
                          copyToClipboard(detail[k]).then(() => {
                            toast('Copied');
                          });
                        }
                      }}
                    />
                  </Column>
                );
              })}
          </Column>
        </Column>
      </Content>
    </Layout>
  );
}
