import { Button, Input } from 'antd';
import { t } from 'i18next';
import VirtualList from 'rc-virtual-list';
import { forwardRef, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NavigateFunction, useNavigate } from 'react-router-dom';

import { ADDRESS_TYPES, KEYRING_TYPE, LANGS } from '@/shared/constant';
import { useExtensionIsInTab, useOpenExtensionInTab } from '@/ui/features/browser/tabs';
import { useAccountAddress, useChangeAccountNameCallback, useCurrentAccount } from '@/ui/state/accounts/hooks';
import { useAddressType, useSettingsState } from '@/ui/state/settings/hooks';
import { shortAddress } from '@/ui/utils';
import { RightOutlined } from '@ant-design/icons';

interface Setting {
  label?: string;
  value?: string;
  desc?: string;
  danger?: boolean;
  action: string;
  route: string;
  right: boolean;
  keyringType?: string;
}

const SettingList: Setting[] = [
  {
    label: t('Address Type'),
    value: t('Taproot'),
    desc: '',
    action: 'addressType',
    route: '/settings/address-type',
    right: true
  },
  // {
  //   label: t('Language'),
  //   value: t('English'),
  //   desc: '',
  //   action: 'language',
  //   route: '/settings/language',
  //   right: true
  // },
  // {
  //   label: t('Currency'),
  //   value: 'US Dollar',
  //   desc: '',
  //   action: 'currency',
  //   route: 'currency',
  //   right: true
  // },
  {
    label: t('Change Password'),
    value: t('Change your lockscreen password'),
    desc: '',
    action: 'password',
    route: '/settings/password',
    right: true
  },
  {
    label: '',
    value: '',
    desc: t('Expand View'),
    action: 'expand-view',
    route: '/settings/export-privatekey',
    right: false
  },
  {
    label: '',
    value: '',
    desc: t('Show Secret Recovery Phrase'),
    action: 'export-mnemonics',
    route: '/settings/export-mnemonics',
    right: false
  },
  {
    label: '',
    value: '',
    desc: t('Export Private Key'),
    action: 'export-privatekey',
    route: '/settings/export-privatekey',
    right: false
  },
  {
    label: '',
    value: '',
    danger: true,
    desc: t('Remove Account'),
    action: 'remove-account',
    route: '/settings/remove-account',
    right: false,
    keyringType: KEYRING_TYPE.SimpleKeyring
  }
];

type MyItemProps = {
  key: number;
  item: Setting;
  navigate: NavigateFunction;
};

const MyItem: React.FC<MyItemProps> = forwardRef(({ item, key, navigate }, ref) => {
  const openExtensionInTab = useOpenExtensionInTab();
  return (
    <Button
      ref={ref as any}
      key={key}
      danger={item.danger}
      type={item.danger ? 'text' : 'default'}
      size="large"
      className={`mb-3_75 box mx-5 ${item.danger ? item.danger : 'default'} ${item.right ? 'btn-settings' : ''}`}
      onClick={(e) => {
        if (item.action == 'expand-view') {
          openExtensionInTab();
          return;
        }
        navigate(item.route);
      }}>
      <div className="flex items-center justify-between font-semibold text-4_5">
        <div className="flex flex-col text-left gap-2_5">
          <span>{item.label}</span>
          <span className="font-normal opacity-60">{item.value}</span>
        </div>
        <div className="flex-grow">{item.desc}</div>
        {item.right ? <RightOutlined style={{ transform: 'scale(1.2)', color: '#AAA' }} /> : <></>}
      </div>
    </Button>
  );
});

export type ScrollAlign = 'top' | 'bottom' | 'auto';

export type ScrollConfig =
  | {
      index: number;
      align?: ScrollAlign;
      offset?: number;
    }
  | {
      key: React.Key;
      align?: ScrollAlign;
      offset?: number;
    };

export type ScrollTo = (arg: number | ScrollConfig) => void;

type ListRef = {
  scrollTo: ScrollTo;
};

export default function SettingsTab() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [editable, setEditable] = useState(false);

  const currentAccount = useCurrentAccount();

  const settings = useSettingsState();

  const addressInput = useRef<any>(null);

  const handleChangeAlianName = () => {
    setEditable(true);
  };

  useEffect(() => {
    if (editable) {
      addressInput.current!.focus({ cursor: 'end' });
    }
  }, [editable]);

  const [name, setName] = useState(currentAccount.alianName);
  const changeAccountName = useChangeAccountNameCallback();
  const handleOnBlur = async (e) => {
    let alianName = currentAccount?.alianName ?? '';
    if (currentAccount && e.target.value) {
      alianName = e.target.value;
    }
    changeAccountName(alianName);
    setName(alianName);
    setEditable(false);
  };

  const addressType = useAddressType();

  const isInTab = useExtensionIsInTab();
  const toRenderSettings = SettingList.filter((v) => {
    if (v.action == 'language') {
      v.value = t(LANGS.find((v) => v.value == settings.locale)?.label || '');
    }
    if (v.action == 'addressType') {
      v.value = ADDRESS_TYPES[addressType].label;
    }

    if (v.action == 'expand-view') {
      if (isInTab) {
        return false;
      }
    }

    if (v.keyringType) {
      if (currentAccount?.type == v.keyringType) {
        return true;
      }
    } else {
      return true;
    }
  });

  const address = useAccountAddress();
  return (
    <div className="flex flex-col items-strech h-full">
      <div className="mt-5">
        <div
          className={` duration-80 grid items-center justify-center grid-cols-6 p-5 mt-5 h-15_5 box text-white border-0 border-white rounded mx-5 hover  ${
            editable ? 'bg-primary-active border-opacity-60' : 'bg-soft-black border-opacity-20'
          }`}>
          {editable ? (
            <Input
              ref={addressInput}
              className="col-span-5 font-semibold rounded-none p0 hover hover:cursor-text disabled:color-soft-white"
              bordered={false}
              status="error"
              placeholder=""
              defaultValue={name}
              onBlur={(e) => handleOnBlur(e)}
              onPressEnter={(e) => handleOnBlur(e)}
            />
          ) : (
            <span
              className="col-span-5 font-semibold p0 hover hover:cursor-text opacity-60"
              onClick={(e) => {
                handleChangeAlianName();
              }}>
              {name}
            </span>
          )}
          <div
            className={`flex items-center justify-end cursor-pointer hover:opacity-100 ${
              editable ? 'opacity-100' : 'opacity-60'
            }`}>
            <img
              className="w-4_5 h-4_5"
              src="./images/Name.svg"
              onClick={(e) => {
                setName('');
                handleChangeAlianName();
              }}
              title={t('Clear the inputted')}
            />
          </div>
        </div>

        <div className="w-full text-center text-soft-white mt-2_5">{shortAddress(address)}</div>
      </div>
      <div className="mt-3_75">
        <VirtualList
          data={toRenderSettings}
          data-id="list"
          // height={virtualListHeight}
          itemHeight={20}
          itemKey={(item) => item.action}
          style={{
            boxSizing: 'border-box'
          }}>
          {(item, index) => <MyItem key={index} navigate={navigate} item={item} />}
        </VirtualList>
      </div>
    </div>
  );
}
