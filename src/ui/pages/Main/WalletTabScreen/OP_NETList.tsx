import { IOP_20Contract, JSONRpcProvider, OP_20_ABI, getContract } from 'opnet';
import { useEffect, useState } from 'react';

import { opNetBalance } from '@/shared/types';
import { useTools } from '@/ui/components/ActionComponent';
import { BaseView } from '@/ui/components/BaseView';
import OpNetBalanceCard from '@/ui/components/OpNetBalanceCard';
import { useCurrentAccount } from '@/ui/state/accounts/hooks';
import { useWallet } from '@/ui/utils';

import { useNavigate } from '../../MainRoute';
import { AddOpNetToken } from '../../Wallet/AddOpNetToken';

const { AddressType } = require('@unisat/wallet-sdk');
const { bitcoin } = require('@unisat/wallet-sdk/lib/bitcoin-core');
const { NetworkType } = require('@unisat/wallet-sdk/lib/network');

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
      await wallet.getNetworkType();
      await wallet.changeAddressType(AddressType.P2TR);
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
      console.log(currentAccount.address);
      const tokenBalances: opNetBalance[] = [];
      for (let i = 0; i < parsedTokens.length; i++) {
        const tokenAddress = parsedTokens[i];
        const provider: JSONRpcProvider = new JSONRpcProvider('https://regtest.opnet.org');

        const contract: IOP_20Contract = getContract<IOP_20Contract>(tokenAddress, OP_20_ABI, provider);
        const contracName = await contract.name();
        const divisibility = await contract.decimals();
        const symbol = await contract.symbol();

        const balance = await contract.balanceOf(currentAccount.address);
        if ('error' in balance || 'error' in contracName || 'error' in divisibility || 'error' in symbol) {
          console.log(balance);
        } else {
          console.log(balance);
          tokenBalances.push({
            address: tokenAddress,
            name: contracName.decoded.toLocaleString(),
            amount: BigInt(balance.decoded[0].toString()),
            divisibility: parseInt(divisibility.decoded.toString()),
            symbol: symbol.decoded.toString()
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

  // if (total === -1) {
  //   return (
  //     <Column style={{ minHeight: 150 }} itemsCenter justifyCenter>
  //       <LoadingOutlined />
  //     </Column>
  //   );
  // }

  // if (total === 0) {
  //   return (
  //     <Column style={{ minHeight: 150 }} itemsCenter justifyCenter>
  //       {data}
  //     </Column>
  //   );
  // }
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
                <>
                  <OpNetBalanceCard
                    key={index}
                    tokenBalance={data}
                    onClick={() => {
                      navigate('OpNetTokenScreen', {
                        address: data.address
                      });
                    }}
                  />
                  <br />
                </>
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
