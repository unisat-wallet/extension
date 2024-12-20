import { CSSProperties, useEffect, useState } from 'react';

import { NetworkType } from '@/shared/types';
import { colors } from '@/ui/theme/colors';
import { useWallet } from '@/ui/utils';

import { Column } from '../Column';
import { Input } from '../Input';
import { Row } from '../Row';
import { Text } from '../Text';

enum FeeRateType {
    SLOW,
    AVG,
    FAST,
    CUSTOM
}

export function FeeRateBar({ readonly, onChange }: { readonly?: boolean; onChange?: (val: number) => void }) {
    const wallet = useWallet();
    const [feeOptions, setFeeOptions] = useState<{ title: string; desc?: string; feeRate: number }[]>([]);

    useEffect(() => {
        const getData = async () => {
            if ((await wallet.getNetworkType()) == NetworkType.REGTEST) {
                const feeArray = [
                    { title: 'Slow', desc: 'Slow', feeRate: 100 },
                    { title: 'Medium', desc: 'Medium', feeRate: 100 },
                    { title: 'Fast', desc: 'Fast', feeRate: 100 }
                ];
                setFeeOptions([...feeArray, { title: 'Custom', feeRate: 0 }]);
            } else {
                wallet.getFeeSummary().then((v) => {
                    const list = readonly ? v.list : [...v.list, { title: 'Custom', feeRate: 0 }];

                    list.forEach((v) => {
                        v.feeRate = v.feeRate < 5 ? (v.feeRate = 5) : v.feeRate;
                        v.feeRate += 10;

                        return v;
                    });

                    console.log('set fee', list);

                    setFeeOptions(list);
                });
            }
        };
        getData();
    }, []);

    const [feeOptionIndex, setFeeOptionIndex] = useState(FeeRateType.AVG);
    const [feeRateInputVal, setFeeRateInputVal] = useState('');

    useEffect(() => {
        const defaultOption = feeOptions[1];
        let val = defaultOption ? defaultOption.feeRate : 15;
        if (feeOptionIndex === FeeRateType.CUSTOM) {
            val = parseFloat(feeRateInputVal) || 0;
        } else if (feeOptions.length > 0) {
            val = feeOptions[feeOptionIndex].feeRate;

            if (val < 5) {
                val = 5;
            }
        }

        onChange?.(val);
    }, [feeOptions, feeOptionIndex, feeRateInputVal]);

    const adjustFeeRateInput = (inputVal: string) => {
        const val = parseFloat(inputVal);
        if (!val) {
            setFeeRateInputVal('');
            return;
        }
        const defaultOption = feeOptions[1];
        const defaultVal = defaultOption ? defaultOption.feeRate : 1;
        if (val <= 0) {
            setFeeRateInputVal(defaultVal.toString());
        }
        setFeeRateInputVal(inputVal);
    };

    return (
        <Column>
            <Row justifyCenter>
                {feeOptions.map((v, index) => {
                    let selected = index === feeOptionIndex as number;
                    if (readonly) {
                        selected = false;
                    }

                    return (
                        <div
                            key={v.title}
                            onClick={() => {
                                if (readonly) {
                                    return;
                                }
                                setFeeOptionIndex(index);
                            }}
                            style={Object.assign(
                                {},
                                {
                                    borderWidth: 1,
                                    borderColor: 'rgba(255,255,255,0.3)',
                                    height: 75,
                                    width: 75,
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
                            <Text text={v.title} textCenter style={{ color: selected ? colors.black : colors.white }} />
                            {v.title !== 'Custom' && (
                                <Text
                                    text={`${v.feeRate} sat/vB`}
                                    size="xxs"
                                    textCenter
                                    style={{ color: selected ? colors.black : colors.white }}
                                />
                            )}
                            {v.title !== 'Custom' && (
                                <Text
                                    text={`${v.desc}`}
                                    size="xxs"
                                    textCenter
                                    style={{ color: selected ? colors.black : colors.white_muted }}
                                />
                            )}
                        </div>
                    );
                })}
            </Row>
            {feeOptionIndex === FeeRateType.CUSTOM && (
                <Input
                    preset="amount"
                    placeholder={'sat/vB'}
                    value={feeRateInputVal}
                    runesDecimal={1}
                    onAmountInputChange={(amount) => {
                        adjustFeeRateInput(amount);
                    }}
                    // onBlur={() => {
                    //   const val = parseInt(feeRateInputVal) + '';
                    //   setFeeRateInputVal(val);
                    // }}
                    autoFocus={true}
                />
            )}
        </Column>
    );
}
