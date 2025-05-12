import { useState } from 'react';

import { SwitchChainModal } from '@/ui/pages/Settings/SwitchChainModal';
import { useChain } from '@/ui/state/settings/hooks';

import { Card } from '../Card';
import { Icon } from '../Icon';
import { Image } from '../Image';
import { Row } from '../Row';
import { Text } from '../Text';

export function SwitchNetworkBar() {
  const [switchChainModalVisible, setSwitchChainModalVisible] = useState(false);

  const chain = useChain();

  return (
    <Card
      preset="style2"
      style={{
        backgroundColor: 'rgba(255,255,255,0.12)',
        height: 28,
        borderRadius: 8,
        padding: '2px 4px',
        gap: 2
      }}>
      <Row
        itemsCenter
        onClick={() => {
          setSwitchChainModalVisible(true);
        }}>
        <Image src={chain.icon} size={22} style={{}} />
        <Text text={chain.iconLabel} color="white" size="xs" />
        <Icon icon="down" color="textDim" size={10} />
      </Row>
      {switchChainModalVisible && (
        <SwitchChainModal
          onClose={() => {
            setSwitchChainModalVisible(false);
          }}
        />
      )}
    </Card>
  );
}
