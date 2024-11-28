import React, { useCallback, useEffect, useState } from 'react';

import { KEYRING_TYPE } from '@/shared/constant';
import { SignPsbtOptions, TxType, WebsiteResult } from '@/shared/types';
import { Button, Card, Column, Content, Footer, Header, Icon, Layout, Row, Text } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import { PhishingDetection } from '@/ui/components/PhishingDetection';
import WebsiteBar from '@/ui/components/WebsiteBar';
import KeystoneSignScreen from '@/ui/pages/Wallet/KeystoneSignScreen';
import { useCurrentAccount } from '@/ui/state/accounts/hooks';
import { fontSizes } from '@/ui/theme/font';
import { shortAddress, useApproval, useWallet } from '@/ui/utils';
import { LoadingOutlined } from '@ant-design/icons';

import SignPsbt from '../SignPsbt';
import MultiSignDisclaimerModal from './MultiSignDisclaimerModal';

interface Props {
  header?: React.ReactNode;
  params: {
    data: {
      psbtHexs: string[];
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

// keystone
interface TxInfo {
  psbtHexs: string[];
  txError: string;
  currentIndex: number;
}

const initTxInfo: TxInfo = {
  psbtHexs: [],
  txError: '',
  currentIndex: 0
};

export default function MultiSignPsbt({
  params: {
    data: { psbtHexs, options },
    session
  },
  header,
  handleCancel,
  handleConfirm
}: Props) {
  const [getApproval, resolveApproval, rejectApproval] = useApproval();
  const [txInfo, setTxInfo] = useState<TxInfo>(initTxInfo);
  const [loading, setLoading] = useState(true);
  const [viewingPsbtIndex, setViewingPsbtIndex] = useState(-1);
  const [signStates, setSignStates] = useState<SignState[]>(new Array(psbtHexs.length).fill(SignState.PENDING));

  // keystone sign
  const wallet = useWallet();
  const tools = useTools();
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
    // keystone
    setTxInfo({
      psbtHexs,
      txError: '',
      currentIndex: 0
    });

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

  const updateTxInfo = useCallback(
    (params: { currentIndex?: number }) => {
      setTxInfo(Object.assign({}, txInfo, params));
    },
    [txInfo, setTxInfo]
  );
  // keystone
  if (!handleCancel) {
    handleCancel = () => {
      if (txInfo.currentIndex > 0) {
        updateTxInfo({
          currentIndex: txInfo.currentIndex - 1
        });
        return;
      }
      rejectApproval();
    };
  }

  if (!handleConfirm) {
    handleConfirm = () => {
      resolveApproval({
        psbtHexs: txInfo.psbtHexs
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

  if (viewingPsbtIndex >= 0 && txInfo.psbtHexs) {
    return (
      <>
        <SignPsbt
          header={
            <Header
              onBack={() => {
                setViewingPsbtIndex(-1);
              }}
            />
          }
          params={{
            data: {
              psbtHex: txInfo.psbtHexs[viewingPsbtIndex],
              type: TxType.SIGN_TX,
              options: options ? options[viewingPsbtIndex] : { autoFinalized: false }
            },
            session
          }}
          handleCancel={() => {
            setViewingPsbtIndex(-1);
            signStates[viewingPsbtIndex] = SignState.FAILED;
            setSignStates(signStates);
          }}
          handleConfirm={() => {
            setViewingPsbtIndex(-1);
            signStates[viewingPsbtIndex] = SignState.SUCCESS;
            setSignStates(signStates);
          }}
        />
      </>
    );
  }

  const signedCount = signStates.filter((v) => v === SignState.SUCCESS).length;
  const isAllSigned = signedCount === txInfo.psbtHexs.length;

  // keystone
  const count = txInfo.psbtHexs.length;
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
        type="psbt"
        data={txInfo.psbtHexs[signIndex]}
        isFinalize={false}
        signatureText={`Get Signature (${signIndex + 1}/${count})`}
        id={signIndex}
        onSuccess={(data) => {
          txInfo.psbtHexs[signIndex] = data.psbtHex || '';
          if (signIndex === txInfo.psbtHexs.length - 1) {
            setIsKeystoneSigning(false);
            originalHandleConfirm();
          } else {
            tools.toastSuccess(`Get Signature Success (${signIndex + 1}/${count})`);
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
        <Text text={'Sign Multiple Transactions'} preset="title-bold" textCenter mt="lg" />
        <Column>
          {txInfo.psbtHexs.map((v, index) => {
            const signState = signStates[index];
            let text = 'View';
            if (signState == SignState.PENDING) {
              text = 'View';
            } else if (signState == SignState.SUCCESS) {
              text = 'Signed';
            } else if (signState == SignState.FAILED) {
              text = 'Rejected';
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
                    <Text text={`Transaction ${index + 1}`} preset="bold" />
                    <Text text={shortAddress(v, 10)} wrap />
                  </Column>
                  <Column>
                    <Button
                      preset={preset as any}
                      textStyle={{ fontSize: fontSizes.sm }}
                      text={text}
                      onClick={() => {
                        setViewingPsbtIndex(index);
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
          <Button preset="default" text={'Reject All'} onClick={handleCancel} full />

          {websiteResult.allowQuickMultiSign ? (
            <Button
              preset="primary"
              text={isAllSigned ? 'Submit' : `(${signedCount}/${txInfo.psbtHexs.length}) Signed`}
              icon={isAllSigned ? undefined : 'alert'}
              onClick={() => {
                if (isAllSigned) {
                  handleConfirm();
                } else {
                  setDisclaimerVisible(true);
                }
              }}
              full
            />
          ) : (
            <Button
              preset="primary"
              text={isAllSigned ? 'Submit' : `(${signedCount}/${txInfo.psbtHexs.length}) Signed`}
              onClick={handleConfirm}
              full
              disabled={isAllSigned == false}
            />
          )}
        </Row>
      </Footer>
      {disclaimerVisible && (
        <MultiSignDisclaimerModal
          txCount={txInfo.psbtHexs.length}
          onContinue={() => {
            handleConfirm();
          }}
          onClose={() => {
            setDisclaimerVisible(false);
          }}
        />
      )}
    </Layout>
  );
}
