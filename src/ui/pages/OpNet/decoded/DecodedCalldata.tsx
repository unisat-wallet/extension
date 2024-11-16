import { Decoded, InteractionType, isInteractionType } from '@/shared/web3/decoder/CalldataDecoder';
import { ContractInformation } from '@/shared/web3/interfaces/ContractInformation';
import { AddLiquidityDecoded, AddLiquidityDecodedInfo } from '@/ui/pages/OpNet/decoded/AddLiquidityDecodedInfo';
import { ApproveDecodedInfo, DecodedApprove, DecodedTransfer } from '@/ui/pages/OpNet/decoded/ApproveDecodedInfo';
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

    if(!isInteractionType(decoded.selector)) {
        return <></>;
    }

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

        case InteractionType.Approve: {
            return (
                <ApproveDecodedInfo
                    decoded={decoded as DecodedApprove}
                    contractInfo={contractInfo}
                    interactionType={interactionType}
                />
            );
        }

        case InteractionType.AddLiquidity: {
            return (
                <AddLiquidityDecodedInfo
                    decoded={decoded as AddLiquidityDecoded}
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
