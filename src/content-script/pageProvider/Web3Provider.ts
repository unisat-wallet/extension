import { BroadcastedTransaction } from 'opnet';

import { UnisatProvider } from '@/content-script/pageProvider/index.js';
import { IInteractionParameters, UTXO } from '@btc-vision/transaction';

export type InteractionParametersWithoutSigner = Omit<IInteractionParameters, 'signer'>;

export interface BroadcastTransactionOptions {
  raw: string;
  psbt: boolean;
}

export class Web3Provider {
  protected readonly provider: UnisatProvider;

  constructor(provider: UnisatProvider) {
    this.provider = provider;
  }

  public async signAndBroadcastInteraction(
    interactionParameters: InteractionParametersWithoutSigner
  ): Promise<[BroadcastedTransaction, BroadcastedTransaction, UTXO[]]> {
    if ('signer' in interactionParameters) {
      throw new Error('signer is not allowed in interaction parameters');
    }

    return this.provider.signAndBroadcastInteraction(interactionParameters);
  }

  public async signInteraction(
    interactionParameters: InteractionParametersWithoutSigner
  ): Promise<[string, string, UTXO[]]> {
    if ('signer' in interactionParameters) {
      throw new Error('signer is not allowed in interaction parameters');
    }

    return this.provider.signInteraction(interactionParameters);
  }

  public async broadcast(transactions: BroadcastTransactionOptions[]): Promise<BroadcastedTransaction[]> {
    return this.provider.broadcast(transactions);
  }
}
