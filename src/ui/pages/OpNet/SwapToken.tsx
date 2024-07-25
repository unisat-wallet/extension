import BigNumber from 'bignumber.js';
import {
  BaseContractProperty,
  getContract,
  IMotoswapRouterContract,
  IOP_20Contract,
  MOTOSWAP_ROUTER_ABI,
  OP_20_ABI
} from 'opnet';
import { CSSProperties, useMemo, useState } from 'react';

import { Account, OpNetBalance } from '@/shared/types';
import { expandToDecimals } from '@/shared/utils';
import Web3API from '@/shared/web3/Web3API';
import { ContractInformation } from '@/shared/web3/interfaces/ContractInformation';
import { Button, Column, Content, Header, Icon, Layout, Row, Select } from '@/ui/components';
import { BaseView } from '@/ui/components/BaseView';
import { useCurrentAccount } from '@/ui/state/accounts/hooks';
import { useCurrentKeyring } from '@/ui/state/keyrings/hooks';
import { fontSizes } from '@/ui/theme/font';
import { useWallet } from '@/ui/utils';
import { LoadingOutlined } from '@ant-design/icons';
import '@btc-vision/transaction';
import {
  IInteractionParameters,
  MOTO_ADDRESS_REGTEST,
  ROUTER_ADDRESS_REGTEST,
  UTXO,
  Wallet,
  WBTC_ADDRESS_REGTEST
} from '@btc-vision/transaction';

interface ItemData {
  key: string;
  account?: Account;
}

export default function Swap() {
  const [loading, setLoading] = useState(true);
  const [switchOptions, setSwitchOptions] = useState<OpNetBalance[]>([]);
  const [selectedOption, setSelectedOption] = useState<OpNetBalance | null>(null);
  const [selectedOptionOutput, setSelectedOptioOutput] = useState<OpNetBalance | null>(null);
  BigNumber.config({ EXPONENTIAL_AT: 256 });

  const [inputAmount, setInputAmount] = useState<string>('0');
  const [outputAmount, setOutPutAmount] = useState<string>('0');
  const keyring = useCurrentKeyring();

  const wallet = useWallet();
  const currentAccount = useCurrentAccount();

  const items = useMemo(() => {
    const _items: ItemData[] = keyring.accounts.map((v) => {
      return {
        key: v.address,
        account: v
      };
    });
    return _items;
  }, []);

  const handleSelect = (option) => {
    setSelectedOption(option);
    console.log('Selected option:', option);
  };
  const handleSelectOutput = (option) => {
    setSelectedOptioOutput(option);
    console.log('Selected option:', option);
  };
  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Allow empty input, numbers, and one decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      if (selectedOption && selectedOptionOutput) {
        const maxBalance = Number(selectedOption.amount) / Math.pow(10, selectedOption.divisibility);
        console.log(maxBalance);
        // If the input is not empty and is a valid number
        if (value !== '' && value !== '.') {
          const numericValue = parseFloat(value);

          if (numericValue <= maxBalance) {
            setInputAmount(value);
          } else {
            setInputAmount(maxBalance.toString());
          }
          const getQuote: IMotoswapRouterContract = getContract<IMotoswapRouterContract>(
            ROUTER_ADDRESS_REGTEST,
            MOTOSWAP_ROUTER_ABI,
            Web3API.provider
          );
          console.log(BigInt(Number(numericValue) * Math.pow(10, selectedOption.divisibility)));
          const getData = await getQuote.getAmountsOut(
            BigInt(Number(numericValue) * Math.pow(10, selectedOption.divisibility)),
            [WBTC_ADDRESS_REGTEST, MOTO_ADDRESS_REGTEST]
          );
          console.log(getData);
          if ('error' in getData) {
            return;
          } else {
            console.log(getData.decoded[0][1]);
            setOutPutAmount(
              (parseInt(getData.decoded[0][1].toString()) / Math.pow(10, selectedOptionOutput.divisibility)).toString()
            );
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
    width: '100%',
    maxWidth: '350px',
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

      setLoading(false);
    };

    void getData();
  });
  const swap = async () => {
    const getSwap: IMotoswapRouterContract = getContract<IMotoswapRouterContract>(
      ROUTER_ADDRESS_REGTEST,
      MOTOSWAP_ROUTER_ABI,
      Web3API.provider,
      currentAccount.address
    );
    console.log(getSwap);
    if (selectedOption && selectedOptionOutput) {
      const foundObject = items.find((obj) => obj.account && obj.account.address === currentAccount.address);
      const wifWallet = await wallet.getInternalPrivateKey(foundObject?.account as Account);
      const walletGet: Wallet = Wallet.fromWif(wifWallet.wif, Web3API.network);
      const maxUint256 = BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');

      const utxos = await Web3API.getUTXOs([walletGet.p2wpkh, walletGet.p2tr], maxUint256);
      const getData = await approveToken(walletGet, selectedOption.address, utxos);
      const getnextUtxo = await approveToken(walletGet, selectedOptionOutput.address, getData);
      // const contractResult = await getSwap.swapExactTokensForTokensSupportingFeeOnTransferTokens(
      //   BigInt(Number(inputAmount) * Math.pow(10, selectedOption.divisibility)),
      //   BigInt(Number(outputAmount) * Math.pow(10, selectedOptionOutput.divisibility)),
      //   [selectedOption.address, selectedOptionOutput.address],
      //   currentAccount.address,
      //   10000n
      // );
      console.log(inputAmount);
      const inputAmountBigInt = expandToDecimals(inputAmount, selectedOption.divisibility);
      const outPutAmountBigInt = expandToDecimals(outputAmount, selectedOptionOutput.divisibility);

      const contractResult = await getSwap.encodeCalldata('swapExactTokensForTokensSupportingFeeOnTransferTokens', [
        BigInt(Number(inputAmount) * Math.pow(10, selectedOption.divisibility)),
        0n,
        [selectedOption.address, selectedOptionOutput.address],
        currentAccount.address,
        10000n
      ]);
      console.log(inputAmountBigInt, outPutAmountBigInt);
      const interactionParameters: IInteractionParameters = {
        from: walletGet.p2tr,
        to: ROUTER_ADDRESS_REGTEST,
        utxos: getnextUtxo,
        signer: walletGet.keypair,
        network: Web3API.network,
        feeRate: 450,
        priorityFee: 50000n,
        calldata: contractResult as Buffer
      };
      console.log(interactionParameters);
      const sendTransact = await Web3API.transactionFactory.signInteraction(interactionParameters);

      // If this transaction is missing, opnet will deny the unwrapping request.
      const firstTransaction = await Web3API.provider.sendRawTransaction(sendTransact[0], false);
      if (!firstTransaction || !firstTransaction.success) {
        // tools.toastError('Error,Please Try again');
        console.log(firstTransaction);
        throw new Error('Could not broadcast first transaction');
      }

      // This transaction is partially signed. You can not submit it to the Bitcoin network. It must pass via the OPNet network.
      const secondTransaction = await Web3API.provider.sendRawTransaction(sendTransact[1], false);
      if (!secondTransaction || !secondTransaction.success) {
        // tools.toastError('Error,Please Try again');
        throw new Error('Could not broadcast first transaction');
      } else {
        console.log(secondTransaction);
      }
    }
  };
  const approveToken = async (walletGet: Wallet, tokenAddress: string, utxos: UTXO[]) => {
    const contract = getContract<IOP_20Contract>(tokenAddress, OP_20_ABI, Web3API.provider, currentAccount.address);
    const maxUint256 = 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffn;
    const contractApprove: BaseContractProperty = await contract.approve(ROUTER_ADDRESS_REGTEST, maxUint256);
    if ('error' in contractApprove) {
      throw new Error(contractApprove.error);
    }

    const interactionParameters: IInteractionParameters = {
      from: walletGet.p2tr,
      to: contract.address.toString(),
      utxos: utxos,
      signer: walletGet.keypair,
      network: Web3API.network,
      feeRate: 450,
      priorityFee: 50000n,
      calldata: contractApprove.calldata as Buffer
    };

    const sendTransact = await Web3API.transactionFactory.signInteraction(interactionParameters);

    // If this transaction is missing, opnet will deny the unwrapping request.
    const firstTransaction = await Web3API.provider.sendRawTransaction(sendTransact[0], false);
    if (!firstTransaction || !firstTransaction.success) {
      // tools.toastError('Error,Please Try again');
      console.log(firstTransaction);
      throw new Error('Could not broadcast first transaction');
    }

    // This transaction is partially signed. You can not submit it to the Bitcoin network. It must pass via the OPNet network.
    const secondTransaction = await Web3API.provider.sendRawTransaction(sendTransact[1], false);
    if (!secondTransaction || !secondTransaction.success) {
      // tools.toastError('Error,Please Try again');
      throw new Error('Could not broadcast first transaction');
    } else {
      console.log(secondTransaction);
    }
    return sendTransact[2];
  };
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
            <Select options={switchOptions} placeholder={'Select Token'} onSelect={handleSelectOutput} />
            <input
              disabled
              type="text"
              placeholder="0"
              value={Number(outputAmount).toFixed(2)}
              onChange={handleInputChange}
              style={$searchInputStyle}
            />
          </Row>
        </BaseView>
        <br />
        <Button
          text="Swap "
          preset="primary"
          // icon="pencil"
          style={$styleButton}
          onClick={(e) => {
            swap();
          }}
          full
        />
      </Column>
    </Layout>
  );
}
