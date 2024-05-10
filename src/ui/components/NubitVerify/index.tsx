import { Row } from '@/ui/components';
import { useCurrentAccount } from '@/ui/state/accounts/hooks';
import { copyToClipboard } from '@/ui/utils';
import { CopyOutlined, LoadingOutlined } from '@ant-design/icons';
import * as lightIndexer from '@nubit/modular-indexer-light-sdk';
import { Tooltip } from 'antd';
import { useEffect, useState } from 'react';
import { useTools } from '../ActionComponent';
import { Text } from '../Text';

interface NubitVerifyProps {
  tokens: any[];
}

interface verTokenItem {
  name: string;
  proof: string;
}

export function NubitVerify(props: NubitVerifyProps) {

  const { tokens } = props;
  const verTokens: Array<verTokenItem> = []
  const currentAccount = useCurrentAccount();
  const tools = useTools();
  const [verStatus, setVerStatus] = useState(0);
  const [verClick, setVerClick] = useState(false);

  const [verRes, setVerRes] = useState<any>([]);

  const [unVerRes, setUnVerRes] = useState([]);

  const init = async () => {
    const sdk = await lightIndexer.create();
    await sdk.run({
      committeeIndexers: {
        s3: [
          {
            region: "us-west-2",
            bucket: "nubit-modular-indexer-brc-20",
            name: "nubit-official-00"
          }
        ],
        da: []
      },
      verification: {
        bitcoinRPC: "https://bitcoin-mainnet-archive.allthatnode.com",
        metaProtocol: "brc-20",
        minimalCheckpoint: 1
      },
    });

    getLightStatus(sdk)

  }

  const getLightStatus = (sdk: lightIndexer.SDK) => {
    sdk.getStatus()
      .then((res: any) => {
        console.log('lightStatus', res);
        if (res === 'verified') {
          tokens.forEach((item, index) => {
            getLightGetBalanceOfWallet(sdk, index)
          })
          return false
        }
        if (res === 'unverified') {
          getLightGetCurrentCheckpoints(sdk)
          return false
        }
        if (res === 'verifying') {
          setVerStatus(0)
          setTimeout(function () {
            getLightStatus(sdk)
          }, 1000);
        }
      })
      .catch((err: any) => {
        getLightStatus(sdk)
      })
  }

  const getLightGetBalanceOfWallet = (sdk: lightIndexer.SDK, index: number) => {
    sdk.getBalanceOfWallet(tokens[index].ticker, currentAccount.address)
      .then((res: any) => {
        verTokens.push({
          name: tokens[index].ticker,
          proof: res?.proof
        })
        if (verTokens.length == tokens.length) {
          setVerRes(verTokens)
          setVerStatus(1)
        }
      })
      .catch((err: any) => {
        console.log('lightGetBalanceOfWallet', err);
        setVerStatus(0)
        setVerClick(false)
        tools.toastError('Network Unstable, Please Retry Later...');
      })
  }

  const getLightGetCurrentCheckpoints = (sdk: lightIndexer.SDK) => {
    sdk.getCurrentCheckpoints()
      .then((res: any) => {
        setUnVerRes(res)
        setVerStatus(2)
      })
      .catch((err: any) => {
        console.log('lightGetBalanceOfWallet', err);
        setVerStatus(0)
        setVerClick(false)
        tools.toastError('Network Unstable, Please Retry Later...');
      })
  }

  useEffect(() => {
    setVerStatus(0)
    setVerClick(false)
  }, [tokens]);

  return (
    <>
      <Row justifyEnd mt="lg" style={{ marginBottom: '-15px' }}>
        {verStatus === 0 && !verClick && <div style={{
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
          setVerClick(true)
          init()
        }}>
          VERIFY <img src="./images/icons/nubit-ver.svg" height={20} style={{ marginLeft: "3px" }} />
        </div>}
        {verStatus === 0 && verClick && <div style={{
          fontSize: 14,
          color: '#fff',
          backgroundColor: '#F7931A',
          padding: '3px 5px',
          borderRadius: '5px',
          border: '1px solid #F7931A',
          display: 'flex',
          alignItems: 'center'
        }}>
          VERIFY <LoadingOutlined style={{ marginLeft: "3px" }} />
        </div>}
        {verStatus === 1 &&
          <Tooltip placement="topRight" title={<>
            <Row justifyCenter style={{
              color: '#F7931A',
              fontSize: 12,
            }}>PROOF</Row>
            {verRes?.map((item: any, index) => {
              return <Row justifyBetween key={index}>
                <div style={{
                  fontSize: 12,
                }}>{item?.name}</div>
                <Row
                  selfItemsCenter
                  itemsCenter
                  onClick={(e) => {
                    copyToClipboard(item?.proof).then(() => {
                      tools.toastSuccess('Copied');
                    });
                  }}>
                  <Text text={item?.proof.slice(0, 5) + '...' + item?.proof.slice(item?.proof?.length - 15)} style={{ color: '#fff', fontSize: 12 }} />
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
            {unVerRes?.map((item: any, index) => {
              return <Row justifyBetween key={index}>
                <div style={{ fontSize: 12 }}>{item.name}</div>
                <div style={{ color: '#fff', fontSize: 12, overflow: 'hidden' }} >{item.commitment}</div>
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
