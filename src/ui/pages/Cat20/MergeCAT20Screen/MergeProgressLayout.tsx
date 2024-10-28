import { useState } from 'react';

import { CAT20MergeOrder } from '@/shared/types';
import { Button, Column, Content, Header, Layout, Text } from '@/ui/components';

import { MergeState, MergingItem } from './MergingItem';

export function MergeProgressLayout({
  mergeOrder,
  mergeItems,
  mergeState,
  onContinue
}: {
  mergeOrder: CAT20MergeOrder;
  mergeItems: any;
  mergeState: any;
  onContinue: any;
}) {
  const [hideItems, setHideItems] = useState(false);

  return (
    <Layout>
      <Header
        onBack={() => {
          window.history.go(-1);
        }}
        title="Merge Progress"
      />
      <Content>
        <Text preset="regular" text={`Merge Progress: ${mergeOrder.batchIndex}/${mergeOrder.batchCount}`} />
        <Column overflowY style={{ maxHeight: 300 }}>
          {hideItems
            ? null
            : mergeItems.map((item) => {
                return <MergingItem key={'proc_' + item.index} item={item} />;
              })}
        </Column>

        {mergeState == MergeState.Prepare && (
          <Button
            preset="primary"
            text="Start"
            onClick={(e) => {
              onContinue();
            }}></Button>
        )}

        {mergeState == MergeState.Running && (
          <Button
            disabled={true}
            preset="defaultV2"
            text="Merging..."
            onClick={(e) => {
              // onContinue();
            }}></Button>
        )}

        {mergeState == MergeState.Paused && (
          <Button
            preset="defaultV2"
            text="Quit Merging Process"
            onClick={(e) => {
              window.history.go(-1);
            }}></Button>
        )}

        {mergeState == MergeState.Done && (
          <Button
            preset="primary"
            text="Done"
            onClick={(e) => {
              window.history.go(-1);
            }}></Button>
        )}
      </Content>
    </Layout>
  );
}
