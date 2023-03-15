import { Button, Input, Layout } from 'antd';
import { Content } from 'antd/lib/layout/layout';
import BigNumber from 'bignumber.js';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import wallet from '@/background/controller/wallet';
import { DomainInfo, API_STATUS } from '@/background/service/domainService';
import { BTCDOMAINS_LINK, COIN_DUST, DOMAIN_LEVEL_ONE } from '@/shared/constant';
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

import '@/ui/styles/domain.less';

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

  const [parseAddress, setParseAddress] = useState('');
  const [parseError, setParseError] = useState('');
  const [formatError, setFormatError] = useState('');

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

    let toAddress = '';
    if (inputAddress.toLowerCase().endsWith(DOMAIN_LEVEL_ONE)) {
      toAddress = parseAddress;
    } else {
      toAddress = inputAddress
    }

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
  }, [inputAddress, inputAmount, autoAdjust]);

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
      <Content style={{ backgroundColor: '#1C1919' }}>
        <div className="flex flex-col items-strech  mt-5 gap-3_75 justify-evenly mx-5">
          <div className="self-center w-15 h-15">
            <img className="w-full" src={'./images/btc.svg'} alt="" />
          </div>
          <div className="flex justify-between w-full mt-5 box text-soft-white">
            <span>{t('Receiver')}</span>
          </div>
          <Input
            className="mt-5 font-semibold text-white h-15_5 box default hover"
            placeholder={t('Recipients BTC address')}
            defaultValue={inputAddress}
            onChange={async (e) => {
              if (parseError) {
                setParseError('');
              }
              if (parseAddress) {
                setParseAddress('');
              }
              if (formatError) {
                setFormatError('');
              }

              const val = e.target.value;
              setInputAddress(val);

              if (val.toLowerCase().endsWith(DOMAIN_LEVEL_ONE)) {
                const reg = /^[0-9a-zA-Z.]*$/
                if (reg.test(val)) {
                  wallet.queryDomainInfo(val).then((ret: DomainInfo) => {
                    setParseAddress(ret.receive_address);
                    setParseError('');
                    setFormatError('');
                  }).catch((err: Error) => {
                    setParseAddress('')
                    const errMsg = err.message + ' for ' + val;
                    if (err.cause == API_STATUS.NOTFOUND) {
                      setParseError(errMsg);
                      setFormatError('');
                    } else {
                      setParseError('');
                      setFormatError(errMsg);
                    }
                  })
                } else {
                  setParseAddress('');
                  setParseError('');
                  setFormatError('domain name format is not correct.');
                }
              }
            }}
            autoFocus={true}
          />

          {parseAddress ? (
            <div className="word-breakall">{parseAddress}</div>
          ) : null}

          {parseError ? (
            <span className="text-lg text-warn h-5">{`${parseError}` + ', click '}<a href={BTCDOMAINS_LINK} target={'_blank'} rel="noreferrer">btcdomains</a> to register.</span>
          ) : null}

          <span className="text-lg text-error h-5">{formatError}</span>

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
