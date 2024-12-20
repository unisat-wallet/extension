import BigNumber from 'bignumber.js';
import { useLocation } from 'react-router-dom';

export * from './hooks';
export * from './WalletContext';
const UI_TYPE = {
    Tab: 'index',
    Pop: 'popup',
    Notification: 'notification'
};

interface UiTypeCheck {
    isTab: boolean;
    isNotification: boolean;
    isPop: boolean;
}

export const getUiType = (): UiTypeCheck => {
    const { pathname } = window.location;
    return Object.entries(UI_TYPE).reduce<UiTypeCheck>(
        (m, [key, value]) => {
            m[`is${key}`] = pathname === `/${value}.html`;

            return m;
        },
        { isNotification: false, isPop: false, isTab: false }
    );
};

export const hex2Text = (hex: string) => {
    try {
        return hex.startsWith('0x') ? decodeURIComponent(hex.replace(/^0x/, '').replace(/[0-9a-f]{2}/g, '%$&')) : hex;
    } catch {
        return hex;
    }
};

export const getUITypeName = (): string => {
    // need to refact
    const UIType = getUiType();

    if (UIType.isPop) return 'popup';
    if (UIType.isNotification) return 'notification';
    if (UIType.isTab) return 'tab';

    return '';
};

/**
 *
 * @param origin (exchange.pancakeswap.finance)
 * @returns (pancakeswap)
 */
export const getOriginName = (origin: string) => {
    const matches = origin.replace(/https?:\/\//, '').match(/^([^.]+\.)?(\S+)\./);

    return matches ? matches[2] || origin : origin;
};

export const hashCode = (str: string) => {
    if (!str) return 0;
    let hash = 0,
        i: number,
        chr: number,
        len: number;
    if (str.length === 0) return hash;
    for (i = 0, len = str.length; i < len; i++) {
        chr = str.charCodeAt(i);
        hash = (hash << 5) - hash + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
};

export const ellipsisOverflowedText = (str: string, length = 5, removeLastComma = false) => {
    if (str.length <= length) return str;
    let cut = str.substring(0, length);
    if (removeLastComma) {
        if (cut.endsWith(',')) {
            cut = cut.substring(0, length - 1);
        }
    }
    return `${cut}...`;
};

export const satoshisToBTC = (amount: number) => {
    return amount / 100000000;
};

export const btcTosatoshis = (amount: number) => {
    return Math.floor(amount * 100000000);
};

export function shortAddress(address?: string, len = 5) {
    if (!address) return '';
    if (address.length <= len * 2) return address;
    return address.slice(0, len) + '...' + address.slice(address.length - len);
}

export function shortDesc(desc?: string, len = 50) {
    if (!desc) return '';
    if (desc.length <= len) return desc;
    return desc.slice(0, len) + '...';
}

export function shortUtxo(txid: string, vout: number): string {
    return `${txid.slice(0, 8)}...:${vout}}`;
}

export async function sleep(timeSec: number) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(null);
        }, timeSec * 1000);
    });
}

export function isValidAddress(address: string) {
    if (!address) return false;
    return true;
}

export const copyToClipboard = (textToCopy: string | number) => {
    if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(textToCopy.toString());
    } else {
        const textArea = document.createElement('textarea');
        textArea.value = textToCopy.toString();
        textArea.style.position = 'absolute';
        textArea.style.opacity = '0';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        return new Promise<void>((res, rej) => {
            if (document.execCommand('copy')) {
                res();
            } else {
                rej(new Error('Failed to copy text to clipboard'));
            }  
            textArea.remove();
        });
    }
};

export function formatDate(date: Date, fmt = 'yyyy-MM-dd hh:mm:ss') {
    const o = {
        'M+': date.getMonth() + 1,
        'd+': date.getDate(),
        'h+': date.getHours(),
        'm+': date.getMinutes(),
        's+': date.getSeconds(),
        'q+': Math.floor((date.getMonth() + 3) / 3),
        S: date.getMilliseconds()
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, `${date.getFullYear()}`.substr(4 - RegExp.$1.length));
    Object.entries(o).forEach(([k, v]) => {
        if (new RegExp(`(${k})`).test(fmt)) {
            fmt = fmt.replace(
                RegExp.$1,
                RegExp.$1.length === 1 ? String(v) : `00${String(v)}`.substr(String(v).length)
            );
        }
    });
    return fmt;
}

export function satoshisToAmount(val: number) {
    const num = new BigNumber(val);
    return num.dividedBy(100000000).toFixed(8);
}

export function amountToSatoshis(val: string | number) {
    const num = new BigNumber(val);
    return num.multipliedBy(100000000).toNumber();
}

export function useLocationState<T>() {
    const location = useLocation();
    return location.state as T;
}

export function numberWithCommas(value: string, maxFixed: number, isFixed = false) {
    const [integerPart, decimalPart] = value.toString().split('.');
    const integerPartWithCommas = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    if (maxFixed === 0) {
        // no decimal
        return integerPartWithCommas;
    } else if (maxFixed > 0) {
        if (isFixed) {
            // fixed
            return `${integerPartWithCommas}.${(decimalPart || '').substring(0, maxFixed).padEnd(maxFixed, '0')}`;
        } else {
            return decimalPart
                ? `${integerPartWithCommas}.${decimalPart.substring(0, Math.min(maxFixed, decimalPart.length))}`
                : integerPartWithCommas;
        }
    } else {
        // fixed <0 show all decimal
        return decimalPart ? `${integerPartWithCommas}.${decimalPart}` : integerPartWithCommas;
    }
}

export function showLongNumber(num: string | number | undefined, maxFixed = 8, isFixed = false) {
    if (!num || new BigNumber(num).isZero()) return '0';
    if (Math.abs(num as number) < 0.000001 && maxFixed <= 6) {
        let temp = '0.';
        for (let i = 0; i < maxFixed; i += 1) {
            temp += '0';
        }
        return temp;
    }
    return numberWithCommas(num.toString(), maxFixed, isFixed);
}

BigNumber.config({ EXPONENTIAL_AT: 1e9, DECIMAL_PLACES: 38 });
