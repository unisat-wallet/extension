import { Tooltip } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';

import { Atomical, DecodedPsbt, Inscription, RawTxInfo, SignPsbtOptions, ToSignInput, TxType } from '@/shared/types';
import { Button, Card, Column, Content, Footer, Header, Icon, Layout, Row, Text } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import { AddressText } from '@/ui/components/AddressText';
import Arc20PreviewCard from '@/ui/components/Arc20PreviewCard';
import AtomicalsNFTPreview from '@/ui/components/AtomicalsNFTPreview';
import InscriptionPreview from '@/ui/components/InscriptionPreview';
import { WarningPopover } from '@/ui/components/WarningPopover';
import WebsiteBar from '@/ui/components/WebsiteBar';
import { useAccountAddress, useCurrentAccount } from '@/ui/state/accounts/hooks';
import {
  usePrepareSendAtomicalsNFTCallback,
  usePrepareSendBTCCallback,
  usePrepareSendOrdinalsInscriptionsCallback
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
  handleConfirm?: () => void;
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

  const involvedAssets = useMemo(() => {
    const involved = ordinalsInscriptionCount > 0 || atomicalsNFTCount > 0 || arc20Count > 0 || brc20Count > 0;
    if (!involved) return;
    return (
      <Column>
        <Text text="Involved Assets:" preset="bold" />
        <Row justifyCenter>
          {ordinalsInscriptionCount > 0 ? (
            <Tooltip
              title={
                <span>
                  {inscriptionArray.map((v, index) => (
                    <Row justifyBetween key={v.inscriptionId}>
                      <span># {v.inscriptionNumber}</span>
                    </Row>
                  ))}
                </span>
              }
              overlayStyle={{
                fontSize: fontSizes.xs
              }}>
              <div>
                <Card style={{ backgroundColor: '#C67700', width: 75, height: 75 }}>
                  <Column justifyCenter>
                    <Text text={'Inscriptions'} textCenter size="xs" />
                  </Column>
                </Card>
              </div>
            </Tooltip>
          ) : null}

          {brc20Count > 0 ? (
            <Card style={{ backgroundColor: '#9E4A25', width: 75, height: 75 }}>
              <Column justifyCenter>
                <Row itemsCenter>
                  <Text text={'BRC20'} />
                </Row>
              </Column>
            </Card>
          ) : null}

          {atomicalsNFTCount > 0 ? (
            <Card style={{ backgroundColor: '#24B8CD', width: 75, height: 75 }}>
              <Column justifyCenter>
                <Text text={'Atomicals'} textCenter size="xs" />
                <Text text={'NFT'} textCenter size="xs" />
              </Column>
            </Card>
          ) : null}

          {arc20Count > 0 ? (
            <Tooltip
              title={
                <span>
                  {arc20Array.map((v, index) => (
                    <Row justifyBetween key={v.ticker}>
                      <span>{v.ticker}</span>
                      <span>{v.amt}</span>
                    </Row>
                  ))}
                </span>
              }
              overlayStyle={{
                fontSize: fontSizes.xs
              }}>
              <div>
                <Card style={{ backgroundColor: '#1B409D', width: 75, height: 75 }}>
                  <Column justifyCenter>
                    <Text text={'ARC20'} textCenter size="xs" />
                  </Column>
                </Card>
              </div>
            </Tooltip>
          ) : null}
        </Row>
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
  isScammer: boolean;
}

const initTxInfo: TxInfo = {
  changedBalance: 0,
  changedInscriptions: [],
  rawtx: '',
  psbtHex: '',
  toSignInputs: [],
  txError: '',
  isScammer: false,
  decodedPsbt: {
    inputInfos: [],
    outputInfos: [],
    fee: 0,
    feeRate: 0,
    risks: [],
    features: {
      rbf: false
    },
    inscriptions: {}
  }
};

export default function SignPsbt({
  params: {
    data: { psbtHex, options, type, toAddress, satoshis, inscriptionId, feeRate, rawTxInfo, ...rest },
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
  const prepareSendOrdinalsInscriptions = usePrepareSendOrdinalsInscriptionsCallback();
  const prepareSendAtomicalsInscription = usePrepareSendAtomicalsNFTCallback;

  const wallet = useWallet();
  const [loading, setLoading] = useState(true);

  const tools = useTools();

  const address = useAccountAddress();
  const currentAccount = useCurrentAccount();

  const [isWarningVisible, setIsWarningVisible] = useState(false);

  const init = async () => {
    let txError = '';
    if (type === TxType.SEND_BITCOIN) {
      if (!psbtHex && toAddress && satoshis) {
        try {
          const rawTxInfo = await prepareSendBTC({
            toAddressInfo: { address: toAddress, domain: '' },
            toAmount: satoshis,
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
    } else if (type === TxType.SEND_ORDINALS_INSCRIPTION) {
      if (!psbtHex && toAddress && inscriptionId) {
        try {
          const rawTxInfo = await prepareSendOrdinalsInscriptions({
            toAddressInfo: { address: toAddress, domain: '' },
            inscriptionIds: [inscriptionId],
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

    const { isScammer } = await wallet.checkWebsite(session?.origin || '');

    const decodedPsbt = await wallet.decodePsbt(psbtHex);

    if (decodedPsbt.risks.length > 0) {
      setIsWarningVisible(true);
    }

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
      txError,
      isScammer
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
    handleConfirm = () => {
      resolveApproval({
        psbtHex: txInfo.psbtHex
      });
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

  const hasHighRisk = useMemo(() => {
    if (txInfo && txInfo.decodedPsbt) {
      return txInfo.decodedPsbt.risks.find((v) => v.level === 'high') ? true : false;
    } else {
      return false;
    }
  }, [txInfo]);

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

  if (txInfo.isScammer) {
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
              <Text text={txInfo.decodedPsbt.feeRate.toString()} />
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
                                  <Text text={`ARC20`} color={isToSign ? 'white' : 'textDim'} />
                                  <Row overflowX gap="lg" style={{ width: 280 }} pb="lg">
                                    {atomicals_ft.map((w) => (
                                      <Arc20PreviewCard key={w.ticker} ticker={w.ticker || ''} amt={v.value} />
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
                                <Text text={`ARC20`} color={isMyAddress ? 'white' : 'textDim'} />
                                <Row overflowX gap="lg" style={{ width: 280 }} pb="lg">
                                  {atomicals_ft.map((w) => (
                                    <Arc20PreviewCard key={w.ticker} ticker={w.ticker || ''} amt={v.value} />
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
          {hasHighRisk == false && (
            <Button
              preset="primary"
              text={type == TxType.SIGN_TX ? 'Sign' : 'Sign & Pay'}
              onClick={handleConfirm}
              disabled={isValid == false}
              full
            />
          )}
        </Row>
      </Footer>
      {isWarningVisible && (
        <WarningPopover
          risks={txInfo.decodedPsbt.risks}
          onClose={() => {
            setIsWarningVisible(false);
          }}
        />
      )}
    </Layout>
  );
}
