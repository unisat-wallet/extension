import { CSSProperties, useEffect, useState } from 'react';

import { colors } from '@/ui/theme/colors';

import { Column } from '../Column';
import { Input } from '../Input';
import { Row } from '../Row';
import { Text } from '../Text';

enum FeeRateType {
  CURRENT,
  CUSTOM
}

export function OutputValueBar({ defaultValue, onChange }: { defaultValue: number; onChange: (val: number) => void }) {
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

  useEffect(() => {
    let val: any = defaultValue;
    if (optionIndex === FeeRateType.CUSTOM) {
      val = parseInt(inputVal);
    } else if (options.length > 0) {
      val = options[optionIndex].value;
    }
    onChange(val);
  }, [optionIndex, inputVal]);

  return (
    <Column>
      <Row justifyCenter>
        {options.map((v, index) => {
          const selected = index === optionIndex;
          return (
            <div
              key={v.title}
              onClick={() => {
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
              {v.value && <Text text={`${v.value} sats`} color={selected ? 'black' : 'white'} textCenter size="xs" />}
            </div>
          );
        })}
      </Row>
      {optionIndex === FeeRateType.CUSTOM && (
        <Input
          placeholder={'sats'}
          defaultValue={inputVal}
          value={inputVal}
          onChange={async (e) => {
            const val = e.target.value + '';
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
