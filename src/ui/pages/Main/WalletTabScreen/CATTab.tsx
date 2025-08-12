import { useMemo, useState } from 'react';

import { CAT_VERSION } from '@/shared/types';
import { Column, Icon, Row, Text } from '@/ui/components';
import { useAppDispatch } from '@/ui/state/hooks';
import { useCATAssetTabKey } from '@/ui/state/ui/hooks';
import { CATAssetTabKey, uiActions } from '@/ui/state/ui/reducer';
import { colors } from '@/ui/theme/colors';

import { CAT20List } from './CAT20List';
import { CAT721List } from './CAT721List';

const MAIN_TAB_KEYS = {
  CAT20: 'CAT20',
  CAT721: 'CAT721'
} as const;

type MainTabKey = (typeof MAIN_TAB_KEYS)[keyof typeof MAIN_TAB_KEYS];

interface TabConfig {
  key: MainTabKey;
  label: string;
  subItems: {
    key: CATAssetTabKey;
    label: string;
    versionLabel: string;
  }[];
}

interface TabDropdownProps {
  tab: TabConfig;
  isExpanded: boolean;
  selectedKey: CATAssetTabKey;
  onToggle: () => void;
  onSelect: (key: CATAssetTabKey) => void;
}

function TabDropdown({ tab, isExpanded, selectedKey, onToggle, onSelect }: TabDropdownProps) {
  const activeSubText = tab.subItems.find((item) => item.key === selectedKey)?.label || '';
  const activeSubVersion = tab.subItems.find((item) => item.key === selectedKey)?.versionLabel || '';

  return (
    <Column style={{ width: 128, position: 'relative' }} itemsCenter gap="zero">
      {activeSubText ? (
        <Row
          onClick={onToggle}
          gap="zero"
          itemsCenter
          style={{
            paddingTop: 6,
            paddingBottom: 6,
            borderColor: colors.gold,
            borderWidth: 1,
            borderRadius: 16,
            backgroundColor: '#322D1F'
          }}
          px="sm">
          <Text
            text={activeSubText}
            mx="md"
            size="xs"
            style={{
              color: colors.gold
            }}
          />
          <Row
            px="md"
            style={{ backgroundImage: 'linear-gradient(103.92deg, #EBB94C 0%, #E97E00 100%)', borderRadius: 10 }}>
            <Text text={activeSubVersion} size="xs" />
          </Row>

          <Icon icon="drop_down" color="textDim" size={10} style={{ marginLeft: 5, marginRight: 5 }} />
        </Row>
      ) : (
        <Row
          onClick={onToggle}
          gap="zero"
          itemsCenter
          style={{
            paddingTop: 6,
            paddingBottom: 6,
            borderColor: colors.border,
            borderWidth: 2,
            borderRadius: 16,
            backgroundColor: 'rgba(255, 255, 255, 0.08)'
          }}
          px="sm">
          <Text
            text={tab.key}
            mx="md"
            size="xs"
            style={{
              color: colors.textDim
            }}
          />
          <Icon icon="drop_down" color="textDim" size={10} style={{ marginRight: 5 }} />
        </Row>
      )}

      {isExpanded && (
        <Column
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            width: '100%',
            borderWidth: 0,
            borderRadius: 8,
            backgroundColor: '#24282F',
            zIndex: 10
          }}
          gap="zero"
          my="sm">
          {tab.subItems.map((subItem) => (
            <Row key={subItem.key} itemsCenter justifyCenter py="sm" px="sm" gap="zero">
              <Text
                key={subItem.key}
                text={subItem.label}
                color={'white_muted'}
                mx="md"
                my="sm"
                size="xs"
                onClick={() => onSelect(subItem.key)}
              />
              <Row
                px="md"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: colors.border
                }}>
                <Text text={subItem.versionLabel} color={'white_muted'} size="xs" />
              </Row>
            </Row>
          ))}
        </Column>
      )}
    </Column>
  );
}

export function CATTab() {
  const currentTabKey = useCATAssetTabKey();
  const dispatch = useAppDispatch();

  const [expandedTab, setExpandedTab] = useState<MainTabKey | null>(null);

  const tabConfigs = useMemo(
    (): TabConfig[] => [
      {
        key: MAIN_TAB_KEYS.CAT20,
        label: 'CAT20',
        subItems: [
          {
            key: CATAssetTabKey.CAT20,
            label: 'CAT20',
            versionLabel: 'V1'
          },
          {
            key: CATAssetTabKey.CAT20_V2,
            label: 'CAT20',
            versionLabel: 'V2'
          }
        ]
      },
      {
        key: MAIN_TAB_KEYS.CAT721,
        label: 'CAT721',
        subItems: [
          {
            key: CATAssetTabKey.CAT721,
            label: 'CAT721',
            versionLabel: 'V1'
          },
          {
            key: CATAssetTabKey.CAT721_V2,
            label: 'CAT721',
            versionLabel: 'V2'
          }
        ]
      }
    ],
    []
  );

  const handleTabToggle = (tabKey: MainTabKey) => {
    setExpandedTab(expandedTab === tabKey ? null : tabKey);
  };

  const handleSubTabSelect = (key: CATAssetTabKey) => {
    dispatch(uiActions.updateAssetTabScreen({ catAssetTabKey: key }));
    setExpandedTab(null);
  };

  const renderActiveChildren = useMemo(() => {
    switch (currentTabKey) {
      case CATAssetTabKey.CAT20:
        return <CAT20List version={CAT_VERSION.V1} />;
      case CATAssetTabKey.CAT20_V2:
        return <CAT20List version={CAT_VERSION.V2} />;
      case CATAssetTabKey.CAT721:
        return <CAT721List version={CAT_VERSION.V1} />;
      case CATAssetTabKey.CAT721_V2:
        return <CAT721List version={CAT_VERSION.V2} />;
      default:
        return null;
    }
  }, [currentTabKey]);

  return (
    <Column>
      <Row justifyBetween>
        <Row gap="zero">
          {tabConfigs.map((tab) => (
            <TabDropdown
              key={tab.key}
              tab={tab}
              isExpanded={expandedTab === tab.key}
              selectedKey={currentTabKey}
              onToggle={() => handleTabToggle(tab.key)}
              onSelect={handleSubTabSelect}
            />
          ))}
        </Row>
      </Row>

      {renderActiveChildren}
    </Column>
  );
}
