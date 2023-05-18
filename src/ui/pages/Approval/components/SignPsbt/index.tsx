import React, { useEffect, useMemo, useState } from 'react';

import { RawTxInfo, ToSignInput, TxType } from '@/shared/types';
import { DecodedPsbt } from '@/shared/types';
import { Inscription } from '@/shared/types';
import { Button, Layout, Content, Footer, Icon, Text, Row, Card, Column, TextArea, Header } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import { AddressText } from '@/ui/components/AddressText';
import InscriptionPreview from '@/ui/components/InscriptionPreview';
import { TabBar } from '@/ui/components/TabBar';
import WebsiteBar from '@/ui/components/WebsiteBar';
import { useAccountAddress } from '@/ui/state/accounts/hooks';
import { useCreateBitcoinTxCallback, useCreateMultiOrdinalsTxCallback } from '@/ui/state/transactions/hooks';
import { colors } from '@/ui/theme/colors';
import { fontSizes } from '@/ui/theme/font';
import { copyToClipboard, satoshisToAmount, useApproval, useWallet } from '@/ui/utils';
import { LoadingOutlined } from '@ant-design/icons';

interface Props {
  header?: React.ReactNode;
  params: {
    data: {
      psbtHex: string;
      type: TxType;
      toAddress?: string;
      satoshis?: number;
      feeRate?: number;
      inscriptionId?: string;
      toSignInputs?: ToSignInput[];
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
  const sendingAmount = useMemo(() => satoshisToAmount(sendingSatoshis), [sendingSatoshis]);
  const receivingAmount = useMemo(() => satoshisToAmount(receivingSatoshis), [receivingSatoshis]);

  const feeAmount = useMemo(() => satoshisToAmount(txInfo.decodedPsbt.fee), [txInfo.decodedPsbt]);

  const sendingInscriptionSaotoshis = useMemo(
    () => sendingInscriptions.reduce((pre, cur) => pre + cur.outputValue, 0),
    [sendingInscriptions]
  );
  const sendingInscriptionAmount = useMemo(
    () => satoshisToAmount(sendingInscriptionSaotoshis),
    [sendingInscriptionSaotoshis]
  );

  const receivingInscriptionSaotoshis = useMemo(
    () => receivingInscriptions.reduce((pre, cur) => pre + cur.outputValue, 0),
    [receivingInscriptions]
  );
  const receivingInscriptionAmount = useMemo(
    () => satoshisToAmount(receivingInscriptionSaotoshis),
    [receivingInscriptionSaotoshis]
  );

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

      {txInfo.changedInscriptions.length > 0 && (
        <Card>
          <Row>
            <Text text="100" />
          </Row>
        </Card>
      )}
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
    feeRate: 0
  }
};

export default function SignPsbt({
  params: {
    data: { psbtHex, toSignInputs, type, toAddress, satoshis, inscriptionId, feeRate, rawTxInfo },
    session
  },
  header,
  handleCancel,
  handleConfirm
}: Props) {
  const [getApproval, resolveApproval, rejectApproval] = useApproval();

  const [txInfo, setTxInfo] = useState<TxInfo>(initTxInfo);

  const [tabState, setTabState] = useState(TabState.DATA);

  const createBitcoinTx = useCreateBitcoinTxCallback();
  const createOrdinalsTx = useCreateMultiOrdinalsTxCallback();
  const wallet = useWallet();
  const [loading, setLoading] = useState(true);

  const tools = useTools();

  const address = useAccountAddress();

  const init = async () => {
    let txError = '';
    if (type === TxType.SEND_BITCOIN) {
      if (!psbtHex && toAddress && satoshis) {
        try {
          const rawTxInfo = await createBitcoinTx({ address: toAddress, domain: '' }, satoshis, feeRate);
          psbtHex = rawTxInfo.psbtHex;
        } catch (e) {
          console.log(e);
          txError = (e as any).message;
          tools.toastError(txError);
        }
      }
    } else if (type === TxType.SEND_INSCRIPTION) {
      if (!psbtHex && toAddress && inscriptionId) {
        try {
          const rawTxInfo = await createOrdinalsTx({ address: toAddress, domain: '' }, [inscriptionId], feeRate || 5);
          psbtHex = rawTxInfo.psbtHex;
        } catch (e) {
          console.log(e);
          txError = (e as any).message;
          tools.toastError(txError);
        }
      }
    }

    // else if (type === TxType.SEND_INSCRIPTION) {
    //   if (!psbtHex && toAddress && inscriptionId) {
    //     psbtHex = await createOrdinalsTx(toAddress, inscriptionId);
    //   }
    // }

    if (!toSignInputs) {
      toSignInputs = [];
    }

    if (!psbtHex) {
      setLoading(false);
      setTxInfo(Object.assign({}, initTxInfo, { txError }));
      return;
    }

    const decodedPsbt = await wallet.decodePsbt(psbtHex);

    setTxInfo({
      decodedPsbt,
      changedBalance: 0,
      changedInscriptions: [],
      psbtHex,
      rawtx: '',
      toSignInputs,
      txError: ''
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
    if (txInfo.decodedPsbt.inputInfos.length == 0) {
      return false;
    } else {
      return true;
    }
  }, [txInfo.decodedPsbt]);

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

  return (
    <Layout>
      {header}
      <Content>
        <Column>
          {detailsComponent}
          <Row mt="lg" mb="lg">
            <TabBar
              defaultActiveKey={TabState.DATA}
              activeKey={TabState.DATA}
              items={[
                // { label: 'DETAILS', key: TabState.DETAILS },
                { label: 'DATA', key: TabState.DATA },
                { label: 'HEX', key: TabState.HEX }
              ]}
              onTabClick={(key) => {
                setTabState(key as any);
              }}
            />
          </Row>

          {tabState === TabState.DATA && isValidData && (
            <Column gap="xl">
              <Column>
                <Text text="INPUTS:" preset="bold" />
                <Card>
                  <Column full justifyCenter>
                    {txInfo.decodedPsbt.inputInfos.map((v, index) => {
                      const isToSign = address == v.address;
                      const inscriptions = v.inscriptions;
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

                                {/* <Row>
                              <Text text="via" preset="sub" />
                              <Text
                                text={shortAddress(v.txid, 6)}
                                preset="link"
                                onClick={() => {
                                  const url = generateTxUrl(v.txid);
                                  window.open(url);
                                }}
                              />
                              <Text text={`[${v.vout}]`} preset="sub" />
                            </Row> */}
                              </Column>
                              <Row>
                                <Text text={`${satoshisToAmount(v.value)}`} color={isToSign ? 'white' : 'textDim'} />
                                <Text text="BTC" color="textDim" />
                              </Row>
                            </Row>

                            <Row>
                              {inscriptions.length > 0 && (
                                <Column justifyCenter>
                                  <Text
                                    text={`Inscriptions (${inscriptions.length})`}
                                    color={isToSign ? 'white' : 'textDim'}
                                  />
                                  <Row overflowX gap="lg" style={{ width: 280 }} pb="lg">
                                    {inscriptions.map((v) => (
                                      <InscriptionPreview
                                        key={v.inscriptionId}
                                        data={v}
                                        preset="small"
                                        onClick={() => {
                                          window.open(v.preview);
                                        }}
                                      />
                                    ))}
                                  </Row>
                                </Column>
                              )}
                            </Row>
                          </Column>
                        </Row>
                      );
                    })}
                  </Column>
                </Card>
              </Column>

              <Column>
                <Text text="OUTPUTS:" preset="bold" />
                <Card>
                  <Column full justifyCenter gap="lg">
                    {txInfo.decodedPsbt.outputInfos.map((v, index) => {
                      const isToSign = address == v.address;
                      const inscriptions = v.inscriptions;
                      return (
                        <Column
                          key={'output_' + index}
                          style={index === 0 ? {} : { borderColor: colors.border, borderTopWidth: 1, paddingTop: 10 }}>
                          <Column>
                            <Row justifyBetween>
                              <AddressText address={v.address} color={isToSign ? 'white' : 'textDim'} />
                              <Row>
                                <Text text={`${satoshisToAmount(v.value)}`} color={isToSign ? 'white' : 'textDim'} />
                                <Text text="BTC" color="textDim" />
                              </Row>
                            </Row>
                          </Column>
                          <Row>
                            {canChanged === false && inscriptions.length > 0 && (
                              <Column justifyCenter>
                                <Text
                                  text={`Inscriptions (${inscriptions.length})`}
                                  color={isToSign ? 'white' : 'textDim'}
                                />
                                <Row overflowX gap="lg" style={{ width: 280 }} pb="lg">
                                  {inscriptions.map((v) => (
                                    <InscriptionPreview
                                      key={v.inscriptionId}
                                      data={v}
                                      preset="small"
                                      onClick={() => {
                                        window.open(v.preview);
                                      }}
                                    />
                                  ))}
                                </Row>
                              </Column>
                            )}
                          </Row>
                        </Column>
                      );
                    })}
                  </Column>
                </Card>
              </Column>

              {canChanged == false && (
                <Section title="NETWORK FEE:">
                  <Text text={networkFee} />
                  <Text text="BTC" color="textDim" />
                </Section>
              )}

              {canChanged == false && (
                <Section title="NETWORK FEE RATE:">
                  <Text text={txInfo.decodedPsbt.feeRate.toString()} />
                  <Text text="sat/vB" color="textDim" />
                </Section>
              )}
            </Column>
          )}

          {tabState === TabState.HEX && isValidData && txInfo.rawtx && (
            <Column>
              <Text text={`HEX DATA: ${txInfo.rawtx.length / 2} BYTES`} preset="bold" />

              <TextArea text={txInfo.rawtx} />

              <Row
                justifyCenter
                onClick={(e) => {
                  copyToClipboard(txInfo.rawtx).then(() => {
                    tools.toastSuccess('Copied');
                  });
                }}>
                <Icon icon="copy" color="textDim" />
                <Text text="Copy raw transaction data" color="textDim" />
              </Row>
            </Column>
          )}

          {tabState === TabState.HEX && isValidData && txInfo.psbtHex && (
            <Column>
              <Text text={`PSBT HEX DATA: ${txInfo.psbtHex.length / 2} BYTES`} preset="bold" />

              <TextArea text={txInfo.psbtHex} />
              <Row
                justifyCenter
                onClick={(e) => {
                  copyToClipboard(txInfo.psbtHex).then(() => {
                    tools.toastSuccess('Copied');
                  });
                }}>
                <Icon icon="copy" color="textDim" />
                <Text text="Copy psbt transaction data" color="textDim" />
              </Row>
            </Column>
          )}
        </Column>
      </Content>

      <Footer>
        <Row full>
          <Button preset="default" text="Reject" onClick={handleCancel} full />
          <Button
            preset="primary"
            text={type == TxType.SIGN_TX ? 'Sign' : 'Sign & Send'}
            onClick={handleConfirm}
            disabled={isValid == false}
            full
          />
        </Row>
      </Footer>
    </Layout>
  );
}
