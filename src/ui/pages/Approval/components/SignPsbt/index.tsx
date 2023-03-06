import { Button, Layout, message } from 'antd';
import { Content, Footer } from 'antd/lib/layout/layout';
import BigNumber from 'bignumber.js';
import * as bitcoin from 'bitcoinjs-lib';
import { useEffect, useMemo, useState } from 'react';

import { toPsbtNetwork } from '@/background/utils/tx-utils';
import InscriptionPreview from '@/ui/components/InscriptionPreview';
import WebsiteBar from '@/ui/components/WebsiteBar';
import { useAccountAddress, useAccountBalance } from '@/ui/state/accounts/hooks';
import { useNetworkType } from '@/ui/state/settings/hooks';
import { useBitcoinTx, useOrdinalsTx } from '@/ui/state/transactions/hooks';
import { copyToClipboard, satoshisToAmount, shortAddress, useApproval } from '@/ui/utils';

export enum TxType {
  SIGN_TX,
  SEND_BITCOIN,
  SEND_INSCRIPTION
}

interface Props {
  params: {
    data: {
      psbtHex: string;
    };
    session?: {
      origin: string;
      icon: string;
      name: string;
    };
  };
  type?: TxType;
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
          <span className="text-white">{ordinalsTx.fromAddress}</span>
        </div>
      </div>
      <div className="text-left font-semibold text-white mt-5">{'TO'}</div>
      <div className=" bg-soft-black  text-soft-white rounded-2xl px-5 ">
        <div className={'py-5 flex justify-between'}>
          <span className="text-white">{ordinalsTx.toAddress}</span>
        </div>
      </div>
      <div className="text-left font-semibold text-white mt-5">{'NETWORK FE'}</div>
      <div className=" bg-soft-black  text-soft-white rounded-2xl px-5 ">
        <div className={'py-5 flex justify-between'}>
          <span className="text-white">{`${networkFee} `}</span> BTC
        </div>
      </div>
    </div>
  );
}

function SendBitcoinDetails({ txInfo }: { txInfo: TxInfo }) {
  const bitcoinTx = useBitcoinTx();
  const networkFee = useMemo(() => satoshisToAmount(txInfo.fee), [txInfo.fee]);
  const toAmount = useMemo(() => {
    let toAmount = 0;
    txInfo.outputInfos.forEach((v) => {
      if (bitcoinTx.toAddress === v.address) {
        toAmount += v.value;
      }
    });
    return satoshisToAmount(toAmount);
  }, [bitcoinTx.toSatoshis, txInfo]);
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
          <span className="text-white">{bitcoinTx.fromAddress}</span>
        </div>
      </div>
      <div className="text-left font-semibold text-white mt-5">{'TO'}</div>
      <div className=" bg-soft-black  text-soft-white rounded-2xl px-5 ">
        <div className={'py-5 flex justify-between'}>
          <span className="text-white">{bitcoinTx.toAddress}</span>
        </div>
      </div>
      <div className="text-left font-semibold text-white mt-5">{'NETWORK FE'}</div>
      <div className=" bg-soft-black  text-soft-white rounded-2xl px-5 ">
        <div className={'py-5 flex justify-between'}>
          <span className="text-white">{`${networkFee} `}</span> BTC
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
  fee: number;
  feeRate: number;
}

export default function SignPsbt({
  params: {
    data: { psbtHex },
    session
  },
  type,
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
    fee: 0,
    feeRate: 1
  });

  const [tabState, setTabState] = useState(TabState.DETAILS);

  const accountAddress = useAccountAddress();

  const networkType = useNetworkType();
  const psbtNetwork = toPsbtNetwork(networkType);

  const init = async () => {
    const inputInfos: InputInfo[] = [];
    const outputInfos: OutputInfo[] = [];
    const psbt = bitcoin.Psbt.fromHex(psbtHex, { network: psbtNetwork });

    let changedBalance = 0;

    let fee = 0;
    psbt.txInputs.forEach((v, index) => {
      let address = '';
      let value = 0;
      const { witnessUtxo, nonWitnessUtxo } = psbt.data.inputs[index];
      if (witnessUtxo) {
        address = bitcoin.address.fromOutputScript(witnessUtxo.script, psbtNetwork);
        value = witnessUtxo.value;
      } else if (nonWitnessUtxo) {
        address = bitcoin.address.fromOutputScript(nonWitnessUtxo, psbtNetwork);
      } else {
        // todo
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

    let feeRate = 1;
    try {
      feeRate = psbt.getFeeRate();
    } catch (e) {
      // todo
    }

    setTxInfo({
      inputInfos,
      outputInfos,
      changedBalance,
      changedInscriptions: [],
      psbtHex: psbtHex,
      rawtx: '',
      fee,
      feeRate
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
      resolveApproval();
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
      return <SendBitcoinDetails txInfo={txInfo} />;
    } else {
      return <SignTxDetails txInfo={txInfo} />;
    }
  }, [txInfo]);

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
          {tabState === TabState.DATA && (
            <div className="flex flex-col justify-between items-strech box mx-5 mt-5">
              <div className="text-left font-semibold text-white">{'INPUTS:'}</div>
              <div className=" bg-soft-black  text-soft-white rounded-2xl px-5 mt-5">
                {txInfo.inputInfos.map((v, index) => {
                  return (
                    <div
                      key={'input_' + index}
                      className={'py-5 flex justify-between' + (index === 0 ? ' ' : ' border-black border-t')}>
                      <div>{shortAddress(v.address, 10)}</div>

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
                      <div>{shortAddress(v.address, 10)}</div>
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

          {tabState === TabState.HEX && txInfo.rawtx && (
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

          {tabState === TabState.HEX && txInfo.psbtHex && (
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
          <Button size="large" type="primary" className="box" onClick={handleConfirm}>
            <div className="flex  flex-col items-center text-lg font-semibold">Confirm</div>
          </Button>
        </div>
      </Footer>
    </Layout>
  );
}
