import BigNumber from 'bignumber.js';
import {
    Airdrop,
    BitcoinAbiTypes,
    BitcoinInterfaceAbi,
    CallResult,
    getContract,
    IMotoswapRouterContract,
    IOP_20Contract,
    IWBTCContract,
    MOTOSWAP_ROUTER_ABI,
    OP_20_ABI,
    TransactionParameters,
    WBTC_ABI
} from 'opnet';
import { AddressesInfo } from 'opnet/src/providers/interfaces/PublicKeyInfo';
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';

import {
    Action,
    AirdropParameters,
    ClaimParameters,
    DeployContractParameters,
    MintParameters,
    RawTxInfo,
    SendBitcoinParameters,
    StakeParameters,
    SwapParameters,
    TransferParameters,
    UnstakeParameters,
    UnwrapParameters,
    WrapParameters
} from '@/shared/interfaces/RawTxParameters';
import { expandToDecimals } from '@/shared/utils';
import Web3API, { bigIntToDecimal, getOPNetChainType } from '@/shared/web3/Web3API';
import { Button, Card, Column, Content, Footer, Header, Layout, Row, Text } from '@/ui/components';
import { ContextType, useTools } from '@/ui/components/ActionComponent';
import { BottomModal } from '@/ui/components/BottomModal';
import { useBTCUnit } from '@/ui/state/settings/hooks';
import { useLocationState, useWallet } from '@/ui/utils';
import { LoadingOutlined } from '@ant-design/icons';
import {
    ABIDataTypes,
    Address,
    AddressMap,
    currentConsensusConfig,
    DeploymentResult,
    IDeploymentParameters,
    IFundingTransactionParameters,
    IUnwrapParameters,
    IWrapParameters,
    UnwrapResult,
    UTXO,
    Wallet
} from '@btc-vision/transaction';

import { RouteTypes, useNavigate } from '../MainRoute';
import { ConfirmUnWrap } from './ConfirmUnWrap';

BigNumber.config({ EXPONENTIAL_AT: 256 });

interface LocationState {
    rawTxInfo: RawTxInfo;
}

function absBigInt(value: bigint): bigint {
    return value < 0n ? -value : value;
}

export const AIRDROP_ABI: BitcoinInterfaceAbi = [
    ...OP_20_ABI,

    {
        name: 'airdrop',
        inputs: [
            {
                name: 'wallets',
                type: ABIDataTypes.ADDRESS_UINT256_TUPLE
            }
        ],
        outputs: [
            {
                name: 'ok',
                type: ABIDataTypes.BOOL
            }
        ],
        type: BitcoinAbiTypes.Function
    }
];

export interface AirdropInterface extends IOP_20Contract {
    airdrop(tuple: AddressMap<bigint>): Promise<Airdrop>;
}

const waitForTransaction = async (
    txHash: string,
    setOpenLoading: Dispatch<SetStateAction<boolean>>,
    tools: ContextType
) => {
    let attempts = 0;
    const maxAttempts = 360; // 10 minutes max wait time
    setOpenLoading(true);

    while (attempts < maxAttempts) {
        try {
            const txResult = await Web3API.provider.getTransaction(txHash);
            if (txResult && !('error' in txResult)) {
                console.log('Transaction confirmed:', txResult);
                setOpenLoading(false);
                return txResult.hash;
            }
        } catch (error) {
            console.log('Error fetching transaction:', error);
        }
        await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 10 seconds
        attempts++;
    }
    tools.toastError('Transaction not confirmed after 10 minutes');
};

export default function TxOpnetConfirmScreen() {
    const navigate = useNavigate();
    const [finalUnwrapTx, setFinalUnwrapTx] = useState<UnwrapResult>();
    const [acceptWrap, setAcceptWrap] = useState<boolean>(false);
    const [acceptWrapMessage, setAcceptWrapMessage] = useState<string>('');
    const [openAcceptbar, setAcceptBar] = useState<boolean>(false);
    const [openLoading, setOpenLoading] = useState<boolean>(false);
    const [disabled, setDisabled] = useState<boolean>(false);
    const { rawTxInfo } = useLocationState<LocationState>();

    const btcUnit = useBTCUnit();

    const handleCancel = () => {
        window.history.go(-1);
    };

    const [routerAddress, setRouterAddress] = useState<Address | null>(null);

    useEffect(() => {
        const setWallet = async () => {
            Web3API.setNetwork(await wallet.getChainType());

            setRouterAddress(Web3API.ROUTER_ADDRESS ? Web3API.ROUTER_ADDRESS : null);
        };

        void setWallet();
    });

    useEffect(() => {
        if (acceptWrap && finalUnwrapTx) {
            const completeUnwrap = async () => {
                setAcceptBar(false);
                // If this transaction is missing, opnet will deny the unwrapping request.
                const fundingTransaction = await Web3API.provider.sendRawTransaction(
                    finalUnwrapTx.fundingTransaction,
                    false
                );

                if (!fundingTransaction?.success) {
                    tools.toastError(
                        `Something went wrong while broadcasting the funding transaction. Please try again later. ${
                            fundingTransaction.error ?? ''
                        }`
                    );
                    return;
                }

                // This transaction is partially signed. You can not submit it to the Bitcoin network. It must pass via the OPNet network.
                const unwrapTransaction = await Web3API.provider.sendRawTransaction(finalUnwrapTx.psbt, true);
                if (!unwrapTransaction?.success) {
                    tools.toastError(
                        `Something went wrong while broadcasting the unwrap transaction. Please try again later. ${
                            unwrapTransaction.error ?? ''
                        }`
                    );
                    return;
                }

                if (!('inputAmount' in rawTxInfo)) {
                    throw new Error('Input amount not found');
                }

                if (!unwrapTransaction.result) {
                    tools.toastError(`Something went wrong ${unwrapTransaction.error}`);
                    setDisabled(false);
                    return;
                }

                tools.toastSuccess(`You have successfully unwrapped ${rawTxInfo.inputAmount} ${btcUnit}`);
                navigate(RouteTypes.TxSuccessScreen, { txid: unwrapTransaction.result });
            };

            void completeUnwrap();
        }
    }, [acceptWrap]);

    const wallet = useWallet();
    const tools = useTools();

    const getWallet = async () => {
        const currentWalletAddress = await wallet.getCurrentAccount();
        const pubkey = currentWalletAddress.pubkey;

        const wifWallet = await wallet.getInternalPrivateKey({
            pubkey: pubkey,
            type: currentWalletAddress.type
        });

        return Wallet.fromWif(wifWallet.wif, Web3API.network);
    };

    const getPubKey = async (to: string) => {
        let pubKey: Address;
        const pubKeyStr: string = to.replace('0x', '');
        if (
            (pubKeyStr.length === 64 || pubKeyStr.length === 66 || pubKeyStr.length === 130) &&
            pubKeyStr.match(/^[0-9a-fA-F]+$/) !== null
        ) {
            pubKey = Address.fromString(pubKeyStr);
        } else {
            pubKey = await Web3API.provider.getPublicKeyInfo(to);
        }

        return pubKey;
    };

    const transferToken = async (parameters: TransferParameters) => {
        const userWallet = await getWallet();
        const currentWalletAddress = await wallet.getCurrentAccount();
        const contract: IOP_20Contract = getContract<IOP_20Contract>(
            parameters.contractAddress,
            OP_20_ABI,
            Web3API.provider,
            Web3API.network,
            userWallet.address
        );

        const result = 10 ** parameters.tokens[0].divisibility;
        const amountToSend = BigInt(parameters.inputAmount * result); // Amount to send

        try {
            const address = await getPubKey(parameters.to);
            const transferSimulation = await contract.transfer(address, amountToSend);

            const interactionParameters: TransactionParameters = {
                signer: userWallet.keypair, // The keypair that will sign the transaction
                refundTo: currentWalletAddress.address, // Refund the rest of the funds to this address
                maximumAllowedSatToSpend: parameters.priorityFee, // The maximum we want to allocate to this transaction in satoshis
                feeRate: parameters.feeRate, // We need to provide a fee rate
                network: Web3API.network // The network we are operating on
            };

            const symbol = await contract.symbol();
            const sendTransaction = await transferSimulation.sendTransaction(interactionParameters);
            tools.toastSuccess(
                `You have successfully transferred ${parameters.inputAmount} ${symbol.properties.symbol}`
            );

            // Store the next UTXO in localStorage
            navigate(RouteTypes.TxSuccessScreen, { txid: sendTransaction.transactionId });
        } catch (e) {
            console.log(e);

            setDisabled(false);

            navigate(RouteTypes.TxFailScreen, { error: (e as Error).message });
        }
    };

    function getErrorMessage(err: Error): string {
        let message = `Something went wrong: ${err.message}`;
        if (err.message.includes('Outputs are spending')) {
            message = 'Not enough funds to send transaction including bitcoin mining fee.';
        } else if (err.message.includes('Not finalized')) {
            message = 'Please use a taproot wallet.';
        }

        return message;
    }

    const handleWrapConfirm = async (parameters: WrapParameters) => {
        const currentWalletAddress = await wallet.getCurrentAccount();
        const walletAddress = currentWalletAddress.address;

        const userWallet = await getWallet();

        const wrapAmount = expandToDecimals(parameters.inputAmount, 8);
        const amountRequired = wrapAmount + currentConsensusConfig.UNWRAP_CONSOLIDATION_PREPAID_FEES;

        const account = await wallet.getCurrentAccount();
        const utxos: UTXO[] = await Web3API.getUTXOs([account.address], amountRequired + 100_000n);

        if (utxos.length !== 0) {
            // verify if have enough
            const totalAmount = utxos.reduce((acc, utxo) => acc + utxo.value, 0n);
            if (totalAmount < amountRequired) {
                tools.toastError(`Not enough funds to wrap. You need at least ${amountRequired} sat.`);
                return;
            }
        } else {
            tools.toastError('No UTXOs found');
            return;
        }

        const generationParameters = await Web3API.limitedProvider.fetchWrapParameters(wrapAmount);
        if (!generationParameters) {
            tools.toastError('No generation parameters found');
            return;
        }

        const getChain = await wallet.getChainType();

        if (!Web3API.WBTC) {
            tools.toastError('WBTC contract not found');
            return;
        }

        const wrapParameters: IWrapParameters = {
            from: walletAddress,
            to: Web3API.WBTC.p2tr(Web3API.network),
            chainId: getOPNetChainType(getChain),
            utxos: utxos,
            signer: userWallet.keypair,
            network: Web3API.network,
            feeRate: parameters.feeRate,
            priorityFee: parameters.priorityFee,
            amount: wrapAmount,
            generationParameters: generationParameters
        };

        try {
            const finalTx = await Web3API.transactionFactory.wrap(wrapParameters);
            const firstTransaction = await Web3API.provider.sendRawTransaction(finalTx.transaction[0], false);

            if (!firstTransaction.success) {
                tools.toastError('Error,Please Try again');
                setDisabled(false);
                tools.toastError(firstTransaction.error ?? 'Could not broadcast first transaction');
            }

            const secondTxBroadcast = await Web3API.provider.sendRawTransaction(finalTx.transaction[1], false);
            if (!secondTxBroadcast.success || !secondTxBroadcast.result) {
                tools.toastError('Error,Please Try again');
                setDisabled(false);
                tools.toastError(secondTxBroadcast.error ?? 'Could not broadcast second transaction');
            }

            const wrappedAmount = bigIntToDecimal(wrapAmount, 8).toString();
            tools.toastSuccess(`You have successfully wrapped ${wrappedAmount} ${btcUnit}`);
            navigate(RouteTypes.TxSuccessScreen, { txid: secondTxBroadcast.result });
        } catch (e) {
            const msg = getErrorMessage(e as Error);
            console.warn(e);

            tools.toastWarning(msg);
        }
    };

    const handleUnWrapConfirm = async (parameters: UnwrapParameters) => {
        if (!Web3API.WBTC) {
            tools.toastError('WBTC contract not found');
            return;
        }

        try {
            const currentWalletAddress = await wallet.getCurrentAccount();
            const userWallet = await getWallet();
            const contract: IWBTCContract = getContract<IWBTCContract>(
                Web3API.WBTC,
                WBTC_ABI,
                Web3API.provider,
                Web3API.network,
                userWallet.address
            );

            const wbtcBalanceSimulation = await contract.balanceOf(userWallet.address);
            const wbtcBalance = wbtcBalanceSimulation.properties.balance;

            const checkWithdrawalRequest = await contract.withdrawableBalanceOf(userWallet.address);
            const alreadyWithdrawal = checkWithdrawalRequest.properties.balance;
            const unwrapAmount = expandToDecimals(parameters.inputAmount, 8); // Minimum amount to unwrap

            const totalUserWBTC = wbtcBalance + alreadyWithdrawal;
            if (totalUserWBTC < unwrapAmount) {
                const humanReadableAmount = bigIntToDecimal(totalUserWBTC, 8);

                tools.toastError(`You can only withdraw a maximum of ${humanReadableAmount} WBTC`);
                return;
            }

            const requiredAmountDifference: bigint = alreadyWithdrawal - unwrapAmount;
            if (requiredAmountDifference < 0n) {
                const diff = absBigInt(requiredAmountDifference);

                const withdrawalRequest = await contract.requestWithdrawal(diff);

                const interactionParameters: TransactionParameters = {
                    signer: userWallet.keypair, // The keypair that will sign the transaction
                    refundTo: currentWalletAddress.address, // Refund the rest of the funds to this address
                    maximumAllowedSatToSpend: parameters.priorityFee, // The maximum we want to allocate to this transaction in satoshis
                    feeRate: parameters.feeRate, // We need to provide a fee rate
                    network: Web3API.network // The network we are operating on
                };

                const sendTransaction = await withdrawalRequest.sendTransaction(interactionParameters);

                tools.showLoading(true, 'Waiting for transaction confirmation...');
                await waitForTransaction(sendTransaction.transactionId, setOpenLoading, tools);

                tools.showLoading(false);
            }

            const unwrapUtxos = await Web3API.limitedProvider.fetchUnWrapParameters(unwrapAmount, userWallet.address);
            if (!unwrapUtxos) {
                tools.toastError('Could not fetch unwrap parameters. Please try again later.');
                return;
            }

            const chainId = getOPNetChainType(await wallet.getChainType());
            const utxos = await Web3API.provider.utxoManager.getUTXOsForAmount({
                address: currentWalletAddress.address,
                amount: parameters.priorityFee + 100_000n, // max amount to spend
                throwErrors: true
            });

            const unwrapParameters: IUnwrapParameters = {
                from: currentWalletAddress.address, // Refund to this address
                utxos: utxos,
                chainId: chainId,
                unwrapUTXOs: unwrapUtxos.vaultUTXOs, // Vault UTXOs to unwrap
                signer: userWallet.keypair, // The keypair that will sign the transaction
                network: Web3API.network, // Bitcoin network
                feeRate: parameters.feeRate, // Fee rate in satoshis per byte (bitcoin fee)
                priorityFee: parameters.priorityFee, // OPNet priority fee (incl gas.)
                amount: unwrapAmount
            };

            try {
                const finalTx = await Web3API.transactionFactory.unwrap(unwrapParameters);
                setAcceptWrapMessage(
                    `Due to bitcoin fees, you will only get ${
                        unwrapAmount + finalTx.feeRefundOrLoss
                    } satoshis by unwrapping. Do you want to proceed?`
                );

                setFinalUnwrapTx(finalTx);
                setAcceptBar(true);
            } catch (e) {
                console.log('Something went wrong while building the unwrap transaction', e);
                tools.toastError('Something went wrong while building the unwrap request. Please try again later.');
                setDisabled(false);
            }
        } catch (e) {
            const msg = getErrorMessage(e as Error);
            console.warn(e);

            tools.toastWarning(msg);
        }
    };

    const stake = async (parameters: StakeParameters) => {
        if (!Web3API.WBTC) {
            tools.toastError('WBTC contract not found');
            return;
        }

        const currentWalletAddress = await wallet.getCurrentAccount();
        const userWallet = await getWallet();
        const amountToSend = expandToDecimals(parameters.inputAmount, parameters.tokens[0].divisibility);

        const contract: IWBTCContract = getContract<IWBTCContract>(
            Web3API.WBTC,
            WBTC_ABI,
            Web3API.provider,
            Web3API.network,
            userWallet.address
        );

        const stakeData = (await contract.stake(amountToSend)) as unknown as CallResult;

        const interactionParameters: TransactionParameters = {
            signer: userWallet.keypair, // The keypair that will sign the transaction
            refundTo: currentWalletAddress.address, // Refund the rest of the funds to this address
            maximumAllowedSatToSpend: parameters.priorityFee, // The maximum we want to allocate to this transaction in satoshis
            feeRate: parameters.feeRate, // We need to provide a fee rate
            network: Web3API.network // The network we are operating on
        };

        const sendTransaction = await stakeData.sendTransaction(interactionParameters);

        if (!sendTransaction?.transactionId) {
            setOpenLoading(false);
            setDisabled(false);

            tools.toastError(`Could not send transaction`);
            return;
        }

        const stakeAmount = bigIntToDecimal(amountToSend, 8).toString();
        tools.toastSuccess(`You have successfully staked ${stakeAmount} wBTC`);
        navigate(RouteTypes.TxSuccessScreen, { txid: sendTransaction.transactionId });
    };

    const unstake = async (parameters: UnstakeParameters) => {
        if (!Web3API.WBTC) {
            tools.toastError('WBTC contract not found');
            return;
        }

        const currentWalletAddress = await wallet.getCurrentAccount();
        const userWallet = await getWallet();

        const contract: IWBTCContract = getContract<IWBTCContract>(
            Web3API.WBTC,
            WBTC_ABI,
            Web3API.provider,
            Web3API.network,
            userWallet.address
        );

        const stakeData = await contract.unstake();

        const interactionParameters: TransactionParameters = {
            signer: userWallet.keypair, // The keypair that will sign the transaction
            refundTo: currentWalletAddress.address, // Refund the rest of the funds to this address
            maximumAllowedSatToSpend: parameters.priorityFee, // The maximum we want to allocate to this transaction in satoshis
            feeRate: parameters.feeRate, // We need to provide a fee rate
            network: Web3API.network // The network we are operating on
        };

        const sendTransaction = await stakeData.sendTransaction(interactionParameters);
        if (!sendTransaction?.transactionId) {
            setOpenLoading(false);
            setDisabled(false);

            tools.toastError(`Could not send transaction`);
            return;
        }

        tools.toastSuccess(`You have successfully un-staked WBTC`);

        navigate(RouteTypes.TxSuccessScreen, { txid: sendTransaction.transactionId });
    };

    const airdrop = async (parameters: AirdropParameters) => {
        const contractAddress = parameters.contractAddress;
        const currentWalletAddress = await wallet.getCurrentAccount();
        const userWallet = await getWallet();

        const contract: AirdropInterface = getContract<AirdropInterface>(
            contractAddress,
            AIRDROP_ABI,
            Web3API.provider,
            Web3API.network,
            userWallet.address
        );

        const addressMap = new AddressMap<bigint>();
        parameters.amounts.forEach((amount) => {
            addressMap.set(Address.fromString(amount.pubKey), BigInt(amount.value));
        });

        const airdropData = await contract.airdrop(addressMap);
        const interactionParameters: TransactionParameters = {
            signer: userWallet.keypair, // The keypair that will sign the transaction
            refundTo: currentWalletAddress.address, // Refund the rest of the funds to this address
            maximumAllowedSatToSpend: parameters.priorityFee, // The maximum we want to allocate to this transaction in satoshis
            feeRate: parameters.feeRate, // We need to provide a fee rate
            network: Web3API.network // The network we are operating on
        };

        const sendTransaction = await airdropData.sendTransaction(interactionParameters);
        if (!sendTransaction?.transactionId) {
            setOpenLoading(false);
            setDisabled(false);

            tools.toastError(`Could not send transaction`);
            return;
        }

        tools.toastSuccess(`You have successfully deployed ${contractAddress}`);
        navigate(RouteTypes.TxSuccessScreen, { txid: sendTransaction.transactionId, contractAddress: contractAddress });
    };

    const claim = async (parameters: ClaimParameters) => {
        if (!Web3API.WBTC) {
            tools.toastError('WBTC contract not found');
            return;
        }

        try {
            const currentWalletAddress = await wallet.getCurrentAccount();
            const userWallet = await getWallet();
            const contract: IWBTCContract = getContract<IWBTCContract>(
                Web3API.WBTC,
                WBTC_ABI,
                Web3API.provider,
                Web3API.network,
                userWallet.address
            );

            const stakeData = (await contract.claim()) as unknown as CallResult;

            const interactionParameters: TransactionParameters = {
                signer: userWallet.keypair, // The keypair that will sign the transaction
                refundTo: currentWalletAddress.address, // Refund the rest of the funds to this address
                maximumAllowedSatToSpend: parameters.priorityFee, // The maximum we want to allocate to this transaction in satoshis
                feeRate: parameters.feeRate, // We need to provide a fee rate
                network: Web3API.network // The network we are operating on
            };

            const sendTransaction = await stakeData.sendTransaction(interactionParameters);
            if (!sendTransaction?.transactionId) {
                setOpenLoading(false);
                setDisabled(false);

                tools.toastError(`Could not send transaction`);
                return;
            }

            tools.toastSuccess(`You have successfully claimed WBTC`);
            navigate(RouteTypes.TxSuccessScreen, { txid: sendTransaction.transactionId });
        } catch (e) {
            tools.toastError(`Can not claim WBTC: ${e}`);

            navigate(RouteTypes.TxFailScreen, { error: `${e}` });
        }
    };

    const swap = async (swapParameters: SwapParameters) => {
        if (!routerAddress) {
            tools.toastError('Router address not found');
            return;
        }

        const currentWalletAddress = await wallet.getCurrentAccount();
        const userWallet = await getWallet();

        const getSwap: IMotoswapRouterContract = getContract<IMotoswapRouterContract>(
            routerAddress,
            MOTOSWAP_ROUTER_ABI,
            Web3API.provider,
            Web3API.network,
            userWallet.address
        );

        const inputAmountBigInt = expandToDecimals(swapParameters.amountIn, swapParameters.tokens[0].divisibility);
        const slippageAmount = Number(swapParameters.amountOut) * Number(swapParameters.slippageTolerance / 100);
        const outPutAmountBigInt = expandToDecimals(
            swapParameters.amountOut - slippageAmount,
            swapParameters.tokens[1].divisibility
        );

        const addressOfContract: AddressesInfo = await Web3API.provider.getPublicKeysInfo([
            swapParameters.tokenIn,
            swapParameters.tokenOut
        ]);

        const block = await Web3API.provider.getBlockNumber();
        const contractData = await getSwap.swapExactTokensForTokensSupportingFeeOnTransferTokens(
            inputAmountBigInt,
            outPutAmountBigInt,
            [addressOfContract[swapParameters.tokenIn], addressOfContract[swapParameters.tokenOut]],
            userWallet.address,
            BigInt(swapParameters.deadline) + block
        );

        const interactionParameters: TransactionParameters = {
            signer: userWallet.keypair, // The keypair that will sign the transaction
            refundTo: currentWalletAddress.address, // Refund the rest of the funds to this address
            maximumAllowedSatToSpend: swapParameters.priorityFee, // The maximum we want to allocate to this transaction in satoshis
            feeRate: swapParameters.feeRate, // We need to provide a fee rate
            network: Web3API.network // The network we are operating on
        };

        const sendTransaction = await contractData.sendTransaction(interactionParameters);

        if (!sendTransaction?.transactionId) {
            setOpenLoading(false);
            setDisabled(false);

            tools.toastError(`Could not send transaction`);
            return;
        }

        const amountA = Number(swapParameters.amountIn).toLocaleString();
        const amountB = Number(swapParameters.amountOut).toLocaleString();
        tools.toastSuccess(
            `You have successfully swapped ${amountA} ${swapParameters.tokens[0].symbol} for ${amountB} ${swapParameters.tokens[1].symbol}`
        );

        navigate(RouteTypes.TxSuccessScreen, { txid: sendTransaction.transactionId });
    };

    /*const approveToken = async (inputAmountBigInt: bigint, walletGet: Wallet, tokenAddress: string, utxos: UTXO[]) => {
        try {
            const walletAddressPub = new Address(walletGet.keypair.publicKey);
            if (!routerAddress) {
                tools.toastError('Router address not found');
                return utxos;
            }

            const contract = getContract<IOP_20Contract>(
                tokenAddress,
                OP_20_ABI,
                Web3API.provider,
                Web3API.network,
                walletAddressPub
            );
            const getRemaining = await contract.allowance(walletAddressPub, routerAddress);
            if (getRemaining.properties.allowance > inputAmountBigInt) {
                return utxos;
            }
            const maxUint256 = BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');
            const contractApprove = await contract.approve(routerAddress, maxUint256);

            const interactionParameters: TransactionParameters = {
                signer: walletGet.keypair, // The keypair that will sign the transaction
                refundTo: walletGet.p2tr, // Refund the rest of the funds to this address
                maximumAllowedSatToSpend: rawTxInfo.priorityFee, // The maximum we want to allocate to this transaction in satoshis
                feeRate: rawTxInfo.feeRate, // We need to provide a fee rate
                network: Web3API.network // The network we are operating on
            };

            const sendTransaction = await contractApprove.sendTransaction(interactionParameters);
            if (!sendTransaction?.transactionId) {
                console.log(sendTransaction);
                tools.toastError('Could not broadcast transaction');
            }

            return sendTransaction.newUTXOs;
        } catch (e) {
            setDisabled(false);
            return utxos;
        }
    };*/

    const sendBTC = async (parameters: SendBitcoinParameters) => {
        try {
            const currentWalletAddress = await wallet.getCurrentAccount();
            const userWallet = await getWallet();

            const utxos: UTXO[] = await Web3API.getUTXOs(
                [currentWalletAddress.address],
                expandToDecimals(parameters.inputAmount, 8) * 2n
            );

            const IFundingTransactionParameters: IFundingTransactionParameters = {
                amount: expandToDecimals(parameters.inputAmount, 8),
                utxos: utxos,
                signer: userWallet.keypair,
                network: Web3API.network,
                feeRate: parameters.feeRate,
                priorityFee: parameters.priorityFee,
                to: parameters.to,
                from: currentWalletAddress.address
            };

            console.log('IFundingTransactionParameters', IFundingTransactionParameters);

            const sendTransact = await Web3API.transactionFactory.createBTCTransfer(IFundingTransactionParameters);
            const firstTransaction = await Web3API.provider.sendRawTransaction(sendTransact.tx, false);
            if (!firstTransaction?.success) {
                setDisabled(false);
                tools.toastError('Error: Could not broadcast first transaction');
                return;
            }

            const amountA = Number(parameters.inputAmount).toLocaleString();
            tools.toastSuccess(`You have successfully transferred ${amountA} ${btcUnit}`);

            navigate(RouteTypes.TxSuccessScreen, { txid: firstTransaction.result });
        } catch (e) {
            tools.toastError(`Error: ${(e as Error).message}`);
            setDisabled(false);
            throw e;
        }
    };

    const deployContract = async (parameters: DeployContractParameters) => {
        try {
            const currentWalletAddress = await wallet.getCurrentAccount();
            const userWallet = await getWallet();

            const utxos: UTXO[] = await Web3API.getUTXOs([currentWalletAddress.address], 1_000_000n); // maximum fee a contract can pay

            const arrayBuffer = await parameters.file.arrayBuffer();
            const uint8Array = new Uint8Array(arrayBuffer);

            const deploymentParameters: IDeploymentParameters = {
                utxos: utxos,
                signer: userWallet.keypair,
                network: Web3API.network,
                feeRate: parameters.feeRate,
                priorityFee: parameters.priorityFee,
                from: currentWalletAddress.address,
                bytecode: Buffer.from(uint8Array)
            };

            const sendTransact: DeploymentResult = await Web3API.transactionFactory.signDeployment(
                deploymentParameters
            );

            const firstTransaction = await Web3API.provider.sendRawTransaction(sendTransact.transaction[0], false);
            if (!firstTransaction?.success || firstTransaction.error) {
                setDisabled(false);
                tools.toastError(firstTransaction.error ?? 'Could not broadcast first transaction');

                return;
            }

            // This transaction is partially signed. You can not submit it to the Bitcoin network. It must pass via the OPNet network.
            const secondTransaction = await Web3API.provider.sendRawTransaction(sendTransact.transaction[1], false);
            if (secondTransaction.result && !secondTransaction.error && secondTransaction.success) {
                await waitForTransaction(secondTransaction.result, setOpenLoading, tools);

                const getChain = await wallet.getChainType();
                const tokensImported = localStorage.getItem('opnetTokens_' + getChain);
                let updatedTokens: string[] = tokensImported ? JSON.parse(tokensImported) : [];
                if (tokensImported) {
                    updatedTokens = JSON.parse(tokensImported);
                }

                if (!updatedTokens.includes(sendTransact.contractAddress.toString())) {
                    updatedTokens.push(sendTransact.contractAddress.toString());
                    localStorage.setItem('opnetTokens_' + getChain, JSON.stringify(updatedTokens));
                }

                tools.toastSuccess(`You have successfully deployed ${sendTransact.contractAddress}`);

                navigate(RouteTypes.TxSuccessScreen, {
                    txid: secondTransaction.result,
                    contractAddress: sendTransact.contractAddress
                });
            } else {
                tools.toastError(`Error: ${secondTransaction.error}`);

                setOpenLoading(false);
                setDisabled(false);
            }
        } catch (e) {
            console.log(e);
            tools.toastError(`Error: ${e}`);
            setDisabled(false);
            setDisabled(false);
        }
    };

    const mint = async (parameters: MintParameters) => {
        try {
            const currentWalletAddress = await wallet.getCurrentAccount();
            const userWallet = await getWallet();

            const contract = getContract<IOP_20Contract>(
                parameters.contractAddress,
                OP_20_ABI,
                Web3API.provider,
                Web3API.network,
                userWallet.address
            );

            const value = expandToDecimals(parameters.inputAmount, parameters.tokens[0].divisibility);
            const mintData = await contract.mint(Address.fromString(parameters.to), BigInt(value));

            const interactionParameters: TransactionParameters = {
                signer: userWallet.keypair, // The keypair that will sign the transaction
                refundTo: currentWalletAddress.address, // Refund the rest of the funds to this address
                maximumAllowedSatToSpend: parameters.priorityFee, // The maximum we want to allocate to this transaction in satoshis
                feeRate: parameters.feeRate, // We need to provide a fee rate
                network: Web3API.network // The network we are operating on
            };

            const sendTransaction = await mintData.sendTransaction(interactionParameters);

            if (!sendTransaction?.transactionId) {
                console.log(sendTransaction);
                tools.toastError('Could not broadcast transaction');
                return;
            }

            tools.toastSuccess(`You have successfully minted ${parameters.inputAmount} `);
            navigate(RouteTypes.TxSuccessScreen, { txid: sendTransaction.transactionId });
        } catch (e) {
            setDisabled(false);
            console.log(e);
        }
    };
    return (
        <Layout>
            <Header
                onBack={() => {
                    window.history.go(-1);
                }}
                title={rawTxInfo.header}
            />
            <Content>
                <Column gap="xl">
                    <Section title="Network Fee Rate:">
                        <Text text={rawTxInfo.feeRate.toString()} />

                        <Text text="sat/vB" color="textDim" />
                    </Section>

                    <Section title="Opnet Fee Rate:">
                        <Text text={rawTxInfo.priorityFee.toString()} />

                        <Text text="sat/vB" color="textDim" />
                    </Section>
                    <Section title="Features:">
                        <Row>
                            {rawTxInfo.features.rbf ? (
                                <Text
                                    text="RBF"
                                    color="white"
                                    style={{ backgroundColor: 'green', padding: 5, borderRadius: 5 }}
                                />
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
                    {/*
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
                                                    <RunesPreviewCard
                                                        key={index}
                                                        balance={w}
                                                        price={{ curPrice: 0, changePercent: 0 }}
                                                    />
                                                ))}
                                            </Row>
                                        </Column>
                                    </Row>
                                </Column>
                            </Card>
                        </Column>
                    </Column>
                         */}
                </Column>
            </Content>

            <Footer>
                <Row full>
                    <Button preset="default" text="Reject" onClick={handleCancel} full />
                    <Button
                        preset="primary"
                        disabled={disabled}
                        icon={undefined}
                        text={'Sign'}
                        onClick={async () => {
                            setDisabled(true);
                            switch (rawTxInfo.action) {
                                case Action.Wrap:
                                    await handleWrapConfirm(rawTxInfo);
                                    break;
                                case Action.Unwrap:
                                    await handleUnWrapConfirm(rawTxInfo);
                                    break;
                                case Action.Stake:
                                    await stake(rawTxInfo);
                                    break;
                                case Action.Unstake:
                                    await unstake(rawTxInfo);
                                    break;
                                case Action.Claim:
                                    await claim(rawTxInfo);
                                    break;
                                case Action.Swap:
                                    if (!('amountIn' in rawTxInfo)) {
                                        throw new Error('Invalid swap parameters');
                                    }

                                    await swap(rawTxInfo);
                                    break;
                                case Action.SendBitcoin:
                                    await sendBTC(rawTxInfo);
                                    break;
                                case Action.DeployContract:
                                    await deployContract(rawTxInfo);
                                    break;
                                case Action.Mint:
                                    await mint(rawTxInfo);
                                    break;
                                case Action.Airdrop:
                                    if (!('amounts' in rawTxInfo)) {
                                        throw new Error('Amounts not found');
                                    }

                                    await airdrop(rawTxInfo);
                                    break;
                                case Action.Transfer: {
                                    if (!('contractAddress' in rawTxInfo)) {
                                        tools.toastError('Contract address not found');
                                        return;
                                    }

                                    if (!('to' in rawTxInfo)) {
                                        tools.toastError('Destination address not found');
                                        return;
                                    }

                                    await transferToken(rawTxInfo);
                                    break;
                                }
                            }
                        }}
                        full
                    />
                </Row>
            </Footer>
            {openAcceptbar && (
                <ConfirmUnWrap
                    onClose={() => {
                        setDisabled(false);
                        setAcceptBar(false);
                    }}
                    acceptWrapMessage={acceptWrapMessage}
                    setAcceptWrap={setAcceptWrap}
                />
            )}
            {openLoading && (
                <BottomModal
                    onClose={() => {
                        setDisabled(false);
                        setOpenLoading(false);
                    }}>
                    <Column style={{ minHeight: 150 }} itemsCenter justifyCenter>
                        <LoadingOutlined />
                    </Column>
                </BottomModal>
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
