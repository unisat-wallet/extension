import { getContract, IWBTCContract, WBTC_ABI } from 'opnet';

import { Account } from '@/shared/types';
import Web3API from '@/shared/web3/Web3API';
import { Button, Card, Column, Content, Footer, Layout, Row, Text } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import RunesPreviewCard from '@/ui/components/RunesPreviewCard';
import { useLocationState, useWallet } from '@/ui/utils';
import { BinaryWriter } from '@btc-vision/bsi-binary';
import {
  IInteractionParameters,
  IUnwrapParameters,
  IWrapParameters,
  UTXO,
  Wallet,
  wBTC
} from '@btc-vision/transaction';

import { useNavigate } from '../MainRoute';

interface LocationState {
  rawTxInfo: any;
}

export default function TxOpnetConfirmScreen() {
  const navigate = useNavigate();

  const { rawTxInfo } = useLocationState<LocationState>();
  const handleCancel = () => {
    console.log();
  };

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

      // Sign and broadcast the transaction
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
    const result = 10 ** 8; // 8 decimals

    const wrapAmount = BigInt(rawTxInfo.inputAmount * result);
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
    const result = 10 ** 8;

    const unwrapAmount = BigInt(rawTxInfo.inputAmount * result); // Minimum amount to unwrap
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

    const withdrawalRequest = await contract.requestWithdrawal(unwrapAmount);
    if ('error' in withdrawalRequest) {
      throw new Error('Invalid calldata in withdrawal request');
    }

    const interactionParameters: IInteractionParameters = {
      from: walletGet.p2tr,
      to: contract.address.toString(),
      utxos: utxos,
      signer: walletGet.keypair,
      network: Web3API.network,
      feeRate: 450,
      priorityFee: 50000n,
      calldata: withdrawalRequest.calldata as Buffer
    };

    const sendTransact = await Web3API.transactionFactory.signInteraction(interactionParameters);

    // If this transaction is missing, opnet will deny the unwrapping request.
    const firstTransaction = await Web3API.provider.sendRawTransaction(sendTransact[0], false);
    if (!firstTransaction || !firstTransaction.success) {
      tools.toastError('Error,Please Try again');
      throw new Error('Could not broadcast first transaction');
    }

    // This transaction is partially signed. You can not submit it to the Bitcoin network. It must pass via the OPNet network.
    const secondTransaction = await Web3API.provider.sendRawTransaction(sendTransact[1], false);
    if (!secondTransaction || !secondTransaction.success) {
      tools.toastError('Error,Please Try again');
      throw new Error('Could not broadcast first transaction');
    }

    const unwrapUtxos = await Web3API.limitedProvider.fetchUnWrapParameters(unwrapAmount, walletGet.p2tr);
    if (!unwrapUtxos) {
      throw new Error('No vault UTXOs or something went wrong. Please try again.');
    }

    // TODO: Use the new UTXO from the previous transaction

    utxos = await Web3API.getUTXOs([walletGet.p2wpkh, walletGet.p2tr], unwrapAmount);
    const unwrapParameters: IUnwrapParameters = {
      from: walletGet.p2tr, // Address to unwrap
      utxos: utxos, // Use the UTXO generated from the withdrawal request
      unwrapUTXOs: unwrapUtxos.vaultUTXOs, // Vault UTXOs to unwrap
      signer: walletGet.keypair, // Signer
      network: Web3API.network, // Bitcoin network
      feeRate: 300, // Fee rate in satoshis per byte (bitcoin fee)
      priorityFee: 10000n, // OPNet priority fee (incl gas.)
      amount: unwrapAmount,
      calldata: calldata
    };

    try {
      const finalTx = await Web3API.transactionFactory.unwrap(unwrapParameters);
      console.log(
        `Due to bitcoin fees, you will lose ${finalTx.feeRefundOrLoss} satoshis by unwrapping. Do you want to proceed?`
      );

      // If this transaction is missing, opnet will deny the unwrapping request.
      const fundingTransaction = await Web3API.provider.sendRawTransaction(finalTx.fundingTransaction, false);
      if (!fundingTransaction || !fundingTransaction.success) {
        tools.toastError('Error. Please Try again');
        return;
      }

      // This transaction is partially signed. You can not submit it to the Bitcoin network. It must pass via the OPNet network.
      const unwrapTransaction = await Web3API.provider.sendRawTransaction(finalTx.psbt, true);
      if (!unwrapTransaction || !unwrapTransaction.success) {
        tools.toastError('Error. Please Try again');
        return;
      }

      tools.toastSuccess(`"You have sucessfully unwraped ${unwrapAmount} Bitcoin"`);
      navigate('TxSuccessScreen', { unwrapTransaction });
    } catch (e) {
      console.error('Error:', e);
    }
  };

  const stake = async () => {
    const foundObject = rawTxInfo.items.find((obj) => obj.account && obj.account.address === rawTxInfo.account.address);
    const wifWallet = await wallet.getInternalPrivateKey(foundObject?.account as Account);
    const result = 10 ** rawTxInfo.opneTokens[0].divisibility;
    const amountToSend = BigInt(rawTxInfo.inputAmount * result);
    const walletGet: Wallet = Wallet.fromWif(wifWallet.wif, Web3API.network);

    const contract: IWBTCContract = getContract<IWBTCContract>(
      wBTC.getAddress(Web3API.network),
      WBTC_ABI,
      Web3API.provider,
      walletGet.p2tr
    );

    const stakeData = (await contract.stake(amountToSend)) as unknown as { calldata: Buffer };
    if ('error' in stakeData) {
      throw new Error('Invalid calldata in stakeData');
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
    } else {
      console.log('Broadcasted:', firstTransaction);
    }

    // This transaction is partially signed. You can not submit it to the Bitcoin network. It must pass via the OPNet network.
    const seconfTransaction = await Web3API.provider.sendRawTransaction(sendTransact[1], false);
    if (!seconfTransaction.success) {
      console.log('Broadcasted:', false);
    } else {
      console.log('Broadcasted:', seconfTransaction);
    }
    tools.toastSuccess(`"You have sucessfully Staked ${amountToSend} Bitcoin"`);
    navigate('TxSuccessScreen', { seconfTransaction });
  };
  return (
    <Layout>
      <Content>
        <Column gap="xl">
          <Text text={rawTxInfo.header} />
        </Column>
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
              <Text text={`Inputs: (${rawTxInfo.inputInfos.length})`} preset="bold" />
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
              } else {
                handleConfirm();
              }
            }}
            full
          />
        </Row>
      </Footer>
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
