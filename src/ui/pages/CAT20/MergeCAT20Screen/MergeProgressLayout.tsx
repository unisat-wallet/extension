import { useState } from 'react';

import { CAT20MergeOrder } from '@/shared/types';
import { Button, Column, Content, Header, Layout, Text } from '@/ui/components';
import { useI18n } from '@/ui/hooks/useI18n';

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

  const { t } = useI18n();

  return (
    <Layout>
      <Header
        onBack={() => {
          window.history.go(-1);
        }}
        title={t('merge_progress')}
      />
      <Content>
        <Text preset="regular" text={`${t('merge_progress')}: ${mergeOrder.batchIndex}/${mergeOrder.batchCount}`} />
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
            text={t('start')}
            onClick={(e) => {
              onContinue();
            }}></Button>
        )}

        {mergeState == MergeState.Running && (
          <Button
            disabled={true}
            preset="defaultV2"
            text={t('merging')}
            onClick={(e) => {
              // onContinue();
            }}></Button>
        )}

        {mergeState == MergeState.Paused && (
          <Button
            preset="defaultV2"
            text={t('quit_merging_process')}
            onClick={(e) => {
              window.history.go(-1);
            }}></Button>
        )}

        {mergeState == MergeState.Done && (
          <Button
            preset="primary"
            text={t('done')}
            onClick={(e) => {
              window.history.go(-1);
            }}></Button>
        )}
      </Content>
    </Layout>
  );
}
