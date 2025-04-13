import { useCallback } from 'react';

import { CosmosSignDataType } from '@/shared/types';
import KeystoneSignBase, { KeystoneSignBaseProps } from '@/ui/components/Keystone/SignBase';
import { useWallet } from '@/ui/utils';

interface Props {
  cosmosSignRequest: {
    requestId?: string;
    signData: any;
    dataType: CosmosSignDataType;
    path: string;
    chainId?: string;
    accountNumber?: string;
    address?: string;
  };
  onSuccess?: (data: any) => void;
  onBack: () => void;
}

export default function CosmosSignScreen(props: Props) {
  const wallet = useWallet();

  const generateUR = useCallback(async () => {
    return wallet.genSignCosmosUr(props.cosmosSignRequest);
  }, [props.cosmosSignRequest, wallet]);

  const parseUR = useCallback(
    async (type: string, cbor: string) => {
      return wallet.parseCosmosSignUr(type, cbor);
    },
    [wallet]
  );

  const baseProps: KeystoneSignBaseProps = {
    onBack: props.onBack,
    onSuccess: props.onSuccess,
    signatureText: 'Get Signature',
    id: props.cosmosSignRequest.requestId,
    generateUR,
    parseUR
  };

  return <KeystoneSignBase {...baseProps} />;
}
