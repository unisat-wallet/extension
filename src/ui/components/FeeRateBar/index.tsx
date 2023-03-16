import { Input } from 'antd';
import { useEffect, useState } from 'react';

import { useWallet } from '@/ui/utils';

enum FeeRateType {
  SLOW,
  AVG,
  FAST,
  CUSTOM
}

export function FeeRateBar({ onChange }: { onChange: (val: number) => void }) {
  const wallet = useWallet();
  const [feeOptions, setFeeOptions] = useState<{ title: string; desc?: string; feeRate?: number }[]>([]);

  useEffect(() => {
    wallet.getFeeSummary().then((v) => {
      setFeeOptions([...v.list, { title: 'Custom' }]);
    });
  }, []);

  const [feeOptionIndex, setFeeOptionIndex] = useState(FeeRateType.AVG);
  const [feeRateInputVal, setFeeRateInputVal] = useState('');

  useEffect(() => {
    let val = 5;
    if (feeOptionIndex === FeeRateType.CUSTOM) {
      val = parseFloat(feeRateInputVal) || 5;
    } else if (feeOptions.length > 0) {
      val = feeOptions[feeOptionIndex].feeRate || 5;
    }
    onChange(val);
  }, [feeOptions, feeOptionIndex, feeRateInputVal]);

  return (
    <div>
      <div className="flex items-center !h-24 mt-2 justify-center">
        {feeOptions.map((v, index) => (
          <div
            key={v.title}
            onClick={() => {
              setFeeOptionIndex(index);
            }}
            className={
              'text-center !h-24 w-40 px-2 py-2 rounded-md mx-2 flex flex-col justify-center cursor-pointer' +
              (index === feeOptionIndex ? ' bg-yellow-300 text-black' : '')
            }
            style={{ borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' }}>
            <div>{v.title}</div>
            {v.feeRate && <div className="text-sm mt-1">{v.feeRate} sat/vB</div>}
            {v.desc && (
              <div className={'text-xs mt-1' + (index === feeOptionIndex ? '' : ' text-soft-white')}>{v.desc}</div>
            )}
          </div>
        ))}
      </div>
      {feeOptionIndex === FeeRateType.CUSTOM && (
        <Input
          className="font-semibold  text-white h-15_5 box default hover !mt-5"
          placeholder={'sat/vB'}
          defaultValue={feeRateInputVal}
          value={feeRateInputVal}
          onChange={async (e) => {
            const val = e.target.value + '';
            setFeeRateInputVal(val);
          }}
          onBlur={() => {
            const val = parseInt(feeRateInputVal) + '';
            setFeeRateInputVal(val);
          }}
          onPressEnter={(e) => {
            const val = parseInt(feeRateInputVal) + '';
            setFeeRateInputVal(val);
          }}
          autoFocus={true}
        />
      )}
    </div>
  );
}
