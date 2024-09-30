import { Button, Text } from '@/ui/components';
import { colors } from '@/ui/theme/colors';
import Base, { convertMulitAccountToCryptoAccount, CryptoMultiAccounts } from '@keystonehq/hw-app-base';
import { Curve, DerivationAlgorithm } from '@keystonehq/keystone-sdk';
import { useCallback, useState } from 'react';
import { createKeystoneTransport } from './utils';

const EXPECTED_HD_PATH = ["m/44'/0'/0'", "m/49'/0'/0'", "m/84'/0'/0'", "m/86'/0'/0'"];

export default function KeystoneFetchKey({
  onSucceed,
  size
}: {
  onSucceed: (data: { type: string; cbor: string }) => void;
  size?: number;
}) {
  const [isError, setIsError] = useState(false);
  const [progress, setProgress] = useState(0);

  const onError = useCallback((e: any) => {
    console.error(e);
    setIsError(true);
    setProgress(0);
  }, []);

  const onClick = useCallback(async () => {
    try {
      const transport = await createKeystoneTransport();
      const base = new Base(transport as any);
      const accounts: CryptoMultiAccounts[]  = [];
      for (const path of EXPECTED_HD_PATH) {
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
    }
  }, []);

  const onProgress = useCallback((progress) => {
    setProgress(progress);
  }, []);

  return (
    <div className="keystone-scan">
      <div
        style={{
          width: size,
          height: size,
          position: 'relative',
          background: colors.bg4
        }}
      >
      </div>
      <Button preset="defaultV2" style={{ color: colors.white, marginTop: '2px' }} onClick={onClick}>
        <Text text="Click to fetch keys" color="white" />
      </Button>
    </div>
  );
}
