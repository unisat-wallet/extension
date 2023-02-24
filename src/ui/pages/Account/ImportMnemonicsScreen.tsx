import { Button, Input, message } from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useCreateAccountCallback } from '@/ui/state/global/hooks';

import { useNavigate } from '../MainRoute';

export default function ImportMnemonicsScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // const tmp = 'venue tattoo cloth cash learn diary add hurry success actress case lobster'
  // const [keys, setKeys] = useState<Array<string>>(tmp.split(' '))
  const [keys, setKeys] = useState<Array<string>>(new Array(12).fill(''));
  const [active, setActive] = useState(999);
  const [hover, setHover] = useState(999);
  const [disabled, setDisabled] = useState(true);

  const createAccount = useCreateAccountCallback();
  const verify = async () => {
    const mnemonics = keys.join(' ');
    try {
      await createAccount(mnemonics);
      navigate('MainScreen');
    } catch (e) {
      message.error(t('mnemonic phrase is invalid'));
    }
  };

  const handleEventPaste = (event, index: number) => {
    const copyText = event.clipboardData?.getData('text/plain');
    const textArr = copyText.trim().split(' ');
    const newKeys = [...keys];
    if (textArr) {
      for (let i = 0; i < keys.length - index; i++) {
        if (textArr.length == i) {
          break;
        }
        newKeys[index + i] = textArr[i];
      }
      setKeys(newKeys);
    }

    event.preventDefault();
  };

  const onChange = (e: any, index: any) => {
    const newKeys = [...keys];
    newKeys.splice(index, 1, e.target.value);
    setKeys(newKeys);
  };

  useEffect(() => {
    // to verify key
    setDisabled(
      keys.filter((key) => {
        return key == '';
      }).length > 0
    );
  }, [keys]);

  useEffect(() => {
    //todo
  }, [hover]);

  const handleOnKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!disabled && 'Enter' == e.key) {
      verify();
    }
  };

  return (
    <div className="flex justify-center pt-15 box">
      <div className="flex flex-col item-strech justify-center gap-5 text-center">
        <div className="text-2xl font-semibold text-white">{t('Secret Recovery Phrase')}</div>
        <div className="text-lg text-soft-white">
          {t('Import an existing wallet with your 12 word secret recovery phrase')}
        </div>
        <div className="grid grid-cols-2 gap-5 text-soft-white">
          {keys.map((_, index) => {
            return (
              <div
                key={index}
                className={`flex items-center w-full p-5 font-semibold text-left border-0 border-white rounded bg-soft-black border-opacity-20 box hover:text-white hover:bg-primary-active
                                   ${active == index ? ' active' : ''}`}>
                {index + 1}.&nbsp;
                <Input
                  // className={`font-semibold p0 ${active == index || hover == index ? styles.antInputActive : styles.antInput}`}
                  className="font-semibold p0 nobg"
                  bordered={false}
                  value={_}
                  onPaste={(e) => {
                    handleEventPaste(e, index);
                  }}
                  onChange={(e) => {
                    onChange(e, index);
                  }}
                  // onMouseOverCapture={(e) => {
                  //   setHover(index);
                  // }}
                  // onMouseLeave={(e) => {
                  //   setHover(999);
                  // }}
                  onFocus={(e) => {
                    setActive(index);
                  }}
                  onBlur={(e) => {
                    setActive(999);
                  }}
                  onKeyUp={(e) => handleOnKeyUp(e)}
                  autoFocus={index == 0}
                />
              </div>
            );
          })}
        </div>
        <div>
          <Button disabled={disabled} size="large" type="primary" className="box content" onClick={verify}>
            {t('Import wallet')}
          </Button>
        </div>
      </div>
    </div>
  );
}
