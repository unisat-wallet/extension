import { Statistic } from 'antd';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import { NetworkType } from '@/shared/types';
import AccountSelect from '@/ui/components/AccountSelect';
import { AddressBar } from '@/ui/components/AddressBar';
import InscriptionPreview from '@/ui/components/InscriptionPreview';
import { useAccountBalance, useAccountInscriptions } from '@/ui/state/accounts/hooks';
import { useNetworkType } from '@/ui/state/settings/hooks';
import { transactionsActions } from '@/ui/state/transactions/reducer';
import { faArrowRightArrowLeft, faQrcode, faClock } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { useNavigate } from '../../../MainRoute';
import './index.less';

export default function WalletTab() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const accountBalance = useAccountBalance();
  const accountInscriptions = useAccountInscriptions();
  const networkType = useNetworkType();
  const isTestNetwork = networkType === NetworkType.TESTNET;

  const dispatch = useDispatch();
  return (
    <div className="flex flex-col items-stretch gap-5 mt-5 mx-5 justify-evenly">
      <AccountSelect />
      {isTestNetwork && (
        <div className="text-red-500 mx-10 text-center ">Bitcoin Testnet is used for testing. Funds have no value!</div>
      )}

      <div className="flex flex-col items-center mt-5 font-semibold text-11" style={{ height: '2.75rem' }}>
        <div className="flex items-center">
          <Statistic className="text-white" value={accountBalance?.amount} valueStyle={{ fontSize: '2.75rem' }} />{' '}
          <span className="mx-5">BTC</span>
        </div>
      </div>
      <div className="mb-5">
        <AddressBar />
      </div>
      <div className="grid grid-cols-3 gap-x-2.5 mx-5">
        <div
          className="cursor-pointer duration-80 unit box content default gap-2_5 hover:bg-primary-active"
          onClick={(e) => {
            navigate('ReceiveScreen');
          }}>
          <span>
            <FontAwesomeIcon icon={faQrcode} style={{ height: '1.1rem' }} className="text-soft-white" />
          </span>
          <span>{t('Receive')}</span>
        </div>
        <div
          className="cursor-pointer duration-80 unit box content default gap-2_5 hover:bg-primary-active"
          onClick={(e) => {
            dispatch(transactionsActions.reset());
            navigate('TxCreateScreen');
          }}>
          <span>
            <FontAwesomeIcon icon={faArrowRightArrowLeft} style={{ height: '1.1rem' }} className="text-soft-white" />
          </span>
          <span>{t('Send')}</span>
        </div>
        <div
          className="cursor-pointer duration-80 unit box content default gap-2_5 hover:bg-primary-active"
          onClick={(e) => {
            navigate('HistoryScreen');
          }}>
          <span>
            <FontAwesomeIcon icon={faClock} style={{ height: '1.1rem' }} className="text-soft-white" />
          </span>
          <span>{t('History')}</span>
        </div>
      </div>
      <div
        className={`flex-1 min-h-[200px] w-full p-2 ${
          accountInscriptions.list.length === 0
            ? 'flex justify-center items-center'
            : 'flex gap-5 flex-wrap content-start '
        }`}
        style={{}}>
        {accountInscriptions.list.length === 0 ? (
          <span>{t('Inscription list is empty')}</span>
        ) : (
          <>
            {accountInscriptions.list.map((data, index) => (
              <InscriptionPreview
                key={index}
                data={data}
                className="cursor-pointer"
                size="medium"
                onClick={(inscription) => {
                  navigate('OrdinalsDetailScreen', { inscription, withSend: true });
                }}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
