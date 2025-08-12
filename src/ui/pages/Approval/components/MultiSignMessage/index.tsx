import React, { useCallback, useEffect, useState } from 'react';

import { KEYRING_TYPE } from '@/shared/constant';
import { KeystoneSignEnum } from '@/shared/constant/KeystoneSignType';
import { SignPsbtOptions, WebsiteResult } from '@/shared/types';
import { Button, Card, Column, Content, Footer, Header, Icon, Layout, Row, Text } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import { PhishingDetection } from '@/ui/components/PhishingDetection';
import WebsiteBar from '@/ui/components/WebsiteBar';
import { useI18n } from '@/ui/hooks/useI18n';
import KeystoneSignScreen from '@/ui/pages/Wallet/KeystoneSignScreen';
import { useCurrentAccount } from '@/ui/state/accounts/hooks';
import { fontSizes } from '@/ui/theme/font';
import { shortAddress, useApproval, useWallet } from '@/ui/utils';
import { LoadingOutlined } from '@ant-design/icons';

import MultiSignDisclaimerModal from '../MultiSignPsbt/MultiSignDisclaimerModal';

interface Props {
  header?: React.ReactNode;
  params: {
    data: {
      messages: { text: string; type: string }[];
      options: SignPsbtOptions[];
    };
    session?: {
      origin: string;
      icon: string;
      name: string;
    };
  };
  handleCancel?: () => void;
  handleConfirm?: () => void;
}

enum SignState {
  PENDING,
  SUCCESS,
  FAILED
}

// Message info container
interface MessageInfo {
  messages: { text: string; type: string }[];
  txError: string;
  currentIndex: number;
}

const initMessageInfo: MessageInfo = {
  messages: [],
  txError: '',
  currentIndex: 0
};

export default function MultiSignMessage({
  params: {
    data: { messages, options },
    session
  },
  header,
  handleCancel,
  handleConfirm
}: Props) {
  const [getApproval, resolveApproval, rejectApproval] = useApproval();
  const [messageInfo, setMessageInfo] = useState<MessageInfo>(initMessageInfo);
  const [loading, setLoading] = useState(true);
  const [viewingMessageIndex, setViewingMessageIndex] = useState(-1);
  const [signStates, setSignStates] = useState<SignState[]>([]);
  // keystone sign
  const wallet = useWallet();
  const tools = useTools();
  const { t } = useI18n();
  const currentAccount = useCurrentAccount();
  const [isKeystoneSigning, setIsKeystoneSigning] = useState(false);
  const [signIndex, setSignIndex] = useState(0);

  const [websiteResult, setWebsiteResult] = useState<WebsiteResult>({
    isScammer: false,
    warning: '',
    allowQuickMultiSign: false
  });

  const [disclaimerVisible, setDisclaimerVisible] = useState(false);

  const init = async () => {
    // Initialize the message info
    const messagesCopy = [...messages];

    setMessageInfo({
      messages: messagesCopy,
      txError: '',
      currentIndex: 0
    });

    // Initialize sign states
    setSignStates(new Array(messages.length).fill(SignState.PENDING));

    const website = session?.origin;
    if (website) {
      const result = await wallet.checkWebsite(website);
      setWebsiteResult(result);
    }

    setLoading(false);
  };

  useEffect(() => {
    init();
  }, []);

  const updateMessageInfo = useCallback(
    (params: { currentIndex?: number }) => {
      setMessageInfo(Object.assign({}, messageInfo, params));
    },
    [messageInfo, setMessageInfo]
  );

  if (!handleCancel) {
    handleCancel = () => {
      if (messageInfo.currentIndex > 0) {
        updateMessageInfo({
          currentIndex: messageInfo.currentIndex - 1
        });
        return;
      }
      rejectApproval();
    };
  }

  if (!handleConfirm) {
    handleConfirm = () => {
      resolveApproval({
        messages: messageInfo.messages
      });
    };
  }

  const originalHandleConfirm = handleConfirm;
  if (currentAccount.type === KEYRING_TYPE.KeystoneKeyring) {
    handleConfirm = () => {
      setIsKeystoneSigning(true);
    };
  }

  if (loading) {
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

  if (!header && session) {
    header = (
      <Header>
        <WebsiteBar session={session} />
      </Header>
    );
  }

  if (websiteResult.isScammer) {
    return <PhishingDetection handleCancel={handleCancel} />;
  }

  if (viewingMessageIndex >= 0 && messageInfo.messages) {
    const currentMessage = messageInfo.messages[viewingMessageIndex];
    return (
      <Layout>
        <Header
          onBack={() => {
            setViewingMessageIndex(-1);
          }}
        />
        <Content>
          <Column>
            <Text text={t('signature_request')} preset="title-bold" textCenter mt="lg" />
            <Text text={t('only_sign_this_message_if_you_fully_understand_the')} preset="sub" textCenter mt="lg" />
            <Text text={t('you_are_signing')} textCenter mt="lg" />

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
                {currentMessage.text}
              </div>
            </Card>
          </Column>
        </Content>

        <Footer>
          <Row full>
            <Button
              text={t('reject')}
              full
              preset="default"
              onClick={() => {
                setViewingMessageIndex(-1);
                const newSignStates = [...signStates];
                newSignStates[viewingMessageIndex] = SignState.FAILED;
                setSignStates(newSignStates);
              }}
            />
            <Button
              text={t('sign')}
              full
              preset="primary"
              onClick={() => {
                setViewingMessageIndex(-1);
                const newSignStates = [...signStates];
                newSignStates[viewingMessageIndex] = SignState.SUCCESS;
                setSignStates(newSignStates);
              }}
            />
          </Row>
        </Footer>
      </Layout>
    );
  }

  const signedCount = signStates.filter((v) => v === SignState.SUCCESS).length;
  const isAllSigned = signedCount === messageInfo.messages.length;

  // keystone
  const count = messageInfo.messages.length;
  const arr: { label: string; key: number }[] = [];
  for (let i = 0; i < count; i++) {
    arr.push({
      label: `${i + 1}`,
      key: i
    });
  }

  if (isKeystoneSigning) {
    return (
      <KeystoneSignScreen
        type={
          messageInfo.messages[signIndex].type === 'bip322-simple'
            ? KeystoneSignEnum.BIP322_SIMPLE
            : KeystoneSignEnum.MSG
        }
        data={messageInfo.messages[signIndex].text}
        signatureText={`${t('get_signature')} (${signIndex + 1}/${count})`}
        id={signIndex}
        onSuccess={(data) => {
          // Handle success for keystone signing
          const newSignStates = [...signStates];
          newSignStates[signIndex] = SignState.SUCCESS;
          setSignStates(newSignStates);

          if (signIndex === messageInfo.messages.length - 1) {
            setIsKeystoneSigning(false);
            originalHandleConfirm();
          } else {
            tools.toastSuccess(`${t('get_signature_success')} (${signIndex + 1}/${count})`);
            setTimeout(() => {
              setSignIndex(signIndex + 1);
            }, 1000);
          }
        }}
        onBack={() => {
          setIsKeystoneSigning(false);
        }}
      />
    );
  }

  return (
    <Layout>
      {header}
      <Content>
        <Text text={t('sign_multiple_transactions')} preset="title-bold" textCenter mt="lg" />
        <Column>
          {messageInfo.messages.map((v, index) => {
            const signState = signStates[index];
            let text = 'View';
            if (signState == SignState.PENDING) {
              text = t('view');
            } else if (signState == SignState.SUCCESS) {
              text = t('signed');
            } else if (signState == SignState.FAILED) {
              text = t('reject');
            }

            let preset = 'primary';
            if (signState === SignState.SUCCESS) {
              preset = 'approval';
            } else if (signState === SignState.FAILED) {
              preset = 'danger';
            }
            return (
              <Card key={index}>
                <Row justifyBetween fullX>
                  <Column>
                    <Text text={`${t('message')} ${index + 1}`} preset="bold" />
                    <Text text={shortAddress(v.text, 30)} wrap />
                  </Column>
                  <Column>
                    <Button
                      preset={preset as any}
                      textStyle={{ fontSize: fontSizes.sm }}
                      text={text}
                      onClick={() => {
                        setViewingMessageIndex(index);
                      }}
                      style={{ width: 80, height: 25 }}
                    />
                  </Column>
                </Row>
              </Card>
            );
          })}
        </Column>
      </Content>

      <Footer>
        <Row full>
          <Button preset="default" text={t('reject_all')} onClick={handleCancel} full />

          {websiteResult.allowQuickMultiSign ? (
            <Button
              preset="primary"
              text={isAllSigned ? t('submit') : `(${signedCount}/${messageInfo.messages.length}) ${t('signed')}`}
              icon={isAllSigned ? undefined : 'alert'}
              onClick={() => {
                if (isAllSigned) {
                  handleConfirm && handleConfirm();
                } else {
                  setDisclaimerVisible(true);
                }
              }}
              full
            />
          ) : (
            <Button
              preset="primary"
              text={isAllSigned ? t('submit') : `(${signedCount}/${messageInfo.messages.length}) ${t('signed')}`}
              onClick={handleConfirm}
              full
              disabled={isAllSigned == false}
            />
          )}
        </Row>
      </Footer>
      {disclaimerVisible && (
        <MultiSignDisclaimerModal
          txCount={messageInfo.messages.length}
          onContinue={() => {
            handleConfirm && handleConfirm();
          }}
          onClose={() => {
            setDisclaimerVisible(false);
          }}
        />
      )}
    </Layout>
  );
}
