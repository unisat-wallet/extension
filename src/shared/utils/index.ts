import BigNumber from 'bignumber.js';
import { keyBy } from 'lodash';

import browser from '@/background/webapi/browser';
import { AddressFlagType, CHAINS, CHAINS_MAP, ChainType, NETWORK_TYPES } from '@/shared/constant';

import BroadcastChannelMessage from './message/broadcastChannelMessage';
import PortMessage from './message/portMessage';

const Message = {
    BroadcastChannelMessage,
    PortMessage
};

declare global {
    const langLocales: Record<string, Record<'message', string>>;
}

const t = (name: string) => browser.i18n.getMessage(name);

const format = (str: string, ...args: (string | number)[]): string => {
    return args.reduce((result: string, replacement) => result.replace('_s_', String(replacement)), str);
};

export { format, Message, t };

const chainsDict = keyBy(CHAINS, 'serverId');
export const getChain = (chainId?: string) => {
    if (!chainId) {
        return null;
    }
    return chainsDict[chainId];
};

// Check if address flag is enabled
export const checkAddressFlag = (currentFlag: number, flag: AddressFlagType): boolean => {
    return Boolean(currentFlag & flag);
};

export function getChainInfo(chainType: ChainType) {
    const chain = CHAINS_MAP[chainType];
    return {
        enum: chainType,
        name: chain.label,
        network: NETWORK_TYPES[chain.networkType].name
    };
}

export function expandToDecimals(n: number | string, decimals: number | string) {
    const amount = new BigNumber(n).multipliedBy(new BigNumber(10).pow(decimals)).decimalPlaces(0);

    return BigInt(amount.toString());
}

export function bigintToDecimal(n: bigint, decimals: number | string): number {
    const divisor = BigInt(10) ** BigInt(decimals);
    const quotient = Number(n) / Number(divisor);
    return quotient;
}

export function addressShortner(address: string) {
    const str = address.slice(0, 4) + '...' + address.slice(address.length - 4, address.length);
    return str;
}
