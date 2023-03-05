import { Button, Checkbox, message } from 'antd';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

import { useAdvanceState, useCreateAccountCallback } from '@/ui/state/global/hooks';
import { copyToClipboard, useWallet } from '@/ui/utils';
import { RightOutlined } from '@ant-design/icons';

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

  const advanceState = useAdvanceState();

  useEffect(() => {
    init();
  }, []);
  const createAccount = useCreateAccountCallback();
  const btnClick = async () => {
    try {
      await createAccount(mnemonics, advanceState.hdPath, advanceState.passphrase);
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

  const words = mnemonics.split(' ');
  return (
    <div className="flex justify-center pt-10">
      <div className="flex flex-col justify-center gap-5 text-center mx-5">
        <div className="text-2xl font-semibold text-white box w380">{t('Secret Recovery Phrase')}</div>
        <div className="text-lg text-warn box w-auto">
          {t('This phrase is the ONLY way to recover your wallet. Do NOT share it with anyone!')}
        </div>

        <div
          className="flex items-center justify-center gap-2 px-4 duration-80 rounded cursor-pointer flex-nowrap opacity-80 hover:opacity-100"
          onClick={(e) => {
            copy(mnemonics);
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

        <div
          onClick={() => {
            navigate('AdvanceOptionsScreen');
          }}
          className="flex justify-between items-center p-3 font-semibold select-text box default text-4_5 leading-6_5 mx-10">
          <div className="text-soft-white flex flex-col text-left">
            <div className="text-white">Advance Options </div>
            <div>{`Derivation Path: ${advanceState.hdPath} (${advanceState.hdName})`} </div>
            {advanceState.passphrase && <div>{`Passphrase: ${advanceState.passphrase}`}</div>}
          </div>
          <RightOutlined style={{ transform: 'scale(1.2)', color: '#AAA' }} />
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
