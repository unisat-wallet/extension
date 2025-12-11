import { useEffect, useMemo, useRef, useState } from 'react';

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
  preset?: string;
  tabBar?: React.ReactNode;
  onTabClick: (key: string) => void;
}

export function Tabs({ preset, items, defaultActiveKey, activeKey, onTabClick }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultActiveKey);

  const renderedTabs = useRef<Set<string>>(new Set([defaultActiveKey]));

  useEffect(() => {
    setActiveTab(activeKey);
    renderedTabs.current.add(activeKey);
  }, [activeKey]);

  const tabBar = useMemo(() => {
    if (preset == 'style2') {
      return (
        <Row>
          {items.map((item, index) => {
            const isActiveItem = item.key === activeTab;

            return (
              <Column
                key={item.key}
                style={{ borderWidth: 1, borderRadius: 20, backgroundColor: '#322D1F' }}
                color={isActiveItem ? 'gold' : 'white_muted'}
                onClick={() => onTabClick(item.key)}>
                <Text text={item.label} size="xs" color={isActiveItem ? 'gold' : 'white_muted'} mx="md" my="sm" />
              </Column>
            );
          })}
        </Row>
      );
    } else {
      return (
        <Column gap="zero" style={{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: '#070606' }}>
          <Row style={{ padding: 0, height: 50 }}>
            {items.map((item) => {
              const isActiveItem = item.key === activeTab;
              return (
                <Row key={item.key} onClick={() => onTabClick(item.key)} mx="md">
                  <Column gap="zero" justifyCenter itemsCenter>
                    <Text text={item.label} color={isActiveItem ? 'gold' : 'textDim'} size="md" />
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
      );
    }
  }, [items, activeTab, onTabClick, preset]);

  return (
    <Column gap="sm">
      {/* Tab Bar */}
      {tabBar}

      {/* Content */}
      <Column>
        {items.map((item) => {
          if (!renderedTabs.current.has(item.key)) return null;

          const isActive = item.key === activeTab;

          return (
            <Column
              key={item.key}
              style={{
                position: isActive ? 'relative' : 'absolute',
                top: isActive ? 0 : -9999,
                zIndex: isActive ? 1 : 0,
                opacity: isActive ? 1 : 0,
                height: isActive ? 'auto' : 0,
                pointerEvents: isActive ? 'auto' : 'none'
              }}>
              {item.children}
            </Column>
          );
        })}
      </Column>
    </Column>
  );
}
