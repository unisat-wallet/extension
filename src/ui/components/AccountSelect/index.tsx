import { useTranslation } from 'react-i18next';

import { KEYRING_CLASS } from '@/shared/constant';
import { useNavigate } from '@/ui/pages/MainRoute';
import { useCurrentAccount } from '@/ui/state/accounts/hooks';
import { shortAddress } from '@/ui/utils';

import './index.less';

const AccountSelect = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const currentAccount = useCurrentAccount();
  return (
    <div
      className="px-5 duration-80 account-select-container mx-5"
      onClick={(e) => {
        navigate('SwitchAccountScreen');
      }}>
      <span className="icon-profile">
        <img src="./images/user-solid.svg" alt="" />
      </span>
      <div className="account">
        <div className="text-lg font-semibold whitespace-nowrap">{shortAddress(currentAccount?.alianName, 8)}</div>
        {currentAccount?.type == KEYRING_CLASS.PRIVATE_KEY ? (
          <div className="rounded bg-primary-active py-1_25 px-2_5">
            <div className="text-xs font-medium">
              <span>IMPORTED</span>
            </div>
          </div>
        ) : (
          <></>
        )}
      </div>
      <span className="icon-drop">
        <img src="./images/chevron-down-solid.svg" alt="" />
      </span>
    </div>
  );
};

export default AccountSelect;
