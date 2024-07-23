import { BroadcastedTransaction } from 'opnet';

import { UnisatProvider } from '@/content-script/pageProvider/index.js';
import { IInteractionParameters } from '@btc-vision/transaction';

export type InteractionParametersWithoutSigner = Omit<IInteractionParameters, 'signer'>;

export class Web3Provider {
  protected readonly provider: UnisatProvider;

  constructor(provider: UnisatProvider) {
    this.provider = provider;
  }

  public async signAndBroadcastInteraction(
    interactionParameters: InteractionParametersWithoutSigner
  ): Promise<[BroadcastedTransaction, BroadcastedTransaction]> {
    if ('signer' in interactionParameters) {
      throw new Error('signer is not allowed in interaction parameters');
    }

    return this.provider.signAndBroadcastInteraction(interactionParameters);
  }
  public async signInteraction(
    interactionParameters: InteractionParametersWithoutSigner
  ): Promise<[string, string, import('@btc-vision/transaction').UTXO[]]> {
    if ('signer' in interactionParameters) {
      throw new Error('signer is not allowed in interaction parameters');
    }

    return this.provider.signInteraction(interactionParameters);
  }
  public async broadcast(finalTx: any[]): Promise<[BroadcastedTransaction, BroadcastedTransaction]> {
    return this.provider.broadcast(finalTx);
  }
}
