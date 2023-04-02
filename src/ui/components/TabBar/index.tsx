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
}

export function TabBar(props: TabBarProps) {
  const { items, defaultActiveKey, activeKey, onTabClick } = props;

  const [tabKey, setTabKey] = useState(defaultActiveKey);
  useEffect(() => {
    onTabClick(tabKey);
  }, [tabKey]);

  useEffect(() => {
    if (activeKey !== tabKey) {
      setTabKey(activeKey);
    }
  }, [activeKey]);
  return (
    <Row justifyCenter>
      {items.map((v, index) => {
        const isSelected = v.key === tabKey;
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
      })}
    </Row>
  );
}
