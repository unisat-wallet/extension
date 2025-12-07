import BigNumber from 'bignumber.js';
import { useEffect, useMemo, useState } from 'react';

import { TokenBalance, TokenTransfer } from '@/shared/types';
import { Button, Checkbox, Column, Content, Header, Icon, Input, Layout, Row, Text } from '@/ui/components';
import BRC20Preview from '@/ui/components/BRC20Preview';
import { BRC20Ticker } from '@/ui/components/BRC20Ticker';
import { FeeRateBar } from '@/ui/components/FeeRateBar';
import { RefreshButton } from '@/ui/components/RefreshButton';
import { TabBar } from '@/ui/components/TabBar';
import { TickUsdWithoutPrice, TokenType } from '@/ui/components/TickUsd';
import { fontSizes } from '@/ui/theme/font';
import { showLongNumber } from '@/ui/utils';
import {
  BRC20SendStepParams,
  BRC20SendTabKey,
  ContextData,
  UpdateContextDataParams,
  useBRC20SendScreenLogic,
  useBRC20SendScreenLogicStep1,
  useBRC20SendScreenLogicStep2,
  useBRC20SendScreenLogicStep3,
  useCurrentAccount,
  useI18n,
  useNavigation,
  useTools,
  useWallet
} from '@unisat/wallet-state';

import { getUiType } from '@/ui/web';
import { SignPsbt } from '../Approval/components';
import { useNavigate } from '../MainRoute';

function Step1({ contextData, updateContextData }: BRC20SendStepParams) {
  const { t, disabled, tokenBalance, onClickNext } = useBRC20SendScreenLogicStep1({ contextData, updateContextData });

  return (
    <Content pt="lg">
      <Column full>
        <Column gap="lg" full>
          <Column>
            <TransferableList contextData={contextData} updateContextData={updateContextData} />
          </Column>

          <Row justifyCenter mt="xxl">
            <Column style={{ width: '100%' }}>
              <InscribeTransferButton tokenBalance={tokenBalance} />
            </Column>
          </Row>
        </Column>

        <Button text={t('next')} preset="primary" onClick={onClickNext} disabled={disabled} />
      </Column>
    </Content>
  );
}

const InscribeTransferButton = ({ tokenBalance }: { tokenBalance: TokenBalance }) => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const isSafeBalanceZero = tokenBalance.availableBalanceSafe != '0';

  return (
    <Column fullX>
      <Button
        preset="default"
        onClick={() => {
          navigate('InscribeTransferScreen', { ticker: tokenBalance.ticker });
        }}
        style={{
          width: '100%',
          background: '#1C1C1E',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.5)',
          padding: '16px 14px',
          height: '72px',
          position: 'relative'
        }}>
        <Column style={{ width: '100%' }}>
          <Row style={{ width: '100%' }} justifyBetween itemsCenter>
            <Text text={t('inscribe_transfer')} preset="bold" size="sm" style={{ whiteSpace: 'nowrap' }} />
            <div style={{ opacity: 0.6 }}>
              <Icon icon="arrow-right" size="sm" />
            </div>
          </Row>
          <Row style={{ width: '100%' }} justifyBetween>
            <Text text={t('available')} color="textDim" size="sm" />
            <Row itemsCenter gap="sm">
              <Text text={`${tokenBalance.availableBalanceSafe}  `} color="white" preset="bold" digital />
              {!isSafeBalanceZero && (
                <Text text={` + ${tokenBalance.availableBalanceUnSafe}`} color="textDim" digital />
              )}
            </Row>
          </Row>
        </Column>
      </Button>
      <Row style={{ width: '100%' }} justifyCenter mt="md">
        <Text text={t('to_send_brc20_you_have_to_inscribe_a_transfer_inscription_first')} preset="sub" textCenter />
      </Row>
    </Column>
  );
};

function TransferableList({
  contextData,
  updateContextData
}: {
  contextData: ContextData;
  updateContextData: (params: UpdateContextDataParams) => void;
}) {
  const wallet = useWallet();
  const currentAccount = useCurrentAccount();
  const { t } = useI18n();

  const [items, setItems] = useState<TokenTransfer[]>([]);
  const [total, setTotal] = useState(0);
  const [pagination, setPagination] = useState({ currentPage: 1, pageSize: 100 });
  const [allSelected, setAllSelected] = useState(false);

  const tools = useTools();
  const fetchData = async () => {
    try {
      // tools.showLoading(true);
      const { list, total } = await wallet.getBRC20TransferableList(
        currentAccount.address,
        contextData.tokenBalance.ticker,
        pagination.currentPage,
        pagination.pageSize
      );
      setItems(list);
      setTotal(total);
    } catch (e) {
      tools.toastError((e as Error).message);
    } finally {
      // tools.showLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [pagination]);
  const totalAmount = items.reduce((pre, cur) => new BigNumber(cur.amount).plus(pre), new BigNumber(0)).toString();

  const selectedCount = useMemo(() => contextData.inscriptionIdSet.size, [contextData]);

  return (
    <Column>
      <Column>
        <Text text={t('transfer_amount')} color="textDim" />
        <Row justifyCenter itemsCenter>
          <Text
            text={`${showLongNumber(contextData.transferAmount)}`}
            size="xxl"
            textCenter
            my="lg"
            digital
            style={{
              maxWidth: '85%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              wordBreak: 'break-all',
              fontSize: new BigNumber(contextData.transferAmount).gte(1000000) ? fontSizes.xl : fontSizes.xxl
            }}
          />
          <BRC20Ticker tick={contextData.tokenBalance.ticker} displayName={contextData.tokenBalance.displayName} />
        </Row>
        <Row justifyCenter itemsCenter style={{ marginTop: -12 }}>
          <TickUsdWithoutPrice
            tick={contextData.tokenBalance.ticker}
            balance={contextData.transferAmount}
            type={TokenType.BRC20}
            size={'md'}
          />
        </Row>
      </Column>

      {items.length > 0 ? (
        <Column style={{ marginTop: 16 }}>
          <Row justifyBetween>
            <Text text={`${t('transfer_inscriptions')} (${selectedCount}/${items.length})`} color="textDim" />
          </Row>

          <Row overflowX gap="lg" pb="md">
            {items.map((v, index) => (
              <BRC20Preview
                key={v.inscriptionId}
                tick={v.ticker}
                balance={v.amount}
                inscriptionNumber={v.inscriptionNumber}
                timestamp={v.timestamp}
                selected={contextData.inscriptionIdSet.has(v.inscriptionId)}
                type="TRANSFER"
                onClick={() => {
                  if (contextData.inscriptionIdSet.has(v.inscriptionId)) {
                    const inscriptionIdSet = new Set(contextData.inscriptionIdSet);
                    inscriptionIdSet.delete(v.inscriptionId);
                    const transferAmount = new BigNumber(contextData.transferAmount).minus(new BigNumber(v.amount));
                    updateContextData({
                      inscriptionIdSet,
                      transferAmount: transferAmount.toString()
                    });
                    if (allSelected) {
                      setAllSelected(false);
                    }
                  } else {
                    const inscriptionIdSet = new Set(contextData.inscriptionIdSet);
                    inscriptionIdSet.add(v.inscriptionId);
                    const transferAmount = new BigNumber(contextData.transferAmount)
                      .plus(new BigNumber(v.amount))
                      .toString();
                    updateContextData({
                      inscriptionIdSet,
                      transferAmount
                    });
                    if (allSelected == false && transferAmount === totalAmount) {
                      setAllSelected(true);
                    }
                  }
                }}
              />
            ))}
          </Row>

          <Row justifyEnd>
            <Row mx="md">
              <RefreshButton
                onClick={() => {
                  fetchData();
                }}
              />
            </Row>

            <Checkbox
              onChange={(e) => {
                const val = e.target.checked;
                setAllSelected(val);
                if (val) {
                  const inscriptionIdSet = new Set(items.map((v) => v.inscriptionId));
                  updateContextData({
                    inscriptionIdSet,
                    transferAmount: totalAmount
                  });
                } else {
                  updateContextData({
                    inscriptionIdSet: new Set(),
                    transferAmount: '0'
                  });
                }
              }}
              checked={allSelected}
              style={{ fontSize: fontSizes.sm }}>
              <Text text={t('select_all')} preset="sub" color="white" />
            </Checkbox>
          </Row>

          {/* <Row justifyCenter mt="lg">
        <Pagination
          pagination={pagination}
          total={total}
          onChange={(pagination) => {
            setPagination(pagination);
          }}
        />
      </Row> */}
        </Column>
      ) : (
        <Column>
          <Row justifyBetween>
            <Text text={t('transfer_inscriptions_0')} color="textDim" />
            <RefreshButton
              onClick={() => {
                fetchData();
              }}
            />
          </Row>
        </Column>
      )}
    </Column>
  );
}

function Step2({ contextData, updateContextData }: BRC20SendStepParams) {
  const { t, disabled, onStep2ClickNext } = useBRC20SendScreenLogicStep2({ contextData, updateContextData });
  return (
    <Content mt="lg">
      <Column full>
        <Column>
          <Row justifyBetween>
            <Text text={t('send')} color="textDim" />
            <TickUsdWithoutPrice
              tick={contextData.tokenBalance.ticker}
              balance={contextData.transferAmount}
              type={TokenType.BRC20}
              size={'sm'}
            />
          </Row>
          <Input
            preset="text"
            value={`${showLongNumber(contextData.transferAmount)} ${contextData.tokenBalance.ticker}`}
            disabled
          />
        </Column>

        <Column>
          <Input
            preset="address"
            addressInputData={{
              address: '',
              domain: ''
            }}
            autoFocus={true}
            onAddressInputChange={(val) => {
              updateContextData({ receiver: val.address });
            }}
          />
        </Column>
        <Column>
          <FeeRateBar />
        </Column>
      </Column>

      <Button text={t('next')} preset="primary" onClick={onStep2ClickNext} disabled={disabled} />
    </Content>
  );
}

function Step3(props: BRC20SendStepParams) {
  const { signPsbtParams, onSignPsbtConfirm } = useBRC20SendScreenLogicStep3(props);
  return <SignPsbt params={signPsbtParams} handleConfirm={onSignPsbtConfirm} />;
}

export default function BRC20SendScreen() {
  const { contextData, updateContextData, onHeaderBack, onTabClick } = useBRC20SendScreenLogic();

  const component = useMemo(() => {
    if (contextData.tabKey === BRC20SendTabKey.STEP1) {
      return <Step1 contextData={contextData} updateContextData={updateContextData} />;
    } else if (contextData.tabKey === BRC20SendTabKey.STEP2) {
      return <Step2 contextData={contextData} updateContextData={updateContextData} />;
    } else {
      return <Step3 contextData={contextData} updateContextData={updateContextData} />;
    }
  }, [contextData.tabKey, contextData, updateContextData]);

  const { t } = useI18n();

  const nav = useNavigation();
  const { isSidePanel } = getUiType();

  return (
    <Layout>
      <Header onBack={onHeaderBack} title={t('send')} />
      <Column bg={isSidePanel ? 'black' : 'transparent'} style={{ flex: 1 }}>
        <Row justifyCenter>
          <TabBar
            progressEnabled
            defaultActiveKey={BRC20SendTabKey.STEP1}
            activeKey={contextData.tabKey}
            items={[
              { key: BRC20SendTabKey.STEP1, label: t('step1') },
              { key: BRC20SendTabKey.STEP2, label: t('step2') }
              // { key: TabKey.STEP3, label: 'Step3' }
            ]}
            onTabClick={onTabClick}
          />
        </Row>

        <Column style={{ flex: 1 }}>{component}</Column>
      </Column>
    </Layout>
  );
}
