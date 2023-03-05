import { Button, Input, Layout } from 'antd';
import { Content, Header } from 'antd/lib/layout/layout';
import { useState } from 'react';

import { ADDRESS_TYPES } from '@/shared/constant';
import CHeader from '@/ui/components/CHeader';
import { useAdvanceState, useUpdateAdvanceStateCallback } from '@/ui/state/global/hooks';

export default function AdvanceOptionsScreen() {
  const adavanceState = useAdvanceState();

  const updateAdvanceState = useUpdateAdvanceStateCallback();
  const hdPathOptions = ADDRESS_TYPES.map((v) => {
    return {
      label: v.name,
      hdPath: v.hdPath
    };
  }).concat([
    {
      label: 'CUSTOM',
      hdPath: ''
    }
  ]);

  const [pathIndex, setPathIndex] = useState(hdPathOptions.findIndex((v) => v.hdPath === adavanceState.hdPath));

  return (
    <Layout className="h-full">
      <Header className="border-white border-opacity-10">
        <CHeader
          onBack={() => {
            window.history.go(-1);
          }}
        />
      </Header>
      <Content style={{ backgroundColor: '#1C1919' }}>
        <div className="flex flex-col items-strech gap-3_75 justify-evenly mx-5 mt-5">
          <div className="flex flex-col px-2 text-2xl font-semibold h-13">{'Derivation Path'}</div>
          {hdPathOptions.map((item, index) => {
            return (
              <Button
                key={index}
                size="large"
                type="default"
                className="p-5 box default btn-88"
                onClick={() => {
                  setPathIndex(index);
                  if (item.hdPath) {
                    updateAdvanceState({ hdPath: item.hdPath, hdName: item.label });
                  }
                }}>
                <div className="flex items-center justify-between text-lg font-semibold">
                  <div className="flex flex-col flex-grow text-left">
                    <div className=" w-60 text-left">{item.label}</div>
                    <div className="font-normal opacity-60">{item.hdPath}</div>
                  </div>

                  {index == pathIndex ? (
                    <span className="w-4 h-4">
                      <img src="./images/check.svg" alt="" />
                    </span>
                  ) : (
                    <></>
                  )}
                </div>
              </Button>
            );
          })}
          {pathIndex == 3 && (
            <Input
              className="font-semibold text-white h-15_5 box default hover"
              placeholder={'Custom Derivation Path'}
              defaultValue={adavanceState.hdPath}
              onChange={async (e) => {
                updateAdvanceState({ hdPath: e.target.value });
              }}
              autoFocus={true}
            />
          )}

          <div className="flex flex-col px-2 text-2xl font-semibold mt-5">{'Phrase (Optional)'}</div>

          <Input
            className="font-semibold text-white h-15_5 box default hover"
            placeholder={'Passphrase'}
            defaultValue={adavanceState.passphrase}
            onChange={async (e) => {
              updateAdvanceState({ passphrase: e.target.value });
            }}
          />
        </div>
      </Content>
    </Layout>
  );
}
