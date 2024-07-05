import { IOP_20Contract, JSONRpcProvider, OP_20_ABI, getContract } from 'opnet';
import { useEffect, useState } from 'react';

import { opNetBalance } from '@/shared/types';
import { Column } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import { BaseView } from '@/ui/components/BaseView';
import OpNetBalanceCard from '@/ui/components/OpNetBalanceCard';
import { useCurrentAccount } from '@/ui/state/accounts/hooks';
import { useWallet } from '@/ui/utils';
import { LoadingOutlined } from '@ant-design/icons';

import { useNavigate } from '../../MainRoute';
import { AddOpNetToken } from '../../Wallet/AddOpNetToken';

export function OP_NETList() {
  const navigate = useNavigate();
  const wallet = useWallet();
  const currentAccount = useCurrentAccount();

  const [tokens, setTokens] = useState<any[]>([]);
  const [total, setTotal] = useState(-1);
  const [data, setData] = useState<string>();
  const [pagination, setPagination] = useState({ currentPage: 1, pageSize: 100 });
  const [importTokenBool, setImportTokenBool] = useState(false);

  const tools = useTools();
  const fetchData = async () => {
    try {
      console.log(await wallet.getNetworkType());
      // await wallet.setNetworkType('OPNET');
      console.log(currentAccount.address);
      // const url = 'https://testnet.opnet.org/api/v1/address/get-balance?address=' + currentAccount.address;

      // fetch(url)
      //   .then((response) => response.json())
      //   .then((data) => {
      //     console.log(data);
      //     setData(data);
      //   })
      //   .catch((error) => console.error('Error:', error));

      // setData(data);

      // const rpc = new JSONRpcProvider('https://testnet.opnet.org');
      // console.log(await rpc.getUXTOs(currentAccount.address));
      const tokensImported = localStorage.getItem('tokensImported');
      let parsedTokens: string[] = [];
      if (tokensImported) {
        parsedTokens = JSON.parse(tokensImported);
      }

      const tokenBalances: opNetBalance[] = [];
      for (let i = 0; i < parsedTokens.length; i++) {
        const tokenAddress = parsedTokens[i];
        const provider: JSONRpcProvider = new JSONRpcProvider('https://regtest.opnet.org');

        const contract: IOP_20Contract = getContract<IOP_20Contract>(tokenAddress, OP_20_ABI, provider);
        const contracName = await contract.name();
        const divisibility = await contract.decimals();
        const balance = await contract.balanceOf('bcrt1pnnxvt9l9y4pl3asr3mzmnnx3fll5g2c6xfc4jmxl68umncj7mvcsd9lmq4');
        if ('error' in balance || 'error' in contracName || 'error' in divisibility) {
          console.log(balance);
        } else {
          console.log(contracName);
          tokenBalances.push({
            address: tokenAddress,
            name: contracName.decoded.toLocaleString(),
            amount: balance.decoded[0].toLocaleString(),
            divisibility: parseInt(divisibility.decoded.toLocaleString()),
            symbol: ''
          });
        }
      }
      console.log(tokenBalances);
      setTokens(tokenBalances);
      setTotal(1);
    } catch (e) {
      console.log(e);
      tools.toastError((e as Error).message);
    } finally {
      tools.showLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [pagination, currentAccount.address]);

  if (total === -1) {
    return (
      <Column style={{ minHeight: 150 }} itemsCenter justifyCenter>
        <LoadingOutlined />
      </Column>
    );
  }

  if (total === 0) {
    return (
      <Column style={{ minHeight: 150 }} itemsCenter justifyCenter>
        {data}
      </Column>
    );
  }
  const $footerBaseStyle = {
    display: 'block',
    minHeight: 20,
    paddingBottom: 10
  } as any;
  const $opnet = {
    display: 'block',
    minHeight: 100
  } as any;
  const $style = Object.assign({}, $footerBaseStyle);
  const $style2 = Object.assign({}, $opnet);
  return (
    <div>
      <BaseView style={$style2}>
        {total === 0 ? (
          <>Empty</>
        ) : (
          <>
            {tokens.map((data, index) => {
              return (
                <OpNetBalanceCard
                  key={index}
                  tokenBalance={data}
                  onClick={() => {
                    console.log('');
                  }}
                />
              );
            })}
          </>
        )}
      </BaseView>
      <BaseView style={$style}>
        <div>
          <div onClick={() => setImportTokenBool(true)}>Import Tokens</div>
          <div>Refresh List</div>
        </div>
      </BaseView>
      {importTokenBool && (
        <AddOpNetToken
          onClose={() => {
            setImportTokenBool(false);
          }}
        />
      )}
    </div>
  );
}
