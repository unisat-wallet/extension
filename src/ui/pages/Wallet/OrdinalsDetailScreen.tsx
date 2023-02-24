import { Layout, message } from 'antd';
import { Content, Header } from 'antd/lib/layout/layout';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

import { Inscription } from '@/shared/types';
import CHeader from '@/ui/components/CHeader';
import InscriptionPreview from '@/ui/components/InscriptionPreview';
import { useAppDispatch } from '@/ui/state/hooks';
import { transactionsActions } from '@/ui/state/transactions/reducer';
import { copyToClipboard } from '@/ui/utils';
import { faArrowRightArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { useNavigate } from '../MainRoute';

export default function OrdinalsDetailScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { state } = useLocation();
  const { inscription, withSend } = state as {
    inscription: Inscription;
    withSend: boolean;
  };
  const dispatch = useAppDispatch();

  const detail = inscription.detail;
  const isMempool = inscription.num === -1;
  return (
    <Layout className="h-full">
      <Header className="border-white border-opacity-10">
        <CHeader
          onBack={() => {
            window.history.go(-1);
          }}
        />
      </Header>
      <Content style={{ backgroundColor: '#1C1919', overflowY: 'auto', overflowX: 'hidden' }}>
        <div className="flex flex-col items-strech mx-5 mt-5 gap-3_75 justify-evenly">
          <div className="flex self-center px-2 text-2xl font-semibold h-13">
            {isMempool ? 'Inscription (not confirmed yet)' : `Inscription ${inscription.num}`}
          </div>
          <InscriptionPreview className="self-center" data={inscription} size="large" />
          {withSend && (
            <div
              className="cursor-pointer duration-80 unit box content default gap-2_5 hover:bg-primary-active w-36 self-center"
              onClick={(e) => {
                dispatch(transactionsActions.reset());
                navigate('OrdinalsTxCreateScreen', { inscription });
              }}>
              <span>
                <FontAwesomeIcon
                  icon={faArrowRightArrowLeft}
                  style={{ height: '1.1rem' }}
                  className="text-soft-white"
                />
              </span>
              <span>{t('Send')}</span>
            </div>
          )}
          {detail &&
            Object.keys(detail).map((k, i) => {
              return (
                <div key={i} className="w-full mt-5 text-xl font-semibold text-white break-all box">
                  <div>{t(k)}</div>
                  <span
                    className="text-sm cursor-pointer text-soft-white"
                    onClick={() => {
                      if (k === 'preview' || k === 'content') {
                        window.open(detail[k]);
                      } else {
                        copyToClipboard(detail[k]).then(() => {
                          message.info('Copied');
                        });
                      }
                    }}>
                    {detail[k]}
                  </span>
                </div>
              );
            })}
        </div>
      </Content>
    </Layout>
  );
}
