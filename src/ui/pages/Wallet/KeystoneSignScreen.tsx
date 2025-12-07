import { useCallback } from 'react';

import { CosmosSignDataType } from '@/shared/types';
import KeystoneSignBase, { KeystoneSignBaseProps } from '@/ui/components/Keystone/SignBase';
import { COSMOS_CHAINS_MAP } from '@unisat/babylon-service/types';
import { KeystoneSignEnum } from '@unisat/keyring-service/types';
import {
  useAccountAddress,
  useBabylonConfig,
  useCurrentAccount,
  useCurrentKeyring,
  useWallet
} from '@unisat/wallet-state';

interface Props {
  type: KeystoneSignEnum;
  data: any;
  isFinalize?: boolean;
  signatureText?: string;
  id?: number;
  onSuccess?: (data: { psbtHex?: string; rawtx?: string; signature?: string }) => void;
  onBack: () => void;
}

export default function KeystoneSignScreen(props: Props) {
  const wallet = useWallet();
  const currentKeyring = useCurrentKeyring();
  const currentAccount = useCurrentAccount();
  const address = useAccountAddress();
  const babylonConfig = useBabylonConfig();
  const babylonChain = COSMOS_CHAINS_MAP[babylonConfig.chainId];

  const generateUR = useCallback(async () => {
    switch (props.type) {
      case KeystoneSignEnum.BIP322_SIMPLE:
        return wallet.genSignMsgUr(props.data, props.type);
      case KeystoneSignEnum.MSG:
        return wallet.genSignMsgUr(props.data, props.type);
      case KeystoneSignEnum.PSBT:
        return wallet.genSignPsbtUr(props.data);
      case KeystoneSignEnum.COSMOS_DIRECT:
        return wallet.genSignCosmosUr({
          signData: props.data,
          dataType: CosmosSignDataType.COSMOS_DIRECT,
          path: currentKeyring.hdPath + '/' + currentAccount.index,
          address,
          chainId: babylonChain.chainId
        });
      case KeystoneSignEnum.COSMOS_ARBITRARY:
        return wallet.genSignCosmosUr({
          signData: props.data,
          dataType: CosmosSignDataType.COSMOS_AMINO,
          path: currentKeyring.hdPath + '/' + currentAccount.index,
          address,
          chainId: babylonChain.chainId
        });
      default:
        return {
          type: '',
          cbor: ''
        };
    }
  }, [props.data, props.type, wallet]);

  const parseUR = useCallback(
    async (type: string, cbor: string) => {
      switch (props.type) {
        case KeystoneSignEnum.BIP322_SIMPLE:
          return wallet.parseSignMsgUr(type, cbor, props.type);
        case KeystoneSignEnum.MSG:
          return wallet.parseSignMsgUr(type, cbor, props.type);
        case KeystoneSignEnum.PSBT:
          return wallet.parseSignPsbtUr(type, cbor, props.isFinalize === false ? false : true);
        case KeystoneSignEnum.COSMOS_DIRECT:
          return wallet.parseCosmosSignUr(type, cbor);
        case KeystoneSignEnum.COSMOS_ARBITRARY:
          return wallet.parseCosmosSignUr(type, cbor);
        default:
          return {
            signature: ''
          };
      }
    },
    [props.isFinalize, props.type, wallet]
  );

  const baseProps: KeystoneSignBaseProps = {
    onBack: props.onBack,
    onSuccess: props.onSuccess,
    signatureText: props.signatureText,
    id: props.id,
    generateUR,
    parseUR
  };

  return <KeystoneSignBase {...baseProps} />;
}
