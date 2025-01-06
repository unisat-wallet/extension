import { BroadcastedTransaction } from 'opnet';

import { OpnetProvider } from '@/content-script/pageProvider/index.js';
import {
    DeploymentResult,
    IDeploymentParameters,
    IInteractionParameters,
    InteractionResponse,
    UTXO
} from '@btc-vision/transaction';

export type InteractionParametersWithoutSigner = Omit<IInteractionParameters, 'signer'>;
export type IDeploymentParametersWithoutSigner = Omit<IDeploymentParameters, 'signer' | 'network'>;

export interface BroadcastTransactionOptions {
    raw: string;
    psbt: boolean;
}

export class Web3Provider {
    protected readonly provider: OpnetProvider;

    constructor(provider: OpnetProvider) {
        this.provider = provider;
    }

    public async signAndBroadcastInteraction(
        interactionParameters: InteractionParametersWithoutSigner
    ): Promise<[BroadcastedTransaction, BroadcastedTransaction, UTXO[], string]> {
        if ('signer' in interactionParameters) {
            console.warn(`signer is not allowed in interaction parameters`);

            interactionParameters.signer = undefined;
        }

        return this.provider.signAndBroadcastInteraction(interactionParameters);
    }

    public async signInteraction(
        interactionParameters: InteractionParametersWithoutSigner
    ): Promise<InteractionResponse> {
        if ('signer' in interactionParameters) {
            console.warn(`signer is not allowed in interaction parameters`);

            interactionParameters.signer = undefined;
        }

        return this.provider.signInteraction(interactionParameters);
    }

    public async deployContract(params: IDeploymentParametersWithoutSigner): Promise<DeploymentResult> {
        return this.provider.deployContract(params);
    }

    public async broadcast(transactions: BroadcastTransactionOptions[]): Promise<BroadcastedTransaction[]> {
        return this.provider.broadcast(transactions);
    }
}
