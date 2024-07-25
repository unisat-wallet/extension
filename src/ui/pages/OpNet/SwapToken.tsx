import { getContract, IMotoswapRouterContract, IOP_20Contract, MOTOSWAP_ROUTER_ABI, OP_20_ABI } from 'opnet';
import { CSSProperties, useState } from 'react';

import { OpNetBalance } from '@/shared/types';
import Web3API from '@/shared/web3/Web3API';
import { ContractInformation } from '@/shared/web3/interfaces/ContractInformation';
import { Button, Column, Content, Header, Icon, Layout, Row, Select } from '@/ui/components';
import { BaseView } from '@/ui/components/BaseView';
import { useCurrentAccount } from '@/ui/state/accounts/hooks';
import { fontSizes } from '@/ui/theme/font';
import { useWallet } from '@/ui/utils';
import { LoadingOutlined } from '@ant-design/icons';
import '@btc-vision/transaction';
import { MOTO_ADDRESS_REGTEST, ROUTER_ADDRESS_REGTEST, WBTC_ADDRESS_REGTEST } from '@btc-vision/transaction';

export default function Swap() {
  const [loading, setLoading] = useState(true);
  const [switchOptions, setSwitchOptions] = useState<OpNetBalance[]>([]);
  const [selectedOption, setSelectedOption] = useState<OpNetBalance | null>(null);

  const [inputAmount, setInputAmount] = useState<string>('0');
  const wallet = useWallet();
  const currentAccount = useCurrentAccount();

  const handleSelect = (option) => {
    setSelectedOption(option);
    console.log('Selected option:', option);
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Allow empty input, numbers, and one decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      if (selectedOption) {
        const maxBalance = Number(selectedOption.amount) / Math.pow(10, selectedOption.divisibility);

        // If the input is not empty and is a valid number
        if (value !== '' && value !== '.') {
          const numericValue = parseFloat(value);

          if (numericValue <= maxBalance) {
            setInputAmount(value);
          } else {
            setInputAmount(maxBalance.toString());
          }
        } else {
          // Allow empty input or just a decimal point
          setInputAmount(value);
        }
      } else {
        // If no option is selected, just set the input value
        setInputAmount(value);
      }
    }
  };
  const $searchInputStyle = {
    width: '30%',
    padding: 8,
    fontSize: fontSizes.xs,
    border: 'none',
    borderRadius: 0,
    outline: 'none',
    height: '42px',
    backgroundColor: '#2a2626'

    // color: colors.text
  } as CSSProperties;
  const $styleBox = {
    width: '100%',
    maxWidth: '350px',
    marginRight: 'auto',
    marginLeft: 'auto',
    backgroundColor: '#2a2626',
    borderRadius: '10px',
    border: 'solid 1px white',
    padding: '20px'
  } as CSSProperties;
  const $columnstyle = {
    padding: '20px'
  } as CSSProperties;
  const $styleButton = {
    maxWidth: '400px',
    marginRight: 'auto',
    marginLeft: 'auto'
  } as CSSProperties;
  const $style = Object.assign({}, $styleBox);

  useState(() => {
    const getData = async () => {
      console.log(await wallet.getChainType());
      Web3API.setNetwork(await wallet.getChainType());
      const parsedTokens = [WBTC_ADDRESS_REGTEST, MOTO_ADDRESS_REGTEST];

      const tokenBalances: OpNetBalance[] = [];
      for (let i = 0; i < parsedTokens.length; i++) {
        try {
          const tokenAddress = parsedTokens[i];
          const provider = Web3API.provider;
          const contract: IOP_20Contract = getContract<IOP_20Contract>(tokenAddress, OP_20_ABI, provider);
          const contractInfo: ContractInformation | undefined = await Web3API.queryContractInformation(tokenAddress);

          const balance = await contract.balanceOf(currentAccount.address);
          if (!('error' in balance)) {
            console.log(contractInfo?.logo);
            tokenBalances.push({
              address: tokenAddress,
              name: contractInfo?.name || '',
              amount: BigInt(balance.decoded[0].toString()),
              divisibility: contractInfo?.decimals || 8,
              symbol: contractInfo?.symbol,
              logo: contractInfo?.logo
            });
          }
        } catch (e) {
          console.log(`Error processing token at index ${i}:`, e);
        }
      }
      setSwitchOptions(tokenBalances);
      // // const foundObject = rawTxInfo.items.find((obj) => obj.account && obj.account.address === rawTxInfo.account.address);
      // // const wifWallet = await wallet.getInternalPrivateKey(foundObject?.account as Account);
      // // const walletGet: Wallet = Wallet.fromWif(wifWallet.wif, networks.regtest);

      // const getSwap: IMotoswapPoolContract = getContract<IMotoswapPoolContract>(
      //   Web3API.WBTC,
      //   WBTC_ABI,
      //   Web3API.provider,
      //   'bcrt1p2m2yz9hae5lkypuf8heh6udnt0tchmxhaftcfslqsr5vrwzh34yqgn6hs6'
      // );
      // console.log(getSwap);

      const getQuote: IMotoswapRouterContract = getContract<IMotoswapRouterContract>(
        ROUTER_ADDRESS_REGTEST,
        MOTOSWAP_ROUTER_ABI,
        Web3API.provider
      );

      const getData = await getQuote.getAmountsOut(1000n, [WBTC_ADDRESS_REGTEST, MOTO_ADDRESS_REGTEST]);
      console.log(getData);

      setLoading(false);
    };

    void getData();
  });

  if (loading) {
    return (
      <Layout>
        <Content itemsCenter justifyCenter>
          <Icon size={fontSizes.xxxl} color="gold">
            <LoadingOutlined />
          </Icon>
        </Content>
      </Layout>
    );
  }
  return (
    <Layout>
      <Header
        onBack={() => {
          window.history.go(-1);
        }}
      />
      <Column py="xl" style={$columnstyle}>
        <BaseView style={$style}>
          <Row itemsCenter fullX justifyBetween style={{ alignItems: 'baseline' }}>
            <Select options={switchOptions} placeholder={'Select Token'} onSelect={handleSelect} />
            <input
              type="text"
              placeholder="0"
              value={inputAmount}
              onChange={handleInputChange}
              style={$searchInputStyle}
            />
          </Row>
          <hr style={{ width: 'calc(100% + 37px)', marginLeft: '-20px' }} />
          <br />
          <Row itemsCenter fullX justifyBetween style={{ alignItems: 'baseline' }}>
            <Select options={switchOptions} placeholder={'Select Token'} onSelect={handleSelect} />
            <input
              type="text"
              placeholder="0"
              value={inputAmount}
              onChange={handleInputChange}
              style={$searchInputStyle}
            />
          </Row>
        </BaseView>
        <br />
        <Button
          text="Fetch Quotes "
          preset="primary"
          icon="pencil"
          style={$styleButton}
          onClick={(e) => {
            // console.log(btcBalance);
            // navigate('WrapBitcoinOpnet', {
            //   OpNetBalance: btcBalance
            // });
          }}
          full
        />
      </Column>
    </Layout>
  );
}
