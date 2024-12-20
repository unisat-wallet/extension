 
import { useEffect, useState } from 'react';

import { colors } from '@/ui/theme/colors';

import { Column } from '../Column';
import { Row } from '../Row';
import { Text } from '../Text';
import './index.less';

interface TabProps {
    key: string | number;
    label: string;
    hidden?: boolean;
}

interface TabBarProps {
    defaultActiveKey?: string | number;
    activeKey?: string | number;
    items: TabProps[];
    onTabClick: (string) => void;
    progressEnabled?: boolean;
    preset?: 'number-page' | 'default' | 'style1' | 'style2';
}

export function TabBar(props: TabBarProps) {
    const { items, defaultActiveKey, activeKey, onTabClick, progressEnabled, preset } = props;
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

    if (preset == 'number-page') {
        return (
            <Row>
                {items.map((v, index) => {
                    const isSelected = v.key === tabKey;
                    const reach = isSelected; //index <= (tabKey as number);
                    return (
                        <Column
                            key={v.key}
                            style={Object.assign(
                                { width: 20, height: 20 },
                                reach
                                    ? {
                                          backgroundColor: colors.gold
                                      }
                                    : {
                                          backgroundColor: colors.bg2
                                      }
                            )}
                            justifyCenter
                            itemsCenter
                            onClick={() => {
                                setTabKey(v.key);
                            }}>
                            <Text text={v.label} color={'white'} />
                        </Column>
                    );
                })}
            </Row>
        );
    }

    if (preset == 'style1') {
        return (
            <Row gap={'lg'}>
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
                                style={{ padding: '8px' }}
                                classname={isSelected ? 'selected-tab' : ''}
                                onClick={() => {
                                    setTabKey(v.key);
                                }}>
                                <Text
                                    text={v.label}
                                    size={'md'}
                                    preset={isSelected ? 'bold' : 'regular'}
                                    color={isSelected ? 'gold' : 'white'}
                                />
                            </Column>
                        );
                    }
                })}
            </Row>
        );
    }

    // tabbar
    if (preset == 'style2') {
        return (
            <Row>
                {items.map((v, index) => {
                    if (v.hidden) return null;
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
                                style={{ borderWidth: 1, borderRadius: 20, backgroundColor: '#322D1F' }}
                                color={isSelected ? 'gold' : 'white_muted'}
                                onClick={() => {
                                    setTabKey(v.key);
                                }}>
                                <Text
                                    text={v.label}
                                    size="xxs"
                                    color={isSelected ? 'gold' : 'white_muted'}
                                    mx="md"
                                    my="sm"
                                />
                            </Column>
                        );
                    }
                })}
            </Row>
        );
    }
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
