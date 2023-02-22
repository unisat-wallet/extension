import { Button, Input, message } from 'antd';
import { Layout } from 'antd';
import { Content, Header } from 'antd/lib/layout/layout';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import CHeader from '@/ui/components/CHeader';
import { FooterBackButton } from '@/ui/components/FooterBackButton';
import { useImportAccountCallback } from '@/ui/state/accounts/hooks';

import { useNavigate } from '../MainRoute';

type InputStatus = '' | 'error' | 'warning' | undefined;

export default function ImportAccountScreen() {
  const navigate = useNavigate();
  const [privateKey, setPrivateKey] = useState('');
  const [inputError, setInputError] = useState('');
  const [inputStatus, setInputStatus] = useState<InputStatus>('');
  const [disabled, setDisabled] = useState(true);
  const { t } = useTranslation();
  const importAccount = useImportAccountCallback();

  const onNext = () => {
    importAccount(privateKey).then(({ success, error }) => {
      if (success) {
        message.success({
          content: t('Successfully imported')
        });
        navigate('MainScreen');
      } else {
        setInputStatus('error');
        setInputError(error);
      }
    });
  };

  useEffect(() => {
    if (privateKey) {
      setDisabled(false);
      return;
    }
    setInputStatus('');
    setInputError('');
    setDisabled(true);
  }, [privateKey]);

  return (
    <Layout className="h-full">
      <Header className=" border-white border-opacity-10">
        <CHeader />
      </Header>
      <Content style={{ backgroundColor: '#1C1919' }}>
        <div className="flex flex-col items-strech mx-5 mt-5 gap-3_75 justify-evenly">
          <div className="flex flex-col self-center text-center px-2 text-2xl font-semibold">
            {t('Import Private Key')}
            <div className="text-lg text-soft-white mt-2_5">
              {t(
                'Imported accounts will not be associated with your originally created Unisat account Secret Recovery Phrase'
              )}
              .
            </div>
          </div>
          <Input
            className="font-semibold text-white mt-1_25 h-15_5"
            status={inputStatus}
            placeholder={t('Private Key')}
            onKeyUp={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if ('Enter' == e.key) {
                onNext();
              }
            }}
            onChange={(e) => {
              setPrivateKey(e.target.value);
            }}
          />
          {inputError ? <div className="text-lg text-error">{inputError}</div> : <></>}
          <Button
            disabled={disabled}
            size="large"
            type="primary"
            className="box"
            onClick={(e) => {
              onNext();
            }}>
            <div className="flex items-center justify-center text-lg font-semibold">{t('Import Private Key')}</div>
          </Button>
        </div>
      </Content>
      <FooterBackButton />
    </Layout>
  );
}
