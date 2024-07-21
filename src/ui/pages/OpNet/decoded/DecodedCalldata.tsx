import { Decoded, DecodedTransfer, InteractionType } from '@/shared/web3/decoder/CalldataDecoder';
import { ContractInformation } from '@/shared/web3/interfaces/ContractInformation';
import { TransferDecodedInfo } from '@/ui/pages/OpNet/decoded/TransferDecodedInfo';

interface DecodedProps {
  readonly decoded: Decoded;
  readonly contractInfo: ContractInformation;
  readonly interactionType: string;
}

export function DecodedCalldata(props: DecodedProps): JSX.Element {
  const contractInfo = props.contractInfo;
  const decoded = props.decoded;
  const interactionType = props.interactionType;

  switch (decoded.selector) {
    case InteractionType.Transfer: {
      return (
        <TransferDecodedInfo
          decoded={decoded as DecodedTransfer}
          contractInfo={contractInfo}
          interactionType={interactionType}
        />
      );
    }

    default: {
      return <></>;
    }
  }
}
