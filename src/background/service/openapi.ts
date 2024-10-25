import randomstring from 'randomstring';

import { createPersistStore } from '@/background/utils';
import { CHAINS_MAP, CHANNEL, VERSION } from '@/shared/constant';
import {
    AddressRecentHistory,
    AddressSummary,
    AppSummary,
    BitcoinBalance,
    BtcPrice,
    BuyBtcChannel,
    DecodedPsbt,
    FeeSummary,
    GroupAsset,
    UTXO,
    VersionDetail,
    WalletConfig
} from '@/shared/types';
import Web3API from '@/shared/web3/Web3API';

import { preferenceService } from '.';

interface ApiResponse<T> {
    code: number;
    msg: string;
    data: T;
}

interface OpenApiStore {
    deviceId: string;
    config?: WalletConfig;
}

export class OpenApiService {
    store!: OpenApiStore;
    clientAddress = '';
    addressFlag = 0;
    endpoints: string[] = [];
    endpoint = '';
    config: WalletConfig | null = null;

    private btcPriceCache: number | null = null;
    private btcPriceUpdateTime = 0;
    private isRefreshingBtcPrice = false;

    setEndpoints = async (endpoints: string[]) => {
        this.endpoints = endpoints;
        await this.init();
    };

    init = async () => {
        this.store = await createPersistStore({
            name: 'openapi',
            template: {
                deviceId: randomstring.generate(12)
            }
        });

        const chainType = preferenceService.getChainType();
        Web3API.setNetwork(chainType);

        const chain = CHAINS_MAP[chainType];
        this.endpoint = chain.endpoints[0];

        if (!this.store.deviceId) {
            this.store.deviceId = randomstring.generate(12);
        }

        try {
            const config = await this.getWalletConfig();
            this.config = config;
            if (config.endpoint && config.endpoint !== this.endpoint) {
                this.endpoint = config.endpoint;
            }
        } catch (e) {
            console.error(e);
        }
    };

    setClientAddress = (token: string, flag: number) => {
        this.clientAddress = token;
        this.addressFlag = flag;
    };

    getRespData = async <T>(res: Response): Promise<T> => {
        let jsonRes: ApiResponse<T>;

        if (!res) throw new Error('Network error, no response');
        if (res.status !== 200) throw new Error(`Network error with status: ${res.status}`);
        try {
            jsonRes = await res.json();
        } catch (e) {
            throw new Error('Network error, json parse error');
        }
        if (!jsonRes) throw new Error('Network error,no response data');
        if (jsonRes.code !== 0) {
            // API_STATUS.SUCCESS
            throw new Error(jsonRes.msg);
        }
        return jsonRes.data;
    };

    httpGet = async <T>(route: string, params: object, endpoint?: string): Promise<T> => {
        if (!endpoint) {
            endpoint = this.endpoint;
        }
        let url = endpoint + route;
        let c = 0;
        for (const id in params) {
            if (c == 0) {
                url += '?';
            } else {
                url += '&';
            }
            url += `${id}=${params[id]}`;
            c++;
        }
        const headers = new Headers();
        headers.append('X-Client', 'OP_WALLET');
        headers.append('X-Version', VERSION);
        headers.append('x-address', this.clientAddress);
        headers.append('x-flag', `${this.addressFlag}`);
        headers.append('x-channel', CHANNEL);
        headers.append('x-udid', this.store.deviceId);
        let res: Response;
        try {
            res = await fetch(new Request(url), { method: 'GET', headers, mode: 'cors', cache: 'default' });
        } catch (err: unknown) {
            const e: Error = err as Error;
            throw new Error(`Network error: ${e.message}`);
        }

        return this.getRespData<T>(res);
    };

    httpPost = async <T>(route: string, params: object): Promise<T> => {
        const url = this.endpoint + route;
        const headers = new Headers();
        headers.append('X-Client', 'OP_WALLET');
        headers.append('X-Version', VERSION);
        headers.append('x-address', this.clientAddress);
        headers.append('x-flag', `${this.addressFlag}`);
        headers.append('x-channel', CHANNEL);
        headers.append('x-udid', this.store.deviceId);
        headers.append('Content-Type', 'application/json;charset=utf-8');
        let res: Response;
        try {
            res = await fetch(new Request(url), {
                method: 'POST',
                headers,
                mode: 'cors',
                cache: 'default',
                body: JSON.stringify(params)
            });
        } catch (e) {
            throw new Error(`Network error: ${(e as Error).message}`);
        }

        return this.getRespData<T>(res);
    };

    async getWalletConfig(): Promise<WalletConfig> {
        return this.httpGet<WalletConfig>('/v5/default/config', {}, 'https://wallet-api.opnet.org');
    }

    async getAddressSummary(address: string): Promise<AddressSummary> {
        return this.httpGet<AddressSummary>('/v5/address/summary', {
            address
        });
    }

    async getAddressBalance(address: string): Promise<BitcoinBalance> {
        return this.httpGet<BitcoinBalance>('/v5/address/balance', {
            address
        });
    }

    async findGroupAssets(
        groups: { type: number; address_arr: string[] }[]
    ): Promise<GroupAsset[]> {
        return this.httpPost<GroupAsset[]>('/v5/address/find-group-assets', {
            groups
        });
    }

    async getBTCUtxos(address: string): Promise<UTXO[]> {
        return this.httpGet<UTXO[]>('/v5/address/btc-utxo', {
            address
        });
    }

    async getAppSummary(): Promise<AppSummary> {
        return this.httpGet<AppSummary>('/v5/default/app-summary-v2', {});
    }

    async pushTx(rawtx: string): Promise<string> {
        return this.httpPost<string>('/v5/tx/broadcast', {
            rawtx
        });
    }

    async getFeeSummary(): Promise<FeeSummary> {
        return this.httpGet<FeeSummary>('/v5/default/fee-summary', {});
    }

    async refreshBtcPrice() {
        try {
            this.isRefreshingBtcPrice = true;
            const result: BtcPrice = await this.httpGet<BtcPrice>('/v5/default/btc-price', {});
            // test
            // const result: BtcPrice = await Promise.resolve({ price: 58145.19716040577, updateTime: 1634160000000 });

            this.btcPriceCache = result.price;
            this.btcPriceUpdateTime = Date.now();

            return result.price;
        } finally {
            this.isRefreshingBtcPrice = false;
        }
    }

    async getBtcPrice(): Promise<number> {
        while (this.isRefreshingBtcPrice) {
            await new Promise((resolve) => setTimeout(resolve, 100));
        }

        //   30s cache
        if (this.btcPriceCache && Date.now() - this.btcPriceUpdateTime < 30 * 1000) {
            return this.btcPriceCache;
        }
        // 40s return cache and refresh
        if (this.btcPriceCache && Date.now() - this.btcPriceUpdateTime < 40 * 1000) {
            this.refreshBtcPrice().then();
            return this.btcPriceCache;
        }

        return this.refreshBtcPrice();
    }

    async decodePsbt(psbtHex: string, website: string): Promise<DecodedPsbt> {
        return this.httpPost<DecodedPsbt>('/v5/tx/decode2', { psbtHex, website });
    }

    async getBuyBtcChannelList(): Promise<BuyBtcChannel[]> {
        return this.httpGet<BuyBtcChannel[]>('/v5/buy-btc/channel-list', {});
    }

    async createPaymentUrl(address: string, channel: string): Promise<string> {
        return this.httpPost<string>('/v5/buy-btc/create', { address, channel });
    }

    async checkWebsite(website: string): Promise<{ isScammer: boolean; warning: string }> {
        return this.httpPost<{ isScammer: boolean; warning: string }>('/v5/default/check-website', { website });
    }

    async getVersionDetail(version: string): Promise<VersionDetail> {
        return this.httpGet<VersionDetail>('/v5/version/detail', {
            version
        });
    }

    async getAddressRecentHistory(params: { address: string; start: number; limit: number }): Promise<AddressRecentHistory> {
        return this.httpGet<AddressRecentHistory>('/v5/address/history', params);
    }
}

export default new OpenApiService();
