import { useEffect, useState } from 'react';

import { useNavigate } from '@/ui/pages/MainRoute';
import { useCurrentAccount } from '@/ui/state/accounts/hooks';
import { useChain } from '@/ui/state/settings/hooks';
import {
  useFetchUtxosCallback,
  usePrepareSendBTCCallback,
  useSafeBalance,
  useUtxos
} from '@/ui/state/transactions/hooks';
import { amountToSatoshis } from '@/ui/utils';

import { useTools } from '../ActionComponent';
import { Button } from '../Button';
import { Column } from '../Column';
import { FeeRateBar } from '../FeeRateBar';
import { Popover } from '../Popover';
import { Row } from '../Row';
import { Text } from '../Text';

export const MergeBTCPopover = ({ onClose }: { onClose: () => void }) => {
  const prepareSendBTC = usePrepareSendBTCCallback();

  const currentAccount = useCurrentAccount();

  const fetchUtxos = useFetchUtxosCallback();

  const tools = useTools();

  const safeBalance = useSafeBalance();

  const safeUTXOs = useUtxos();
  useEffect(() => {
    tools.showLoading(true);
    fetchUtxos().finally(() => {
      tools.showLoading(false);
    });
  }, []);

  const [feeRate, setFeeRate] = useState(0);

  const chain = useChain();
  const navigate = useNavigate();
  const onConfirm = async () => {
    const rawTxInfo = await prepareSendBTC({
      toAddressInfo: {
        address: currentAccount.address
      },
      toAmount: amountToSatoshis(safeBalance),
      feeRate,
      enableRBF: true
    });

    navigate('TxConfirmScreen', { rawTxInfo });
  };
  return (
    <Popover onClose={onClose}>
      <Column justifyCenter itemsCenter>
        <Column mt="lg">
          <Text preset="bold" text={`Merge ${chain.unit} UTXOs`} textCenter />
        </Column>

        <Column style={{ marginTop: 8 }} mx="md">
          <Text
            preset="regular"
            text={`Your ${chain.unit} balance have to be merged.This process will merge your UTXOs into one.`}
          />
          <Text preset="regular" text={`Merging UTXOs: ${safeUTXOs.length}`} />
          <Text preset="regular" text={`Merging Amount: ${safeBalance} ${chain.unit} `} />
        </Column>

        <FeeRateBar
          onChange={(val) => {
            setFeeRate(val);
          }}
        />

        <Row full mt="lg">
          <Button
            text="Cancel"
            full
            onClick={(e) => {
              if (onClose) {
                onClose();
              }
            }}
          />

          <Button
            text="Confirm"
            full
            preset="primary"
            onClick={(e) => {
              onConfirm();
            }}
          />
        </Row>
      </Column>
    </Popover>
  );
};
