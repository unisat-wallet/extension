import { Button, Checkbox, message } from 'antd';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

import { useCreateAccountCallback } from '@/ui/state/global/hooks';
import { copyToClipboard, useWallet } from '@/ui/utils';

import { useNavigate } from '../MainRoute';

export default function CreateMnemonicsScreen() {
  const { t } = useTranslation();
  const wallet = useWallet();
  const navigate = useNavigate();
  const { state } = useLocation();

  const [mnemonics, setMnemonics] = useState('');

  const init = async () => {
    const _mnemonics = (await wallet.getPreMnemonics()) || (await wallet.generatePreMnemonic());
    setMnemonics(_mnemonics);
  };

  useEffect(() => {
    init();
  }, []);
  const createAccount = useCreateAccountCallback();
  const btnClick = async () => {
    try {
      await createAccount(mnemonics);
      navigate('MainScreen');
    } catch (e) {
      message.error((e as any).message);
    }
  };

  const [checked, setChecked] = useState(false);

  const onChange = (e: CheckboxChangeEvent) => {
    setChecked(e.target.checked);
  };

  function copy(str: string) {
    copyToClipboard(str).then(() => {
      message.success({
        duration: 3,
        content: t('copied')
      });
    });
  }

  const handleOnKeyUp = (e) => {
    if (checked && 'Enter' == e.key) {
      btnClick();
    }
  };

  // useEffect(()=>{
  //   window.addEventListener('keyup', handleOnKeyUp)

  //   return () => {
  //     window.removeEventListener('keyup', handleOnKeyUp)
  //   }
  // },[])

  return (
    <div className="flex justify-center pt-33_75">
      <div className="flex flex-col justify-center gap-5 text-center">
        <div className="text-2xl font-semibold text-white box w380">{t('Secret Recovery Phrase')}</div>
        <div className="text-lg text-warn box w380">
          {t('This phrase is the ONLY way to')} <br />
          {t('recover your wallet')}. {t('Do NOT share it with anyone')}!
        </div>
        <div className="h-10">{/* margin */} </div>
        <div
          className="p-5 font-semibold select-text box default text-4_5 w380 leading-6_5"
          onClick={(e) => {
            copy(mnemonics);
          }}>
          {mnemonics}
        </div>
        <div>
          <div className="flex items-center justify-center align-middle">
            <Checkbox onChange={onChange} checked={checked} className="font-semibold">
              <span className="font-semibold text-white">{t('I saved My Secret Recovery Phrase')}</span>
            </Checkbox>
          </div>
        </div>
        <div>
          <Button disabled={!checked} size="large" type="primary" className="box w380 content" onClick={btnClick}>
            {t('Continue')}
          </Button>
        </div>
      </div>
    </div>
  );
}
