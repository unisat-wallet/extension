import { useEffect, useState } from 'react';

import {
  Button,
  Card,
  Column,
  Content,
  Footer,
  Header,
  Icon,
  Input,
  Layout,
  Loading,
  Row,
  Text
} from '@/ui/components';
import WebsiteBar from '@/ui/components/WebsiteBar';
import { copyToClipboard } from '@/ui/utils';
import { useApproval, useI18n, useTools, useWallet } from '@unisat/wallet-state';

interface Props {
  params: {
    data: {
      data: string;
    };
    session: {
      origin: string;
      icon: string;
      name: string;
    };
  };
}

export default function SignData({ params: { data, session } }: Props) {
  const { resolveApproval, rejectApproval } = useApproval();
  const { t } = useI18n();
  const AGREEMENT_TEXT = t('i_only_sign_what_i_understand');

  const handleCancel = () => {
    rejectApproval();
  };

  const handleConfirm = () => {
    resolveApproval();
  };

  const wallet = useWallet();
  const [ready, setReady] = useState(false);
  const [enableSignData, setEnableSignData] = useState(false);
  useEffect(() => {
    wallet
      .getEnableSignData()
      .then((enable) => {
        setEnableSignData(enable);
      })
      .finally(() => {
        setReady(true);
      });
  }, []);

  const tools = useTools();

  const [inputValue, setInputValue] = useState('');
  const [understand, setUnderstand] = useState(false);
  useEffect(() => {
    if (inputValue === AGREEMENT_TEXT) {
      setUnderstand(true);
    } else {
      setUnderstand(false);
    }
  }, [inputValue]);

  if (!ready) {
    return (
      <Layout>
        <Loading />
      </Layout>
    );
  }

  if (!enableSignData) {
    return (
      <Layout>
        <Content>
          <Header>
            <WebsiteBar session={session} />
          </Header>

          <Column>
            <Text text={t('sign_data_request')} preset="title-bold" textCenter mt="lg" />

            <Text text={t('signdata_required_tip')} textCenter />
          </Column>
        </Content>

        <Footer>
          <Row full>
            <Button text={t('reject')} full preset="default" onClick={handleCancel} />
          </Row>
        </Footer>
      </Layout>
    );
  }

  return (
    <Layout>
      <Content>
        <Header>
          <WebsiteBar session={session} />
        </Header>

        <Column>
          <Text text={t('signature_request')} preset="title-bold" textCenter mt="lg" />

          <Text text={t('you_are_signing_data')} textCenter mt="lg" />

          <Card>
            <div
              style={{
                userSelect: 'text',
                maxHeight: 384,
                overflow: 'auto',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                flexWrap: 'wrap'
              }}>
              {data.data}
            </div>
          </Card>

          <Text
            preset="sub"
            textCenter
            mt="lg"
            color="warning"
            text={t(
              'only_sign_this_message_if_you_fully_understand_the_content_and_trust_the_requesting_site_or_you_could_be_agreeing_to_give_away_your_funds_and_nfts'
            )}
          />
          <Row
            itemsCenter
            gap="sm"
            onClick={(e) => {
              copyToClipboard(AGREEMENT_TEXT).then(() => {
                tools.toastSuccess(t('copied'));
              });
            }}>
            <Text text={`${t('enter')} “${AGREEMENT_TEXT}” ${t('to_continue')}`} preset="bold" />
            <Icon icon="copy" color="textDim" />
          </Row>
          <Input
            preset="text"
            autoFocus={true}
            onChange={(e) => {
              setInputValue(e.target.value);
            }}
          />
        </Column>
      </Content>

      <Footer>
        <Row full>
          <Button text={t('reject')} full preset="default" onClick={handleCancel} />
          <Button text={t('sign')} full preset="primary" onClick={handleConfirm} disabled={!understand} />
        </Row>
      </Footer>
    </Layout>
  );
}
