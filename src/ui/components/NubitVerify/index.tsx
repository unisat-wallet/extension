import { Row } from '@/ui/components';
import { copyToClipboard, shortAddress } from '@/ui/utils';
import { CopyOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import { useState } from 'react';
import { useTools } from '../ActionComponent';
import { Text } from '../Text';

interface NubitVerifyProps {
  text?: string;
}
export function NubitVerify(props: NubitVerifyProps) {
  const { text } = props;
  const tools = useTools();
  const [verStatus, setVerStatus] = useState(0);
  const [verRes, setVerRes] = useState([
    { name: 'nubit', address: '0000000000000000000330ca389d07a4793abec642ea8d04e93a3ac1e5321ac5' },
    { name: 'auto', address: '0000000000000000000330ca389d07a4793abec642ea8d04e93a3ac1e5321ac5' },
    { name: 'pepe', address: '0000000000000000000330ca389d07a4793abec642ea8d04e93a3ac1e5321ac5' }
  ]);
  const [unVerRes, setUnVerRes] = useState([
    { name: 'Committee Indexer 01 ', address: '0000000000000000000330ca389d07a4793abec642ea8d04e93a3ac1e5321ac5' },
    { name: 'Committee Indexer 02 ', address: '0000000000000000000330ca389d07a4793abec642ea8d04e93a3ac1e5321ac5' },
    { name: 'Committee Indexer 03 ', address: '0000000000000000000330ca389d07a4793abec642ea8d04e93a3ac1e5321ac5' }
  ]);


  return (
    <>
      <Row justifyEnd mt="lg" style={{ marginBottom: '-15px' }}>
        {verStatus === 0 && <div style={{
          fontSize: 14,
          color: '#fff',
          cursor: 'pointer',
          backgroundColor: '#F7931A',
          padding: '3px 5px',
          borderRadius: '5px',
          border: '1px solid #F7931A',
          display: 'flex',
          alignItems: 'center'
        }} onClick={() => {
          setVerStatus(1)
        }}>VERIFY <img src="./images/icons/nubit-ver.svg" height={20} style={{ marginLeft: "3px" }} /></div>}
        {verStatus === 1 &&
          <Tooltip placement="topRight" title={<>
            <Row justifyCenter style={{
              color: '#F7931A',
              fontSize: 12,
            }}>PROOF</Row>
            {verRes?.map((item, index) => {
              return <Row justifyBetween key={index}>
                <div style={{
                  fontSize: 12,
                }}>{item?.name}</div>
                <Row
                  selfItemsCenter
                  itemsCenter
                  onClick={(e) => {
                    copyToClipboard(item?.address).then(() => {
                      tools.toastSuccess('Copied');
                    });
                  }}>
                  <Text text={shortAddress(item?.address)} style={{ color: '#fff', fontSize: 12 }} />
                  <CopyOutlined style={{ color: '#fff', fontSize: 12 }} />
                </Row>
              </Row>
            })}
          </>}>
            <div style={{
              fontSize: 14,
              color: '#03D73E',
              backgroundColor: 'transparent',
              padding: '3px 5px',
              borderRadius: '5px',
              border: '1px solid #03D73E'
            }}>VERIFIED</div>
          </Tooltip>
        }
        {verStatus === 2 &&
          <Tooltip placement="topRight" title={<>
            <Row justifyCenter style={{
              color: '#E10F0F',
              fontSize: 14,
            }}>Inconsistent Discovered</Row>
            {unVerRes?.map((item, index) => {
              return <Row justifyBetween key={index}>
                <div style={{
                  fontSize: 12,
                }}>{item?.name}</div>
                <Row
                  selfItemsCenter
                  itemsCenter
                  onClick={(e) => {
                    copyToClipboard(item?.address).then(() => {
                      tools.toastSuccess('Copied');
                    });
                  }}>
                  <Text text={shortAddress(item?.address)} style={{ color: '#fff', fontSize: 12 }} />
                  <CopyOutlined style={{ color: '#fff', fontSize: 12 }} />
                </Row>
              </Row>
            })}
          </>}>
            <div style={{
              fontSize: 14,
              color: '#E10F0F',
              backgroundColor: 'transparent',
              padding: '3px 5px',
              borderRadius: '5px',
              border: '1px solid #E10F0F'
            }}>UNVERIFIED</div>
          </Tooltip>
        }
      </Row>
      <Row justifyEnd mt="lg">
        <img src="./images/icons/nubit.svg" width={100} />
      </Row>
    </>
  );
}
