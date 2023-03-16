import { Button, Layout, message } from 'antd';
import { Content, Footer } from 'antd/lib/layout/layout';
import BigNumber from 'bignumber.js';
import * as bitcoin from 'bitcoinjs-lib';
import { useEffect, useMemo, useState } from 'react';

import { toPsbtNetwork } from '@/background/utils/tx-utils';
import { ToSignInput, TxType } from '@/shared/types';
import { AddressText } from '@/ui/components/AddressText';
import InscriptionPreview from '@/ui/components/InscriptionPreview';
import WebsiteBar from '@/ui/components/WebsiteBar';
import { useAccountAddress, useAccountBalance } from '@/ui/state/accounts/hooks';
import { useNetworkType } from '@/ui/state/settings/hooks';
import {
  useBitcoinTx,
  useCreateBitcoinTxCallback,
  useCreateOrdinalsTxCallback,
  useOrdinalsTx
} from '@/ui/state/transactions/hooks';
import { copyToClipboard, satoshisToAmount, useApproval } from '@/ui/utils';
import { LoadingOutlined } from '@ant-design/icons';

interface Props {
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

const TAB_STATES = ['DETAILS', 'DATA', 'HEX'];

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
    <div className="flex flex-col justify-between items-strech box mx-5 mt-5">
      <div className="text-left font-semibold text-white">{`BALANCE: ${beforeBalance} -> ${afterBalance}`}</div>
      <div className=" bg-soft-black  text-soft-white rounded-2xl px-5 mt-5">
        <div className={'py-5 flex justify-between'}>
          <span>
            <span className="text-white">{txInfo.changedBalance > 0 ? '+' : ' ' + changedBalance}</span> BTC
          </span>
        </div>
      </div>

      {txInfo.changedInscriptions.length > 0 && (
        <div>
          <div className="text-left font-semibold text-white mt-5">{'INSCRIPTIONS:'}</div>
          <div className=" bg-soft-black  text-soft-white rounded-2xl px-5 mt-5">
            <div className={'py-5 flex justify-between'}>
              <div className="text-white">100</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SendInscriptionDetails({ txInfo }: { txInfo: TxInfo }) {
  const ordinalsTx = useOrdinalsTx();
  const networkFee = useMemo(() => satoshisToAmount(txInfo.fee), [txInfo.fee]);
  return (
    <div className="flex flex-col items-strech mx-5 mt-5 gap-3_75 justify-evenly ">
      <div className="text-left font-semibold text-white mt-5">{'INSCRIPTION'}</div>
      <InscriptionPreview className="self-center" data={ordinalsTx.inscription} size="medium" />

      <div className="text-left font-semibold text-white mt-5">{'FROM'}</div>
      <div className=" bg-soft-black  text-soft-white rounded-2xl px-5 ">
        <div className={'py-5 flex justify-between'}>
          <AddressText address={ordinalsTx.fromAddress} />
        </div>
      </div>
      <div className="text-left font-semibold text-white mt-5">{'TO'}</div>
      <div className=" bg-soft-black  text-soft-white rounded-2xl px-5 ">
        <div className={'py-5 flex justify-between'}>
          <AddressText address={ordinalsTx.toAddress} domain={ordinalsTx.toDomain} />
        </div>
      </div>
      <div className="text-left font-semibold text-white mt-5">{'NETWORK FEE'}</div>
      <div className=" bg-soft-black  text-soft-white rounded-2xl px-5 ">
        <div className={'py-5 flex justify-between'}>
          <span className="text-white">{`${networkFee} `}</span> BTC
        </div>
      </div>
    </div>
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
      <div className="flex flex-col items-strech mx-5 mt-5 gap-3_75 justify-evenly">
        <div className="text-left font-semibold text-white mt-5">{'Transfer Amount'}</div>
        <div className=" bg-soft-black  text-soft-white rounded-2xl px-5 ">
          <div className={'py-5 flex justify-between'}>
            <span className="text-white">{toAmount}</span> BTC
          </div>
        </div>

        <span className="text-lg text-error h-5">{`Insufficient Balance (${balance.amount})`}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-strech mx-5 mt-5 gap-3_75 justify-evenly">
      <div className="text-left font-semibold text-white mt-5">{'Transfer Amount'}</div>
      <div className=" bg-soft-black  text-soft-white rounded-2xl px-5 ">
        <div className={'py-5 flex justify-between'}>
          <span className="text-white">{toAmount}</span> BTC
        </div>
      </div>

      <div className="text-left font-semibold text-white mt-5">{'FROM'}</div>
      <div className=" bg-soft-black  text-soft-white rounded-2xl px-5 ">
        <div className={'py-5 flex justify-between'}>
          <AddressText address={bitcoinTx.fromAddress} />
        </div>
      </div>
      <div className="text-left font-semibold text-white mt-5">{'TO'}</div>
      <div className=" bg-soft-black  text-soft-white rounded-2xl px-5 ">
        <div className={'py-5 flex justify-between'}>
          <AddressText address={bitcoinTx.toAddress} domain={bitcoinTx.toDomain} />
        </div>
      </div>
      <div className="text-left font-semibold text-white mt-5">{'NETWORK FEE'}</div>
      <div className=" bg-soft-black  text-soft-white rounded-2xl px-5 ">
        <div className={'py-5 flex justify-between'}>
          <span className={feeEnough ? 'text-white' : 'text-red-500'}>{`${networkFee} `}</span> BTC
        </div>
      </div>
    </div>
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
}

export default function SignPsbt({
  params: {
    data: { psbtHex, toSignInputs, type, toAddress, satoshis, feeRate, inscriptionId },
    session
  },

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
    feeRate: 1
  });

  const [tabState, setTabState] = useState(TabState.DETAILS);

  const accountAddress = useAccountAddress();

  const networkType = useNetworkType();
  const psbtNetwork = toPsbtNetwork(networkType);

  const createBitcoinTx = useCreateBitcoinTxCallback();
  const createOrdinalsTx = useCreateOrdinalsTxCallback();

  const [loading, setLoading] = useState(true);

  const init = async () => {
    if (type === TxType.SEND_BITCOIN) {
      if (!psbtHex && toAddress && satoshis) {
        try {
          psbtHex = await createBitcoinTx({ address: toAddress, domain: '' }, satoshis, feeRate);
        } catch (e) {
          console.log(e);
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
        toSignInputs: []
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
      toSignInputs
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
      <Layout className="h-full">
        <Content style={{ backgroundColor: '#1C1919', overflowY: 'auto' }}>
          <div className="flex flex-col items-strech mx-5 text-6xl mt-60 gap-3_75 text-primary">
            <LoadingOutlined />
            <span className="text-2xl text-white self-center">{'Loading'}</span>
          </div>
        </Content>
      </Layout>
    );
  }
  return (
    <Layout className="h-full">
      <Content style={{ backgroundColor: '#1C1919', overflowY: 'auto' }}>
        <div className="flex flex-col items-strech mt-5 gap-3_75 justify-evenly mx-5">
          {session && <WebsiteBar session={session} />}

          <div className="flex self-center px-2 text-2xl font-semibold h-13">{title}</div>

          <div className="flex">
            {TAB_STATES.map((v, index) => {
              return (
                <div
                  key={v}
                  className={'mx-5 cursor-pointer' + (index == tabState ? ' border-b border-white' : ' ')}
                  onClick={() => {
                    setTabState(index);
                  }}>
                  {v}
                </div>
              );
            })}
          </div>

          {tabState === TabState.DETAILS && detailsComponent}
          {tabState === TabState.DATA && isValidData && (
            <div className="flex flex-col justify-between items-strech box mx-5 mt-5">
              <div className="text-left font-semibold text-white">{'INPUTS:'}</div>
              <div className=" bg-soft-black  text-soft-white rounded-2xl px-5 mt-5">
                {txInfo.inputInfos.map((v, index) => {
                  return (
                    <div
                      key={'input_' + index}
                      className={'py-5 flex justify-between' + (index === 0 ? ' ' : ' border-black border-t')}>
                      <AddressText address={v.address} />
                      <div className="text-white">{v.value}</div>
                    </div>
                  );
                })}
              </div>
              <span className="text-white self-center text-3xl mt-5">↓</span>
              <div className=" text-left font-semibold text-white">{'OUTPUTS:'}</div>
              <div className=" bg-soft-black  text-soft-white rounded-2xl  px-5 mt-5">
                {txInfo.outputInfos.map((v, index) => {
                  return (
                    <div
                      key={'output_' + index}
                      className={'py-5 flex justify-between' + (index === 0 ? ' ' : ' border-black border-t')}>
                      <AddressText address={v.address} />
                      <div className="text-white">{v.value}</div>
                    </div>
                  );
                })}
              </div>

              <div className=" text-left font-semibold text-white mt-5">{'NETWORK FEE:'}</div>
              <div className=" bg-soft-black  text-soft-white rounded-2xl px-5 mt-5">
                <div className={'py-5 flex justify-between'}>
                  <span className="text-white">{networkFee}</span> BTC
                </div>
              </div>

              <div className=" text-left font-semibold text-white mt-5">{'NETWORK FEE RATE:'}</div>
              <div className=" bg-soft-black  text-soft-white rounded-2xl px-5 mt-5">
                <div className={'py-5 flex justify-between'}>
                  <span className="text-white">{txInfo.feeRate}</span> sat/vB
                </div>
              </div>
            </div>
          )}

          {tabState === TabState.HEX && isValidData && txInfo.rawtx && (
            <div className="flex flex-col items-strech mt-5 gap-3_75 justify-evenly mx-5">
              <div className=" text-left font-semibold text-white">{`HEX DATA: ${txInfo.rawtx.length / 2} BYTES`}</div>

              <div className=" flex-wrap break-words whitespace-pre-wrap bg-slate-300 bg-opacity-5 p-5 max-h-96 overflow-auto">
                {txInfo.rawtx}
              </div>
              <div
                className="flex items-center justify-center gap-2 px-4 py-2 duration-80 rounded cursor-pointer flex-nowrap opacity-80 hover:opacity-100"
                onClick={(e) => {
                  copyToClipboard(txInfo.rawtx).then(() => {
                    message.success('Copied');
                  });
                }}>
                <img src="./images/copy-solid.svg" alt="" className="h-4_5 hover:opacity-100" />
                <span className="text-lg text-white">Copy raw transaction data</span>{' '}
              </div>
            </div>
          )}

          {tabState === TabState.HEX && isValidData && txInfo.psbtHex && (
            <div className="flex flex-col items-strech mt-5 gap-3_75 justify-evenly mx-5">
              <div className=" text-left font-semibold text-white">{`PSBT HEX DATA: ${
                txInfo.psbtHex.length / 2
              } BYTES`}</div>

              <div className=" flex-wrap break-words whitespace-pre-wrap bg-slate-300 bg-opacity-5 p-5 max-h-96 overflow-auto">
                {txInfo.psbtHex}
              </div>
              <div
                className="flex items-center justify-center gap-2 px-4 py-2 duration-80 rounded cursor-pointer flex-nowrap opacity-80 hover:opacity-100"
                onClick={(e) => {
                  copyToClipboard(txInfo.psbtHex).then(() => {
                    message.success('Copied');
                  });
                }}>
                <img src="./images/copy-solid.svg" alt="" className="h-4_5 hover:opacity-100" />
                <span className="text-lg text-white">Copy psbt transaction data</span>{' '}
              </div>
            </div>
          )}
        </div>
      </Content>

      <Footer className="footer-bar flex-col">
        <div className="grid grid-cols-2 gap-x-2.5 mx-5">
          <Button size="large" type="default" className="box" onClick={handleCancel}>
            <div className="flex flex-col items-center text-lg font-semibold">Reject</div>
          </Button>
          <Button size="large" type="primary" className="box" onClick={handleConfirm} disabled={isValid == false}>
            <div className="flex  flex-col items-center text-lg font-semibold">Confirm</div>
          </Button>
        </div>
      </Footer>
    </Layout>
  );
}
