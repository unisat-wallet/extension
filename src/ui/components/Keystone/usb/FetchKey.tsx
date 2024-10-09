import { Button, Column, Content, Text } from '@/ui/components';
import { colors } from '@/ui/theme/colors';
import { fontSizes } from '@/ui/theme/font';
import { LoadingOutlined } from '@ant-design/icons';
import Base, { convertMulitAccountToCryptoAccount, CryptoMultiAccounts } from '@keystonehq/hw-app-base';
import { Curve, DerivationAlgorithm } from '@keystonehq/keystone-sdk';
import { useCallback, useState } from 'react';
import KeystonePopover from '../Popover';
import { createKeystoneTransport, handleKeystoneUSBError } from './utils';

const EXPECTED_HD_PATH = ["m/44'/0'/0'", "m/49'/0'/0'", "m/84'/0'/0'", "m/86'/0'/0'"];

export default function KeystoneFetchKey({
  onSucceed,
  isCancelledRef,
  size,
}: {
  onSucceed: (data: { type: string; cbor: string }) => void;
  isCancelledRef: React.MutableRefObject<boolean>
  size?: number;
}) {
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onError = useCallback((e: any) => {
    console.error(e);
    setError(handleKeystoneUSBError(e));
    setIsError(true);
  }, []);

  const onClick = useCallback(async () => {
    try {
      setLoading(true)
      const transport = await createKeystoneTransport();
      const base = new Base(transport as any);
      const accounts: CryptoMultiAccounts[] = [];
      for (const path of EXPECTED_HD_PATH) {
        console.log(isCancelledRef.current)
        if (isCancelledRef.current) {
          return []
        }
        const res = await base.getURAccount(
          path,
          Curve.secp256k1,
          DerivationAlgorithm.slip10
        );
        accounts.push(res);
      }
      const urCryptoAccount = convertMulitAccountToCryptoAccount(accounts);
      console.log({ type: urCryptoAccount.getRegistryType().getType(), cbor: urCryptoAccount.toCBOR() });
      onSucceed({ type: urCryptoAccount.getRegistryType().getType(), cbor: urCryptoAccount.toCBOR() });
    } catch (e) {
      onError(e);
    } finally {
      setLoading(false)
    }
  }, []);

  const onCloseError = useCallback(() => {
    setIsError(false);
    setError('');
  }, [])

  return (
    <Content itemsCenter justifyCenter>
      <Column style={{ minHeight: size }} itemsCenter justifyCenter>
        {loading && <LoadingOutlined style={{
          fontSize: fontSizes.xxxl,
          color: colors.blue
        }} />}
      </Column>
      <Column style={{ minWidth: 300 }} itemsCenter justifyCenter>
        <Button preset="defaultV2" style={{ color: colors.white, marginTop: '2px' }} onClick={onClick}>
          <Text text="Connect" color="white" />
        </Button>
      </Column>
      {isError && <KeystonePopover
        msg={error}
        onClose={onCloseError}
        onConfirm={onCloseError}
      />}
    </Content>
  );
}
