import { Checkbox } from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { RawTxInfo, TokenBalance, TokenTransfer, TxType } from '@/shared/types';
import { Button, Column, Content, Header, Input, Layout, Row, Text } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import BRC20Preview from '@/ui/components/BRC20Preview';
import { FeeRateBar } from '@/ui/components/FeeRateBar';
import { RefreshButton } from '@/ui/components/RefreshButton';
import { TabBar } from '@/ui/components/TabBar';
import { useCurrentAccount } from '@/ui/state/accounts/hooks';
import { useCreateMultiOrdinalsTxCallback, usePushOrdinalsTxCallback } from '@/ui/state/transactions/hooks';
import { colors } from '@/ui/theme/colors';
import { fontSizes } from '@/ui/theme/font';
import { useWallet } from '@/ui/utils';

import { SignPsbt } from '../Approval/components';
import { useNavigate } from '../MainRoute';

function Step1({
  contextData,
  updateContextData
}: {
  contextData: ContextData;
  updateContextData: (params: UpdateContextDataParams) => void;
}) {
  const { tokenBalance, transferAmount } = contextData;

  const navigate = useNavigate();

  const [disabled, setDisabled] = useState(true);

  useEffect(() => {
    setDisabled(true);
    if (contextData.transferAmount <= 0) {
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
    <Content mt="lg">
      <Column full>
        <Column gap="lg" full>
          {/* <Row justifyBetween>
            <Text text="Transfer Amount" color="textDim" />
            <Text text={`${transferAmount} ${tokenBalance.ticker}`} />
          </Row> */}

          <Column>
            <TransferableList contextData={contextData} updateContextData={updateContextData} />
          </Column>

          <Row justifyCenter mt="xxl">
            <Column style={{ width: 250 }}>
              <Column>
                <Column
                  style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 10 }}
                  px="md"
                  py="md"
                  onClick={() => {
                    navigate('InscribeTransferScreen', { ticker: tokenBalance.ticker });
                  }}>
                  <Text text="Inscribe TRANSFER" textCenter preset="bold" />

                  {tokenBalance.availableBalanceUnSafe != '0' ? (
                    <Row justifyCenter>
                      <Text text={'Available '} textCenter color="textDim" size="xs" />
                      <Text text={`${tokenBalance.availableBalanceSafe}  `} textCenter size="xs" />
                      <Text
                        text={` + ${tokenBalance.availableBalanceUnSafe} ${tokenBalance.ticker} `}
                        textCenter
                        color="textDim"
                        size="xs"
                      />
                    </Row>
                  ) : (
                    <Text
                      text={`Available ${tokenBalance.availableBalanceSafe} ${tokenBalance.ticker}`}
                      textCenter
                      color="textDim"
                      size="xs"
                    />
                  )}
                </Column>
                {/* <Button
                  preset="primary"
                  text="Inscribe TRANSFER"
                  onClick={() => {
                    navigate('InscribeTransferScreen', { tokenBalance });
                  }}
                /> */}
                <Row>
                  <Text text={'* To send BRC-20, you have to inscribe a TRANSFER inscription first'} preset="sub" />
                </Row>
              </Column>
            </Column>
          </Row>
        </Column>

        <Button text="Next" preset="primary" onClick={onClickNext} disabled={disabled} />
      </Column>
    </Content>
  );
}

// function Container({ children }) {
//   const isInTab = useExtensionIsInTab();
//   if (isInTab) {
//     return (
//       <Row style={{ flexWrap: 'wrap' }} gap="lg">
//         {children}
//       </Row>
//     );
//   } else {
//     return <Grid columns={2}>{children}</Grid>;
//   }
// }

function TransferableList({
  contextData,
  updateContextData
}: {
  contextData: ContextData;
  updateContextData: (params: UpdateContextDataParams) => void;
}) {
  const wallet = useWallet();
  const currentAccount = useCurrentAccount();

  const [items, setItems] = useState<TokenTransfer[]>([]);
  const [total, setTotal] = useState(0);
  const [pagination, setPagination] = useState({ currentPage: 1, pageSize: 100 });
  const [allSelected, setAllSelected] = useState(false);
  const tools = useTools();
  const fetchData = async () => {
    try {
      tools.showLoading(true);
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
      tools.showLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [pagination]);
  const totalAmount = items.reduce((pre, cur) => pre + parseInt(cur.amount), 0);

  const selectedCount = useMemo(() => contextData.inscriptionIdSet.size, [contextData]);

  return (
    <Column>
      <Column>
        <Text text={'Transfer Amount'} color="textDim" />
        <Text text={`${contextData.transferAmount} ${contextData.tokenBalance.ticker}`} size="xxl" textCenter my="lg" />
      </Column>

      {items.length > 0 ? (
        <Column>
          <Row justifyBetween>
            <Text text={`TRANSFER Inscriptions (${selectedCount}/${items.length})`} color="textDim" />
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
                    const transferAmount = contextData.transferAmount - parseInt(v.amount);
                    updateContextData({
                      inscriptionIdSet,
                      transferAmount
                    });
                    if (allSelected) {
                      setAllSelected(false);
                    }
                  } else {
                    const inscriptionIdSet = new Set(contextData.inscriptionIdSet);
                    inscriptionIdSet.add(v.inscriptionId);
                    const transferAmount = contextData.transferAmount + parseInt(v.amount);
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
                    transferAmount: 0
                  });
                }
              }}
              checked={allSelected}
              style={{ fontSize: fontSizes.sm }}>
              <Text text="Select All" preset="sub" color="white" />
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
            <Text text={'TRANSFER Inscriptions (0)'} color="textDim" />
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
  const createOrdinalsTx = useCreateMultiOrdinalsTxCallback();

  const [disabled, setDisabled] = useState(true);

  useEffect(() => {
    setDisabled(true);
    if (!contextData.receiver) {
      return;
    }
    setDisabled(false);
  }, [contextData.receiver]);

  const tools = useTools();
  const navigate = useNavigate();
  const onClickNext = async () => {
    try {
      tools.showLoading(true);
      const inscriptionIds = Array.from(contextData.inscriptionIdSet);
      const rawTxInfo = await createOrdinalsTx(
        { address: contextData.receiver, domain: '' },
        inscriptionIds,
        contextData.feeRate
      );
      navigate('OrdinalsTxConfirmScreen', { rawTxInfo });
      // updateContextData({ tabKey: TabKey.STEP3, rawTxInfo: txInfo });
    } catch (e) {
      const error = e as Error;
      console.log(error);
      tools.toastError(error.message);
    } finally {
      tools.showLoading(false);
    }
  };
  return (
    <Content mt="lg">
      <Column full>
        <Column>
          <Text text="Send" color="textDim" />
          <Input preset="text" value={`${contextData.transferAmount} ${contextData.tokenBalance.ticker}`} disabled />
        </Column>

        <Column>
          <Text text="Receiver" color="textDim" />
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
          <Text text="Fee Rate" color="textDim" />
          <FeeRateBar
            onChange={(val) => {
              updateContextData({ feeRate: val });
            }}
          />
        </Column>
      </Column>

      <Button text="Next" preset="primary" onClick={onClickNext} disabled={disabled} />
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
          type: TxType.SIGN_TX
        }
      }}
      handleConfirm={() => {
        pushOrdinalsTx(contextData.rawTxInfo.rawtx).then(({ success, txid, error }) => {
          if (success) {
            navigate('TxSuccessScreen', { txid });
          } else {
            navigate('TxFailScreen', { error });
          }
        });
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
  transferAmount: number;
  transferableList: TokenTransfer[];
  inscriptionIdSet: Set<string>;
  feeRate: number;
  receiver: string;
  rawTxInfo: RawTxInfo;
}

interface UpdateContextDataParams {
  tabKey?: TabKey;
  transferAmount?: number;
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
    selectedInscriptionIds: string[];
    selectedAmount: number;
  };

  const tokenBalance = props.tokenBalance;
  const selectedInscriptionIds = props.selectedInscriptionIds || [];
  const selectedAmount = props.selectedAmount || 0;

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
      />
      <Row justifyCenter>
        <TabBar
          progressEnabled
          defaultActiveKey={TabKey.STEP1}
          activeKey={contextData.tabKey}
          items={[
            { key: TabKey.STEP1, label: 'Step1' },
            { key: TabKey.STEP2, label: 'Step2' }
            // { key: TabKey.STEP3, label: 'Step3' }
          ]}
          onTabClick={(key) => {
            updateContextData({ tabKey: key });
          }}
        />
      </Row>

      <Row mt="lg" />
      {component}
    </Layout>
  );
}
