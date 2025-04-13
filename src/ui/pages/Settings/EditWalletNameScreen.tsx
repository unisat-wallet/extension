import { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { WalletKeyring } from '@/shared/types';
import { Button, Column, Content, Header, Layout } from '@/ui/components';
import { useAppDispatch } from '@/ui/state/hooks';
import { keyringsActions } from '@/ui/state/keyrings/reducer';
import { colors } from '@/ui/theme/colors';
import { useWallet } from '@/ui/utils';

export default function EditWalletNameScreen() {
  const { state } = useLocation();
  const { keyring } = state as {
    keyring: WalletKeyring;
  };

  const wallet = useWallet();
  const [alianName, setAlianName] = useState(keyring.alianName || '');
  const dispatch = useAppDispatch();
  const handleOnClick = async () => {
    const newKeyring = await wallet.setKeyringAlianName(keyring, alianName || keyring.alianName);
    dispatch(keyringsActions.updateKeyringName(newKeyring));
    window.history.go(-1);
  };

  const handleOnKeyUp = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ('Enter' == e.key && e.ctrlKey) {
      handleOnClick();
    }
  };

  const isValidName = useMemo(() => {
    if (alianName.length == 0) {
      return false;
    }
    return true;
  }, [alianName]);

  const calculateRows = useMemo(() => {
    return Math.min(5, Math.max(1, Math.ceil(alianName.length / 40)));
  }, [alianName]);

  const truncatedTitle = useMemo(() => {
    if (keyring.alianName.length > 20) {
      return keyring.alianName.slice(0, 20) + '...';
    }
    return keyring.alianName;
  }, [keyring.alianName]);

  return (
    <Layout>
      <div style={{ position: 'relative' }}>
        <Header
          onBack={() => {
            window.history.go(-1);
          }}
          title={truncatedTitle}
        />
      </div>
      <Content>
        <Column gap="lg">
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: colors.black,
              paddingLeft: 15.2,
              paddingRight: 15.2,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: colors.line2
            }}>
            <textarea
              placeholder={keyring.alianName}
              onChange={(e) => {
                setAlianName(e.target.value);
              }}
              value={alianName}
              onKeyUp={handleOnKeyUp}
              autoFocus={true}
              rows={calculateRows}
              style={{
                display: 'flex',
                flex: 1,
                borderWidth: 0,
                outlineWidth: 0,
                backgroundColor: 'rgba(0,0,0,0)',
                alignSelf: 'stretch',
                padding: '11px 0',
                overflowWrap: 'break-word',
                wordWrap: 'break-word',
                wordBreak: 'break-all',
                whiteSpace: 'pre-wrap',
                resize: 'none',
                lineHeight: '22px'
              }}
            />
          </div>
          <Button
            disabled={!isValidName}
            text="Change Wallet Name"
            preset="primary"
            onClick={(e) => {
              handleOnClick();
            }}
          />
        </Column>
      </Content>
    </Layout>
  );
}
