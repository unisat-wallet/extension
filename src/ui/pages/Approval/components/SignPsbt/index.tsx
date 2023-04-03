import BigNumber from 'bignumber.js';
import * as bitcoin from 'bitcoinjs-lib';
import React, { useEffect, useMemo, useState } from 'react';

import { toPsbtNetwork } from '@/background/utils/tx-utils';
import { ToSignInput, TxType } from '@/shared/types';
import { Button, Layout, Content, Footer, Icon, Text, Row, Card, Column, TextArea, Header } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import { AddressText } from '@/ui/components/AddressText';
import InscriptionPreview from '@/ui/components/InscriptionPreview';
import { TabBar } from '@/ui/components/TabBar';
import WebsiteBar from '@/ui/components/WebsiteBar';
import { useAccountAddress, useAccountBalance } from '@/ui/state/accounts/hooks';
import { useNetworkType } from '@/ui/state/settings/hooks';
import {
  useBitcoinTx,
  useCreateBitcoinTxCallback,
  useCreateOrdinalsTxCallback,
  useOrdinalsTx
} from '@/ui/state/transactions/hooks';
import { colors } from '@/ui/theme/colors';
import { copyToClipboard, satoshisToAmount, useApproval } from '@/ui/utils';
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

function SignTxDetails({ txInfo }: { txInfo: TxInfo }) {
  const changedBalance = useMemo(() => satoshisToAmount(txInfo.changedBalance), [txInfo.changedBalance]);
  const accountBalance = useAccountBalance();
  const beforeBalance = accountBalance.amount;
  const afterBalance = useMemo(() => {
    return new BigNumber(accountBalance.amount)
      .multipliedBy(100000000)
      .plus(new BigNumber(txInfo.changedBalance))
      .dividedBy(100000000)
      .toFixed(8);
  }, [accountBalance.amount, txInfo.changedBalance]);
  return (
    <Column gap="lg">
      <Text text={`BALANCE: ${beforeBalance} -> ${afterBalance}`} />
      <Card>
        <Row full itemsCenter>
          <Text text={txInfo.changedBalance > 0 ? '+' : ' ' + changedBalance} />
          <Text text="BTC" color="textDim" />
        </Row>
      </Card>

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

function SendInscriptionDetails({ txInfo }: { txInfo: TxInfo }) {
  const ordinalsTx = useOrdinalsTx();
  const networkFee = useMemo(() => satoshisToAmount(txInfo.fee), [txInfo.fee]);
  return (
    <Column>
      <Text text="INSCRIPTION" preset="bold" />
      <Row justifyCenter>
        <InscriptionPreview data={ordinalsTx.inscription} preset="medium" />
      </Row>

      <Section title="FROM">
        <AddressText address={ordinalsTx.fromAddress} />
      </Section>

      <Section title="TO">
        <AddressText address={ordinalsTx.toAddress} domain={ordinalsTx.toDomain} />
      </Section>

      <Section title="NETWORK FEE">
        <Text text={networkFee} />
        <Text text="BTC" color="textDim" />
      </Section>
    </Column>
  );
}

function SendBitcoinDetails({
  txInfo,
  toAddress,
  satoshis
}: {
  txInfo: TxInfo;
  toAddress?: string;
  satoshis?: number;
}) {
  const bitcoinTx = useBitcoinTx();
  const networkFee = useMemo(() => satoshisToAmount(txInfo.fee), [txInfo.fee]);
  const toAmount = useMemo(() => {
    if (txInfo.psbtHex) {
      let toAmount = 0;
      txInfo.outputInfos.forEach((v) => {
        if (bitcoinTx.toAddress === v.address) {
          toAmount += v.value;
        }
      });
      return satoshisToAmount(toAmount);
    } else {
      return satoshisToAmount(satoshis || 0);
    }
  }, [bitcoinTx.toSatoshis, txInfo]);

  const balance = useAccountBalance();
  const feeEnough = txInfo.fee > 0;
  if (!txInfo.psbtHex) {
    return (
      <Column>
        <Text text="Transfer Amount" preset="bold" />
        <Card>
          <Row full itemsCenter>
            <Text text={toAmount} />
            <Text text="BTC" color="textDim" />
          </Row>
        </Card>

        <Text text={`Insufficient Balance (${balance.amount})`} color="danger" />
      </Column>
    );
  }

  return (
    <Column gap="lg">
      <Section title="Transfer Amount">
        <Text text={toAmount} />
        <Text text="BTC" color="textDim" />
      </Section>

      <Section title="FROM">
        <AddressText address={bitcoinTx.fromAddress} />
      </Section>

      <Section title="TO">
        <AddressText address={bitcoinTx.toAddress} domain={bitcoinTx.toDomain} />
      </Section>

      <Section title="NETWORK FEE">
        <Text text={networkFee} color={feeEnough ? 'white' : 'danger'} />
        <Text text="BTC" color="textDim" />
      </Section>
    </Column>
  );
}

interface TxInfo {
  inputInfos: InputInfo[];
  outputInfos: OutputInfo[];
  changedBalance: number;
  changedInscriptions: InscriptioinInfo[];
  rawtx: string;
  psbtHex: string;
  toSignInputs: ToSignInput[];
  fee: number;
  feeRate: number;
  txError: string;
}

export default function SignPsbt({
  params: {
    data: { psbtHex, toSignInputs, type, toAddress, satoshis, feeRate, inscriptionId },
    session
  },
  header,
  handleCancel,
  handleConfirm
}: Props) {
  const [getApproval, resolveApproval, rejectApproval] = useApproval();

  const [txInfo, setTxInfo] = useState<TxInfo>({
    inputInfos: [],
    outputInfos: [],
    changedBalance: 0,
    changedInscriptions: [],
    rawtx: '',
    psbtHex: '',
    toSignInputs: [],
    fee: 0,
    feeRate: 1,
    txError: ''
  });

  const [tabState, setTabState] = useState(TabState.DETAILS);

  const accountAddress = useAccountAddress();

  const networkType = useNetworkType();
  const psbtNetwork = toPsbtNetwork(networkType);

  const createBitcoinTx = useCreateBitcoinTxCallback();
  const createOrdinalsTx = useCreateOrdinalsTxCallback();

  const [loading, setLoading] = useState(true);

  const tools = useTools();

  const init = async () => {
    let txError = '';
    if (type === TxType.SEND_BITCOIN) {
      if (!psbtHex && toAddress && satoshis) {
        try {
          psbtHex = await createBitcoinTx({ address: toAddress, domain: '' }, satoshis, feeRate);
        } catch (e) {
          console.log(e);
          txError = (e as any).message;
          tools.toastError(txError);
        }
      }
    }

    if (!toSignInputs) {
      toSignInputs = [];
    }
    // else if (type === TxType.SEND_INSCRIPTION) {
    //   if (!psbtHex && toAddress && inscriptionId) {
    //     psbtHex = await createOrdinalsTx(toAddress, inscriptionId);
    //   }
    // }

    setLoading(false);
    if (!psbtHex) {
      setTxInfo({
        inputInfos: [],
        outputInfos: [],
        changedBalance: 0,
        changedInscriptions: [],
        psbtHex: '',
        rawtx: '',
        fee: 0,
        feeRate: 0,
        toSignInputs: [],
        txError
      });
      return;
    }

    const inputInfos: InputInfo[] = [];
    const outputInfos: OutputInfo[] = [];
    const psbt = bitcoin.Psbt.fromHex(psbtHex, { network: psbtNetwork });

    let changedBalance = 0;

    let fee = 0;
    psbt.txInputs.forEach((v, index) => {
      let address = 'UNKNOWN SCRIPT';
      let value = 0;

      try {
        const { witnessUtxo, nonWitnessUtxo } = psbt.data.inputs[index];
        if (witnessUtxo) {
          address = bitcoin.address.fromOutputScript(witnessUtxo.script, psbtNetwork);
          value = witnessUtxo.value;
        } else if (nonWitnessUtxo) {
          const tx = bitcoin.Transaction.fromBuffer(nonWitnessUtxo);
          const output = tx.outs[psbt.txInputs[index].index];
          address = bitcoin.address.fromOutputScript(output.script, psbtNetwork);
          value = output.value;
        } else {
          // todo
        }
      } catch (e) {
        // unknown
      }
      inputInfos.push({
        txid: v.hash.toString('hex'),
        vout: v.index,
        address,
        value
      });
      if (address == accountAddress) {
        changedBalance -= value;
      }

      fee += value;
    });

    psbt.txOutputs.forEach((v) => {
      outputInfos.push({
        address: v.address || '',
        value: v.value
      });
      if (v.address == accountAddress) {
        changedBalance += v.value;
      }
      fee -= v.value;
    });

    let finalFeeRate = feeRate || 1;
    try {
      finalFeeRate = psbt.getFeeRate();
    } catch (e) {
      // todo
    }

    setTxInfo({
      inputInfos,
      outputInfos,
      changedBalance,
      changedInscriptions: [],
      psbtHex,
      rawtx: '',
      fee,
      feeRate: finalFeeRate,
      toSignInputs,
      txError: ''
    });
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

  const networkFee = useMemo(() => satoshisToAmount(txInfo.fee), [txInfo.fee]);

  const title = useMemo(() => {
    if (type === TxType.SEND_INSCRIPTION) {
      return 'Confirm Transaction';
    } else if (type === TxType.SEND_BITCOIN) {
      return 'Confirm Transaction';
    } else {
      return 'Sign Transaction';
    }
  }, []);

  const detailsComponent = useMemo(() => {
    if (type === TxType.SEND_INSCRIPTION) {
      return <SendInscriptionDetails txInfo={txInfo} />;
    } else if (type === TxType.SEND_BITCOIN) {
      return <SendBitcoinDetails txInfo={txInfo} toAddress={toAddress} satoshis={satoshis} />;
    } else {
      return <SignTxDetails txInfo={txInfo} />;
    }
  }, [txInfo]);

  const isValidData = useMemo(() => {
    if (txInfo.psbtHex === '') {
      return false;
    }
    return true;
  }, [txInfo.psbtHex]);

  const isValid = useMemo(() => {
    if (txInfo.psbtHex === '') {
      return false;
    }
    if (txInfo.fee == 0) {
      return false;
    }
  }, [txInfo.psbtHex, txInfo.fee]);

  if (loading) {
    return (
      <Layout>
        <Content>
          <Icon>
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

  console.log('up', detailsComponent);
  return (
    <Layout>
      {header}
      <Content>
        <Column>
          <Text text={title} preset="title-bold" textCenter />

          <Row mt="lg" mb="lg">
            <TabBar
              defaultActiveKey={TabState.DETAILS}
              activeKey={TabState.DETAILS}
              items={[
                { label: 'DETAILS', key: TabState.DETAILS },
                { label: 'DATA', key: TabState.DATA },
                { label: 'HEX', key: TabState.HEX }
              ]}
              onTabClick={(key) => {
                setTabState(key as any);
              }}
            />
          </Row>

          {tabState === TabState.DETAILS && detailsComponent}
          {tabState === TabState.DATA && isValidData && (
            <Column gap="xl">
              <Column>
                <Text text="INPUTS:" preset="bold" />
                <Card>
                  <Column full justifyCenter>
                    {txInfo.inputInfos.map((v, index) => {
                      return (
                        <Row
                          key={'output_' + index}
                          style={
                            index === 0 ? {} : { borderColor: colors.white_muted, borderTopWidth: 1, paddingTop: 10 }
                          }
                          justifyBetween>
                          <AddressText address={v.address} />
                          <Text text={v.value.toString()} />
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
                    {txInfo.outputInfos.map((v, index) => {
                      return (
                        <Row
                          key={'output_' + index}
                          style={
                            index === 0 ? {} : { borderColor: colors.white_muted, borderTopWidth: 1, paddingTop: 10 }
                          }
                          justifyBetween>
                          <AddressText address={v.address} />
                          <Text text={v.value.toString()} />
                        </Row>
                      );
                    })}
                  </Column>
                </Card>
              </Column>

              <Section title="NETWORK FEE RATE:">
                <Text text={networkFee} />
                <Text text="BTC" color="textDim" />
              </Section>

              <Section title="NETWORK FEE RATE:">
                <Text text={txInfo.feeRate.toString()} />
                <Text text="sat/vB" color="textDim" />
              </Section>
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
          <Button preset="primary" text="Confirm" onClick={handleConfirm} disabled={isValid == false} full />
        </Row>
      </Footer>
    </Layout>
  );
}
