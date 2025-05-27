import { useEffect, useMemo, useState } from 'react';

import { KEYRING_TYPE } from '@/shared/constant';
import { KeystoneSignEnum } from '@/shared/constant/KeystoneSignType';
import { TxType } from '@/shared/types';
import { Column, Content, Footer, Header, Layout } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import { ContractPopover } from '@/ui/components/ContractPopover';
import LoadingPage from '@/ui/components/LoadingPage';
import { PhishingDetection } from '@/ui/components/PhishingDetection';
import { SignPsbtWithRisksPopover } from '@/ui/components/SignPsbtWithRisksPopover';
import WebsiteBar from '@/ui/components/WebsiteBar';
import { useI18n } from '@/ui/hooks/useI18n';
import KeystoneSignScreen from '@/ui/pages/Wallet/KeystoneSignScreen';
import { useAccountAddress, useCurrentAccount } from '@/ui/state/accounts/hooks';
import { useBTCUnit } from '@/ui/state/settings/hooks';
import {
  usePrepareSendAlkanesCallback,
  usePrepareSendAtomicalsNFTCallback,
  usePrepareSendBTCCallback,
  usePrepareSendOrdinalsInscriptionCallback,
  usePrepareSendRunesCallback
} from '@/ui/state/transactions/hooks';
import { satoshisToAmount, useApproval, useWallet } from '@/ui/utils';

import FeaturesSection from './components/FeaturesSection';
import FeeSection from './components/FeeSection';
import FooterActions from './components/FooterActions';
import InputsList from './components/InputsList';
import OutputsList from './components/OutputsList';
import PsbtDataSection from './components/PsbtDataSection';
import SignTxDetails from './components/SignTxDetails';
import { initTxInfo } from './const';
import { usePriceFetcher } from './hooks/usePriceFetcher';
import { usePsbtInitializer } from './hooks/usePsbtInitializer';
import { Props, TxInfo } from './types';

export default function SignPsbt({
  params: {
    data: {
      psbtHex,
      options,
      type,
      sendBitcoinParams,
      sendInscriptionParams,
      sendRunesParams,
      rawTxInfo,
      sendAlkanesParams
    },
    session
  },
  header,
  handleCancel,
  handleConfirm
}: Props) {
  const [getApproval, resolveApproval, rejectApproval] = useApproval();
  const [txInfo, setTxInfo] = useState<TxInfo>(initTxInfo);
  const [loading, setLoading] = useState(true);
  const [isPsbtRiskPopoverVisible, setIsPsbtRiskPopoverVisible] = useState(false);
  const [isKeystoneSigning, setIsKeystoneSigning] = useState(false);
  const [contractPopoverData, setContractPopoverData] = useState(undefined);

  const wallet = useWallet();
  const tools = useTools();
  const address = useAccountAddress();
  const currentAccount = useCurrentAccount();
  const btcUnit = useBTCUnit();
  const { t } = useI18n();

  const prepareSendBTC = usePrepareSendBTCCallback();
  const prepareSendOrdinalsInscription = usePrepareSendOrdinalsInscriptionCallback();
  const prepareSendAtomicalsInscription = usePrepareSendAtomicalsNFTCallback;
  const prepareSendRunes = usePrepareSendRunesCallback();
  const prepareSendAlkanes = usePrepareSendAlkanesCallback();

  // get price data
  const { brc20PriceMap, runesPriceMap } = usePriceFetcher(txInfo, wallet, tools);

  // initialize PSBT
  const { initializePsbt: initialize } = usePsbtInitializer(setTxInfo, setLoading, tools);
  // initialize
  useEffect(() => {
    initialize({
      type,
      psbtHex,
      options,
      sendBitcoinParams,
      sendInscriptionParams,
      sendRunesParams,
      sendAlkanesParams,
      session,
      currentAccount,
      wallet,
      prepareSendBTC,
      prepareSendOrdinalsInscription,
      prepareSendRunes,
      prepareSendAlkanes
    });
  }, []);

  const defaultHandleCancel = () => rejectApproval();
  const actualHandleCancel = handleCancel || defaultHandleCancel;

  const defaultHandleConfirm = (res) => {
    let signed = true;
    if (type === TxType.SIGN_TX && currentAccount.type !== KEYRING_TYPE.KeystoneKeyring) {
      signed = false;
    }
    console.log('SignPsbt handleConfirm', res, txInfo);
    resolveApproval({
      psbtHex: (res ?? txInfo).psbtHex,
      signed
    });
  };
  const originalHandleConfirm = handleConfirm || defaultHandleConfirm;

  // Keystone wallet handle
  const finalHandleConfirm =
    currentAccount.type === KEYRING_TYPE.KeystoneKeyring ? () => setIsKeystoneSigning(true) : originalHandleConfirm;

  const networkFee = useMemo(() => satoshisToAmount(txInfo.decodedPsbt.fee), [txInfo.decodedPsbt]);

  const detailsComponent = useMemo(
    () => (
      <SignTxDetails
        txInfo={txInfo}
        rawTxInfo={rawTxInfo}
        type={type}
        runesPriceMap={runesPriceMap}
        brc20PriceMap={brc20PriceMap}
      />
    ),
    [txInfo, brc20PriceMap, runesPriceMap, type, rawTxInfo]
  );

  const isValidData = useMemo(() => txInfo.psbtHex !== '', [txInfo.psbtHex]);

  const isValid = useMemo(
    () => txInfo.toSignInputs.length > 0 && txInfo.decodedPsbt.inputInfos.length > 0,
    [txInfo.decodedPsbt, txInfo.toSignInputs]
  );

  const canChanged = useMemo(() => {
    let val = true;
    txInfo.decodedPsbt.inputInfos.forEach((v) => {
      if (v.address === address && (!v.sighashType || v.sighashType === 1)) {
        val = false;
      }
    });
    return val;
  }, [txInfo.decodedPsbt, address]);

  // condition render
  if (loading) {
    return <LoadingPage />;
  }

  if (!header && session) {
    header = (
      <Header>
        <WebsiteBar session={session} />
      </Header>
    );
  }

  if (txInfo.decodedPsbt.isScammer) {
    return <PhishingDetection handleCancel={actualHandleCancel} />;
  }

  if (isKeystoneSigning) {
    return (
      <KeystoneSignScreen
        type={KeystoneSignEnum.PSBT}
        data={txInfo.psbtHex}
        isFinalize={options?.autoFinalized !== false}
        onSuccess={(data) => originalHandleConfirm(data as any)}
        onBack={() => setIsKeystoneSigning(false)}
      />
    );
  }

  return (
    <Layout>
      {header}
      <Content>
        <Column gap="xl">
          {detailsComponent}
          <div />

          {/* fee area */}
          {!canChanged && <FeeSection txInfo={txInfo} t={t} networkFee={networkFee} btcUnit={btcUnit} />}

          {/* features */}
          <FeaturesSection txInfo={txInfo} t={t} />

          {/* input output details */}
          {isValidData && (
            <Column gap="xl">
              <InputsList
                txInfo={txInfo}
                t={t}
                address={address}
                btcUnit={btcUnit}
                runesPriceMap={runesPriceMap}
                setContractPopoverData={setContractPopoverData}
              />

              <OutputsList
                txInfo={txInfo}
                t={t}
                currentAccount={currentAccount}
                btcUnit={btcUnit}
                canChanged={canChanged}
                runesPriceMap={runesPriceMap}
                setContractPopoverData={setContractPopoverData}
              />
            </Column>
          )}

          {/* PSBT data */}
          <PsbtDataSection txInfo={txInfo} t={t} tools={tools} />
        </Column>
      </Content>

      {/* footer buttons */}
      <Footer>
        <FooterActions
          txInfo={txInfo}
          type={type}
          isValid={isValid}
          t={t}
          handleCancel={actualHandleCancel}
          handleConfirm={finalHandleConfirm}
          setIsPsbtRiskPopoverVisible={setIsPsbtRiskPopoverVisible}
        />
      </Footer>

      {/* popup component */}
      {isPsbtRiskPopoverVisible && (
        <SignPsbtWithRisksPopover
          decodedPsbt={txInfo.decodedPsbt}
          onClose={() => setIsPsbtRiskPopoverVisible(false)}
          onConfirm={() => {
            setIsPsbtRiskPopoverVisible(false);
            finalHandleConfirm();
          }}
        />
      )}

      {contractPopoverData && (
        <ContractPopover contract={contractPopoverData} onClose={() => setContractPopoverData(undefined)} />
      )}
    </Layout>
  );
}
