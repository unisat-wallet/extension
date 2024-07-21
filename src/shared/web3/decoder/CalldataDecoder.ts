import { decodeAddLiquidity } from '@/ui/pages/OpNet/decoded/AddLiquidityDecodedInfo';
import { decodeApprove } from '@/ui/pages/OpNet/decoded/ApproveDecodedInfo';
import { decodeTransfer } from '@/ui/pages/OpNet/decoded/TransferDecodedInfo';
import { BinaryReader } from '@btc-vision/bsi-binary';

export enum InteractionType {
  Transfer = '27f576ca',
  Approve = '74e21680',
  TransferFrom = '23b872dd',
  AddLiquidity = 'eb686505'
}

export function selectorToString(calldata: string): string {
  const data = Buffer.from(calldata, 'hex');
  const selector = data.slice(0, 4).toString('hex');

  switch (selector) {
    case InteractionType.Transfer:
      return 'transfer(address,uint256)';
    case InteractionType.Approve:
      return 'approve(address,uint256)';
    case InteractionType.TransferFrom:
      return 'transferFrom(address,address,uint256)';
    case InteractionType.AddLiquidity:
      return 'addLiquidity(address,address,bigint,bigint,bigint,bigint,address,bigint)';
    default:
      return `Unknown Interaction : 0x${selector}`;
  }
}

export interface Decoded {
  readonly selector: string;
}

export function decodeCallData(calldata: string): Decoded | null {
  const data = Buffer.from(calldata, 'hex');
  const reader = new BinaryReader(data);
  reader.setOffset(4);

  const selector = data.slice(0, 4).toString('hex');

  switch (selector) {
    case InteractionType.Transfer:
      return decodeTransfer(selector, reader);
    case InteractionType.Approve:
      return decodeApprove(selector, reader);
    //case InteractionType.TransferFrom:
    // return decodeTransferFrom(selector, reader);
    case InteractionType.AddLiquidity:
      return decodeAddLiquidity(selector, reader);
    default:
      return null;
  }
}
