import { IAtomicalBalanceItem } from '@/background/service/interfaces/api';
import BigNumber from 'bignumber.js';
import { toUnicode } from 'punycode';
import { useLocation } from 'react-router-dom';

export * from './hooks';
export * from './WalletContext';
const UI_TYPE = {
  Tab: 'index',
  Pop: 'popup',
  Notification: 'notification'
};

type UiTypeCheck = {
  isTab: boolean;
  isNotification: boolean;
  isPop: boolean;
};

export const getUiType = (): UiTypeCheck => {
  const { pathname } = window.location;
  return Object.entries(UI_TYPE).reduce((m, [key, value]) => {
    m[`is${key}`] = pathname === `/${value}.html`;

    return m;
  }, {} as UiTypeCheck);
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
    i,
    chr,
    len;
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
      document.execCommand('copy') ? res() : rej();
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
  for (const k in o)
    if (new RegExp(`(${k})`).test(fmt))
      fmt = fmt.replace(RegExp.$1, RegExp.$1.length === 1 ? o[k] : `00${o[k]}`.substr(`${o[k]}`.length));
  return fmt;
}

export function satoshisToAmount(val: number) {
  const num = new BigNumber(val);
  return num.dividedBy(100000000).toFixed(8);
}

export function amountToSatoshis(val: any) {
  const num = new BigNumber(val);
  return num.multipliedBy(100000000).toNumber();
}

export function useLocationState<T>() {
  const { state } = useLocation();
  return state as T;
}



export const calculateFTFundsRequired = (
  numberOfInputs: number,
  numberOfOutputs: number,
  satsByte: number,
  mintDataLength = 0,
  baseTxByteLength = 300
) => {
  // The default base includes assumes 1 input and 1 output with room to spare
  const estimatedTxSizeBytes = baseTxByteLength + mintDataLength;
  const baseInputSize = 36 + 4 + 64;
  const baseOutputSize = 8 + 20 + 4;

  let expectedSatoshisDeposit =
    (estimatedTxSizeBytes +
      numberOfInputs * baseInputSize +
      numberOfOutputs * baseOutputSize) *
    satsByte;
  if (expectedSatoshisDeposit > 0 && expectedSatoshisDeposit < 546) {
    expectedSatoshisDeposit = 546;
  }
  return {
    expectedSatoshisDeposit,
  };
};

export function flattenObject(ob: any = {}) {
  const toReturn: { [key: string]: any } = {};

  for (const i in ob) {
    if (Object.prototype.hasOwnProperty.call(ob, i)) {
      if (typeof ob[i] == "object" && ob[i] !== null) {
        const flatObject = flattenObject(ob[i]);
        for (const x in flatObject) {
          if (Object.prototype.hasOwnProperty.call(flatObject, x)) {
            toReturn[i + "." + x] = flatObject[x];
          }
        }
      } else {
        toReturn[i] = ob[i];
      }
    }
  }
  return toReturn;
}

export function findValueInDeepObject(obj: any, key: string): any | undefined {
  const flattened = flattenObject(obj);
  const found = Object.keys(flattened).find((_key) => _key.includes(key));
  if (found) {
    return flattened[found];
  } else {
    return undefined;
  }
}


export function returnImageType(item: IAtomicalBalanceItem): { type: string; content: string; tag: string } {
  let ct, content, type, tag;
  if (item.realm) {
    type = 'realm';
    tag  = 'Realm';
    content = item.full_realm_name!.toLowerCase().startsWith('xn--')
      ? toUnicode(item.full_realm_name!)
      : item.full_realm_name;
  } else {
    type = 'nft';
    ct = findValueInDeepObject(item.data.mint_data.fields!, '$ct');
    if (ct) {
      if (ct.endsWith('webp')) {
        ct = 'image/webp';
      } else if (ct.endsWith('svg')) {
        ct = 'image/svg+xml';
      } else if (ct.endsWith('png')) {
        ct = 'image/png';
      } else if (ct.endsWith('jpg') || ct.endsWith('jpeg')) {
        ct = 'image/jpeg';
      } else if (ct.endsWith('gif')) {
        ct = 'image/gif';
      }
      const data = findValueInDeepObject(item.data.mint_data.fields!, '$d');
      const b64String = Buffer.from(data, 'hex').toString('base64');
      content = `data:${ct};base64,${b64String}`;
      tag = ct;
    }
  }
  return { type, content, tag };
}
