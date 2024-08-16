import { CHAINS, CHAINS_MAP, ChainType } from '@/shared/constant';
import { Card, Column, Image, Row, Text } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import { BottomModal } from '@/ui/components/BottomModal';
import { useReloadAccounts } from '@/ui/state/accounts/hooks';
import { useChain, useChangeChainTypeCallback } from '@/ui/state/settings/hooks';
import { colors } from '@/ui/theme/colors';
import { ArrowLeftOutlined, CloseOutlined, RightOutlined } from '@ant-design/icons';
import { useMemo, useState } from 'react';

function ChainItem(props: { selected: boolean, chainType: ChainType, onClick, hasFold?: boolean, disable?: boolean }) {
  const chain = CHAINS_MAP[props.chainType];

  return (
    <Card
      style={{
        backgroundColor: props.disable ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.1)',
        borderRadius: 10,
        borderColor: colors.gold,
        borderWidth: props.selected ? 1 : 0
      }}
      mt="lg"
      onClick={props.onClick}>
      <Row fullX justifyBetween itemsCenter>
        <Row itemsCenter>
          <Image src={chain.icon} size={30} style={{ opacity: props.disable ? 0.7 : 1 }} />
          <Text text={chain.label} color={props.disable ? 'textDim' : 'text'} />
        </Row>
        {
          props.hasFold && <RightOutlined />
        }
      </Row>
    </Card>
  );
}

export const SwitchChainModal = ({ onClose }: { onClose: () => void }) => {
  const chain = useChain();
  const changeChainType = useChangeChainTypeCallback();
  const reloadAccounts = useReloadAccounts();
  const tools = useTools();

  const [foldKey, setFoldKey] = useState<string>();
  const chainsUsed = useMemo(() => {
    const result: any = [];
    const folds = {};
    for (let i = 0; i < CHAINS.length; i += 1) {
      const item = CHAINS[i];
      if (!item.foldIn) {
        result.push(item);
      } else {
        if (!folds[item.foldIn]) {
          folds[item.foldIn] = JSON.parse(JSON.stringify(item));
          result.push(folds[item.foldIn]);
        }
        const fold = folds[item.foldIn];
        if (!fold.children) {
          fold.children = [];
        }

        const foldItem = JSON.parse(JSON.stringify(item));
        delete foldItem.foldIn;
        fold.children.push(foldItem);

      }
    }
    if (foldKey) {
      return folds[foldKey].children;
    }
    return result;
  }, [foldKey]);

  return (
    <BottomModal onClose={onClose}>
      <Column justifyCenter itemsCenter>
        <Row justifyBetween itemsCenter style={{ height: 20 }} fullX>
          {
            foldKey ? <Row onClick={() => {
              setFoldKey('');
            }}>
              <ArrowLeftOutlined />
            </Row> : <Row style={{ width: 18 }} />
          }

          <Text text="Select Network" textCenter size="md" />
          <Row
            onClick={() => {
              onClose();
            }}>
            <CloseOutlined />
          </Row>
        </Row>

        <Row fullX style={{ borderTopWidth: 1, borderColor: colors.border }} mt="md" />

        <Column gap="zero" mt="sm" mb="lg" fullX>
          {chainsUsed.map((v) => (
            <ChainItem
              key={v.enum}
              selected={v.enum == chain.enum && !v.foldIn}
              chainType={v.enum}
              disable={v.disable}
              hasFold={(v.children?.length || 0) > 0}
              onClick={async () => {
                if (v.disable) {
                  return tools.toastError('This network is not available');
                }
                if (v.foldIn) {
                  return setFoldKey(v.foldIn);
                }
                if (v.enum == chain.enum) {
                  return;
                }
                await changeChainType(v.enum);
                reloadAccounts();
                tools.toastSuccess(`Changed to ${v.label}`);
                onClose();
              }}
            />
          ))}
        </Column>
      </Column>
    </BottomModal>
  );
};
