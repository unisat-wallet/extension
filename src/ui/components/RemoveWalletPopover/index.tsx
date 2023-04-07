import { useMemo } from 'react';

import { WalletKeyring } from '@/shared/types';
import { useNavigate } from '@/ui/pages/MainRoute';
import { accountActions } from '@/ui/state/accounts/reducer';
import { useAppDispatch } from '@/ui/state/hooks';
import { keyringsActions } from '@/ui/state/keyrings/reducer';
import { shortAddress, useWallet } from '@/ui/utils';
import { faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { Button } from '../Button';
import { Card } from '../Card';
import { Column } from '../Column';
import { Popover } from '../Popover';
import { Row } from '../Row';
import { Text } from '../Text';

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
      <Column justifyCenter itemsCenter>
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: '1.5rem',
            alignItems: 'center',
            display: 'flex',
            flexDirection: 'row',
            backgroundColor: '#CC3333',
            justifyContent: 'center'
          }}>
          <FontAwesomeIcon icon={faTrashCan} style={{ height: '1rem' }} />
        </div>

        <Card preset="style2" style={{ width: 200 }}>
          <Column>
            <Text text={keyring.alianName} textCenter />
            <Text text={displayAddress} preset="sub" textCenter />
          </Column>
        </Card>
        <Text
          text="Please pay attention to whether you have backed up the mnemonic/private key to prevent asset loss"
          textCenter
        />

        <Text text="This action is not reversible." color="danger" />
        <Row full>
          <Button
            text="Cancel"
            full
            onClick={(e) => {
              if (onClose) {
                onClose();
              }
            }}
          />
          <Button
            text="Remove"
            preset="danger"
            full
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
            }}
          />
        </Row>
      </Column>
    </Popover>
  );
};
