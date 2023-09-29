import { HttpProvider } from './http';
import { WSProvider } from './ws';
import { isHttp, isWs } from './utils';

export enum ProviderType {
  http = 'http',
  ws = 'ws',
}

export class Provider {
  static getProvider(provider: string | HttpProvider | WSProvider) {
    try {
      this.getProvider(provider);
      return new Provider(provider);
    } catch (error) {
      throw error;
    }
  }
  public provider: WSProvider | HttpProvider;
  public providerType: ProviderType;
  constructor(url: string | WSProvider | HttpProvider) {
    this.provider = this.onInitSetProvider(url);
    this.providerType = this.getType(this.provider);
  }
  private onInitSetProvider(providerUrl: string | HttpProvider | WSProvider): HttpProvider | WSProvider {
    if (typeof providerUrl === 'string') {
      return isHttp(providerUrl)
        ? new HttpProvider(providerUrl)
        : isWs(providerUrl)
        ? new WSProvider(providerUrl)
        : new HttpProvider(providerUrl);
    }
    try {
      const providerType = this.getType(providerUrl);
      if (providerType === ProviderType.http || providerType === ProviderType.ws) {
        return providerUrl;
      } else {
        throw new Error('cannot get provider type');
      }
    } catch (error) {
      throw error;
    }
  }
  private getType(provider: HttpProvider | WSProvider) {
    if (provider instanceof HttpProvider) {
      return ProviderType.http;
    }
    if (provider instanceof WSProvider) {
      return ProviderType.ws;
    }
    throw new Error('provider is not correct');
  }
}
