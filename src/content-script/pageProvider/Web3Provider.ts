import { IInteractionParameters } from '@btc-vision/transaction';
import { UnisatProvider } from '@/content-script/pageProvider/index.js';


export class Web3Provider {
  protected readonly provider: UnisatProvider;

  constructor(provider: UnisatProvider) {
    this.provider = provider;
  }

  public async signInteraction(interactionParameters: Omit<IInteractionParameters, 'signer'>): Promise<[string, string]> {

    // TODO: ADD SIGNER
    const params: IInteractionParameters = {
      ...interactionParameters,
      signer: null // Change this.
    }

    return this.provider.signInteraction(params);
  }
}
