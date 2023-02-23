import { Button, Input, Layout } from 'antd';
import { Content, Header } from 'antd/lib/layout/layout';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { COIN_DUST } from '@/shared/constant';
import CHeader from '@/ui/components/CHeader';
import { useNavigate } from '@/ui/pages/MainRoute';
import { useAccountBalance } from '@/ui/state/accounts/hooks';
import {
  useBitcoinTx,
  useCreateBitcoinTxCallback,
  useFetchUtxosCallback,
  useSafeBalance
} from '@/ui/state/transactions/hooks';
import { isValidAddress } from '@/ui/utils';

type InputState = '' | 'error' | 'warning' | undefined;

export default function TxCreateScreen() {
  const { t } = useTranslation();
  const accountBalance = useAccountBalance();
  const safeBalance = useSafeBalance();
  const navigate = useNavigate();
  const bitcoinTx = useBitcoinTx();
  const [statueAdd, setStatueAdd] = useState<InputState>('');
  const [statueAmt, setStatueAmt] = useState<InputState>('');
  const [inputAmount, setInputAmount] = useState(bitcoinTx.toAmount > 0 ? bitcoinTx.toAmount.toString() : '');
  const [disabled, setDisabled] = useState(true);

  const [inputAddress, setInputAddress] = useState(bitcoinTx.toAddress);
  const [error, setError] = useState('');

  const fetchUtxos = useFetchUtxosCallback();
  useEffect(() => {
    fetchUtxos();
  }, []);

  const createBitcoinTx = useCreateBitcoinTxCallback();
  const verify = () => {
    setStatueAdd('');
    setStatueAmt('');
    if (!isValidAddress(inputAddress)) {
      setStatueAdd('error');
      setError('Invalid Address');
      return;
    }
    const toAmount = bitcoinTx.toAmount;
    if (!toAmount || toAmount < COIN_DUST || toAmount > safeBalance) {
      setStatueAmt('error');
      setError('Invalid Amount');
      return;
    }
    // to verify
    navigate('TxConfirmScreen');
  };

  useEffect(() => {
    setError('');
    const toAmount = parseFloat(inputAmount);
    const toAddress = inputAddress;
    if (!isValidAddress(toAddress)) {
      return;
    }
    if (!toAmount) {
      return;
    }
    if (toAmount < COIN_DUST || toAmount > safeBalance) {
      return;
    }

    if (toAddress == bitcoinTx.toAddress && toAmount == bitcoinTx.toAmount) {
      //Prevent repeated triggering caused by setAmount
      return;
    }
    const run = async () => {
      createBitcoinTx(toAddress, toAmount)
        .then((data) => {
          setInputAmount(data.toString());
        })
        .catch((e) => {
          console.log(e);
          setError(e.message);
        });
    };

    run();
  }, [inputAddress, inputAmount]);

  const handleValueChanged = (value: string) => {
    let newValue = parseFloat(value);
    if (!newValue) {
      newValue = 0;
    }
    if (newValue < COIN_DUST) {
      newValue = COIN_DUST;
    }

    if (safeBalance && newValue > Number(safeBalance)) {
      newValue = Number(safeBalance);
    }

    setInputAmount(newValue.toFixed(8));
  };

  useEffect(() => {
    setDisabled(true);
    if (bitcoinTx.toAddress && bitcoinTx.toAmount) {
      setDisabled(false);
    }
  }, [bitcoinTx]);

  return (
    <Layout className="h-full">
      <Header className=" border-white border-opacity-10">
        <CHeader
          onBack={() => {
            window.history.go(-1);
          }}
        />
      </Header>
      <Content style={{ backgroundColor: '#1C1919' }}>
        <div className="flex flex-col items-strech  mt-5 gap-3_75 justify-evenly mx-5">
          <div className="flex self-center px-2 text-2xl font-semibold h-13">{t('Send')} BTC</div>
          <div className="self-center w-15 h-15">
            <img className="w-full" src={'./images/btc.svg'} alt="" />
          </div>
          <Input
            className="mt-5 font-semibold text-white h-15_5 box default hover"
            placeholder={t('Recipients BTC address')}
            status={statueAdd}
            defaultValue={inputAddress}
            onChange={async (e) => {
              const val = e.target.value;
              setInputAddress(val);
            }}
          />
          <div className="flex justify-between w-full mt-5 box text-soft-white">
            <span>{t('Balance')}</span>
            <span>
              <span
                className="font-semibold text-white cursor-pointer"
                onClick={(e) => {
                  handleValueChanged(accountBalance.amount);
                }}>
                {accountBalance.amount}
              </span>{' '}
              BTC
            </span>
          </div>
          {accountBalance.amount != safeBalance.toString() && (
            <div className="flex justify-between w-full mt-5 box text-soft-white">
              <span>Available (safe to send)</span>
              <span>
                <span
                  className="font-semibold text-white cursor-pointer"
                  onClick={(e) => {
                    handleValueChanged(safeBalance.toString());
                  }}>
                  {safeBalance}
                </span>{' '}
                BTC
              </span>
            </div>
          )}
          <Input
            className="font-semibold text-white h-15_5 box default hover"
            placeholder={t('Amount') + ` ( >${COIN_DUST} )`}
            status={statueAmt}
            defaultValue={bitcoinTx.toAmount || ''}
            onBlur={() => {
              handleValueChanged(inputAmount);
            }}
            onKeyDown={(e) => {
              if (e.code == 'Enter') {
                handleValueChanged(inputAmount);
              }
            }}
            value={inputAmount}
            onChange={async (e) => {
              setInputAmount(e.target.value);
            }}
          />

          <div className="flex justify-between w-full mt-5 text-soft-white">
            <span>{t('Fee')}</span>
            <span>
              <span className="font-semibold text-white">{bitcoinTx.fee.toFixed(8)}</span> BTC
            </span>
          </div>
          <span className="text-lg text-error h-5">{error}</span>

          <Button
            disabled={disabled}
            size="large"
            type="primary"
            className="box"
            onClick={(e) => {
              verify();
            }}>
            <div className="flex items-center justify-center text-lg font-semibold">{t('Next')}</div>
          </Button>
        </div>
      </Content>
    </Layout>
  );
}
