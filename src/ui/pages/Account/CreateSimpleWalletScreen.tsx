import { Button, Input, Layout, message } from 'antd';
import { Tabs } from 'antd';
import { Content } from 'antd/lib/layout/layout';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { ADDRESS_TYPES } from '@/shared/constant';
import { AddressType } from '@/shared/types';
import CHeader from '@/ui/components/CHeader';
import { amountToSaothis, shortAddress, useWallet } from '@/ui/utils';

import { useNavigate } from '../MainRoute';

function Step1({
  contextData,
  updateContextData
}: {
  contextData: ContextData;
  updateContextData: (params: UpdateContextDataParams) => void;
}) {
  const [wif, setWif] = useState('');
  const [disabled, setDisabled] = useState(true);
  const wallet = useWallet();
  const init = async () => {
    const _mnemonics = (await wallet.getPreMnemonics()) || (await wallet.generatePreMnemonic());
    updateContextData({
      wif: _mnemonics
    });
  };

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    setDisabled(true);

    if (!wif) {
      return;
    }

    setDisabled(false);
  }, [wif]);

  const onChange = (e) => {
    const val = e.target.value;
    setWif(val);
    updateContextData({ step1Completed: val });
  };

  const btnClick = () => {
    updateContextData({
      wif,
      tabType: TabType.STEP2
    });
  };

  return (
    <div className="flex justify-center">
      <div className="flex flex-col justify-center gap-5 text-center mx-5">
        <div className="text-2xl font-semibold text-white box w380">{'Private Key (WIF)'}</div>

        <Input
          className="font-semibold text-white mt-1_25 h-15_5 box default focus:active"
          placeholder={'Private Key (WIF)'}
          onKeyUp={(e: React.KeyboardEvent<HTMLInputElement>) => {
            if ('Enter' == e.key) {
              btnClick();
            }
          }}
          onChange={onChange}
          autoFocus={true}
        />
        <div>
          <Button disabled={disabled} size="large" type="primary" className="box w380 content" onClick={btnClick}>
            {'Continue'}
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

  const hdPathOptions = useMemo(() => {
    return ADDRESS_TYPES.filter((v) => {
      if (v.displayIndex < 0) {
        return false;
      }
      if (v.isUnisatLegacy) {
        return false;
      }
      return true;
    })
      .sort((a, b) => a.displayIndex - b.displayIndex)
      .map((v) => {
        return {
          label: v.name,
          hdPath: v.hdPath,
          addressType: v.value,
          isUnisatLegacy: v.isUnisatLegacy
        };
      });
  }, [contextData]);

  const [previewAddresses, setPreviewAddresses] = useState<string[]>(hdPathOptions.map((v) => ''));

  const [addressBalances, setAddressBalances] = useState<{ [key: string]: { amount: string; satoshis: number } }>({});

  const selfRef = useRef({
    maxSatoshis: 0,
    recommended: 0,
    count: 0,
    addressBalances: {}
  });
  const self = selfRef.current;
  const run = async () => {
    const addresses: string[] = [];
    for (let i = 0; i < hdPathOptions.length; i++) {
      const options = hdPathOptions[i];
      const keyring = await wallet.createTmpKeyringWithPrivateKey(contextData.wif, options.addressType);
      const address = keyring.accounts[0].address;
      addresses.push(address);
    }

    const balances = await wallet.getMultiAddressBalance(addresses.join(','));
    for (let i = 0; i < addresses.length; i++) {
      const address = addresses[i];
      const balance = balances[i];
      const satoshis = amountToSaothis(balance.amount);
      self.addressBalances[address] = {
        amount: balance.amount,
        satoshis
      };
      if (satoshis > self.maxSatoshis) {
        self.maxSatoshis = satoshis;
        self.recommended = i;
      }

      updateContextData({ addressType: hdPathOptions[self.recommended].addressType });
      setAddressBalances(self.addressBalances);
    }
    setPreviewAddresses(addresses);
  };
  useEffect(() => {
    run();
  }, [contextData.wif]);

  const pathIndex = hdPathOptions.findIndex((v) => v.addressType === contextData.addressType);

  const navigate = useNavigate();

  const onNext = async () => {
    try {
      await wallet.createKeyringWithPrivateKey(contextData.wif, contextData.addressType);
      navigate('MainScreen');
    } catch (e) {
      message.error((e as any).message);
    }
  };
  return (
    <div className="flex flex-col items-strech gap-3_75 justify-evenly mx-5">
      <div className="flex flex-col px-2 text-2xl font-semibold">{'Address Type'}</div>
      {hdPathOptions.map((item, index) => {
        const address = previewAddresses[index];
        const balance = addressBalances[address] || {
          amount: '--',
          satoshis: 0
        };
        const hasVault = balance.satoshis > 0;
        if (item.isUnisatLegacy && !hasVault) {
          return null;
        }
        return (
          <Button
            key={index}
            size="large"
            type="default"
            className={'p-5 box default ' + (hasVault ? '!h-32' : '!h-20')}
            onClick={() => {
              if (item.hdPath) {
                updateContextData({ addressType: item.addressType });
              }
            }}>
            <div className="flex items-center justify-between text-lg font-semibold">
              <div className="flex flex-col flex-grow text-left">
                <div className=" w-60 text-left">{`${item.label}`}</div>
                <div className={'font-normal ' + (hasVault ? 'text-yellow-300' : 'opacity-60')}>
                  {shortAddress(address)}
                </div>
                {hasVault && <div className={' border-b-2 opacity-60'}></div>}
                {hasVault && (
                  <div className={'font-normal ' + (hasVault ? 'text-yellow-300' : 'opacity-60')}>
                    {balance ? `${balance.amount} BTC` : ''}{' '}
                  </div>
                )}
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
  wif: string;
  addressType: AddressType;
  step1Completed: boolean;
  tabType: TabType;
}

interface UpdateContextDataParams {
  wif?: string;
  addressType?: AddressType;
  step1Completed?: boolean;
  tabType?: TabType;
}

export default function CreateSimpleWalletScreen() {
  const navigate = useNavigate();

  const [contextData, setContextData] = useState<ContextData>({
    wif: '',
    addressType: AddressType.P2WPKH,
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
      children: <Step1 contextData={contextData} updateContextData={updateContextData} />
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
          window.history.go(-1);
        }}
        title="Create Single Wallet"
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
