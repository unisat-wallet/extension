import { useEffect, useState } from 'react';

import { IMAGE_SOURCE_MAP } from '@/shared/constant';
import { Card, Column, Icon, Image, Row, Text } from '@/ui/components';
import { BottomModal } from '@/ui/components/BottomModal';
import { colors } from '@/ui/theme/colors';
import { CloseOutlined } from '@ant-design/icons';
import { CHAIN_GROUPS, CHAINS_MAP, TypeChainGroup } from '@unisat/wallet-shared';
import { useChain, useChangeChainTypeCallback, useI18n, useReloadAccounts, useTools } from '@unisat/wallet-state';
import { ChainType } from '@unisat/wallet-types';

function ChainItem(props: { chainType: ChainType; inGroup?: boolean; onClose: () => void }) {
  const chain = CHAINS_MAP[props.chainType];

  const currentChain = useChain();
  const selected = currentChain.enum == chain.enum;
  const changeChainType = useChangeChainTypeCallback();
  const reloadAccounts = useReloadAccounts();
  const tools = useTools();
  const { t } = useI18n();
  return (
    <Card
      style={Object.assign(
        {},
        {
          borderRadius: 10,
          borderColor: colors.gold,
          borderWidth: selected ? 1 : 0
        },
        props.inGroup
          ? { backgroundColor: 'opacity', marginTop: 6 }
          : {
              backgroundColor: chain.disable ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.1)',
              marginTop: 12
            }
      )}
      onClick={async () => {
        if (chain.disable) {
          return tools.toastError(t('this_network_is_not_available'));
        }

        if (currentChain.enum == chain.enum) {
          return;
        }
        await changeChainType(chain.enum);
        props.onClose();
        reloadAccounts();
        tools.toastSuccess(`${t('changed_to_network')} ${chain.label}`);
      }}>
      <Row fullX justifyBetween itemsCenter>
        <Row itemsCenter>
          <Image src={IMAGE_SOURCE_MAP[chain.icon]} size={30} style={{ opacity: chain.disable ? 0.7 : 1 }} />
          <Text text={chain.label} color={chain.disable ? 'textDim' : 'text'} />
        </Row>
      </Row>
    </Card>
  );
}

function ChainGroup(props: { group: TypeChainGroup; onClose: () => void }) {
  const group = props.group;
  const currentChain = useChain();

  const [folded, setFolded] = useState(true);

  useEffect(() => {
    if (group.type === 'list') {
      let defaultFolded = true;
      if (group.items && group.items.find((v) => v.enum == currentChain.enum)) {
        defaultFolded = false;
      }
      setFolded(defaultFolded);
    }
  }, [currentChain]);

  if (group.type === 'single') {
    return <ChainItem chainType={group.chain!.enum} onClose={props.onClose} />;
  } else {
    return (
      <Column>
        <Card
          style={{
            backgroundColor: 'rgba(255,255,255,0.1)',
            borderRadius: 10,
            borderColor: colors.gold,
            borderWidth: 0
          }}
          mt="lg"
          onClick={() => {
            setFolded(!folded);
          }}>
          <Column fullX gap="zero">
            <Row fullX justifyBetween itemsCenter>
              <Row itemsCenter>
                <Image src={IMAGE_SOURCE_MAP[group.icon!]} size={30} />
                <Text text={group.label} color={'text'} />
              </Row>
              {folded ? <Icon icon="down" /> : <Icon icon="up" />}
            </Row>
            {!folded ? (
              <Row
                style={{ borderTopWidth: 1, borderColor: '#FFFFFF1F', alignSelf: 'stretch', width: '100%' }}
                my="md"
              />
            ) : null}

            {!folded ? (
              <Column gap="zero">
                {group.items &&
                  group.items.map((v) => <ChainItem key={v.enum} inGroup chainType={v.enum} onClose={props.onClose} />)}
              </Column>
            ) : null}
          </Column>
        </Card>
      </Column>
    );
  }
}

export const SwitchChainModal = ({ onClose }: { onClose: () => void }) => {
  const { t } = useI18n();
  return (
    <BottomModal onClose={onClose}>
      <Column justifyCenter itemsCenter>
        <Row justifyBetween itemsCenter style={{ height: 20 }} fullX>
          <Text text={t('select_network')} textCenter size="md" />
          <Row
            onClick={() => {
              onClose();
            }}>
            <CloseOutlined />
          </Row>
        </Row>

        <Row fullX style={{ borderTopWidth: 1, borderColor: colors.border }} mt="md" />

        <Column gap="zero" mt="sm" mb="lg" fullX>
          {CHAIN_GROUPS.map((v, index) => (
            <ChainGroup key={'chain_group_' + index} group={v} onClose={onClose} />
          ))}
        </Column>
      </Column>
    </BottomModal>
  );
};
