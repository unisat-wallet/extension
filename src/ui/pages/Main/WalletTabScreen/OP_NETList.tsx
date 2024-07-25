import { getContract, IOP_20Contract, JSONRpcProvider, OP_20_ABI } from 'opnet';
import { useEffect, useState } from 'react';

import { OpNetBalance } from '@/shared/types';
import Web3API from '@/shared/web3/Web3API';
import { Button, Column, Row } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import { BaseView } from '@/ui/components/BaseView';
import OpNetBalanceCard from '@/ui/components/OpNetBalanceCard';
import { useCurrentAccount } from '@/ui/state/accounts/hooks';
import { useWallet } from '@/ui/utils';
import { LoadingOutlined } from '@ant-design/icons';

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
      Web3API.setNetwork(await wallet.getChainType());

      const tokensImported = localStorage.getItem('tokensImported');
      let parsedTokens: string[] = [];
      if (tokensImported) {
        parsedTokens = JSON.parse(tokensImported);
      }
      const tokenBalances: OpNetBalance[] = [];
      for (let i = 0; i < parsedTokens.length; i++) {
        try {
          const tokenAddress = parsedTokens[i];
          const provider: JSONRpcProvider = Web3API.provider;

          const contract: IOP_20Contract = getContract<IOP_20Contract>(tokenAddress, OP_20_ABI, provider);
          const contracName = await contract.name();
          const divisibility = await contract.decimals();
          const symbol = await contract.symbol();

          const balance = await contract.balanceOf(currentAccount.address);
          if (!('error' in balance || 'error' in contracName || 'error' in divisibility || 'error' in symbol)) {
            tokenBalances.push({
              address: tokenAddress,
              name: contracName.decoded.toLocaleString(),
              amount: BigInt(balance.decoded[0].toString()),
              divisibility: parseInt(divisibility.decoded.toString()),
              symbol: symbol.decoded.toString()
            });
          }
        } catch (e) {
          console.log(`Error processing token at index ${i}:`, e);
          parsedTokens.splice(i, 1);
          localStorage.setItem('tokensImported', JSON.stringify(parsedTokens));
          i--;
        }
      }
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
    paddingBottom: 10,
    fontSize: 12,
    cursor: 'pointer'
  } as any;
  const $opnet = {
    display: 'block',
    minHeight: 100
  } as any;
  const $style = Object.assign({}, $footerBaseStyle);
  const $style2 = Object.assign({}, $opnet);
  return (
    <div>
      <Row justifyBetween mt="lg">
        <>
          <Button
            text="SWAP "
            preset="primary"
            icon="pencil"
            onClick={(e) => {
              navigate('Swap', {});
            }}
            full
          />
        </>
      </Row>
      <br />
      <BaseView style={$style2}>
        {total === 0 ? (
          <>Empty</>
        ) : (
          <>
            {tokens.map((data, index) => {
              return (
                <div key={index}>
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
                </div>
              );
            })}
          </>
        )}
      </BaseView>
      <BaseView style={$style}>
        <Row>
          <Button text="Import Tokens" preset="primary" onClick={() => setImportTokenBool(true)}></Button>
          <br />
          <Button text="Refresh List" preset="primary" onClick={() => fetchData()}></Button>
        </Row>
      </BaseView>
      {importTokenBool && (
        <AddOpNetToken
          setImportTokenBool={setImportTokenBool}
          fetchData={fetchData}
          onClose={() => {
            setImportTokenBool(false);
          }}
        />
      )}
    </div>
  );
}
