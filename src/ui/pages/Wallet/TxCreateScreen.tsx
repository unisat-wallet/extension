import { Button, Input, Layout } from 'antd';
import { Content, Header } from 'antd/lib/layout/layout';
import BigNumber from 'bignumber.js';
import { useEffect, useMemo, useState } from 'react';
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
import { amountToSaothis, isValidAddress, satoshisToAmount } from '@/ui/utils';

export default function TxCreateScreen() {
  const { t } = useTranslation();
  const accountBalance = useAccountBalance();
  const safeBalance = useSafeBalance();
  const navigate = useNavigate();
  const bitcoinTx = useBitcoinTx();
  const [inputAmount, setInputAmount] = useState(
    bitcoinTx.toSatoshis > 0 ? satoshisToAmount(bitcoinTx.toSatoshis) : ''
  );
  const [disabled, setDisabled] = useState(true);

  const [inputAddress, setInputAddress] = useState(bitcoinTx.toAddress);
  const [error, setError] = useState('');

  const [autoAdjust, setAutoAdjust] = useState(false);

  const fetchUtxos = useFetchUtxosCallback();
  useEffect(() => {
    fetchUtxos();
  }, []);

  const createBitcoinTx = useCreateBitcoinTxCallback();

  const safeSatoshis = useMemo(() => {
    return amountToSaothis(safeBalance);
  }, [safeBalance]);

  const toSatoshis = useMemo(() => {
    if (!inputAmount) return 0;
    return amountToSaothis(inputAmount);
  }, [inputAmount]);

  const feeAmount = useMemo(() => {
    return satoshisToAmount(bitcoinTx.fee);
  }, [bitcoinTx.fee]);

  const dustAmount = useMemo(() => satoshisToAmount(COIN_DUST), [COIN_DUST]);
  useEffect(() => {
    setError('');
    setDisabled(true);

    const toAddress = inputAddress;
    if (!isValidAddress(toAddress)) {
      return;
    }
    if (!toSatoshis) {
      return;
    }
    if (toSatoshis < COIN_DUST) {
      setError(`Amount must be at least ${dustAmount} BTC`);
      return;
    }

    if (toSatoshis > safeSatoshis) {
      setError('Amount exceeds your available balance');
      return;
    }

    if (toAddress == bitcoinTx.toAddress && toSatoshis == bitcoinTx.toSatoshis && autoAdjust == bitcoinTx.autoAdjust) {
      //Prevent repeated triggering caused by setAmount
      setDisabled(false);
      return;
    }
    createBitcoinTx(toAddress, toSatoshis, autoAdjust)
      .then((data) => {
        if (data.fee < data.estimateFee) {
          setError(`Network fee must be at leat ${data.estimateFee}`);
          return;
        }
        setDisabled(false);
      })
      .catch((e) => {
        setError(e.message);
      });
  }, [inputAddress, inputAmount, autoAdjust]);

  const showSafeBalance = useMemo(
    () => new BigNumber(accountBalance.amount).eq(new BigNumber(safeBalance)) == false,
    [accountBalance.amount, safeBalance]
  );
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
            defaultValue={inputAddress}
            onChange={async (e) => {
              const val = e.target.value;
              setInputAddress(val);
            }}
            autoFocus={true}
          />
          <div className="flex justify-between w-full mt-5 box text-soft-white">
            <span>{t('Balance')}</span>
            {showSafeBalance ? (
              <div>
                <span className="font-semibold text-white">{`${accountBalance.amount} BTC`}</span>
              </div>
            ) : (
              <div
                className="flex cursor-pointer"
                onClick={() => {
                  setAutoAdjust(true);
                  setInputAmount(accountBalance.amount);
                }}>
                <div className={`font-semibold mx-5 ${autoAdjust ? 'text-yellow-300' : ''}`}>MAX</div>
                <span className="font-semibold text-white">{`${accountBalance.amount} BTC`}</span>
              </div>
            )}
          </div>
          {showSafeBalance && (
            <div className="flex justify-between w-full mt-5 box text-soft-white">
              <span>Available (safe to send)</span>
              <div
                className="flex cursor-pointer"
                onClick={() => {
                  setAutoAdjust(true);
                  setInputAmount(safeBalance.toString());
                }}>
                <div className={`font-semibold mx-5 ${autoAdjust ? 'text-yellow-300' : ''}`}>MAX</div>
                <span className="font-semibold text-white ">{`${safeBalance} BTC`}</span>
              </div>
            </div>
          )}
          <Input
            className="font-semibold  text-white h-15_5 box default hover"
            placeholder={t('Amount')}
            defaultValue={inputAmount}
            value={inputAmount}
            onChange={async (e) => {
              if (autoAdjust == true) {
                setAutoAdjust(false);
              }
              setInputAmount(e.target.value);
            }}
          />

          <div className="flex justify-between w-full mt-5 text-soft-white">
            <span>{t('Network Fee')}</span>
            <span>
              <span className="font-semibold text-white">{feeAmount}</span> BTC
            </span>
          </div>
          <span className="text-lg text-error h-5">{error}</span>

          <Button
            disabled={disabled}
            size="large"
            type="primary"
            className="box"
            onClick={(e) => {
              navigate('TxConfirmScreen');
            }}>
            <div className="flex items-center justify-center text-lg font-semibold">{t('Next')}</div>
          </Button>
        </div>
      </Content>
    </Layout>
  );
}
