import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { ADDRESS_TYPES } from '@/shared/constant';
import { AddressType } from '@/shared/types';
import { Button, Card, Column, Content, Header, Input, Layout, Row, Text } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import { Icon } from '@/ui/components/Icon';
import { TabBar } from '@/ui/components/TabBar';
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

  const tools = useTools();

  const btnClick = async () => {
    try {
      const _res = await wallet.createTmpKeyringWithPrivateKey(wif, AddressType.P2TR);
      if (_res.accounts.length == 0) {
        throw new Error('Invalid PrivateKey');
      }
    } catch (e) {
      tools.toastError((e as Error).message);
      return;
    }
    updateContextData({
      wif,
      tabType: TabType.STEP2
    });
  };

  return (
    <Column gap="lg">
      <Text text="Private Key (WIF)" textCenter preset="bold" />

      <Input
        placeholder={'Private Key (WIF)'}
        onKeyUp={(e: React.KeyboardEvent<HTMLInputElement>) => {
          if ('Enter' == e.key) {
            btnClick();
          }
        }}
        onChange={onChange}
        autoFocus={true}
      />
      <Button disabled={disabled} text="Continue" preset="primary" onClick={btnClick} />
    </Column>
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
  const tools = useTools();

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

  const pathIndex = useMemo(() => {
    return hdPathOptions.findIndex((v) => v.addressType === contextData.addressType);
  }, [hdPathOptions, contextData.addressType]);

  const navigate = useNavigate();

  const onNext = async () => {
    try {
      await wallet.createKeyringWithPrivateKey(contextData.wif, contextData.addressType);
      navigate('MainScreen');
    } catch (e) {
      tools.toastError((e as any).message);
    }
  };
  return (
    <Column gap="lg">
      <Text text="Address Type" preset="bold" />
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
          <Card
            key={index}
            onClick={() => {
              updateContextData({ addressType: item.addressType });
            }}>
            <Row full itemsCenter justifyBetween>
              <Column justifyCenter>
                <Text text={`${item.label} `} />
                <Text text={shortAddress(address)} color={hasVault ? 'yellow' : 'white'} />
                {hasVault && (
                  <Text
                    text={balance ? `${balance.amount} BTC` : ''}
                    preset="regular-bold"
                    color={hasVault ? 'yellow' : 'white'}
                  />
                )}
              </Column>
              <Column justifyCenter>{index == pathIndex && <Icon icon="check" />}</Column>
            </Row>
          </Card>
        );
      })}

      <Button text="Coninue" preset="primary" onClick={onNext} />
    </Column>
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

  const renderChildren = useMemo(() => {
    return items.find((v) => v.key == contextData.tabType)?.children;
  }, [contextData.tabType]);

  return (
    <Layout>
      <Header
        onBack={() => {
          window.history.go(-1);
        }}
        title="Create Single Wallet"
      />
      <Content>
        <TabBar
          defaultActiveKey={TabType.STEP1}
          items={items}
          activeKey={contextData.tabType}
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
        />
        {renderChildren}
      </Content>
    </Layout>
  );
}
