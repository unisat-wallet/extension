import { CSSProperties, useEffect, useState } from 'react';

import { colors } from '@/ui/theme/colors';

import { useTools } from '../ActionComponent';
import { Column } from '../Column';
import { Input } from '../Input';
import { Row } from '../Row';
import { Text } from '../Text';

enum FeeRateType {
    CURRENT,
    CUSTOM
}

export function OutputValueBar({
    defaultValue,
    minValue,
    onChange
}: {
    defaultValue: number;
    minValue: number;
    onChange: (val: number) => void;
}) {
    const options = [
        {
            title: 'Current',
            value: defaultValue
        },
        {
            title: 'Custom'
        }
    ];
    const [optionIndex, setOptionIndex] = useState(FeeRateType.CURRENT);
    const [inputVal, setInputVal] = useState('');
    const [currentValue, setCurrentValue] = useState(defaultValue);

    useEffect(() => {
        let val = defaultValue;
        if (optionIndex === FeeRateType.CUSTOM) {
            if (!inputVal) {
                onChange(0);
                setCurrentValue(0);
                return;
            }
            val = parseInt(inputVal);
        } else if ((options.length) > 0 && (options[optionIndex].value)) {
            val = options[optionIndex].value;
        }
        // if (val + '' != inputVal) {
        //   setInputVal(val);
        // }
        onChange(val);
        setCurrentValue(val);
    }, [optionIndex, inputVal]);

    useEffect(() => {
        if (minValue && currentValue < minValue) {
            // setOptionIndex(FeeRateType.CUSTOM);
            // setInputVal(minValue + '');
        }
    }, [minValue, currentValue]);

    const tools = useTools();
    return (
        <Column>
            <Row justifyCenter>
                {options.map((v, index) => {
                    const selected = index === optionIndex;
                    return (
                        <div
                            key={v.title}
                            onClick={() => {
                                if (defaultValue < minValue && index === 0) {
                                    tools.showTip('Can not change to a lower value');
                                    return;
                                }
                                setOptionIndex(index);
                            }}
                            style={Object.assign(
                                {},
                                {
                                    borderWidth: 1,
                                    borderColor: 'rgba(255,255,255,0.3)',
                                    height: 75,
                                    width: 120,
                                    textAlign: 'center',
                                    padding: 4,
                                    borderRadius: 5,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    cursor: 'pointer'
                                } as CSSProperties,
                                selected ? { backgroundColor: colors.primary } : {}
                            )}>
                            <Text text={v.title} color={selected ? 'black' : 'white'} textCenter />
                            {v.value && (
                                <Text
                                    text={`${v.value} sats`}
                                    color={selected ? 'black' : 'white'}
                                    textCenter
                                    size="xs"
                                />
                            )}
                        </div>
                    );
                })}
            </Row>
            {optionIndex === FeeRateType.CUSTOM && (
                <Input
                    preset="amount"
                    disableDecimal
                    placeholder={'sats'}
                    value={inputVal}
                    onAmountInputChange={(val) => {
                        setInputVal(val);
                    }}
                    onBlur={() => {
                        if (inputVal) {
                            const val = parseInt(inputVal || '0') + '';
                            setInputVal(val);
                        }
                    }}
                    autoFocus={true}
                />
            )}
        </Column>
    );
}
