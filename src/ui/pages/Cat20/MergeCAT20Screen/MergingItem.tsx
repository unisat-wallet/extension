import { Card, Column, Icon, Row, Text } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import { useTxExplorerUrl } from '@/ui/state/settings/hooks';
import { shortAddress } from '@/ui/utils';

export interface MergeItem {
  index: number;
  status: ItemStatus;
  txid?: string;
  error?: string;
  feeRate?: number;
}

export function MergingItem({ item }: { item: MergeItem }) {
  const tools = useTools();
  const txidUrl = useTxExplorerUrl(item.txid || '');

  return (
    <Card style={{ borderRadius: 10, minHeight: 60 }}>
      <Column fullX>
        <Row justifyBetween>
          <Text text={`Transaction ${item.index + 1}`} />
          <MergeItemStatus mergeItem={item} />
        </Row>

        {item.txid && (
          <Row
            itemsCenter
            gap="zero"
            onClick={() => {
              window.open(`${txidUrl}`);
            }}>
            <Text text={`${shortAddress(item.txid) || '--'}`} preset="sub" color="txid_color" mx="sm" />
            <Icon icon="link" color="txid_color" />
            {/* {item.feeRate && <Text text={` ( Fee Rate: ${item.feeRate} sats/vB) `} color="txid_color" size="xs" />} */}
          </Row>
        )}
        {item.error && <Text text={`Merge Failed. (${item.error})`} color="error" />}
      </Column>
    </Card>
  );
}

export enum MergeState {
  None,
  Prepare,
  Running,
  Paused,
  Done
}

export enum ItemStatus {
  pending,
  dealing,
  paused,
  completed
}
function MergeItemStatus({ mergeItem }: { mergeItem: MergeItem }) {
  if (mergeItem.status == ItemStatus.pending) {
    return (
      <Row itemsCenter>
        <Icon icon="history" color="textDim" />
        <Text text={'Pending...'} color="textDim" />
      </Row>
    );
  } else if (mergeItem.status == ItemStatus.dealing) {
    return (
      <Row itemsCenter>
        <Icon icon="circle-check" color="warning" />
        <Text text={'Dealing'} color="warning" />
      </Row>
    );
  } else if (mergeItem.status == ItemStatus.paused) {
    return (
      <Row itemsCenter>
        <Icon icon="paused" color="red" />
        <Text text={'Paused'} color="red" />
      </Row>
    );
  } else if (mergeItem.status == ItemStatus.completed) {
    return (
      <Row itemsCenter>
        <Icon icon="circle-check" color="success" />
        <Text text={'Completed'} color="success" />
      </Row>
    );
  } else {
    return null;
  }
}
