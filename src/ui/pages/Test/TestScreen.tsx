import { useEffect } from 'react';

import { NetworkType, TxType } from '@/shared/types';
import { Card, Text } from '@/ui/components';
import { AddressDetailPopover } from '@/ui/components/AddressDetailPopover';
import { AddressText } from '@/ui/components/AddressText';
import { RemoveWalletPopover } from '@/ui/components/RemoveWalletPopover';
import { useCurrentKeyring } from '@/ui/state/keyrings/hooks';

import { Connect, SignPsbt, SignText, SwitchNetwork } from '../Approval/components';
import { useNavigate } from '../MainRoute';

export default function TestScreen() {
  return <TestButton />;
}

function TestButton() {
  return (
    <Card
      onClick={() => {
        //tpdp
      }}>
      <Text text="HELLO" />
      <Text text="WORLD" />
    </Card>
  );
}

function TestAddressDetail() {
  return (
    <AddressDetailPopover
      address="sfjskfjdskfdjk"
      onClose={() => {
        //todo
      }}
    />
  );
}

function TestAddressText() {
  return <AddressText address="sfjskfjdskfdjk" domain="abc.sats" />;
}

function TestApprovalConnect() {
  return (
    <Connect
      params={{
        session: {
          origin: 'https://mail.google.com/',
          icon: 'https://ssl.gstatic.com/ui/v1/icons/mail/rfr/gmail.ico',
          name: 'GMAIL'
        }
      }}
    />
  );
}

function TestApprovalSignPsbt() {
  return (
    <SignPsbt
      params={{
        data: {
          psbtHex:
            '70736274ff01007d02000000013c62aafa5705ab12906a9e7d504971cd9b078a9e895539f48e6d6d6cdcfd3a690100000000fdffffff02e803000000000000160014da7fda4bd80b59b83963e7da8649963f8834fc699017000000000000225120517aaf863dcf93a135664bbede4dc219c054a63fdd5b8b10a7c2b61bd8d3e28f000000000001012b081c000000000000225120517aaf863dcf93a135664bbede4dc219c054a63fdd5b8b10a7c2b61bd8d3e28f0108420140ef3a6a82e30869e08a4750ad83d0f82d8d058fe0dbce054be127ad1bf03be57acf34f0bcc3b154b8d76f1e454071356ffbe62fcacad2314d62d7242386734b66000000',
          type: TxType.SEND_BITCOIN
        },
        session: {
          origin: 'https://mail.google.com/',
          icon: 'https://ssl.gstatic.com/ui/v1/icons/mail/rfr/gmail.ico',
          name: 'GMAIL'
        }
      }}
    />
  );
}

function TestApprovalSwitchNetwork() {
  return (
    <SwitchNetwork
      params={{
        data: {
          networkType: NetworkType.MAINNET
        },
        session: {
          origin: 'https://mail.google.com/',
          icon: 'https://ssl.gstatic.com/ui/v1/icons/mail/rfr/gmail.ico',
          name: 'GMAIL'
        }
      }}
    />
  );
}

function TestApprovalSignText() {
  return (
    <SignText
      params={{
        data: {
          text: 'hello'
        },
        session: {
          origin: 'https://mail.google.com/',
          icon: 'https://ssl.gstatic.com/ui/v1/icons/mail/rfr/gmail.ico',
          name: 'GMAIL'
        }
      }}
    />
  );
}

function TestRemoveWalletPoper() {
  const keyring = useCurrentKeyring();
  return (
    <RemoveWalletPopover
      keyring={keyring}
      onClose={function (): void {
        throw new Error('Function not implemented.');
      }}
    />
  );
}

function TestCreatePassword() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate('CreatePasswordScreen', { isNewAccount: true });
  }, []);
}
