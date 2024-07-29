import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { Account, Inscription, OpNetBalance, RawTxInfo } from '@/shared/types';
import { Button, Content, Header, Layout, Text } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import { useCurrentAccount } from '@/ui/state/accounts/hooks';
import { useCurrentKeyring } from '@/ui/state/keyrings/hooks';
import { useRunesTx } from '@/ui/state/transactions/hooks';
import { getAddressUtxoDust } from '@unisat/wallet-sdk/lib/transaction';

import { useNavigate } from '../MainRoute';

interface ItemData {
  key: string;
  account?: Account;
}
export default function WrapBitcoinOpnet() {
  const { state } = useLocation();
  const props = state as {
    OpNetBalance: OpNetBalance;
  };

  const account = useCurrentAccount();
  const OpNetBalance = props.OpNetBalance;

  const navigate = useNavigate();
  const runesTx = useRunesTx();
  const [inputAmount, setInputAmount] = useState('');
  const [disabled, setDisabled] = useState(true);
  const [OpnetRateInputVal, adjustFeeRateInput] = useState('800');
  const [getFile, setFile] = useState<File | null>(null);

  const [toInfo, setToInfo] = useState<{
    address: string;
    domain: string;
    inscription?: Inscription;
  }>({
    address: runesTx.toAddress,
    domain: runesTx.toDomain,
    inscription: undefined
  });

  //const [availableBalance, setAvailableBalance] = useState('0');
  const [error, setError] = useState('');

  const defaultOutputValue = 546;

  const [outputValue, setOutputValue] = useState(defaultOutputValue);
  const [amounts, SetAmounts] = useState<Map<string, bigint>>();
  const minOutputValue = useMemo(() => {
    if (toInfo.address) {
      return getAddressUtxoDust(toInfo.address);
    } else {
      return 0;
    }
  }, [toInfo.address]);

  //const fetchUtxos = useFetchUtxosCallback();

  //const fetchAssetUtxosRunes = useFetchAssetUtxosRunesCallback();
  const tools = useTools();

  //const prepareSendRunes = usePrepareSendRunesCallback();
  const [file, ç] = useState<File | null>(null);

  const [feeRate, setFeeRate] = useState(5);
  const [enableRBF, setEnableRBF] = useState(false);
  const [rawTxInfo, setRawTxInfo] = useState<RawTxInfo>();
  const keyring = useCurrentKeyring();
  const items = useMemo(() => {
    const _items: ItemData[] = keyring.accounts.map((v) => {
      return {
        key: v.address,
        account: v
      };
    });
    return _items;
  }, []);

  useEffect(() => {
    setError('');
    setDisabled(false);
    if (getFile) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        const lines = content.split('\n');

        const amounts: Map<string, bigint> = new Map();

        for (let i = 1; i < lines.length; i++) {
          // Start from 1 to skip header
          const [address, amount] = lines[i].split(',');
          if (address && amount) {
            const trimmedAddress = address.trim();
            const trimmedAmount = amount.trim();
            if (/^0x[a-fA-F0-9]{40}$/.test(trimmedAddress) && /^\d+$/.test(trimmedAmount)) {
              amounts.set(trimmedAddress, BigInt(trimmedAmount));
            } else {
              setError('Invalid data format in CSV. Please check your file.');
              setDisabled(true);
              break;
            }
          }
        }

        if (amounts.size > 0) {
          console.log('Parsed amounts:', amounts);
          SetAmounts(amounts);
          // You can use the amounts map here or store it in state for later use
        } else {
          setError('No valid data found in CSV file.');
          setDisabled(true);
        }
      };

      reader.onerror = (error) => {
        setError('Error reading file: ' + error);
        setDisabled(true);
      };

      reader.readAsText(getFile);
    }
    if (!getFile) {
      setDisabled(true);
    }

    // }
  }, [getFile]);

  return (
    <Layout>
      <Header
        onBack={() => {
          window.history.go(-1);
        }}
        title={'Airdrop ' + OpNetBalance.name}
      />
      <Content>
        <Text text="Upload Contract" color="textDim" />
        <Text text={getFile?.name} />

        <div
          style={{
            border: '2px dashed #ccc',
            borderRadius: '4px',
            padding: '20px',
            textAlign: 'center',
            cursor: 'pointer'
          }}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const files = e.dataTransfer.files;
            if (files.length > 0 && files[0].name.endsWith('.wasm')) {
              // Handle the dropped file here
              setFile(files[0]);
              console.log(files[0]);
              console.log('File dropped:', files[0].name);
            } else {
              tools.toastError('Please drop a .wasm file');
            }
          }}>
          <input
            type="file"
            accept=".csv"
            style={{ display: 'none' }}
            onChange={(e) => {
              const files = e.target.files;
              if (files && files.length > 0) {
                // Handle the selected file here
                setFile(files[0]);
                console.log(files[0]);
                console.log('File selected:', files[0].name);
              }
            }}
            id="fileInput"
          />
          <label htmlFor="fileInput" style={{ cursor: 'pointer' }}>
            <Text text="Click to select or drag and drop a .wasm file here" />
          </label>
        </div>
        {error && <Text text={error} color="error" />}

        <Button
          disabled={disabled}
          preset="primary"
          text="Airdrop"
          onClick={(e) => {
            navigate('TxOpnetConfirmScreen', {
              rawTxInfo: {
                items: items,
                account: account,
                inputAmount: inputAmount,
                contractAddress: OpNetBalance.address,
                amounts: amounts,
                address: toInfo.address,
                feeRate: feeRate,
                priorityFee: BigInt(OpnetRateInputVal),
                header: 'Airdrop ',
                networkFee: feeRate,
                features: {
                  rbf: false
                },
                file: getFile,
                inputInfos: [],
                isToSign: false,
                opneTokens: [],
                action: 'airdrop'
              }
            });
          }}></Button>
      </Content>
    </Layout>
  );
}
