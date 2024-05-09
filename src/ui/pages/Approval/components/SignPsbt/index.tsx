import { Tooltip } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';

import { KEYRING_TYPE } from '@/shared/constant';
import {
  Atomical,
  DecodedPsbt,
  Inscription,
  RawTxInfo,
  RuneBalance,
  SignPsbtOptions,
  ToSignInput,
  TxType
} from '@/shared/types';
import { Button, Card, Column, Content, Footer, Header, Icon, Layout, Row, Text } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import { AddressText } from '@/ui/components/AddressText';
import Arc20PreviewCard from '@/ui/components/Arc20PreviewCard';
import AssetTag from '@/ui/components/AssetTag';
import AtomicalsNFTPreview from '@/ui/components/AtomicalsNFTPreview';
import BRC20Preview from '@/ui/components/BRC20Preview';
import InscriptionPreview from '@/ui/components/InscriptionPreview';
import RunesPreviewCard from '@/ui/components/RunesPreviewCard';
import { SignPsbtWithRisksPopover } from '@/ui/components/SignPsbtWithRisksPopover';
import WebsiteBar from '@/ui/components/WebsiteBar';
import KeystoneSignScreen from '@/ui/pages/Wallet/KeystoneSignScreen';
import { useAccountAddress, useCurrentAccount } from '@/ui/state/accounts/hooks';
import {
  usePrepareSendAtomicalsNFTCallback,
  usePrepareSendBTCCallback,
  usePrepareSendOrdinalsInscriptionCallback
} from '@/ui/state/transactions/hooks';
import { colors } from '@/ui/theme/colors';
import { fontSizes } from '@/ui/theme/font';
import { copyToClipboard, satoshisToAmount, shortAddress, useApproval, useWallet } from '@/ui/utils';
import { LoadingOutlined } from '@ant-design/icons';

interface Props {
  header?: React.ReactNode;
  params: {
    data: {
      psbtHex: string;
      options: SignPsbtOptions;
      type: TxType;
      toAddress?: string;
      satoshis?: number;
      feeRate?: number;
      memo?: string;
      memos?: string[];
      inscriptionId?: string;
      rawTxInfo?: RawTxInfo;
    };
    session?: {
      origin: string;
      icon: string;
      name: string;
    };
  };
  handleCancel?: () => void;
  handleConfirm?: (rawTxInfo?: RawTxInfo) => void;
}
interface InputInfo {
  txid: string;
  vout: number;
  address: string;
  value: number;
  inscrip;
}

interface OutputInfo {
  address: string;
  value: number;
}

enum TabState {
  DETAILS,
  DATA,
  HEX
}

interface InscriptioinInfo {
  id: string;
  isSent: boolean;
}

function SignTxDetails({ txInfo, type, rawTxInfo }: { txInfo: TxInfo; rawTxInfo?: RawTxInfo; type: TxType }) {
  const address = useAccountAddress();

  const sendingInscriptions = useMemo(() => {
    return txInfo.decodedPsbt.inputInfos
      .reduce<Inscription[]>((pre, cur) => cur.inscriptions.concat(pre), [])
      .filter((v) => v.address == address);
  }, [txInfo.decodedPsbt]);

  const receivingInscriptions = useMemo(() => {
    return txInfo.decodedPsbt.outputInfos
      .reduce<Inscription[]>((pre, cur) => cur.inscriptions.concat(pre), [])
      .filter((v) => v.address == address);
  }, [txInfo.decodedPsbt]);

  const isCurrentToPayFee = useMemo(() => {
    if (type === TxType.SIGN_TX) {
      return false;
    } else {
      return true;
    }
  }, [type]);

  const spendSatoshis = useMemo(() => {
    const inValue = txInfo.decodedPsbt.inputInfos
      .filter((v) => v.address === address)
      .reduce((pre, cur) => cur.value + pre, 0);
    const outValue = txInfo.decodedPsbt.outputInfos
      .filter((v) => v.address === address)
      .reduce((pre, cur) => cur.value + pre, 0);
    const spend = inValue - outValue;
    return spend;
  }, [txInfo.decodedPsbt]);

  const sendingSatoshis = useMemo(() => {
    const inValue = txInfo.decodedPsbt.inputInfos
      .filter((v) => v.address === address)
      .reduce((pre, cur) => cur.value + pre, 0);
    return inValue;
  }, [txInfo.decodedPsbt]);

  const receivingSatoshis = useMemo(() => {
    const outValue = txInfo.decodedPsbt.outputInfos
      .filter((v) => v.address === address)
      .reduce((pre, cur) => cur.value + pre, 0);
    return outValue;
  }, [txInfo.decodedPsbt]);

  const spendAmount = useMemo(() => satoshisToAmount(spendSatoshis), [spendSatoshis]);
  const balanceChangedAmount = useMemo(
    () => satoshisToAmount(receivingSatoshis - sendingSatoshis),
    [sendingSatoshis, receivingSatoshis]
  );
  const feeAmount = useMemo(() => satoshisToAmount(txInfo.decodedPsbt.fee), [txInfo.decodedPsbt]);

  const sendingInscriptionSaotoshis = useMemo(
    () => sendingInscriptions.reduce((pre, cur) => pre + cur.outputValue, 0),
    [sendingInscriptions]
  );
  const sendingInscriptionAmount = useMemo(
    () => satoshisToAmount(sendingInscriptionSaotoshis),
    [sendingInscriptionSaotoshis]
  );

  const ordinalsInscriptionCount = txInfo.decodedPsbt.inputInfos.reduce(
    (pre, cur) => cur.inscriptions?.length + pre,
    0
  );
  const atomicalsNFTCount = txInfo.decodedPsbt.inputInfos.reduce(
    (pre, cur) => cur.atomicals.filter((v) => v.type === 'NFT').length + pre,
    0
  );
  const arc20Count = txInfo.decodedPsbt.inputInfos.reduce(
    (pre, cur) => cur.atomicals.filter((v) => v.type === 'FT').length + pre,
    0
  );

  const runesCount = txInfo.decodedPsbt.inputInfos.reduce((pre, cur) => (cur.runes ? cur.runes.length : 0) + pre, 0);

  const brc20Count = 0;

  const atomicals_nft: Atomical[] = [];
  const atomicals_ft: Atomical[] = [];
  const arc20Map: { [ticker: string]: number } = {};
  txInfo.decodedPsbt.inputInfos.forEach((v) => {
    v.atomicals.forEach((w) => {
      if (w.type === 'FT') {
        atomicals_ft.push(w);
        const ticker = w.ticker || '';
        arc20Map[ticker] = (arc20Map[ticker] || 0) + v.value;
      } else {
        atomicals_nft.push(w);
      }
    });
  });
  const inscriptionArray = Object.values(txInfo.decodedPsbt.inscriptions);
  const arc20Array = Object.keys(arc20Map).map((v) => ({ ticker: v, amt: arc20Map[v] }));

  const brc20Array: { tick: string; amt: string; inscriptionNumber: number }[] = [];
  txInfo.decodedPsbt.inputInfos.forEach((v) => {
    v.inscriptions.forEach((w) => {
      const inscriptionInfo = txInfo.decodedPsbt.inscriptions[w.inscriptionId];
      if (inscriptionInfo.brc20) {
        brc20Array.push({
          tick: inscriptionInfo.brc20.tick,
          amt: inscriptionInfo.brc20.amt,
          inscriptionNumber: w.inscriptionNumber
        });
      }
    });
  });

  const runesArray: RuneBalance[] = [];
  txInfo.decodedPsbt.inputInfos.forEach((v) => {
    if (v.runes) {
      v.runes.forEach((w) => {
        runesArray.push(w);
      });
    }
  });

  const involvedAssets = useMemo(() => {
    const involved =
      ordinalsInscriptionCount > 0 || atomicalsNFTCount > 0 || arc20Count > 0 || brc20Count > 0 || runesCount > 0;
    if (!involved) return;
    return (
      <Column>
        <Text text="Involved Assets:" preset="bold" />
        <Column justifyCenter>
          {ordinalsInscriptionCount > 0 ? (
            <Column
              fullX
              px="md"
              pt="md"
              pb="md"
              style={{
                backgroundColor: '#1e1a1e',
                borderRadius: 10,
                borderWidth: 1,
                borderColor: colors.border
              }}>
              <Row>
                <AssetTag type="Inscription" />
              </Row>

              <Row overflowX>
                {inscriptionArray.map((inscription, index) => {
                  return <InscriptionPreview key={'inscription_' + index} data={inscription} preset="small" />;
                })}
              </Row>
            </Column>
          ) : null}

          {arc20Array.length > 0 ? (
            <Column
              fullX
              px="md"
              pt="md"
              pb="md"
              style={{
                backgroundColor: '#1e1a1e',
                borderRadius: 10,
                borderWidth: 1,
                borderColor: colors.border
              }}>
              <Row>
                <AssetTag type="ARC20" />
              </Row>

              <Row overflowX>
                {arc20Array.map((w, index) => {
                  return <Arc20PreviewCard key={w.ticker} ticker={w.ticker || ''} amt={w.amt} />;
                })}
              </Row>
            </Column>
          ) : null}

          {brc20Array.length > 0 ? (
            <Column
              fullX
              px="md"
              pt="md"
              pb="md"
              style={{
                backgroundColor: '#1e1a1e',
                borderRadius: 10,
                borderWidth: 1,
                borderColor: colors.border
              }}>
              <Row>
                <AssetTag type="BRC20" />
              </Row>

              <Row overflowX>
                {brc20Array.map((w, index) => {
                  return (
                    <BRC20Preview
                      preset="small"
                      key={w.tick}
                      tick={w.tick || ''}
                      balance={w.amt}
                      type="TRANSFER"
                      inscriptionNumber={w.inscriptionNumber}
                    />
                  );
                })}
              </Row>
            </Column>
          ) : null}

          {runesArray.length > 0 ? (
            <Column
              fullX
              px="md"
              pt="md"
              pb="md"
              style={{
                backgroundColor: '#1e1a1e',
                borderRadius: 10,
                borderWidth: 1,
                borderColor: colors.border
              }}>
              <Row>
                <AssetTag type="RUNES" />
              </Row>

              <Row overflowX>
                {runesArray.map((w, index) => {
                  return <RunesPreviewCard key={'runes_' + index} balance={w} />;
                })}
              </Row>
            </Column>
          ) : null}
        </Column>
      </Column>
    );
  }, []);

  if (type === TxType.SIGN_TX) {
    return (
      <Column gap="lg">
        <Text text="Sign Transaction" preset="title-bold" textCenter mt="lg" />
        <Row justifyCenter>
          <Card style={{ backgroundColor: '#272626', maxWidth: 320, width: 320 }}>
            <Column gap="lg">
              <Column>
                <Column>
                  <Column justifyCenter>
                    <Row itemsCenter>
                      <Text
                        text={(receivingSatoshis > sendingSatoshis ? '+' : '') + balanceChangedAmount}
                        color={receivingSatoshis > sendingSatoshis ? 'white' : 'white'}
                        preset="bold"
                        textCenter
                        size="xxl"
                      />
                      <Text text="BTC" color="textDim" />
                    </Row>
                  </Column>
                </Column>
              </Column>
            </Column>
          </Card>
        </Row>

        {involvedAssets}
      </Column>
    );
  }

  return (
    <Column gap="lg">
      <Text text="Sign Transaction" preset="title-bold" textCenter mt="lg" />
      <Row justifyCenter>
        <Card style={{ backgroundColor: '#272626', maxWidth: 320, width: 320 }}>
          <Column gap="lg">
            <Column>
              {rawTxInfo && (
                <Column>
                  <Text text={'Send to'} textCenter color="textDim" />
                  <Row justifyCenter>
                    <AddressText addressInfo={rawTxInfo.toAddressInfo} textCenter />
                  </Row>
                </Column>
              )}
              {rawTxInfo && <Row style={{ borderTopWidth: 1, borderColor: colors.border }} my="md" />}

              {sendingInscriptions.length > 0 && (
                <Column justifyCenter>
                  <Text
                    text={
                      sendingInscriptions.length === 1
                        ? 'Spend Inscription'
                        : `Spend Inscription (${sendingInscriptions.length})`
                    }
                    textCenter
                    color="textDim"
                  />
                  <Row overflowX gap="lg" justifyCenter style={{ width: 280 }} pb="lg">
                    {sendingInscriptions.map((v) => (
                      <InscriptionPreview key={v.inscriptionId} data={v} preset="small" />
                    ))}
                  </Row>
                </Column>
              )}
              {sendingInscriptions.length > 0 && (
                <Row style={{ borderTopWidth: 1, borderColor: colors.border }} my="md" />
              )}

              <Column>
                <Text text={'Spend Amount'} textCenter color="textDim" />

                <Column justifyCenter>
                  <Text text={spendAmount} color="white" preset="bold" textCenter size="xxl" />
                  {sendingInscriptionSaotoshis > 0 && (
                    <Text text={`${sendingInscriptionAmount} (in inscriptions)`} preset="sub" textCenter />
                  )}
                  {isCurrentToPayFee && <Text text={`${feeAmount} (network fee)`} preset="sub" textCenter />}
                </Column>
              </Column>
            </Column>
          </Column>
        </Card>
      </Row>
      {involvedAssets}
    </Column>
  );
}

function Section({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <Column>
      <Text text={title} preset="bold" />
      <Card>
        <Row full justifyBetween itemsCenter>
          {children}
        </Row>
      </Card>
    </Column>
  );
}

interface TxInfo {
  changedBalance: number;
  changedInscriptions: InscriptioinInfo[];
  rawtx: string;
  psbtHex: string;
  toSignInputs: ToSignInput[];
  txError: string;
  decodedPsbt: DecodedPsbt;
}

const initTxInfo: TxInfo = {
  changedBalance: 0,
  changedInscriptions: [],
  rawtx: '',
  psbtHex: '',
  toSignInputs: [],
  txError: '',
  decodedPsbt: {
    inputInfos: [],
    outputInfos: [],
    fee: 0,
    feeRate: 0,
    risks: [],
    features: {
      rbf: false
    },
    inscriptions: {},
    isScammer: false,
    shouldWarnFeeRate: false,
    recommendedFeeRate: 1
  }
};

export default function SignPsbt({
  params: {
    data: { psbtHex, options, type, toAddress, satoshis, inscriptionId, feeRate, memo, memos, rawTxInfo, ...rest },
    session
  },
  header,
  handleCancel,
  handleConfirm
}: Props) {
  const [getApproval, resolveApproval, rejectApproval] = useApproval();

  const [txInfo, setTxInfo] = useState<TxInfo>(initTxInfo);

  const [tabState, setTabState] = useState(TabState.DATA);

  const prepareSendBTC = usePrepareSendBTCCallback();
  const prepareSendOrdinalsInscription = usePrepareSendOrdinalsInscriptionCallback();
  const prepareSendAtomicalsInscription = usePrepareSendAtomicalsNFTCallback;

  const wallet = useWallet();
  const [loading, setLoading] = useState(true);

  const tools = useTools();

  const address = useAccountAddress();
  const currentAccount = useCurrentAccount();

  const [isPsbtRiskPopoverVisible, setIsPsbtRiskPopoverVisible] = useState(false);
  const [isKeystoneSigning, setIsKeystoneSigning] = useState(false);

  const init = async () => {
    let txError = '';
    if (type === TxType.SIGN_TX) {
      if (psbtHex && currentAccount.type === KEYRING_TYPE.KeystoneKeyring) {
        try {
          const toSignInputs = await wallet.formatOptionsToSignInputs(psbtHex, options);
          psbtHex = await wallet.signPsbtWithHex(psbtHex, toSignInputs, false);
        } catch (e) {
          console.error(e);
          txError = (e as any).message;
          tools.toastError(txError);
        }
      }
    } else if (type === TxType.SEND_BITCOIN) {
      if (!psbtHex && toAddress && satoshis) {
        try {
          const rawTxInfo = await prepareSendBTC({
            toAddressInfo: { address: toAddress, domain: '' },
            toAmount: satoshis,
            feeRate,
            enableRBF: false,
            memo,
            memos,
            disableAutoAdjust: true
          });
          psbtHex = rawTxInfo.psbtHex;
        } catch (e) {
          console.log(e);
          txError = (e as any).message;
          tools.toastError(txError);
        }
      }
    } else if (type === TxType.SEND_ORDINALS_INSCRIPTION) {
      if (!psbtHex && toAddress && inscriptionId) {
        try {
          const rawTxInfo = await prepareSendOrdinalsInscription({
            toAddressInfo: { address: toAddress, domain: '' },
            inscriptionId: inscriptionId,
            feeRate,
            enableRBF: false
          });
          psbtHex = rawTxInfo.psbtHex;
        } catch (e) {
          console.log(e);
          txError = (e as any).message;
          tools.toastError(txError);
        }
      }
    } else if (type === TxType.SEND_ATOMICALS_INSCRIPTION) {
      // not support
    }

    if (!psbtHex) {
      setLoading(false);
      setTxInfo(Object.assign({}, initTxInfo, { txError }));
      return;
    }

    const decodedPsbt = await wallet.decodePsbt(psbtHex, session?.origin || '');

    let toSignInputs: ToSignInput[] = [];
    if (type === TxType.SEND_BITCOIN || type === TxType.SEND_ORDINALS_INSCRIPTION) {
      toSignInputs = decodedPsbt.inputInfos.map((v, index) => ({
        index,
        publicKey: currentAccount.pubkey
      }));
    } else {
      try {
        toSignInputs = await wallet.formatOptionsToSignInputs(psbtHex, options);
      } catch (e) {
        txError = (e as Error).message;
        tools.toastError(txError);
      }
    }

    setTxInfo({
      decodedPsbt,
      changedBalance: 0,
      changedInscriptions: [],
      psbtHex,
      rawtx: '',
      toSignInputs,
      txError
    });

    setLoading(false);
  };

  useEffect(() => {
    init();
  }, []);

  if (!handleCancel) {
    handleCancel = () => {
      rejectApproval();
    };
  }

  if (!handleConfirm) {
    handleConfirm = (res) => {
      let signed = true;
      if (type === TxType.SIGN_TX && currentAccount.type !== KEYRING_TYPE.KeystoneKeyring) {
        signed = false;
      }
      resolveApproval({
        psbtHex: (res ?? txInfo).psbtHex,
        signed
      });
    };
  }

  const originalHandleConfirm = handleConfirm;
  if (currentAccount.type === KEYRING_TYPE.KeystoneKeyring) {
    handleConfirm = () => {
      setIsKeystoneSigning(true);
    };
  }

  const networkFee = useMemo(() => satoshisToAmount(txInfo.decodedPsbt.fee), [txInfo.decodedPsbt]);

  const detailsComponent = useMemo(() => {
    return <SignTxDetails txInfo={txInfo} rawTxInfo={rawTxInfo} type={type} />;
  }, [txInfo]);

  const isValidData = useMemo(() => {
    if (txInfo.psbtHex === '') {
      return false;
    }
    return true;
  }, [txInfo.psbtHex]);

  const isValid = useMemo(() => {
    if (txInfo.toSignInputs.length == 0) {
      return false;
    }
    if (txInfo.decodedPsbt.inputInfos.length == 0) {
      return false;
    }
    return true;
  }, [txInfo.decodedPsbt, txInfo.toSignInputs]);

  const sendingInscriptions = useMemo(() => {
    return txInfo.decodedPsbt.inputInfos
      .reduce<Inscription[]>((pre, cur) => cur.inscriptions.concat(pre), [])
      .filter((v) => v.address == address);
  }, [txInfo.decodedPsbt]);

  const canChanged = useMemo(() => {
    let val = true;
    txInfo.decodedPsbt.inputInfos.forEach((v) => {
      if (v.address == address && (!v.sighashType || v.sighashType === 1)) {
        val = false;
      }
    });
    return val;
  }, [txInfo.decodedPsbt]);

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

  if (txInfo.decodedPsbt.isScammer) {
    return (
      <Layout>
        <Content>
          <Column>
            <Text text="Phishing Detection" preset="title-bold" textCenter mt="xxl" />
            <Text text="Malicious behavior and suspicious activity have been detected." mt="md" />
            <Text text="Your access to this page has been restricted by UniSat Wallet as it might be unsafe." mt="md" />
          </Column>
        </Content>

        <Footer>
          <Row full>
            <Button text="Reject (blocked by UniSat Wallet)" preset="danger" onClick={handleCancel} full />
          </Row>
        </Footer>
      </Layout>
    );
  }

  if (isKeystoneSigning) {
    return (
      <KeystoneSignScreen
        type="psbt"
        data={txInfo.psbtHex}
        isFinalize={type !== TxType.SIGN_TX}
        onSuccess={(data) => {
          originalHandleConfirm(data as any);
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
        <Column gap="xl">
          {detailsComponent}
          {canChanged == false && (
            <Section title="Network Fee:">
              <Text text={networkFee} />
              <Text text="BTC" color="textDim" />
            </Section>
          )}

          {canChanged == false && (
            <Section title="Network Fee Rate:">
              {txInfo.decodedPsbt.shouldWarnFeeRate ? (
                <Tooltip
                  title={
                    txInfo.decodedPsbt.recommendedFeeRate > txInfo.decodedPsbt.feeRate
                      ? `The fee rate is much lower than recommended fee rate (${txInfo.decodedPsbt.recommendedFeeRate} sat/vB)`
                      : `The fee rate is much higher than recommended fee rate (${txInfo.decodedPsbt.recommendedFeeRate} sat/vB)`
                  }
                  overlayStyle={{
                    fontSize: fontSizes.xs
                  }}>
                  <div>
                    <Row>
                      <Text text={txInfo.decodedPsbt.feeRate.toString()} />
                      <Icon icon="alert" color="warning" />
                    </Row>
                  </div>
                </Tooltip>
              ) : (
                <Text text={txInfo.decodedPsbt.feeRate.toString()} />
              )}

              <Text text="sat/vB" color="textDim" />
            </Section>
          )}

          <Section title="Features:">
            <Row>
              {txInfo.decodedPsbt.features.rbf ? (
                <Text text="RBF" color="white" style={{ backgroundColor: 'green', padding: 5, borderRadius: 5 }} />
              ) : (
                <Text
                  text="RBF"
                  color="white"
                  style={{ backgroundColor: 'red', padding: 5, borderRadius: 5, textDecoration: 'line-through' }}
                />
              )}
            </Row>
          </Section>

          {isValidData && (
            <Column gap="xl">
              <Column>
                <Text text={`Inputs: (${txInfo.decodedPsbt.inputInfos.length})`} preset="bold" />
                <Card>
                  <Column full justifyCenter>
                    {txInfo.decodedPsbt.inputInfos.map((v, index) => {
                      const isToSign = txInfo.toSignInputs.find((v) => v.index === index) ? true : false;
                      const inscriptions = v.inscriptions;
                      const atomicals_nft = v.atomicals.filter((v) => v.type === 'NFT');
                      const atomicals_ft = v.atomicals.filter((v) => v.type === 'FT');
                      const runes = v.runes || [];
                      return (
                        <Row
                          key={'output_' + index}
                          style={index === 0 ? {} : { borderColor: colors.border, borderTopWidth: 1, paddingTop: 10 }}
                          itemsCenter>
                          <Column fullX>
                            <Row fullX justifyBetween>
                              <Column>
                                <Row>
                                  <AddressText address={v.address} color={isToSign ? 'white' : 'textDim'} />
                                  {isToSign && (
                                    <Row style={{ borderWidth: 1, borderColor: 'gold', borderRadius: 5, padding: 2 }}>
                                      <Text text="to sign" color="gold" size="xs" />
                                    </Row>
                                  )}
                                </Row>
                              </Column>
                              <Row>
                                <Text text={`${satoshisToAmount(v.value)}`} color={isToSign ? 'white' : 'textDim'} />
                                <Text text="BTC" color="textDim" />
                              </Row>
                            </Row>

                            {inscriptions.length > 0 && (
                              <Row>
                                <Column justifyCenter>
                                  <Text
                                    text={`Inscriptions (${inscriptions.length})`}
                                    color={isToSign ? 'white' : 'textDim'}
                                  />
                                  <Row overflowX gap="lg" style={{ width: 280 }} pb="lg">
                                    {inscriptions.map((w) => (
                                      <InscriptionPreview
                                        key={w.inscriptionId}
                                        data={txInfo.decodedPsbt.inscriptions[w.inscriptionId]}
                                        preset="small"
                                        onClick={() => {
                                          window.open(w.preview);
                                        }}
                                      />
                                    ))}
                                  </Row>
                                </Column>
                              </Row>
                            )}

                            {atomicals_nft.length > 0 && (
                              <Row>
                                <Column justifyCenter>
                                  <Text
                                    text={`Atomicals NFT (${inscriptions.length})`}
                                    color={isToSign ? 'white' : 'textDim'}
                                  />
                                  <Row overflowX gap="lg" style={{ width: 280 }} pb="lg">
                                    {atomicals_nft.map((w) => (
                                      <AtomicalsNFTPreview
                                        key={w.atomicalId}
                                        data={w as any}
                                        preset="small"
                                        onClick={() => {
                                          window.open(w.preview);
                                        }}
                                      />
                                    ))}
                                  </Row>
                                </Column>
                              </Row>
                            )}

                            {atomicals_ft.length > 0 && (
                              <Row>
                                <Column justifyCenter>
                                  <Text text={'ARC20'} color={isToSign ? 'white' : 'textDim'} />
                                  <Row overflowX gap="lg" style={{ width: 280 }} pb="lg">
                                    {atomicals_ft.map((w) => (
                                      <Arc20PreviewCard key={w.ticker} ticker={w.ticker || ''} amt={v.value} />
                                    ))}
                                  </Row>
                                </Column>
                              </Row>
                            )}

                            {runes.length > 0 && (
                              <Row>
                                <Column justifyCenter>
                                  <Text text={'RUNES'} color={isToSign ? 'white' : 'textDim'} />
                                  <Row overflowX gap="lg" style={{ width: 280 }} pb="lg">
                                    {runes.map((w) => (
                                      <RunesPreviewCard key={w.runeid} balance={w} />
                                    ))}
                                  </Row>
                                </Column>
                              </Row>
                            )}
                          </Column>
                        </Row>
                      );
                    })}
                  </Column>
                </Card>
              </Column>

              <Column>
                <Text text={`Outputs: (${txInfo.decodedPsbt.outputInfos.length})`} preset="bold" />
                <Card>
                  <Column full justifyCenter gap="lg">
                    {txInfo.decodedPsbt.outputInfos.map((v, index) => {
                      const isMyAddress = v.address == currentAccount.address;
                      const inscriptions = v.inscriptions;
                      const atomicals_nft = v.atomicals.filter((v) => v.type === 'NFT');
                      const atomicals_ft = v.atomicals.filter((v) => v.type === 'FT');
                      const runes = v.runes || [];
                      return (
                        <Column
                          key={'output_' + index}
                          style={index === 0 ? {} : { borderColor: colors.border, borderTopWidth: 1, paddingTop: 10 }}>
                          <Column>
                            <Row justifyBetween>
                              <AddressText address={v.address} color={isMyAddress ? 'white' : 'textDim'} />
                              <Row>
                                <Text text={`${satoshisToAmount(v.value)}`} color={isMyAddress ? 'white' : 'textDim'} />
                                <Text text="BTC" color="textDim" />
                              </Row>
                            </Row>
                          </Column>

                          {canChanged === false && inscriptions.length > 0 && (
                            <Row>
                              <Column justifyCenter>
                                <Text
                                  text={`Inscriptions (${inscriptions.length})`}
                                  color={isMyAddress ? 'white' : 'textDim'}
                                />
                                <Row overflowX gap="lg" style={{ width: 280 }} pb="lg">
                                  {inscriptions.map((w) => (
                                    <InscriptionPreview
                                      key={w.inscriptionId}
                                      data={txInfo.decodedPsbt.inscriptions[w.inscriptionId]}
                                      preset="small"
                                      onClick={() => {
                                        window.open(w.preview);
                                      }}
                                    />
                                  ))}
                                </Row>
                              </Column>{' '}
                            </Row>
                          )}

                          {atomicals_nft.length > 0 && (
                            <Row>
                              <Column justifyCenter>
                                <Text
                                  text={`Atomicals NFT (${inscriptions.length})`}
                                  color={isMyAddress ? 'white' : 'textDim'}
                                />
                                <Row overflowX gap="lg" style={{ width: 280 }} pb="lg">
                                  {atomicals_nft.map((v) => (
                                    <AtomicalsNFTPreview
                                      key={v.atomicalId}
                                      data={v as any}
                                      preset="small"
                                      onClick={() => {
                                        window.open(v.preview);
                                      }}
                                    />
                                  ))}
                                </Row>
                              </Column>{' '}
                            </Row>
                          )}

                          {atomicals_ft.length > 0 && (
                            <Row>
                              <Column justifyCenter>
                                <Text text={'ARC20'} color={isMyAddress ? 'white' : 'textDim'} />
                                <Row overflowX gap="lg" style={{ width: 280 }} pb="lg">
                                  {atomicals_ft.map((w) => (
                                    <Arc20PreviewCard key={w.ticker} ticker={w.ticker || ''} amt={v.value} />
                                  ))}
                                </Row>
                              </Column>
                            </Row>
                          )}

                          {runes.length > 0 && (
                            <Row>
                              <Column justifyCenter>
                                <Text text={'RUNES'} color={isMyAddress ? 'white' : 'textDim'} />
                                <Row overflowX gap="lg" style={{ width: 280 }} pb="lg">
                                  {runes.map((w) => (
                                    <RunesPreviewCard key={w.runeid} balance={w} />
                                  ))}
                                </Row>
                              </Column>
                            </Row>
                          )}
                        </Column>
                      );
                    })}
                  </Column>
                </Card>
              </Column>
            </Column>
          )}

          <Section title="PSBT Data:">
            <Text text={shortAddress(txInfo.psbtHex, 10)} />
            <Row
              itemsCenter
              onClick={(e) => {
                copyToClipboard(txInfo.psbtHex).then(() => {
                  tools.toastSuccess('Copied');
                });
              }}>
              <Text text={`${txInfo.psbtHex.length / 2} bytes`} color="textDim" />
              <Icon icon="copy" color="textDim" />
            </Row>
          </Section>
        </Column>
      </Content>

      <Footer>
        <Row full>
          <Button preset="default" text="Reject" onClick={handleCancel} full />
          <Button
            preset="primary"
            icon={txInfo.decodedPsbt.risks.length > 0 ? 'risk' : undefined}
            text={type == TxType.SIGN_TX ? 'Sign' : 'Sign & Pay'}
            onClick={() => {
              if (txInfo.decodedPsbt.risks.length > 0) {
                setIsPsbtRiskPopoverVisible(true);
                return;
              }
              handleConfirm && handleConfirm();
            }}
            disabled={isValid == false}
            full
          />
        </Row>
      </Footer>
      {isPsbtRiskPopoverVisible && (
        <SignPsbtWithRisksPopover
          decodedPsbt={txInfo.decodedPsbt}
          onClose={() => {
            setIsPsbtRiskPopoverVisible(false);
          }}
          onConfirm={() => {
            setIsPsbtRiskPopoverVisible(false);
            handleConfirm && handleConfirm();
          }}
        />
      )}
    </Layout>
  );
}
