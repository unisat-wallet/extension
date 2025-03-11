import { useState } from 'react';

import { CHAIN_GROUPS, CHAINS_MAP, ChainType, TypeChainGroup } from '@/shared/constant';
import { Card, Column, Icon, Image, Row, Text } from '@/ui/components';
import { BottomModal } from '@/ui/components/BottomModal';
import { useI18n } from '@/ui/hooks/useI18n';
import { colors } from '@/ui/theme/colors';
import { CloseOutlined } from '@ant-design/icons';

function ChainItem(props: {
  chainType: ChainType;
  inGroup?: boolean;
  onClose: () => void;
  onSelect: (chainType: ChainType) => void;
  selectedChainType: ChainType | null;
}) {
  const chain = CHAINS_MAP[props.chainType];
  const selected = props.selectedChainType === props.chainType;

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
      onClick={() => {
        if (chain.disable) {
          return;
        }
        props.onSelect(props.chainType);
        props.onClose();
      }}>
      <Row fullX justifyBetween itemsCenter>
        <Row itemsCenter>
          <Image src={chain.icon} size={30} style={{ opacity: chain.disable ? 0.7 : 1 }} />
          <Text text={chain.label} color={chain.disable ? 'textDim' : 'text'} />
        </Row>
      </Row>
    </Card>
  );
}

function ChainGroup(props: {
  group: TypeChainGroup;
  onClose: () => void;
  onSelect: (chainType: ChainType) => void;
  selectedChainType: ChainType | null;
}) {
  const group = props.group;
  const [folded, setFolded] = useState(true);

  if (group.type === 'single') {
    return (
      <ChainItem
        chainType={group.chain!.enum}
        onClose={props.onClose}
        onSelect={props.onSelect}
        selectedChainType={props.selectedChainType}
      />
    );
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
                <Image src={group.icon} size={30} />
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
                  group.items.map((v) => (
                    <ChainItem
                      key={v.enum}
                      inGroup
                      chainType={v.enum}
                      onClose={props.onClose}
                      onSelect={props.onSelect}
                      selectedChainType={props.selectedChainType}
                    />
                  ))}
              </Column>
            ) : null}
          </Column>
        </Card>
      </Column>
    );
  }
}

export const ContactChainModal = ({
  onClose,
  onSelect,
  selectedChainType,
  hideAllNetworks = false
}: {
  onClose: () => void;
  onSelect: (chainType: ChainType) => void;
  selectedChainType: ChainType | null;
  hideAllNetworks?: boolean;
}) => {
  const { t } = useI18n();
  const handleSelectAll = () => {
    onSelect(null as any);
    onClose();
  };

  const handleSelectNetwork = (chainType: ChainType) => {
    onSelect(chainType);
    onClose();
  };

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
          {/* All Networks Option */}
          {!hideAllNetworks && (
            <Card
              style={{
                borderRadius: 10,
                borderColor: colors.gold,
                borderWidth: selectedChainType === null ? 1 : 0,
                backgroundColor: 'rgba(255,255,255,0.1)',
                marginTop: 12
              }}
              onClick={handleSelectAll}>
              <Row fullX justifyBetween itemsCenter>
                <Row itemsCenter>
                  <Icon icon="bitcoin" size={30} color="gold" />
                  <Text text={t('all_networks')} color="text" />
                </Row>
              </Row>
            </Card>
          )}

          {CHAIN_GROUPS.map((v, index) => (
            <ChainGroup
              key={'chain_group_' + index}
              group={v}
              onClose={onClose}
              onSelect={handleSelectNetwork}
              selectedChainType={selectedChainType}
            />
          ))}
        </Column>
      </Column>
    </BottomModal>
  );
};
