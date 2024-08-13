import randomstring from 'randomstring';

import { createPersistStore } from '@/background/utils';
import { CHAINS_MAP, CHANNEL, VERSION } from '@/shared/constant';
import {
    AddressRunesTokenSummary,
    AddressSummary,
    AddressTokenSummary,
    AppSummary,
    Arc20Balance,
    BitcoinBalance,
    BtcPrice,
    DecodedPsbt,
    FeeSummary,
    InscribeOrder,
    Inscription,
    InscriptionSummary,
    RuneBalance,
    TickPriceItem,
    TokenBalance,
    TokenTransfer,
    UTXO,
    UTXO_Detail,
    VersionDetail,
    WalletConfig
} from '@/shared/types';
import Web3API from '@/shared/web3/Web3API';

import { preferenceService } from '.';

interface OpenApiStore {
    deviceId: string;
    config?: WalletConfig;
}

//enum API_STATUS {
//FAILED = -1,
//SUCCESS = 0
//}

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
    private brc20PriceCache: { [key: string]: { cacheTime: number; data: TickPriceItem } } = {};
    private currentRequestBrc20 = {};
    private runesPriceCache: { [key: string]: { cacheTime: number; data: TickPriceItem } } = {};
    private currentRequestRune = {};

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
            console.log('OpenApiService init success', config);
        } catch (e) {
            console.error(e);
        }
    };

    setClientAddress = (token: string, flag: number) => {
        this.clientAddress = token;
        this.addressFlag = flag;
    };

    getRespData = async (res: any) => {
        let jsonRes: { code: number; msg: string; data: any };

        if (!res) throw new Error('Network error, no response');
        if (res.status !== 200) throw new Error('Network error with status: ' + res.status);
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

    httpGet = async (route: string, params: object, endpoint?: string) => {
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
        headers.append('x-flag', this.addressFlag + '');
        headers.append('x-channel', CHANNEL);
        headers.append('x-udid', this.store.deviceId);
        let res: Response;
        try {
            res = await fetch(new Request(url), { method: 'GET', headers, mode: 'cors', cache: 'default' });
        } catch (err: unknown) {
            const e: Error = err as Error;
            throw new Error('Network error: ' + e && e.message);
        }

        return this.getRespData(res);
    };

    httpPost = async (route: string, params: object) => {
        const url = this.endpoint + route;
        const headers = new Headers();
        headers.append('X-Client', 'OP_WALLET');
        headers.append('X-Version', VERSION);
        headers.append('x-address', this.clientAddress);
        headers.append('x-flag', this.addressFlag + '');
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
        } catch (e: any) {
            throw new Error('Network error: ' + e && e.message);
        }

        return this.getRespData(res);
    };

    async getWalletConfig(): Promise<WalletConfig> {
        return this.httpGet('/v5/default/config', {}, 'https://wallet-api.opnet.org');
    }

    async getAddressSummary(address: string): Promise<AddressSummary> {
        return this.httpGet('/v5/address/summary', {
            address
        });
    }

    async getAddressBalance(address: string): Promise<BitcoinBalance> {
        return this.httpGet('/v5/address/balance', {
            address
        });
    }

    async getMultiAddressAssets(addresses: string): Promise<AddressSummary[]> {
        return this.httpGet('/v5/address/multi-assets', {
            addresses
        });
    }

    async findGroupAssets(
        groups: { type: number; address_arr: string[] }[]
    ): Promise<{ type: number; address_arr: string[]; satoshis_arr: number[] }[]> {
        return this.httpPost('/v5/address/find-group-assets', {
            groups
        });
    }

    async getUnavailableUtxos(address: string): Promise<UTXO[]> {
        return this.httpGet('/v5/address/unavailable-utxo', {
            address
        });
    }

    async getBTCUtxos(address: string): Promise<UTXO[]> {
        return this.httpGet('/v5/address/btc-utxo', {
            address
        });
    }

    async getInscriptionUtxo(inscriptionId: string): Promise<UTXO> {
        return this.httpGet('/v5/inscription/utxo', {
            inscriptionId
        });
    }

    async getInscriptionUtxoDetail(inscriptionId: string): Promise<UTXO_Detail> {
        return this.httpGet('/v5/inscription/utxo-detail', {
            inscriptionId
        });
    }

    async getInscriptionUtxos(inscriptionIds: string[]): Promise<UTXO[]> {
        return this.httpPost('/v5/inscription/utxos', {
            inscriptionIds
        });
    }

    async getInscriptionInfo(inscriptionId: string): Promise<Inscription> {
        return this.httpGet('/v5/inscription/info', {
            inscriptionId
        });
    }

    async getAddressInscriptions(
        address: string,
        cursor: number,
        size: number
    ): Promise<{ list: Inscription[]; total: number }> {
        return this.httpGet('/v5/address/inscriptions', {
            address,
            cursor,
            size
        });
    }

    async getInscriptionSummary(): Promise<InscriptionSummary> {
        return this.httpGet('/v5/default/inscription-summary', {});
    }

    async getAppSummary(): Promise<AppSummary> {
        return this.httpGet('/v5/default/app-summary-v2', {});
    }

    async pushTx(rawtx: string): Promise<string> {
        return this.httpPost('/v5/tx/broadcast', {
            rawtx
        });
    }

    async getFeeSummary(): Promise<FeeSummary> {
        return this.httpGet('/v5/default/fee-summary', {});
    }

    async refreshBtcPrice() {
        try {
            this.isRefreshingBtcPrice = true;
            const result: BtcPrice = await this.httpGet('/v5/default/btc-price', {});
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

    async getBrc20sPrice(ticks: string[]) {
        if (ticks.length < 0) {
            return {};
        }
        const tickLine = ticks.join('');
        if (!tickLine) return {};

        try {
            while (this.currentRequestBrc20[tickLine]) {
                await new Promise((resolve) => setTimeout(resolve, 100));
            }
            this.currentRequestBrc20[tickLine] = true;

            const result = {} as { [key: string]: TickPriceItem };

            for (let i = 0; i < ticks.length; i += 1) {
                const tick = ticks[i];
                const cache = this.brc20PriceCache[tick];
                if (!cache) {
                    break;
                }
                if (cache.cacheTime + 5 * 60 * 1000 > Date.now()) {
                    result[tick] = cache.data;
                }
            }

            if (Object.keys(result).length === ticks.length) {
                return result;
            }

            const resp: { [ticker: string]: TickPriceItem } = await this.httpPost('/v5/market/brc20/price', {
                ticks,
                nftType: 'brc20'
            });

            for (let i = 0; i < ticks.length; i += 1) {
                const tick = ticks[i];
                this.brc20PriceCache[tick] = { cacheTime: Date.now(), data: resp[tick] };
            }
            return resp;
        } finally {
            this.currentRequestBrc20[tickLine] = false;
        }
    }

    async getRunesPrice(ticks: string[]) {
        if (ticks.length < 0) {
            return {};
        }
        const tickLine = ticks.join('');
        if (!tickLine) return {};

        try {
            while (this.currentRequestRune[tickLine]) {
                await new Promise((resolve) => setTimeout(resolve, 100));
            }
            this.currentRequestRune[tickLine] = true;

            const result = {} as { [key: string]: TickPriceItem };

            for (let i = 0; i < ticks.length; i += 1) {
                const tick = ticks[i];
                const cache = this.runesPriceCache[tick];
                if (!cache) {
                    break;
                }
                if (cache.cacheTime + 5 * 60 * 1000 > Date.now()) {
                    result[tick] = cache.data;
                }
            }

            if (Object.keys(result).length === ticks.length) {
                return result;
            }

            const resp: { [ticker: string]: TickPriceItem } = await this.httpPost('/v5/market/runes/price', {
                ticks,
                nftType: 'runes'
            });

            for (let i = 0; i < ticks.length; i += 1) {
                const tick = ticks[i];
                this.runesPriceCache[tick] = { cacheTime: Date.now(), data: resp[tick] };
            }
            return resp;
        } finally {
            this.currentRequestRune[tickLine] = false;
        }
    }

    async getDomainInfo(domain: string): Promise<Inscription> {
        return this.httpGet('/v5/address/search', { domain });
    }

    async inscribeBRC20Transfer(
        address: string,
        tick: string,
        amount: string,
        feeRate: number,
        outputValue: number
    ): Promise<InscribeOrder> {
        return this.httpPost('/v5/brc20/inscribe-transfer', { address, tick, amount, feeRate, outputValue });
    }

    async getInscribeResult(orderId: string): Promise<TokenTransfer> {
        return this.httpGet('/v5/brc20/order-result', { orderId });
    }

    async getBRC20List(
        address: string,
        cursor: number,
        size: number
    ): Promise<{
        list: TokenBalance[];
        total: number;
    }> {
        return this.httpGet('/v5/brc20/list', { address, cursor, size });
    }

    async getBRC20List5Byte(
        address: string,
        cursor: number,
        size: number
    ): Promise<{ list: TokenBalance[]; total: number }> {
        return this.httpGet('/v5/brc20/5byte-list', { address, cursor, size, type: 5 });
    }

    async getAddressTokenSummary(address: string, ticker: string): Promise<AddressTokenSummary> {
        return this.httpGet('/v5/brc20/token-summary', { address, ticker: encodeURIComponent(ticker) });
    }

    async getTokenTransferableList(
        address: string,
        ticker: string,
        cursor: number,
        size: number
    ): Promise<{ list: TokenTransfer[]; total: number }> {
        return this.httpGet('/v5/brc20/transferable-list', {
            address,
            ticker: encodeURIComponent(ticker),
            cursor,
            size
        });
    }

    async decodePsbt(psbtHex: string, website: string): Promise<DecodedPsbt> {
        return this.httpPost('/v5/tx/decode2', { psbtHex, website });
    }

    async getBuyBtcChannelList(): Promise<{ channel: string }[]> {
        return this.httpGet('/v5/buy-btc/channel-list', {});
    }

    async createPaymentUrl(address: string, channel: string): Promise<string> {
        return this.httpPost('/v5/buy-btc/create', { address, channel });
    }

    async checkWebsite(website: string): Promise<{ isScammer: boolean; warning: string }> {
        return this.httpPost('/v5/default/check-website', { website });
    }

    async getOrdinalsInscriptions(
        address: string,
        cursor: number,
        size: number
    ): Promise<{ list: Inscription[]; total: number }> {
        return this.httpGet('/v5/ordinals/inscriptions', {
            address,
            cursor,
            size
        });
    }

    async getAtomicalsNFT(
        address: string,
        cursor: number,
        size: number
    ): Promise<{ list: Inscription[]; total: number }> {
        return this.httpGet('/v5/atomicals/nft', {
            address,
            cursor,
            size
        });
    }

    async getAtomicalsUtxo(atomicalId: string): Promise<UTXO> {
        return this.httpGet('/v5/atomicals/utxo', {
            atomicalId
        });
    }

    async getArc20BalanceList(
        address: string,
        cursor: number,
        size: number
    ): Promise<{ list: Arc20Balance[]; total: number }> {
        return this.httpGet('/v5/arc20/balance-list', { address, cursor, size });
    }

    async getArc20Utxos(address: string, ticker: string): Promise<UTXO[]> {
        return this.httpGet('/v5/arc20/utxos', {
            address,
            ticker
        });
    }

    async getVersionDetail(version: string): Promise<VersionDetail> {
        return this.httpGet('/v5/version/detail', {
            version
        });
    }

    async getRunesList(address: string, cursor: number, size: number): Promise<{ list: RuneBalance[]; total: number }> {
        return this.httpGet('/v5/runes/list', { address, cursor, size });
    }

    async getRunesUtxos(address: string, runeid: string): Promise<UTXO[]> {
        return this.httpGet('/v5/runes/utxos', {
            address,
            runeid
        });
    }

    async getAddressRunesTokenSummary(address: string, runeid: string): Promise<AddressRunesTokenSummary> {
        return this.httpGet(`/v5/runes/token-summary?address=${address}&runeid=${runeid}`, {});
    }
}

export default new OpenApiService();
