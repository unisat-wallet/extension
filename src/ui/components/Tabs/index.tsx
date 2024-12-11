import { useEffect, useState } from 'react';

import { colors } from '@/ui/theme/colors';

import { Column } from '../Column';
import { Row } from '../Row';
import { Text } from '../Text';

interface TabItem {
  key: string;
  label: string;
  children: React.ReactNode;
}

interface TabsProps {
  defaultActiveKey: string;
  activeKey: string;
  items: TabItem[];
  onTabClick: (key: string) => void;
}

export function Tabs({ items, defaultActiveKey, activeKey, onTabClick }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultActiveKey);

  useEffect(() => {
    setActiveTab(activeKey);
  }, [activeKey]);

  return (
    <Column>
      <Column gap="zero">
        <Row style={{ padding: 0, height: 50 }}>
          {items.map((item) => {
            const isActiveItem = item.key === activeTab;
            return (
              <Row key={item.key} onClick={() => onTabClick(item.key)} mx="md">
                <Column gap="zero" justifyCenter itemsCenter>
                  <Text text={item.label} color={isActiveItem ? 'gold' : 'textDim'} />
                  <Row
                    style={{
                      width: 40,
                      borderBottomWidth: 2,
                      paddingBottom: 10,
                      borderColor: isActiveItem ? colors.gold : colors.transparent
                    }}
                  />
                </Column>
              </Row>
            );
          })}
        </Row>
        <Row
          style={{
            position: 'relative',
            borderBottomWidth: 1,
            borderColor: colors.line,
            left: 0,
            right: 0,
            marginTop: -10
          }}
        />
      </Column>

      {items.find((item) => item.key === activeTab)?.children}
    </Column>
  );
}
