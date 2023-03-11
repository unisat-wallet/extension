import { Button, Checkbox, Input, Layout, message } from 'antd';
import { Tabs } from 'antd';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import { Content } from 'antd/lib/layout/layout';
import Mnemonic from 'bitcore-mnemonic';
import { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { ADDRESS_TYPES } from '@/shared/constant';
import { AddressType } from '@/shared/types';
import CHeader from '@/ui/components/CHeader';
import { useCreateAccountCallback } from '@/ui/state/global/hooks';
import { copyToClipboard, shortAddress, useWallet } from '@/ui/utils';

import { useNavigate } from '../MainRoute';

function Step1_Create({
  contextData,
  updateContextData
}: {
  contextData: ContextData;
  updateContextData: (params: UpdateContextDataParams) => void;
}) {
  const [checked, setChecked] = useState(false);

  const wallet = useWallet();
  const init = async () => {
    const _mnemonics = (await wallet.getPreMnemonics()) || (await wallet.generatePreMnemonic());
    updateContextData({
      mnemonics: _mnemonics
    });
  };

  useEffect(() => {
    init();
  }, []);

  const onChange = (e: CheckboxChangeEvent) => {
    const val = e.target.checked;
    setChecked(val);
    updateContextData({ step1Completed: val });
  };

  function copy(str: string) {
    copyToClipboard(str).then(() => {
      message.success({
        duration: 3,
        content: 'copied'
      });
    });
  }

  const btnClick = () => {
    updateContextData({
      tabType: TabType.STEP2
    });
  };

  const words = contextData.mnemonics.split(' ');
  return (
    <div className="flex justify-center">
      <div className="flex flex-col justify-center gap-5 text-center mx-5">
        <div className="text-2xl font-semibold text-white box w380">{'Secret Recovery Phrase'}</div>
        <div className="text-lg text-warn box w-auto">
          {'This phrase is the ONLY way to recover your wallet. Do NOT share it with anyone!'}
        </div>

        <div
          className="flex items-center justify-center gap-2 px-4 duration-80 rounded cursor-pointer flex-nowrap opacity-80 hover:opacity-100"
          onClick={(e) => {
            copy(contextData.mnemonics);
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

        <div>
          <div className="flex items-center justify-center align-middle">
            <Checkbox onChange={onChange} checked={checked} className="font-semibold">
              <span className="font-semibold text-white">{'I saved My Secret Recovery Phrase'}</span>
            </Checkbox>
          </div>
        </div>
        <div>
          <Button disabled={!checked} size="large" type="primary" className="box w380 content" onClick={btnClick}>
            {'Continue'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function Step1_Import({
  contextData,
  updateContextData
}: {
  contextData: ContextData;
  updateContextData: (params: UpdateContextDataParams) => void;
}) {
  // const tmp = 'venue tattoo cloth cash learn diary add hurry success actress case lobster'
  // const [keys, setKeys] = useState<Array<string>>(tmp.split(' '))
  const [keys, setKeys] = useState<Array<string>>(new Array(12).fill(''));
  const [active, setActive] = useState(999);
  const [hover, setHover] = useState(999);
  const [disabled, setDisabled] = useState(true);

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
    setDisabled(true);

    const hasEmpty =
      keys.filter((key) => {
        return key == '';
      }).length > 0;
    if (hasEmpty) {
      return;
    }

    const mnemonic = keys.join(' ');
    if (!Mnemonic.isValid(mnemonic)) {
      return;
    }

    setDisabled(false);
  }, [keys]);

  useEffect(() => {
    //todo
  }, [hover]);

  const onNext = () => {
    const mnemonics = keys.join(' ');
    updateContextData({ mnemonics, tabType: TabType.STEP2 });
  };
  const handleOnKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!disabled && 'Enter' == e.key) {
      onNext();
    }
  };

  return (
    <div className="flex justify-center box">
      <div className="flex flex-col item-strech justify-center gap-5 text-center mx-5">
        <div className="text-2xl font-semibold text-white">{'Secret Recovery Phrase'}</div>
        <div className="text-lg text-soft-white">
          {'Import an existing wallet with your 12 word secret recovery phrase'}
        </div>
        <div className="grid grid-cols-2 gap-2 text-soft-white mx-10">
          {keys.map((_, index) => {
            return (
              <div
                key={index}
                className={`flex items-center w-full p-3 font-semibold text-left border-0 border-white rounded bg-soft-black border-opacity-20 box hover:text-white hover:bg-primary-active
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
          <Button
            disabled={disabled}
            size="large"
            type="primary"
            className="box w380 content"
            onClick={() => {
              onNext();
            }}>
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}

function Step2({
  contextData,
  updateContextData
}: {
  contextData: ContextData;
  updateContextData: (params: UpdateContextDataParams) => void;
}) {
  const wallet = useWallet();

  const hdPathOptions = ADDRESS_TYPES.map((v) => {
    return {
      label: v.name,
      hdPath: v.hdPath,
      addressType: v.value
    };
  });
  //.concat([
  //   {
  //     label: 'CUSTOM',
  //     hdPath: '',
  //     addressType: AddressType.P2PKH
  //   }
  // ]);

  const [previewAddresses, setPreviewAddresses] = useState<string[]>(hdPathOptions.map((v) => ''));

  const run = async () => {
    const addresses: string[] = [];
    for (let i = 0; i < hdPathOptions.length; i++) {
      const options = hdPathOptions[i];
      const keyring = await wallet.createTmpKeyringWithMnemonics(
        contextData.mnemonics,
        options.hdPath,
        contextData.passphrase,
        options.addressType
      );
      const address = keyring.accounts[0].address;
      addresses.push(shortAddress(address, 15));
    }
    setPreviewAddresses(addresses);
  };
  useEffect(() => {
    run();
  }, [contextData.mnemonics, contextData.passphrase]);

  const pathIndex = hdPathOptions.findIndex((v) => v.addressType === contextData.addressType);

  const createAccount = useCreateAccountCallback();
  const navigate = useNavigate();

  const onNext = async () => {
    try {
      await createAccount(contextData.mnemonics, contextData.hdPath, contextData.passphrase, contextData.addressType);
      navigate('MainScreen');
    } catch (e) {
      message.error((e as any).message);
    }
  };
  return (
    <div className="flex flex-col items-strech gap-3_75 justify-evenly mx-5">
      <div className="flex flex-col px-2 text-2xl font-semibold">{'Derivation Path'}</div>
      {hdPathOptions.map((item, index) => {
        return (
          <Button
            key={index}
            size="large"
            type="default"
            className="p-5 box default !h-28"
            onClick={() => {
              if (item.hdPath) {
                updateContextData({ hdPath: item.hdPath, addressType: item.addressType });
              }
            }}>
            <div className="flex items-center justify-between text-lg font-semibold">
              <div className="flex flex-col flex-grow text-left">
                <div className=" w-60 text-left">{item.label}</div>
                <div className="font-normal opacity-60">{item.hdPath}</div>
                <div className="font-normal opacity-60">{previewAddresses[index]}</div>
              </div>

              {index == pathIndex ? (
                <span className="w-4 h-4">
                  <img src="./images/check.svg" alt="" />
                </span>
              ) : (
                <></>
              )}
            </div>
          </Button>
        );
      })}
      {pathIndex == 3 && (
        <Input
          className="font-semibold text-white h-15_5 box default hover"
          placeholder={'Custom Derivation Path'}
          defaultValue={contextData.hdPath}
          onChange={async (e) => {
            updateContextData({ hdPath: e.target.value, addressType: AddressType.P2PKH });
          }}
          autoFocus={true}
        />
      )}

      <div className="flex flex-col px-2 text-2xl font-semibold mt-5">{'Phrase (Optional)'}</div>

      <Input
        className="font-semibold text-white h-15_5 box default hover"
        placeholder={'Passphrase'}
        defaultValue={contextData.passphrase}
        onChange={async (e) => {
          updateContextData({
            passphrase: e.target.value
          });
        }}
      />

      <Button size="large" type="primary" className="box w380 content self-center" onClick={onNext}>
        {'Continue'}
      </Button>
    </div>
  );
}

enum TabType {
  STEP1 = 'STEP1',
  STEP2 = 'STEP2',
  STEP3 = 'STEP3'
}

interface ContextData {
  mnemonics: string;
  hdPath: string;
  passphrase: string;
  addressType: AddressType;
  step1Completed: boolean;
  tabType: TabType;
}

interface UpdateContextDataParams {
  mnemonics?: string;
  hdPath?: string;
  passphrase?: string;
  addressType?: AddressType;
  step1Completed?: boolean;
  tabType?: TabType;
}

export default function CreateHDWalletScreen() {
  const navigate = useNavigate();

  const { state } = useLocation();
  const { isImport, fromUnlock } = state as {
    isImport: boolean;
    fromUnlock: boolean;
  };

  const [contextData, setContextData] = useState<ContextData>({
    mnemonics: '',
    hdPath: '',
    passphrase: '',
    addressType: AddressType.P2PKH,
    step1Completed: false,
    tabType: TabType.STEP1
  });

  const updateContextData = useCallback(
    (params: UpdateContextDataParams) => {
      setContextData(Object.assign({}, contextData, params));
    },
    [contextData, setContextData]
  );

  const items = [
    {
      key: TabType.STEP1,
      label: 'Step 1',
      children: isImport ? (
        <Step1_Import contextData={contextData} updateContextData={updateContextData} />
      ) : (
        <Step1_Create contextData={contextData} updateContextData={updateContextData} />
      )
    },
    {
      key: TabType.STEP2,
      label: 'Step 2',
      children: <Step2 contextData={contextData} updateContextData={updateContextData} />
    }
  ];

  return (
    <Layout className="h-full">
      <CHeader
        onBack={() => {
          if (fromUnlock) {
            navigate('WelcomeScreen');
          } else {
            window.history.go(-1);
          }
        }}
        title="Create HD Wallet"
      />
      <Content style={{ backgroundColor: '#1C1919' }}>
        <Tabs
          defaultActiveKey={TabType.STEP1}
          items={items}
          activeKey={contextData.tabType}
          centered={true}
          onTabClick={(key) => {
            const toTabType = key as TabType;

            if (toTabType === TabType.STEP2) {
              if (!contextData.step1Completed) {
                setTimeout(() => {
                  updateContextData({ tabType: contextData.tabType });
                }, 200);
                return;
              }
            }
            updateContextData({ tabType: toTabType });
          }}
          // renderTabBar={() => {
          //   return tabBar;
          // }}
        />
      </Content>
    </Layout>
  );
}
