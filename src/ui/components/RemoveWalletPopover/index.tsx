import { useMemo } from 'react';

import { WalletKeyring } from '@/shared/types';
import { useNavigate } from '@/ui/pages/MainRoute';
import { accountActions } from '@/ui/state/accounts/reducer';
import { useAppDispatch } from '@/ui/state/hooks';
import { keyringsActions } from '@/ui/state/keyrings/reducer';
import { shortAddress, useWallet } from '@/ui/utils';
import { faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { Popover } from '../Popover';

export const RemoveWalletPopover = ({ keyring, onClose }: { keyring: WalletKeyring; onClose: () => void }) => {
  const wallet = useWallet();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const displayAddress = useMemo(() => {
    const address = keyring.accounts[0].address;
    return shortAddress(address);
  }, []);
  return (
    <Popover onClose={onClose}>
      <div className="flex flex-col items-center justify-center ">
        <div
          style={{
            width: '3rem',
            height: '3rem',
            borderRadius: '1.5rem',
            alignItems: 'center',
            display: 'flex',
            flexDirection: 'row',
            backgroundColor: '#CC3333',
            justifyContent: 'center'
          }}>
          <FontAwesomeIcon icon={faTrashCan} style={{ height: '1rem' }} />
        </div>

        <div className={'!px-3 !py-1 box default !w-72 !h-16 mt-5'}>
          <div className="flex items-center justify-between text-lg font-semibold h-full">
            <div className="flex ml-2 flex-col flex-grow text-center h-full cursor-pointer">
              <span>{`${keyring.alianName}`} </span>
              <span className="font-normal opacity-60">{`${displayAddress}`}</span>
            </div>
          </div>
        </div>
        <span className="text-lg text-center mt-5">
          {'Please pay attention to whether you have backed up the mnemonic/private key to prevent asset loss'}.
        </span>
        <span className="text-lg text-center text-error">{'This action is not reversible'}.</span>

        <div className="grid w-full grid-cols-2 gap-2_5 mt-5">
          <div
            className="cursor-pointer box unit bg-soft-black hover:border-white hover:border-opacity-40 hover:bg-primary-active"
            onClick={(e) => {
              if (onClose) {
                onClose();
              }
            }}>
            &nbsp;{'Cancel'}
          </div>

          <div
            className="cursor-pointer box unit ant-btn-dangerous hover:border-white hover:border-opacity-40"
            onClick={async () => {
              const nextKeyring = await wallet.removeKeyring(keyring);
              if (nextKeyring) {
                const keyrings = await wallet.getKeyrings();
                dispatch(keyringsActions.setKeyrings(keyrings));
                dispatch(keyringsActions.setCurrent(keyrings[0]));
                dispatch(accountActions.setCurrent(nextKeyring.accounts[0]));
              } else {
                navigate('WelcomeScreen');
              }
            }}>
            &nbsp;{'Remove'}
          </div>
        </div>
      </div>
    </Popover>
  );
};
