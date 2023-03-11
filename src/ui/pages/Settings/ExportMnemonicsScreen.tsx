import { Button, Input, Layout, message } from 'antd';
import { Content } from 'antd/lib/layout/layout';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ADDRESS_TYPES } from '@/shared/constant';
import CHeader from '@/ui/components/CHeader';
import { useCurrentKeyring } from '@/ui/state/keyrings/hooks';
import { copyToClipboard, useWallet } from '@/ui/utils';

type Status = '' | 'error' | 'warning' | undefined;

export default function ExportMnemonicsScreen() {
  const { t } = useTranslation();

  const [password, setPassword] = useState('');
  const [disabled, setDisabled] = useState(true);

  const [mnemonic, setMnemonic] = useState('');
  const [status, setStatus] = useState<Status>('');
  const [error, setError] = useState('');
  const wallet = useWallet();

  const [passphrase, setPassphrase] = useState('');

  const currenyKering = useCurrentKeyring();
  const btnClick = async () => {
    try {
      const { mnemonic, hdPath, passphrase } = await wallet.getMnemonics(password);
      setMnemonic(mnemonic);
      setPassphrase(passphrase);
      console.log(hdPath);
    } catch (e) {
      setStatus('error');
      setError((e as any).message);
    }
  };

  const handleOnKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ('Enter' == e.key) {
      btnClick();
    }
  };

  useEffect(() => {
    setDisabled(true);
    if (password) {
      setDisabled(false);
      setStatus('');
      setError('');
    }
  }, [password]);

  function copy(str: string) {
    copyToClipboard(str).then(() => {
      message.success({
        duration: 3,
        content: t('copied')
      });
    });
  }
  const words = mnemonic.split(' ');

  const pathName = ADDRESS_TYPES.find((v) => v.hdPath === currenyKering.hdPath)?.name;
  return (
    <Layout className="h-full">
      <CHeader
        onBack={() => {
          window.history.go(-1);
        }}
        title="Secret Recovery Phrase"
      />

      <Content style={{ backgroundColor: '#1C1919' }}>
        <div className="flex flex-col items-strech mx-5 mt-5 text-center justify-evenly">
          {mnemonic == '' ? (
            <div className="flex flex-col items-strech mx-5 text-center gap-3_75 justify-evenly">
              <div className=" text-warn box">{t('Type your password')}</div>
              <div className="mt-1_25">
                <Input.Password
                  className="box"
                  status={status}
                  placeholder={t('Password')}
                  onChange={(e) => {
                    setPassword(e.target.value);
                  }}
                  onKeyUp={(e) => handleOnKeyUp(e)}
                  autoFocus={true}
                />
              </div>
              {error ? <div className="text-lg text-error">{error}</div> : <></>}

              <Button disabled={disabled} size="large" type="primary" className="box content" onClick={btnClick}>
                {t('Show Secret Recovery Phrase')}
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-strech mx-5 text-center gap-3_75 justify-evenly">
              <div className="text-lg text-warn box">
                {t('This phrase is the ONLY way to')} <br />
                {t('recover your wallet')}. {t('Do NOT share it with anyone')}!
                <br /> ({t('click to copy')})
              </div>
              <div>{/* margin */} </div>
              <div
                className="flex items-center justify-center gap-2 px-4 duration-80 rounded cursor-pointer flex-nowrap opacity-80 hover:opacity-100"
                onClick={(e) => {
                  copy(mnemonic);
                }}>
                <img src="./images/copy-solid.svg" alt="" className="h-4_5 hover:opacity-100" />
                <span className="text-lg text-white">Copy to clipboard</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-white mx-10">
                {words.map((v, index) => {
                  return (
                    <div key={index} className="flex items-center w-full ">
                      <div className="w-3">{`${index + 1}. `}</div>
                      <div
                        className="flex items-center w-full p-3 ml-5 font-semibold text-left border-0 border-white rounded bg-soft-black border-opacity-20 box  "
                        style={{ userSelect: 'text' }}>
                        {v}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between items-center p-3 font-semibold select-text box default text-4_5 leading-6_5 mx-10">
                <div className="text-soft-white flex flex-col text-left">
                  <div className="text-white">Advance Options </div>
                  <div
                    className=" cursor-pointer"
                    onClick={() => {
                      copy(currenyKering.hdPath);
                    }}>
                    {`Derivation Path: ${currenyKering.hdPath} (${pathName})`}{' '}
                  </div>
                  {passphrase && <div>{`Passphrase: ${passphrase}`}</div>}
                </div>
              </div>
            </div>
          )}
        </div>
      </Content>
    </Layout>
  );
}
