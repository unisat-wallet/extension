import { Input } from 'antd';
import { useEffect, useState } from 'react';

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
    <div>
      <div className="flex items-center !h-24 mt-2 justify-center">
        {options.map((v, index) => (
          <div
            key={v.title}
            onClick={() => {
              setOptionIndex(index);
            }}
            className={
              'text-center !h-24 w-40 px-2 py-2 rounded-md mx-2 flex flex-col justify-center cursor-pointer' +
              (index === optionIndex ? ' bg-yellow-300 text-black' : '')
            }
            style={{ borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' }}>
            <div>{v.title}</div>
            {v.value && <div className="text-sm mt-1">{v.value} sats</div>}
          </div>
        ))}
      </div>
      {optionIndex === FeeRateType.CUSTOM && (
        <Input
          className="font-semibold  text-white h-15_5 box default hover !mt-5"
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
          onPressEnter={(e) => {
            if (inputVal) {
              const val = parseInt(inputVal || '0') + '';
              setInputVal(val);
            }
          }}
          autoFocus={true}
        />
      )}
    </div>
  );
}
