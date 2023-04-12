import { useEffect } from 'react';

import { NetworkType, TokenBalance, TxType } from '@/shared/types';
import { Card, Content, Input, Layout, Text } from '@/ui/components';
import { AddressDetailPopover } from '@/ui/components/AddressDetailPopover';
import { AddressText } from '@/ui/components/AddressText';
import BRC20BalanceCard from '@/ui/components/BRC20BalanceCard';
import { RemoveWalletPopover } from '@/ui/components/RemoveWalletPopover';
import { useCurrentKeyring } from '@/ui/state/keyrings/hooks';

import { Connect, SignPsbt, SignText, SwitchNetwork } from '../Approval/components';
import MultiSignPsbt from '../Approval/components/MultiSignPsbt';
import { useNavigate } from '../MainRoute';

export default function TestScreen() {
  return <TestApprovalMultiSignPsbt />;
}

const tokenBalance: TokenBalance = {
  ticker: 'MEME',
  availableBalance: '40',
  transferableBalance: '60',
  overallBalance: '100',
  availableBalanceSafe: '',
  availableBalanceUnSafe: ''
};
function TestBRC20BalanceCard() {
  return (
    <Layout>
      <Content>
        <BRC20BalanceCard tokenBalance={tokenBalance} />
      </Content>
    </Layout>
  );
}

const testAddressInfo = {
  address: 'tb1q8h8s4zd9y0lkrx334aqnj4ykqs220ss7mjxzny',
  domain: 'abc.sats',
  inscription: {
    inscriptionId: '8436ee125d5cff80292e1ae3efdcde9880f020b63c5ee0f08a39865fc534ec36i0',
    inscriptionNumber: 1254,
    address: 'tb1q8h8s4zd9y0lkrx334aqnj4ykqs220ss7mjxzny',
    outputValue: 546,
    preview: 'https://ordinals.com/preview/8436ee125d5cff80292e1ae3efdcde9880f020b63c5ee0f08a39865fc534ec36i0',
    content: 'https://ordinals.com/content/8436ee125d5cff80292e1ae3efdcde9880f020b63c5ee0f08a39865fc534ec36i0',
    contentLength: 40,
    contentType: 'text/plain;charset=utf-8',
    contentBody: '',
    timestamp: 1680586687,
    genesisTransaction: '8436ee125d5cff80292e1ae3efdcde9880f020b63c5ee0f08a39865fc534ec36',
    location: '8436ee125d5cff80292e1ae3efdcde9880f020b63c5ee0f08a39865fc534ec36:0:0',
    output: '8436ee125d5cff80292e1ae3efdcde9880f020b63c5ee0f08a39865fc534ec36:0',
    offset: 0
  }
};

function TestAddressInput() {
  const toInfo = {
    address: '',
    domain: ''
  };
  return (
    <Input
      preset="address"
      addressInputData={toInfo}
      onAddressInputChange={(val) => {
        console.log(val);
      }}
      autoFocus={true}
    />
  );
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
      address="tb1q8h8s4zd9y0lkrx334aqnj4ykqs220ss7mjxzny"
      onClose={() => {
        //todo
      }}
    />
  );
}

function TestAddressTextA() {
  return <AddressText addressInfo={testAddressInfo} />;
}

function TestAddressTextB() {
  return <AddressText address={'tb1q8h8s4zd9y0lkrx334aqnj4ykqs220ss7mjxzny'} />;
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
            '70736274ff01007d0200000001d0baba4fd7980fe2c29b1efc4eb9eb2aa43aa1a4dbe2d9f8f38facef3446f5900100000000fdffffff02a086010000000000225120517aaf863dcf93a135664bbede4dc219c054a63fdd5b8b10a7c2b61bd8d3e28f3fc95500000000001600143dcf0a89a523ff619a31af413954960414a7c21e000000000001011f79505700000000001600143dcf0a89a523ff619a31af413954960414a7c21e01086c024830450221008b3706ec6cff7e882fe6dbcbeacc09195f3f10f8b268acce6367bf4f37058edd02203ca6b1c8f6efdad8f6aa63cfe091d5871e1f19d44e3e267d311c31e51cb81f1c0121026887958bcc4cb6f8c04ea49260f0d10e312c41baf485252953b14724db552aac000000',
          type: TxType.SIGN_TX
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

function TestApprovalSignPsbtB() {
  // const psbtHex = '70736274ff01009a020000000229c48c873d924f44e91c0c68350f56ac4a91f7d8e3ce53f611b7bbc6d74e94490000000000fdffffffd0baba4fd7980fe2c29b1efc4eb9eb2aa43aa1a4dbe2d9f8f38facef3446f5900100000000fdffffff0288130000000000001600143dcf0a89a523ff619a31af413954960414a7c21ea74f5700000000001600143dcf0a89a523ff619a31af413954960414a7c21e000000000001011f88130000000000001600143dcf0a89a523ff619a31af413954960414a7c21e01086c02483045022100aa1d2d11a259766c383a3c0d98031e4d22a941d221d7f08a4eef688717aa2fa90220550c1be8139bddb2ff359ad96fcccfd130bfcd300ac6eb8999c1771668671f0d0121026887958bcc4cb6f8c04ea49260f0d10e312c41baf485252953b14724db552aac0001011f79505700000000001600143dcf0a89a523ff619a31af413954960414a7c21e01086c02483045022100e8bd3cbd51dd33fc082dd40f43255860bd5c5af0f2b3e4078cfa34d45f137cfa022021bf8c56c0fc03e50e5ca85cfb38613febcc5f2aabe27c53e0c8846996a241a40121026887958bcc4cb6f8c04ea49260f0d10e312c41baf485252953b14724db552aac000000';

  const psbtHex =
    '70736274ff0100fd7201020000000529c48c873d924f44e91c0c68350f56ac4a91f7d8e3ce53f611b7bbc6d74e94490000000000fdffffff6b09c7db0780116771239461b966e15ff69a3b8bac75087844d70772051b92470000000000fdffffff1565d4732c8902fbcc9b893fb34f81f3d5cfb423738b1b7f0989f6e05118a6b50000000000fdffffff1107c932ca1796f9beec709d055ada9b43ff1defef9d02093b7bac292cbe893a0000000000fdffffffd0baba4fd7980fe2c29b1efc4eb9eb2aa43aa1a4dbe2d9f8f38facef3446f5900100000000fdffffff0588130000000000001600143dcf0a89a523ff619a31af413954960414a7c21e88130000000000001600143dcf0a89a523ff619a31af413954960414a7c21e88130000000000001600143dcf0a89a523ff619a31af413954960414a7c21e88130000000000001600143dcf0a89a523ff619a31af413954960414a7c21e7e4e5700000000001600143dcf0a89a523ff619a31af413954960414a7c21e000000000001011f88130000000000001600143dcf0a89a523ff619a31af413954960414a7c21e01086b024730440220617f506c0178a37246ab459c8fe020ee75c7ae7b384d13c27fe514a76befb0200220633001f7d6216de17a532696151913be16dea2884a3c1d5a5a6cc120013924440121026887958bcc4cb6f8c04ea49260f0d10e312c41baf485252953b14724db552aac0001011f88130000000000001600143dcf0a89a523ff619a31af413954960414a7c21e01086b0247304402204b836a559d34a9dc9541e93e2b14e5fdd37520141ff181cd5b65d8d0b0f8dda902206ed8b5db4f2e90f5690933691cd4849acd09b833e570686e930714d147984ff10121026887958bcc4cb6f8c04ea49260f0d10e312c41baf485252953b14724db552aac0001011f88130000000000001600143dcf0a89a523ff619a31af413954960414a7c21e01086c02483045022100c2210808b3a3012eb2e5acaff7614480b4ee544f971617b20191bd79fb82103e02201df853f23e97f8d64434f7fa0c91e4378464b775e8f50f16fb1db7da0932310e0121026887958bcc4cb6f8c04ea49260f0d10e312c41baf485252953b14724db552aac0001011f88130000000000001600143dcf0a89a523ff619a31af413954960414a7c21e01086c02483045022100854f27ed11762f0527ed8c8b9dfa40a11668d332f4f4f4c426209a8f99f0684002205a37810c7856f55fa0066b4311f43e2c0e0e5bd0898fe347195e04b8302bafa70121026887958bcc4cb6f8c04ea49260f0d10e312c41baf485252953b14724db552aac0001011f79505700000000001600143dcf0a89a523ff619a31af413954960414a7c21e01086c02483045022100ff500eb5249ae8bd06ad4667ae7ad8515f85a44cfffbec33ef7e2f4ad81c7454022019a3a68f17e2c31c76985e07e638717b4e1f61396ff2cf04610e334a92d779940121026887958bcc4cb6f8c04ea49260f0d10e312c41baf485252953b14724db552aac000000000000';
  return (
    <SignPsbt
      params={{
        data: {
          psbtHex,
          type: TxType.SEND_INSCRIPTION,
          rawTxInfo: {
            psbtHex,
            rawtx: '',
            toAddressInfo: testAddressInfo
          }
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

function TestApprovalMultiSignPsbt() {
  // const psbtHex = '70736274ff01009a020000000229c48c873d924f44e91c0c68350f56ac4a91f7d8e3ce53f611b7bbc6d74e94490000000000fdffffffd0baba4fd7980fe2c29b1efc4eb9eb2aa43aa1a4dbe2d9f8f38facef3446f5900100000000fdffffff0288130000000000001600143dcf0a89a523ff619a31af413954960414a7c21ea74f5700000000001600143dcf0a89a523ff619a31af413954960414a7c21e000000000001011f88130000000000001600143dcf0a89a523ff619a31af413954960414a7c21e01086c02483045022100aa1d2d11a259766c383a3c0d98031e4d22a941d221d7f08a4eef688717aa2fa90220550c1be8139bddb2ff359ad96fcccfd130bfcd300ac6eb8999c1771668671f0d0121026887958bcc4cb6f8c04ea49260f0d10e312c41baf485252953b14724db552aac0001011f79505700000000001600143dcf0a89a523ff619a31af413954960414a7c21e01086c02483045022100e8bd3cbd51dd33fc082dd40f43255860bd5c5af0f2b3e4078cfa34d45f137cfa022021bf8c56c0fc03e50e5ca85cfb38613febcc5f2aabe27c53e0c8846996a241a40121026887958bcc4cb6f8c04ea49260f0d10e312c41baf485252953b14724db552aac000000';

  const psbtHex =
    '70736274ff0100fd7201020000000529c48c873d924f44e91c0c68350f56ac4a91f7d8e3ce53f611b7bbc6d74e94490000000000fdffffff6b09c7db0780116771239461b966e15ff69a3b8bac75087844d70772051b92470000000000fdffffff1565d4732c8902fbcc9b893fb34f81f3d5cfb423738b1b7f0989f6e05118a6b50000000000fdffffff1107c932ca1796f9beec709d055ada9b43ff1defef9d02093b7bac292cbe893a0000000000fdffffffd0baba4fd7980fe2c29b1efc4eb9eb2aa43aa1a4dbe2d9f8f38facef3446f5900100000000fdffffff0588130000000000001600143dcf0a89a523ff619a31af413954960414a7c21e88130000000000001600143dcf0a89a523ff619a31af413954960414a7c21e88130000000000001600143dcf0a89a523ff619a31af413954960414a7c21e88130000000000001600143dcf0a89a523ff619a31af413954960414a7c21e7e4e5700000000001600143dcf0a89a523ff619a31af413954960414a7c21e000000000001011f88130000000000001600143dcf0a89a523ff619a31af413954960414a7c21e01086b024730440220617f506c0178a37246ab459c8fe020ee75c7ae7b384d13c27fe514a76befb0200220633001f7d6216de17a532696151913be16dea2884a3c1d5a5a6cc120013924440121026887958bcc4cb6f8c04ea49260f0d10e312c41baf485252953b14724db552aac0001011f88130000000000001600143dcf0a89a523ff619a31af413954960414a7c21e01086b0247304402204b836a559d34a9dc9541e93e2b14e5fdd37520141ff181cd5b65d8d0b0f8dda902206ed8b5db4f2e90f5690933691cd4849acd09b833e570686e930714d147984ff10121026887958bcc4cb6f8c04ea49260f0d10e312c41baf485252953b14724db552aac0001011f88130000000000001600143dcf0a89a523ff619a31af413954960414a7c21e01086c02483045022100c2210808b3a3012eb2e5acaff7614480b4ee544f971617b20191bd79fb82103e02201df853f23e97f8d64434f7fa0c91e4378464b775e8f50f16fb1db7da0932310e0121026887958bcc4cb6f8c04ea49260f0d10e312c41baf485252953b14724db552aac0001011f88130000000000001600143dcf0a89a523ff619a31af413954960414a7c21e01086c02483045022100854f27ed11762f0527ed8c8b9dfa40a11668d332f4f4f4c426209a8f99f0684002205a37810c7856f55fa0066b4311f43e2c0e0e5bd0898fe347195e04b8302bafa70121026887958bcc4cb6f8c04ea49260f0d10e312c41baf485252953b14724db552aac0001011f79505700000000001600143dcf0a89a523ff619a31af413954960414a7c21e01086c02483045022100ff500eb5249ae8bd06ad4667ae7ad8515f85a44cfffbec33ef7e2f4ad81c7454022019a3a68f17e2c31c76985e07e638717b4e1f61396ff2cf04610e334a92d779940121026887958bcc4cb6f8c04ea49260f0d10e312c41baf485252953b14724db552aac000000000000';
  const psbtHex2 =
    '70736274ff01007d0200000001d0baba4fd7980fe2c29b1efc4eb9eb2aa43aa1a4dbe2d9f8f38facef3446f5900100000000fdffffff02a086010000000000225120517aaf863dcf93a135664bbede4dc219c054a63fdd5b8b10a7c2b61bd8d3e28f3fc95500000000001600143dcf0a89a523ff619a31af413954960414a7c21e000000000001011f79505700000000001600143dcf0a89a523ff619a31af413954960414a7c21e01086c024830450221008b3706ec6cff7e882fe6dbcbeacc09195f3f10f8b268acce6367bf4f37058edd02203ca6b1c8f6efdad8f6aa63cfe091d5871e1f19d44e3e267d311c31e51cb81f1c0121026887958bcc4cb6f8c04ea49260f0d10e312c41baf485252953b14724db552aac000000';
  return (
    <MultiSignPsbt
      params={{
        data: {
          psbtHexs: [psbtHex, psbtHex2]
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

function TestTxSuccess() {
  const navigate = useNavigate();
  useEffect(() => {
    setTimeout(() => {
      navigate('TxSuccessScreen', { txid: '' });
    }, 3000);
  }, []);
  return <div />;
}

function TestTxFailed() {
  const navigate = useNavigate();
  useEffect(() => {
    setTimeout(() => {
      navigate('TxFailScreen', { error: '!dfjksdfkds' });
    }, 3000);
  }, []);
  return <div />;
}
