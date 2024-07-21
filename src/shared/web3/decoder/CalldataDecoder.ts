import { BinaryReader } from '@btc-vision/bsi-binary';

export enum InteractionType {
  Transfer = '27f576ca'
}

export function selectorToString(calldata: string): string {
  const data = Buffer.from(calldata, 'hex');
  const selector = data.slice(0, 4).toString('hex');

  switch (selector) {
    case InteractionType.Transfer:
      return 'transfer(address,uint256)';
    case '23b872dd':
      return 'approve(address,uint256)';
    case '095ea7b3':
      return 'transferFrom(address,address,uint256)';
    case '70a08231':
      return 'balanceOf(address)';
    case '313ce567':
      return 'allowance(address,address)';
    default:
      return `Unknown Interaction : 0x${selector}`;
  }
}

export interface Decoded {
  readonly selector: string;
}

export interface DecodedTransfer extends Decoded {
  readonly amount: bigint;
  readonly to: string;
}

export function decodeTransfer(selector: string, reader: BinaryReader): DecodedTransfer {
  let amount = 0n;
  let to = '';
  switch (selector) {
    case InteractionType.Transfer: {
      to = reader.readAddress();
      amount = reader.readU256();
      break;
    }
  }

  return {
    selector,
    amount,
    to
  };
}

export function decodeCallData(calldata: string): Decoded {
  const data = Buffer.from(calldata, 'hex');
  const reader = new BinaryReader(data);
  reader.setOffset(4);

  const selector = data.slice(0, 4).toString('hex');

  switch (selector) {
    case InteractionType.Transfer:
      return decodeTransfer(selector, reader);
    default:
      return {
        selector
      };
  }
}
