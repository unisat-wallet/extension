import { Checkbox } from 'antd';
import BigNumber from 'bignumber.js';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { t } from '@/shared/modules/i18n';
import { RawTxInfo, TokenBalance, TokenInfo, TokenTransfer, TxType } from '@/shared/types';
import { Button, Column, Content, Header, Icon, Input, Layout, Row, Text } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import BRC20Preview from '@/ui/components/BRC20Preview';
import { BRC20Ticker } from '@/ui/components/BRC20Ticker';
import { FeeRateBar } from '@/ui/components/FeeRateBar';
import { RBFBar } from '@/ui/components/RBFBar';
import { RefreshButton } from '@/ui/components/RefreshButton';
import { TabBar } from '@/ui/components/TabBar';
import { TickUsdWithoutPrice, TokenType } from '@/ui/components/TickUsd';
import { useI18n } from '@/ui/hooks/useI18n';
import { useCurrentAccount } from '@/ui/state/accounts/hooks';
import {
  useFetchUtxosCallback,
  usePrepareSendOrdinalsInscriptionCallback,
  usePrepareSendOrdinalsInscriptionsCallback,
  usePushOrdinalsTxCallback
} from '@/ui/state/transactions/hooks';
import { fontSizes } from '@/ui/theme/font';
import { getUiType, showLongNumber, useWallet } from '@/ui/utils';
import { bitcoin } from '@unisat/wallet-sdk/lib/bitcoin-core';
import { getAddressUtxoDust } from '@unisat/wallet-sdk/lib/transaction';

import { SignPsbt } from '../Approval/components';
import { useNavigate } from '../MainRoute';

function Step1({
  contextData,
  updateContextData
}: {
  contextData: ContextData;
  updateContextData: (params: UpdateContextDataParams) => void;
}) {
  const { tokenBalance } = contextData;

  const { t } = useI18n();

  const [disabled, setDisabled] = useState(true);

  useEffect(() => {
    setDisabled(true);
    if (new BigNumber(contextData.transferAmount).lte(0)) {
      return;
    }

    setDisabled(false);
  }, [contextData.transferAmount]);

  const onClickNext = () => {
    updateContextData({
      tabKey: TabKey.STEP2
    });
  };

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

function Step2({
  contextData,
  updateContextData
}: {
  contextData: ContextData;
  updateContextData: (params: UpdateContextDataParams) => void;
}) {
  const fetchUtxos = useFetchUtxosCallback();
  const tools = useTools();
  useEffect(() => {
    tools.showLoading(true);
    fetchUtxos().finally(() => {
      tools.showLoading(false);
    });
  }, []);

  const prepareSendOrdinalsInscriptions = usePrepareSendOrdinalsInscriptionsCallback();
  const prepareSendOrdinalsInscription = usePrepareSendOrdinalsInscriptionCallback();

  const [disabled, setDisabled] = useState(true);

  const [enableRBF, setEnableRBF] = useState(false);
  useEffect(() => {
    setDisabled(true);
    if (!contextData.receiver) {
      return;
    }
    setDisabled(false);
  }, [contextData.receiver]);

  const navigate = useNavigate();
  const onClickNext = async () => {
    try {
      tools.showLoading(true);
      const inscriptionIds = Array.from(contextData.inscriptionIdSet);
      if (inscriptionIds.length === 1) {
        const rawTxInfo = await prepareSendOrdinalsInscription({
          toAddressInfo: { address: contextData.receiver, domain: '' },
          inscriptionId: inscriptionIds[0],
          feeRate: contextData.feeRate,
          outputValue: getAddressUtxoDust(contextData.receiver),
          enableRBF
        });
        navigate('SignOrdinalsTransactionScreen', { rawTxInfo });
      } else {
        const rawTxInfo = await prepareSendOrdinalsInscriptions({
          toAddressInfo: { address: contextData.receiver, domain: '' },
          inscriptionIds,
          feeRate: contextData.feeRate,
          enableRBF
        });
        navigate('SignOrdinalsTransactionScreen', { rawTxInfo });
      }

      // updateContextData({ tabKey: TabKey.STEP3, rawTxInfo: txInfo });
    } catch (e) {
      const error = e as Error;
      console.log(error);
      tools.toastError(error.message);
    } finally {
      tools.showLoading(false);
    }
  };
  const { t } = useI18n();

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
          <Text text={t('fee_rate')} color="textDim" />
          <FeeRateBar
            onChange={(val) => {
              updateContextData({ feeRate: val });
            }}
          />
        </Column>

        <Column mt="lg">
          <RBFBar
            onChange={(val) => {
              setEnableRBF(val);
            }}
          />
        </Column>
      </Column>

      <Button text={t('next')} preset="primary" onClick={onClickNext} disabled={disabled} />
    </Content>
  );
}

function Step3({
  contextData,
  updateContextData
}: {
  contextData: ContextData;
  updateContextData: (params: UpdateContextDataParams) => void;
}) {
  const pushOrdinalsTx = usePushOrdinalsTxCallback();
  const navigate = useNavigate();
  return (
    <SignPsbt
      params={{
        data: {
          psbtHex: contextData.rawTxInfo.psbtHex,
          type: TxType.SIGN_TX,
          options: { autoFinalized: false }
        }
      }}
      handleConfirm={async (res) => {
        try {
          let rawtx = '';

          if (res && res.psbtHex) {
            const psbt = bitcoin.Psbt.fromHex(res.psbtHex);
            try {
              psbt.finalizeAllInputs();
            } catch (e) {
              // ignore
            }
            rawtx = psbt.extractTransaction().toHex();
          } else if (res && res.rawtx) {
            rawtx = res.rawtx;
          } else if (contextData.rawTxInfo.rawtx) {
            rawtx = contextData.rawTxInfo.rawtx;
          } else {
            throw new Error(t('invalid_transaction_data'));
          }

          const { success, txid, error } = await pushOrdinalsTx(rawtx);
          if (success) {
            navigate('TxSuccessScreen', { txid });
          } else {
            throw new Error(error);
          }
        } catch (e) {
          navigate('TxFailScreen', { error: (e as any).message });
        }
      }}
    />
  );
}

enum TabKey {
  STEP1,
  STEP2,
  STEP3
}

interface ContextData {
  tabKey: TabKey;
  tokenBalance: TokenBalance;
  transferAmount: string;
  transferableList: TokenTransfer[];
  inscriptionIdSet: Set<string>;
  feeRate: number;
  receiver: string;
  rawTxInfo: RawTxInfo;
  tokenInfo: TokenInfo;
}

interface UpdateContextDataParams {
  tabKey?: TabKey;
  transferAmount?: string;
  transferableList?: TokenTransfer[];
  inscriptionIdSet?: Set<string>;
  feeRate?: number;
  receiver?: string;
  rawTxInfo?: RawTxInfo;
}

export default function BRC20SendScreen() {
  const { state } = useLocation();
  const props = state as {
    tokenBalance: TokenBalance;
    tokenInfo: TokenInfo;
    selectedInscriptionIds: string[];
    selectedAmount: string;
  };

  const tokenBalance = props.tokenBalance;
  const tokenInfo = props.tokenInfo;
  const selectedInscriptionIds = props.selectedInscriptionIds || [];
  const selectedAmount = props.selectedAmount || '0';

  const [contextData, setContextData] = useState<ContextData>({
    tabKey: TabKey.STEP1,
    tokenBalance,
    transferAmount: selectedAmount,
    transferableList: [],
    inscriptionIdSet: new Set(selectedInscriptionIds),
    feeRate: 5,
    receiver: '',
    rawTxInfo: {
      psbtHex: '',
      rawtx: ''
    },
    tokenInfo: {
      totalSupply: '0',
      totalMinted: '0',
      decimal: 18,
      holder: '',
      inscriptionId: '',
      historyCount: 0,
      holdersCount: 0
    }
  });

  const updateContextData = useCallback(
    (params: UpdateContextDataParams) => {
      setContextData(Object.assign({}, contextData, params));
    },
    [contextData, setContextData]
  );

  const component = useMemo(() => {
    if (contextData.tabKey === TabKey.STEP1) {
      return <Step1 contextData={contextData} updateContextData={updateContextData} />;
    } else if (contextData.tabKey === TabKey.STEP2) {
      return <Step2 contextData={contextData} updateContextData={updateContextData} />;
    } else {
      return <Step3 contextData={contextData} updateContextData={updateContextData} />;
    }
  }, [contextData]);

  const { t } = useI18n();

  const navigate = useNavigate();
  const { isSidePanel } = getUiType();

  return (
    <Layout>
      <Header
        onBack={() => {
          if (contextData.tabKey === TabKey.STEP2) {
            updateContextData({ tabKey: TabKey.STEP1 });
            return;
          }
          window.history.go(-1);
        }}
        title={t('send')}
      />
      <Column bg={isSidePanel ? 'black' : 'transparent'} style={{ flex: 1 }}>
        <Row justifyCenter>
          <TabBar
            progressEnabled
            defaultActiveKey={TabKey.STEP1}
            activeKey={contextData.tabKey}
            items={[
              { key: TabKey.STEP1, label: t('step1') },
              { key: TabKey.STEP2, label: t('step2') }
              // { key: TabKey.STEP3, label: 'Step3' }
            ]}
            onTabClick={(key) => {
              updateContextData({ tabKey: key });
            }}
          />
        </Row>

        <Column style={{ flex: 1 }}>{component}</Column>
      </Column>
    </Layout>
  );
}
