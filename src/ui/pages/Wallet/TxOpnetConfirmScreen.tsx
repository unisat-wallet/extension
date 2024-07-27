import {
  BaseContractProperty,
  IMotoswapRouterContract,
  IOP_20Contract,
  IWBTCContract,
  MOTOSWAP_ROUTER_ABI,
  OP_20_ABI,
  WBTC_ABI,
  getContract
} from 'opnet';
import { useEffect, useState } from 'react';

import { Account } from '@/shared/types';
import { expandToDecimals } from '@/shared/utils';
import Web3API from '@/shared/web3/Web3API';
import { Button, Card, Column, Content, Footer, Layout, Row, Text } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import RunesPreviewCard from '@/ui/components/RunesPreviewCard';
import { useLocationState, useWallet } from '@/ui/utils';
import { BinaryWriter } from '@btc-vision/bsi-binary';
import {
  IFundingTransactionParameters,
  IInteractionParameters,
  IUnwrapParameters,
  IWrapParameters,
  ROUTER_ADDRESS_REGTEST,
  UTXO,
  UnwrapResult,
  Wallet,
  wBTC
} from '@btc-vision/transaction';

import { useNavigate } from '../MainRoute';
import { ConfirmUnWrap } from './ConfirmUnWrap';

interface LocationState {
  rawTxInfo: any;
}

export default function TxOpnetConfirmScreen() {
  const navigate = useNavigate();
  const [finalUnwrapTx, setfinalUnwrapTx] = useState<UnwrapResult>();
  const [acceptWrap, setAcceptWrap] = useState<boolean>(false);
  const [acceptWrapMessage, setAcceptWrapMessage] = useState<string>('false');
  const [openAcceptbar, setAcceptBar] = useState<boolean>(false);
  const [unwrapUseAmount, setUnWrapAmount] = useState<bigint>(0n);
  const { rawTxInfo } = useLocationState<LocationState>();
  const handleCancel = () => {
    window.history.go(-1);
  };
  useEffect(() => {
    const setWallet = async () => {
      Web3API.setNetwork(await wallet.getChainType());
    };
    setWallet();
  });
  useEffect(() => {
    if (acceptWrap && finalUnwrapTx) {
      const completeUnwrap = async () => {
        setAcceptBar(false);
        // If this transaction is missing, opnet will deny the unwrapping request.
        const fundingTransaction = await Web3API.provider.sendRawTransaction(finalUnwrapTx.fundingTransaction, false);
        if (!fundingTransaction || !fundingTransaction.success) {
          console.log(fundingTransaction);
          tools.toastError('Error. Please Try again');
          return;
        }

        // This transaction is partially signed. You can not submit it to the Bitcoin network. It must pass via the OPNet network.
        const unwrapTransaction = await Web3API.provider.sendRawTransaction(finalUnwrapTx.psbt, true);
        if (!unwrapTransaction || !unwrapTransaction.success) {
          console.log(fundingTransaction);
          tools.toastError('Error. Please Try again');
          return;
        }

        tools.toastSuccess(
          `"You have sucessfully unwraped ${unwrapUseAmount + finalUnwrapTx.feeRefundOrLoss} Bitcoin"`
        );
        navigate('TxSuccessScreen', { txid: unwrapTransaction.result });
      };
      completeUnwrap();
    }
  }, [acceptWrap]);
  const wallet = useWallet();
  const tools = useTools();

  const handleConfirm = async () => {
    const foundObject = rawTxInfo.items.find((obj) => obj.account && obj.account.address === rawTxInfo.account.address);
    const wifWallet = await wallet.getInternalPrivateKey(foundObject?.account as Account);
    const walletGet: Wallet = Wallet.fromWif(wifWallet.wif, Web3API.network);
    const transferSelector = Number('0x' + Web3API.abiCoder.encodeSelector('transfer'));

    function getTransferToCalldata(to: string, amount: bigint): Buffer {
      const addCalldata: BinaryWriter = new BinaryWriter();
      addCalldata.writeSelector(transferSelector);
      addCalldata.writeAddress(to);
      addCalldata.writeU256(amount);
      return Buffer.from(addCalldata.getBuffer());
    }

    try {
      const result = 10 ** rawTxInfo.opneTokens[0].divisibility;
      const amountToSend = BigInt(rawTxInfo.inputAmount * result); // Amount to send
      const calldata = getTransferToCalldata(rawTxInfo.address, amountToSend);

      const utxos = await Web3API.getUTXOs([walletGet.p2wpkh, walletGet.p2tr], amountToSend);

      const interactionParameters: IInteractionParameters = {
        from: walletGet.p2tr, // From address
        to: rawTxInfo.contractAddress, // To address
        utxos: utxos, // UTXOs
        signer: walletGet.keypair, // Signer
        network: Web3API.network, // Network
        feeRate: 300, // Fee rate (satoshi per byte)
        priorityFee: BigInt(rawTxInfo.OpnetRateInputVal), // Priority fee (opnet)
        calldata: calldata // Calldata
      };

      const finalTx = await Web3API.transactionFactory.signInteraction(interactionParameters);

      const firstTxBroadcast = await Web3API.provider.sendRawTransaction(finalTx[0], false);
      console.log(`First transaction broadcasted: ${firstTxBroadcast.result}`);

      if (!firstTxBroadcast.success) {
        throw new Error('Could not broadcast first transaction');
      }

      const secondTxBroadcast = await Web3API.provider.sendRawTransaction(finalTx[1], false);
      console.log(`Second transaction broadcasted: ${secondTxBroadcast.result}`);

      if (!secondTxBroadcast.success) {
        throw new Error('Could not broadcast second transaction');
      }

      tools.toastSuccess(`"You have successfully transferred ${amountToSend} Bitcoin"`);

      navigate('TxSuccessScreen', { secondTxBroadcast });
    } catch (e) {
      console.log(e);
    }
  };

  const handleWrapConfirm = async () => {
    const foundObject = rawTxInfo.items.find((obj) => obj.account && obj.account.address === rawTxInfo.account.address);
    const wifWallet = await wallet.getInternalPrivateKey(foundObject?.account as Account);
    const walletGet: Wallet = Wallet.fromWif(wifWallet.wif, Web3API.network);

    const wrapAmount = expandToDecimals(rawTxInfo.inputAmount, 8);
    const utxos = await Web3API.getUTXOs([walletGet.p2wpkh, walletGet.p2tr], wrapAmount);

    const generationParameters = await Web3API.limitedProvider.fetchWrapParameters(wrapAmount);
    if (!generationParameters) {
      throw new Error('No generation parameters found');
    }

    const wrapParameters: IWrapParameters = {
      from: walletGet.p2tr,
      utxos: utxos,
      signer: walletGet.keypair,
      network: Web3API.network,
      feeRate: 400,
      priorityFee: BigInt(rawTxInfo.OpnetRateInputVal),
      amount: wrapAmount,
      generationParameters: generationParameters
    };

    const finalTx = await Web3API.transactionFactory.wrap(wrapParameters);
    const firstTxBroadcast = await Web3API.provider.sendRawTransaction(finalTx.transaction[0], false);
    if (!firstTxBroadcast) {
      tools.toastError('Error,Please Try again');
      throw new Error('Could not broadcast first transaction');
    }

    if (!firstTxBroadcast.success) {
      tools.toastError('Error,Please Try again');
      throw new Error('Could not broadcast first transaction');
    }

    const secondTxBroadcast = await Web3API.provider.sendRawTransaction(finalTx.transaction[1], false);
    if (!secondTxBroadcast) {
      tools.toastError('Error,Please Try again');
      throw new Error('Could not broadcast first transaction');
    }

    if (!secondTxBroadcast.success) {
      tools.toastError('Error,Please Try again');
      throw new Error('Could not broadcast first transaction');
    }

    tools.toastSuccess(`"You have sucessfully wraped ${wrapAmount} Bitcoin"`);
    navigate('TxSuccessScreen', { secondTxBroadcast });
  };

  const handleUnWrapConfirm = async () => {
    const foundObject = rawTxInfo.items.find((obj) => obj.account && obj.account.address === rawTxInfo.account.address);
    const wifWallet = await wallet.getInternalPrivateKey(foundObject?.account as Account);
    const walletGet: Wallet = Wallet.fromWif(wifWallet.wif, Web3API.network);

    const unwrapAmount = expandToDecimals(rawTxInfo.inputAmount, 8); // Minimum amount to unwrap
    const requestWithdrawalSelector = Number('0x' + Web3API.abiCoder.encodeSelector('requestWithdrawal'));

    function generateCalldata(unwrapAmount: bigint): Buffer {
      const addCalldata: BinaryWriter = new BinaryWriter();
      addCalldata.writeSelector(requestWithdrawalSelector);
      addCalldata.writeU256(unwrapAmount);
      return Buffer.from(addCalldata.getBuffer());
    }

    let utxos = await Web3API.getUTXOs([walletGet.p2wpkh, walletGet.p2tr], unwrapAmount);

    const calldata = generateCalldata(unwrapAmount);
    const contract: IWBTCContract = getContract<IWBTCContract>(
      wBTC.getAddress(Web3API.network),
      WBTC_ABI,
      Web3API.provider,
      walletGet.p2tr
    );
    const checkWithdrawalRequest = await contract.withdrawableBalanceOf(rawTxInfo.account.address);

    if ('error' in checkWithdrawalRequest) {
      throw new Error('Invalid calldata in withdrawal request');
    }
    if ((checkWithdrawalRequest.decoded[0] as bigint) < unwrapAmount) {
      tools.toastError('Your withdrawable WBTC balance is ' + (checkWithdrawalRequest.decoded[0] as bigint));
      return;
    }
    const withdrawalRequest = await contract.requestWithdrawal(unwrapAmount);

    if ('error' in withdrawalRequest || 'error' in checkWithdrawalRequest) {
      tools.toastError('Invalid calldata in withdrawal request');
      console.log(withdrawalRequest);
      throw new Error(`Something went wrong while simulating the withdraw request: ${withdrawalRequest}`);
    }
    const interactionParameters: IInteractionParameters = {
      from: walletGet.p2tr,
      to: contract.address.toString(),
      utxos: utxos,
      signer: walletGet.keypair,
      network: Web3API.network,
      feeRate: 100,
      priorityFee: 1000n,
      calldata: withdrawalRequest.calldata as Buffer
    };

    const sendTransact = await Web3API.transactionFactory.signInteraction(interactionParameters);

    // If this transaction is missing, opnet will deny the unwrapping request.
    const firstTransaction = await Web3API.provider.sendRawTransaction(sendTransact[0], false);
    if (!firstTransaction || !firstTransaction.success) {
      tools.toastError('Error: Could not broadcast first transaction');
      console.error('Transaction failed:', firstTransaction);
      return;
    }

    // This transaction is partially signed. You can not submit it to the Bitcoin network. It must pass via the OPNet network.
    const secondTransaction = await Web3API.provider.sendRawTransaction(sendTransact[1], false);
    if (!secondTransaction || !secondTransaction.success) {
      tools.toastError('Error: Could not broadcast second transaction');
      console.error('Transaction failed:', firstTransaction);
      return;
    }

    const unwrapUtxos = await Web3API.limitedProvider.fetchUnWrapParameters(unwrapAmount, walletGet.p2tr);
    if (!unwrapUtxos) {
      tools.toastError('No vault UTXOs or something went wrong. Please try again.');
      console.error('Transaction failed:', firstTransaction);
      return;
    }

    // TODO: Use the new UTXO from the previous transaction

    utxos = await Web3API.getUTXOs([walletGet.p2wpkh, walletGet.p2tr], unwrapAmount);
    const unwrapParameters: IUnwrapParameters = {
      from: walletGet.p2tr, // Address to unwrap
      utxos: sendTransact[2], // Use the UTXO generated from the withdrawal request
      unwrapUTXOs: unwrapUtxos.vaultUTXOs, // Vault UTXOs to unwrap
      signer: walletGet.keypair, // Signer
      network: Web3API.network, // Bitcoin network
      feeRate: 100, // Fee rate in satoshis per byte (bitcoin fee)
      priorityFee: 1000n, // OPNet priority fee (incl gas.)
      amount: unwrapAmount + (checkWithdrawalRequest.decoded[0] as bigint)
    };

    try {
      const finalTx = await Web3API.transactionFactory.unwrap(unwrapParameters);
      console.log(finalTx);
      setfinalUnwrapTx(finalTx);
      setAcceptBar(true);
      setAcceptWrapMessage(
        `Due to bitcoin fees, you will only get ${
          unwrapAmount + finalTx.feeRefundOrLoss
        } satoshis by unwrapping. Do you want to proceed?`
      );
      setUnWrapAmount(unwrapAmount);
    } catch (e) {
      tools.toastError('Error please ty again later');
      console.error('Error:', e);
    }
  };

  const stake = async () => {
    const foundObject = rawTxInfo.items.find((obj) => obj.account && obj.account.address === rawTxInfo.account.address);
    const wifWallet = await wallet.getInternalPrivateKey(foundObject?.account as Account);
    const result = 10 ** rawTxInfo.opneTokens[0].divisibility;
    const amountToSend = expandToDecimals(rawTxInfo.inputAmount, rawTxInfo.opneTokens[0].divisibility);
    const walletGet: Wallet = Wallet.fromWif(wifWallet.wif, Web3API.network);

    const contract: IWBTCContract = getContract<IWBTCContract>(
      wBTC.getAddress(Web3API.network),
      WBTC_ABI,
      Web3API.provider,
      walletGet.p2tr
    );

    const stakeData = (await contract.stake(amountToSend)) as unknown as { calldata: Buffer };
    if ('error' in stakeData) {
      tools.toastError('Invalid calldata in stakeData');
      console.error('stakeDatas:', stakeData);
      return;
    }

    const utxos: UTXO[] = await Web3API.getUTXOs([walletGet.p2wpkh, walletGet.p2tr], amountToSend);

    const interactionParameters: IInteractionParameters = {
      from: walletGet.p2tr,
      to: contract.address.toString(),
      utxos: utxos,
      signer: walletGet.keypair,
      network: Web3API.network,
      feeRate: 300,
      priorityFee: 10000n,
      calldata: stakeData?.calldata as Buffer
    };

    const sendTransact = await Web3API.transactionFactory.signInteraction(interactionParameters);

    // If this transaction is missing, opnet will deny the unwrapping request.
    const firstTransaction = await Web3API.provider.sendRawTransaction(sendTransact[0], false);
    if (!firstTransaction.success) {
      console.log('Broadcasted:', false);
      return;
    } else {
      console.log('Broadcasted:', firstTransaction);
    }

    // This transaction is partially signed. You can not submit it to the Bitcoin network. It must pass via the OPNet network.
    const seconfTransaction = await Web3API.provider.sendRawTransaction(sendTransact[1], false);
    if (!seconfTransaction.success) {
      console.log('Broadcasted:', false);
      return;
    } else {
      console.log('Broadcasted:', seconfTransaction);
    }
    tools.toastSuccess(`"You have sucessfully Staked ${amountToSend} Bitcoin"`);
    navigate('TxSuccessScreen', { txid: seconfTransaction.result });
  };
  const unstake = async () => {
    const foundObject = rawTxInfo.items.find((obj) => obj.account && obj.account.address === rawTxInfo.account.address);
    const wifWallet = await wallet.getInternalPrivateKey(foundObject?.account as Account);
    const result = 10 ** rawTxInfo.opneTokens[0].divisibility;
    const amountToSend = expandToDecimals(rawTxInfo.inputAmount, rawTxInfo.opneTokens[0].divisibility);
    const walletGet: Wallet = Wallet.fromWif(wifWallet.wif, Web3API.network);

    const contract: IWBTCContract = getContract<IWBTCContract>(
      wBTC.getAddress(Web3API.network),
      WBTC_ABI,
      Web3API.provider,
      walletGet.p2tr
    );

    const stakeData = (await contract.unstake()) as unknown as { calldata: Buffer };
    if ('error' in stakeData) {
      tools.toastError('Invalid calldata in stakeData');
      console.error('stakeDatas:', 'Too Early');
      tools.toastError(stakeData.error as string);
      return;
    }

    const utxos: UTXO[] = await Web3API.getUTXOs([walletGet.p2wpkh, walletGet.p2tr], amountToSend);

    const interactionParameters: IInteractionParameters = {
      from: walletGet.p2tr,
      to: contract.address.toString(),
      utxos: utxos,
      signer: walletGet.keypair,
      network: Web3API.network,
      feeRate: 300,
      priorityFee: 10000n,
      calldata: stakeData?.calldata as Buffer
    };

    const sendTransact = await Web3API.transactionFactory.signInteraction(interactionParameters);

    // If this transaction is missing, opnet will deny the unwrapping request.
    const firstTransaction = await Web3API.provider.sendRawTransaction(sendTransact[0], false);
    if (!firstTransaction.success) {
      console.log('Broadcasted:', false);
      return;
    } else {
      console.log('Broadcasted:', firstTransaction);
    }

    // This transaction is partially signed. You can not submit it to the Bitcoin network. It must pass via the OPNet network.
    const seconfTransaction = await Web3API.provider.sendRawTransaction(sendTransact[1], false);
    if (!seconfTransaction.success) {
      console.log('Broadcasted:', false);
      return;
    } else {
      console.log('Broadcasted:', seconfTransaction);
    }
    tools.toastSuccess(`"You have sucessfully Staked ${amountToSend} Bitcoin"`);
    navigate('TxSuccessScreen', { txid: seconfTransaction.result });
  };
  const claim = async () => {
    const foundObject = rawTxInfo.items.find((obj) => obj.account && obj.account.address === rawTxInfo.account.address);
    const wifWallet = await wallet.getInternalPrivateKey(foundObject?.account as Account);
    const result = 10 ** rawTxInfo.opneTokens[0].divisibility;
    const amountToSend = expandToDecimals(rawTxInfo.inputAmount, rawTxInfo.opneTokens[0].divisibility);
    const walletGet: Wallet = Wallet.fromWif(wifWallet.wif, Web3API.network);

    const contract: IWBTCContract = getContract<IWBTCContract>(
      wBTC.getAddress(Web3API.network),
      WBTC_ABI,
      Web3API.provider,
      walletGet.p2tr
    );

    const stakeData = (await contract.claim()) as unknown as { calldata: Buffer };
    if ('error' in stakeData) {
      tools.toastError('Invalid calldata in stakeData');
      console.error('stakeDatas:', stakeData);
      tools.toastError('Claim failed, Try again later' as string);

      return;
    }

    const utxos: UTXO[] = await Web3API.getUTXOs([walletGet.p2wpkh, walletGet.p2tr], amountToSend);

    const interactionParameters: IInteractionParameters = {
      from: walletGet.p2tr,
      to: contract.address.toString(),
      utxos: utxos,
      signer: walletGet.keypair,
      network: Web3API.network,
      feeRate: 300,
      priorityFee: 10000n,
      calldata: stakeData?.calldata as Buffer
    };

    const sendTransact = await Web3API.transactionFactory.signInteraction(interactionParameters);

    // If this transaction is missing, opnet will deny the unwrapping request.
    const firstTransaction = await Web3API.provider.sendRawTransaction(sendTransact[0], false);
    if (!firstTransaction.success) {
      console.log('Broadcasted:', false);
      return;
    } else {
      console.log('Broadcasted:', firstTransaction);
    }

    // This transaction is partially signed. You can not submit it to the Bitcoin network. It must pass via the OPNet network.
    const seconfTransaction = await Web3API.provider.sendRawTransaction(sendTransact[1], false);
    if (!seconfTransaction.success) {
      console.log('Broadcasted:', false);
      return;
    } else {
      console.log('Broadcasted:', seconfTransaction);
    }
    tools.toastSuccess(`"You have sucessfully Staked ${amountToSend} Bitcoin"`);
    navigate('TxSuccessScreen', { txid: seconfTransaction.result });
  };
  const swap = async () => {
    const getSwap: IMotoswapRouterContract = getContract<IMotoswapRouterContract>(
      ROUTER_ADDRESS_REGTEST,
      MOTOSWAP_ROUTER_ABI,
      Web3API.provider,
      rawTxInfo.account.address
    );
    const foundObject = rawTxInfo.items.find((obj) => obj.account && obj.account.address === rawTxInfo.account.address);
    const wifWallet = await wallet.getInternalPrivateKey(foundObject?.account as Account);
    const walletGet: Wallet = Wallet.fromWif(wifWallet.wif, Web3API.network);
    const maxUint256 = BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');
    const inputAmountBigInt = expandToDecimals(rawTxInfo.inputAmount[0], rawTxInfo.opneTokens[0].divisibility);

    const utxos = await Web3API.getUTXOs([walletGet.p2wpkh, walletGet.p2tr], maxUint256);
    const getData = await approveToken(inputAmountBigInt, walletGet, rawTxInfo.contractAddress[0], utxos);
    const getnextUtxo = await approveToken(inputAmountBigInt, walletGet, rawTxInfo.contractAddress[1], getData);
    const outPutAmountBigInt = expandToDecimals(rawTxInfo.inputAmount[1], rawTxInfo.opneTokens[0].divisibility);

    const contractResult = await getSwap.encodeCalldata('swapExactTokensForTokensSupportingFeeOnTransferTokens', [
      inputAmountBigInt,
      0n,
      [rawTxInfo.contractAddress[0], rawTxInfo.contractAddress[1]],
      rawTxInfo.account.address,
      10000n
    ]);
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
      tools.toastSuccess(
        `"You have sucessfully swapped ${rawTxInfo.inputAmount[0]} ${rawTxInfo.opneTokens[0].symbol} for ${rawTxInfo.inputAmount[2]}  ${rawTxInfo.opneTokens[1].symbol}"`
      );
      navigate('TxSuccessScreen', { txid: secondTransaction.result });
    }
  };
  const approveToken = async (inputAmountBigInt: bigint, walletGet: Wallet, tokenAddress: string, utxos: UTXO[]) => {
    try {
      const contract = getContract<IOP_20Contract>(
        tokenAddress,
        OP_20_ABI,
        Web3API.provider,
        rawTxInfo.account.address
      );
      const getRemaining = await contract.allowance(walletGet.p2tr, ROUTER_ADDRESS_REGTEST);
      if ('error' in getRemaining) {
        throw new Error(getRemaining.error);
      }
      if ((getRemaining.decoded[0] as bigint) > inputAmountBigInt) {
        return utxos;
      }
      const maxUint256 = BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');
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
        feeRate: rawTxInfo.feeRate,
        priorityFee: 1000n,
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
    } catch (e) {
      console.log(e);
      return utxos;
    }
  };
  const sendBTC = async () => {
    const foundObject = rawTxInfo.items.find((obj) => obj.account && obj.account.address === rawTxInfo.account.address);
    const wifWallet = await wallet.getInternalPrivateKey(foundObject?.account as Account);
    const walletGet: Wallet = Wallet.fromWif(wifWallet.wif, Web3API.network);
    const utxos = await Web3API.getUTXOs(
      [walletGet.p2wpkh, walletGet.p2tr],
      expandToDecimals(rawTxInfo.inputAmount, 8)
    );
    const IFundingTransactionParameters: IFundingTransactionParameters = {
      amount: expandToDecimals(rawTxInfo.inputAmount, 8),
      utxos: utxos,
      signer: walletGet.keypair,
      network: Web3API.network,
      feeRate: 100,
      priorityFee: 1000n,
      to: rawTxInfo.address,
      from: rawTxInfo.account.address
    };
    const sendTransact = await Web3API.transactionFactory.createBTCTransfer(IFundingTransactionParameters);
    const firstTransaction = await Web3API.provider.sendRawTransaction(sendTransact.tx, false);
    if (!firstTransaction || !firstTransaction.success) {
      tools.toastError('Error: Could not broadcast first transaction');
      console.error('Transaction failed:', firstTransaction);
      return;
    }
    tools.toastSuccess(
      `"You have sucessfully swapped ${rawTxInfo.inputAmount[0]} ${rawTxInfo.opneTokens[0].symbol} for ${rawTxInfo.inputAmount[2]}  ${rawTxInfo.opneTokens[1].symbol}"`
    );
    navigate('TxSuccessScreen', { txid: firstTransaction.result });
  };
  return (
    <Layout>
      <Content>
        <Row itemsCenter fullX justifyCenter>
          <Text text={rawTxInfo.header} size="xxl" />
        </Row>
        <Column gap="xl">
          <Section title="Network Fee Rate:">
            <Text text={rawTxInfo.feeRate.toString()} />

            <Text text="sat/vB" color="textDim" />
          </Section>

          <Section title="Opnet Fee Rate:">
            <Text text={rawTxInfo.OpnetRateInputVal.toString()} />

            <Text text="sat/vB" color="textDim" />
          </Section>
          <Section title="Features:">
            <Row>
              {rawTxInfo.features.rbf ? (
                <Text text="RBF" color="white" style={{ backgroundColor: 'green', padding: 5, borderRadius: 5 }} />
              ) : (
                <Text
                  text="RBF"
                  color="white"
                  style={{
                    backgroundColor: 'red',
                    padding: 5,
                    borderRadius: 5,
                    textDecoration: 'line-through'
                  }}
                />
              )}
            </Row>
          </Section>
          <Column gap="xl">
            <Column>
              <Text text={`Data: (${rawTxInfo.inputInfos.length})`} preset="bold" />
              <Card>
                <Column full justifyCenter>
                  <Row>
                    <Column justifyCenter>
                      <Text text={'TOKENS'} color={rawTxInfo.isToSign ? 'white' : 'textDim'} />
                      <Row overflowX gap="lg" style={{ width: 280 }} pb="lg">
                        {rawTxInfo.opneTokens.map((w, index) => (
                          <RunesPreviewCard key={index} balance={w} />
                        ))}
                      </Row>
                    </Column>
                  </Row>
                </Column>
              </Card>
            </Column>
          </Column>
        </Column>
      </Content>

      <Footer>
        <Row full>
          <Button preset="default" text="Reject" onClick={handleCancel} full />
          <Button
            preset="primary"
            icon={undefined}
            text={'Sign'}
            onClick={() => {
              if (rawTxInfo.action == 'wrap') {
                handleWrapConfirm();
              } else if (rawTxInfo.action == 'unwrap') {
                handleUnWrapConfirm();
              } else if (rawTxInfo.action == 'stake') {
                stake();
              } else if (rawTxInfo.action == 'unstake') {
                unstake();
              } else if (rawTxInfo.action == 'claim') {
                claim();
              } else if (rawTxInfo.action == 'swap') {
                swap();
              } else if (rawTxInfo.action == 'sendBTC') {
                sendBTC();
              } else {
                handleConfirm();
              }
            }}
            full
          />
        </Row>
      </Footer>
      {openAcceptbar && (
        <ConfirmUnWrap
          onClose={() => setAcceptBar(false)}
          acceptWrapMessage={acceptWrapMessage}
          setAcceptWrap={setAcceptWrap}
        />
      )}
    </Layout>
  );
}

function Section({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <Column>
      <Text text={title} preset="bold" />
      <Card>
        <Row full justifyBetween itemsCenter>
          {children}
        </Row>
      </Card>
    </Column>
  );
}
