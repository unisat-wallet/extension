import { ChainType } from '@/shared/constant';
import { ContractInformation } from '@/shared/web3/interfaces/ContractInformation';
import { InteractionParametersWithoutSigner } from '@btc-vision/transaction';

export interface DetailedInteractionParameters {
  readonly interactionParameters: InteractionParametersWithoutSigner;
  readonly contractInfo: ContractInformation;
  network: ChainType;
}
