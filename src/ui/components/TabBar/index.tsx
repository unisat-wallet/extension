import { useEffect, useState } from 'react';

import { Column } from '../Column';
import { Row } from '../Row';
import { Text } from '../Text';
import './index.less';

interface TabProps {
  key: string | number;
  label: string;
}

interface TabBarProps {
  defaultActiveKey?: string | number;
  activeKey?: string | number;
  items: TabProps[];
  onTabClick: (string) => void;
  progressEnabled?: boolean;
}

export function TabBar(props: TabBarProps) {
  const { items, defaultActiveKey, activeKey, onTabClick, progressEnabled } = props;
  const [tabKey, setTabKey] = useState(defaultActiveKey);

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const curIndex = items.findIndex((v) => v.key === tabKey);
    setProgress(curIndex);
    onTabClick(tabKey);
  }, [tabKey]);

  useEffect(() => {
    if (activeKey !== tabKey) {
      setTabKey(activeKey);

      const curIndex = items.findIndex((v) => v.key === activeKey);
      setProgress(curIndex);
    }
  }, [activeKey]);

  return (
    <Row>
      {items.map((v, index) => {
        const isSelected = v.key === tabKey;
        if (progressEnabled && index > progress) {
          return (
            <Column key={v.key}>
              <Text text={v.label} color={'textDim'} />
            </Column>
          );
        } else {
          return (
            <Column
              key={v.key}
              classname={isSelected ? 'selected-tab' : ''}
              onClick={() => {
                setTabKey(v.key);
              }}>
              <Text text={v.label} color={isSelected ? 'gold' : 'white'} />
            </Column>
          );
        }
      })}
    </Row>
  );
}
