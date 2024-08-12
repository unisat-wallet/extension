import { Button, Card, Column, Content, Header, Icon, Layout, Row, Text } from '@/ui/components';
import { AmountItem, HistoryItem } from '@/ui/pages/Wallet/HistoryScreen/index';
import BigNumber from 'bignumber.js';
import { Divider } from 'antd';
import { btcTosatoshis, satoshisToBTC, shortAddress } from '@/ui/utils';
import { CopyableAddress } from '@/ui/components/CopyableAddress';
import { useChain } from '@/ui/state/settings/hooks';

interface HistoryDetailProps {
  detail: HistoryItem,
  close: () => void
}

export function HistoryDetail({ detail, close }: HistoryDetailProps) {
  const chain = useChain();
  const isReceive = detail.type === 'receive';

  return <Layout style={{
    position: 'fixed',
    top: 0,
    left: 0,
    backgroundColor: 'black'
  }}>
    <Header
      onBack={close}
      title="Transaction Details"
    />
    <Content>
      <Card style={{ justifyContent: 'stretch' }} mt={'lg'}>
        <Column itemsCenter gap={'xl'} style={{ flex: 1 }}>
          {
            detail.confirmations > 0 ? <>
              <Icon icon={'success'} size={40} />
              <Text text={'Transaction Success'} color={'green'} />
            </> : <>
              {/*  unconfirmed*/}
              <Icon icon={'warning'} size={40} color={'warning'}/>
              <Text text={'Unconfirmed'} color={'warning'}/>
            </>
          }

          <Column itemsCenter>

            <AmountItem
              inDetail
              item={{
                ticker: 'BTC',
                value: new BigNumber(detail.btcAmount),
                type: 'BTC',
                div: 0,
                symbol: 'BTC'
              }} />
            {
              detail.extra.map((extraItem, index) => {
                return <AmountItem key={index} item={extraItem} inDetail />;
              })
            }
          </Column>
          <div style={{
            alignSelf: 'stretch',
            borderBottom: '1px dashed rgba(255, 255, 255, 0.10)'
          }} />
          <Column gap={'xl'} style={{ alignSelf: 'stretch' }}>
            <Row justifyBetween>
              <Text text={isReceive?'Received from':'Send To'} color={'textDim'} />
              <CopyableAddress address={detail.address} />
            </Row>
            <Row justifyBetween>
              <Text text={'Transaction ID'} color={'textDim'} />
              <CopyableAddress address={detail.txid} />
            </Row>
            {/*<Row justifyBetween>*/}
            {/*  <Text text={'Outputs'} color={'textDim'} />*/}
            {/*  <Row>*/}
            {/*    <Text*/}
            {/*      text={`${Number(Math.abs(satoshisToBTC(detail.outputValue))).toLocaleString('en', { minimumFractionDigits: 8 })}`}*/}
            {/*    ></Text>*/}
            {/*    <Text text={'BTC'} color={'textDim'} />*/}
            {/*  </Row>*/}
            {/*</Row>*/}
            <Row justifyBetween>
              <Text text={'Network fee'} color={'textDim'} />
              <Row>
                <Text
                  text={`${Number(Math.abs(satoshisToBTC(detail.fee))).toLocaleString('en', { minimumFractionDigits: 8 })}`}
                ></Text>
                <Text text={'BTC'} color={'textDim'} />
              </Row>
            </Row>
            <Row justifyBetween>
              <Text text={'Network fee rate'} color={'textDim'} />
              <Row>
                <Text
                  text={detail.feeRate}
                ></Text>
                <Text text={'sats/vB'} color={'textDim'} />
              </Row>
            </Row>
            <Row justifyBetween>
              <Text text={'Date'} color={'textDim'} />
              <Row>
                <Text text={new Date(detail.timestamp).toLocaleString()} color={'textDim'} />
              </Row>
            </Row>
          </Column>
        </Column>
      </Card>

      <Column gap={'lg'} mt={'lg'}>

        {
          chain.unisatExplorerUrl && <Button text={'View on UniSat Explorer'} preset={'primary'} onClick={() => {
            window.open(`${chain.unisatExplorerUrl}/tx/${detail.txid}`);
          }} />
        }
        {
          chain.okxExplorerUrl && <Button text={'View on OKX Explorer'} onClick={() => {
            window.open(`${chain.okxExplorerUrl}/tx/${detail.txid}`);
          }} />
        }
        {
          chain.mempoolSpaceUrl && <Button text={'View on Mempool'} onClick={() => {
            window.open(`${chain.mempoolSpaceUrl}/tx/${detail.txid}`);
          }} />
        }
      </Column>

    </Content>
  </Layout>;
}