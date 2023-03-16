import { Button, Input, Layout } from 'antd';
import { Content } from 'antd/lib/layout/layout';
import BigNumber from 'bignumber.js';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { COIN_DUST } from '@/shared/constant';
import { AddressInputBar } from '@/ui/components/AddressInputBar';
import CHeader from '@/ui/components/CHeader';
import { FeeRateBar } from '@/ui/components/FeeRateBar';
import { useNavigate } from '@/ui/pages/MainRoute';
import { useAccountBalance } from '@/ui/state/accounts/hooks';
import {
  useBitcoinTx,
  useCreateBitcoinTxCallback,
  useFetchUtxosCallback,
  useSafeBalance
} from '@/ui/state/transactions/hooks';
import '@/ui/styles/domain.less';
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
  const [toAddress, setToAddress] = useState(bitcoinTx.toAddress);

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

  const dustAmount = useMemo(() => satoshisToAmount(COIN_DUST), [COIN_DUST]);

  const [feeRate, setFeeRate] = useState(5);
  useEffect(() => {
    setError('');
    setDisabled(true);

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

    if (feeRate <= 0) {
      setError('Invalid fee rate');
      return;
    }

    if (
      toAddress == bitcoinTx.toAddress &&
      toSatoshis == bitcoinTx.toSatoshis &&
      autoAdjust == bitcoinTx.autoAdjust &&
      feeRate == bitcoinTx.feeRate
    ) {
      //Prevent repeated triggering caused by setAmount
      setDisabled(false);
      return;
    }

    createBitcoinTx(toAddress, toSatoshis, feeRate, autoAdjust)
      .then((data) => {
        // if (data.fee < data.estimateFee) {
        //   setError(`Network fee must be at leat ${data.estimateFee}`);
        //   return;
        // }
        setDisabled(false);
      })
      .catch((e) => {
        console.log(e);
        setError(e.message);
      });
  }, [toAddress, inputAmount, autoAdjust, feeRate]);

  const showSafeBalance = useMemo(
    () => new BigNumber(accountBalance.amount).eq(new BigNumber(safeBalance)) == false,
    [accountBalance.amount, safeBalance]
  );

  return (
    <Layout className="h-full">
      <CHeader
        onBack={() => {
          window.history.go(-1);
        }}
        title="Send BTC"
      />
      <Content style={{ backgroundColor: '#1C1919', overflowY: 'auto' }}>
        <div className="flex flex-col items-strech  my-5 gap-3_75 justify-evenly mx-5">
          <div className="self-center w-15 h-15">
            <img className="w-full" src={'./images/btc.svg'} alt="" />
          </div>
          <div className="flex justify-between w-full mt-5 box text-soft-white">
            <span>{t('Recipient')}</span>
          </div>

          <AddressInputBar
            defaultAddress={bitcoinTx.toAddress}
            onChange={(val) => {
              setToAddress(val);
            }}
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
            <div className="flex justify-between w-full mt-1 box text-soft-white">
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

          <div className="flex justify-between w-full box text-soft-white">
            <span>{t('Fee')}</span>
          </div>

          <FeeRateBar
            onChange={(val) => {
              setFeeRate(val);
            }}
          />

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
