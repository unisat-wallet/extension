import { useMemo } from 'react';

import { Atomical, Inscription, RawTxInfo, RuneBalance, TickPriceItem, TxType } from '@/shared/types';
import { Card, Column, Image, Row, Text } from '@/ui/components';
import { AddressText } from '@/ui/components/AddressText';
import Arc20PreviewCard from '@/ui/components/Arc20PreviewCard';
import AssetTag from '@/ui/components/AssetTag';
import BRC20Preview from '@/ui/components/BRC20Preview';
import { BtcUsd } from '@/ui/components/BtcUsd';
import InscriptionPreview from '@/ui/components/InscriptionPreview';
import RunesPreviewCard from '@/ui/components/RunesPreviewCard';
import { useI18n } from '@/ui/hooks/useI18n';
import { useAccountAddress } from '@/ui/state/accounts/hooks';
import { useBTCUnit, useChain } from '@/ui/state/settings/hooks';
import { colors } from '@/ui/theme/colors';
import { satoshisToAmount } from '@/ui/utils';

import { TxInfo } from '../types';

export default function SignTxDetails({
  txInfo,
  type,
  rawTxInfo,
  runesPriceMap,
  brc20PriceMap
}: {
  txInfo: TxInfo;
  rawTxInfo?: RawTxInfo;
  type: TxType;
  runesPriceMap: undefined | { [key: string]: TickPriceItem };
  brc20PriceMap: undefined | { [key: string]: TickPriceItem };
}) {
  const address = useAccountAddress();
  const chain = useChain();
  const btcUnit = useBTCUnit();
  const { t } = useI18n();

  const sendingInscriptions = useMemo(() => {
    return txInfo.decodedPsbt.inputInfos
      .reduce<Inscription[]>((pre, cur) => cur.inscriptions.concat(pre), [])
      .filter((v) => v.address == address);
  }, [txInfo.decodedPsbt]);

  const receivingInscriptions = useMemo(() => {
    return txInfo.decodedPsbt.outputInfos
      .reduce<Inscription[]>((pre, cur) => cur.inscriptions.concat(pre), [])
      .filter((v) => v.address == address);
  }, [txInfo.decodedPsbt]);

  const isCurrentToPayFee = useMemo(() => {
    if (type === TxType.SIGN_TX) {
      return false;
    } else {
      return true;
    }
  }, [type]);

  const spendSatoshis = useMemo(() => {
    const inValue = txInfo.decodedPsbt.inputInfos
      .filter((v) => v.address === address)
      .reduce((pre, cur) => cur.value + pre, 0);
    const outValue = txInfo.decodedPsbt.outputInfos
      .filter((v) => v.address === address)
      .reduce((pre, cur) => cur.value + pre, 0);
    const spend = inValue - outValue;
    return spend;
  }, [txInfo.decodedPsbt]);

  const sendingSatoshis = useMemo(() => {
    const inValue = txInfo.decodedPsbt.inputInfos
      .filter((v) => v.address === address)
      .reduce((pre, cur) => cur.value + pre, 0);
    return inValue;
  }, [txInfo.decodedPsbt]);

  const receivingSatoshis = useMemo(() => {
    const outValue = txInfo.decodedPsbt.outputInfos
      .filter((v) => v.address === address)
      .reduce((pre, cur) => cur.value + pre, 0);
    return outValue;
  }, [txInfo.decodedPsbt]);

  const spendAmount = useMemo(() => satoshisToAmount(spendSatoshis), [spendSatoshis]);
  const balanceChangedAmount = useMemo(
    () => satoshisToAmount(receivingSatoshis - sendingSatoshis),
    [sendingSatoshis, receivingSatoshis]
  );
  const feeAmount = useMemo(() => satoshisToAmount(txInfo.decodedPsbt.fee), [txInfo.decodedPsbt]);

  const sendingInscriptionSaotoshis = useMemo(
    () => sendingInscriptions.reduce((pre, cur) => pre + cur.outputValue, 0),
    [sendingInscriptions]
  );
  const sendingInscriptionAmount = useMemo(
    () => satoshisToAmount(sendingInscriptionSaotoshis),
    [sendingInscriptionSaotoshis]
  );

  const ordinalsInscriptionCount = txInfo.decodedPsbt.inputInfos.reduce(
    (pre, cur) => cur.inscriptions?.length + pre,
    0
  );
  const atomicalsNFTCount = txInfo.decodedPsbt.inputInfos.reduce(
    (pre, cur) => cur.atomicals.filter((v) => v.type === 'NFT').length + pre,
    0
  );
  const arc20Count = txInfo.decodedPsbt.inputInfos.reduce(
    (pre, cur) => cur.atomicals.filter((v) => v.type === 'FT').length + pre,
    0
  );

  const runesCount = txInfo.decodedPsbt.inputInfos.reduce((pre, cur) => (cur.runes ? cur.runes.length : 0) + pre, 0);

  const brc20Count = 0;

  const atomicals_nft: Atomical[] = [];
  const atomicals_ft: Atomical[] = [];
  const arc20Map: { [ticker: string]: number } = {};
  txInfo.decodedPsbt.inputInfos.forEach((v) => {
    v.atomicals.forEach((w) => {
      if (w.type === 'FT') {
        atomicals_ft.push(w);
        const ticker = w.ticker || '';
        arc20Map[ticker] = (arc20Map[ticker] || 0) + w.atomicalValue;
      } else {
        atomicals_nft.push(w);
      }
    });
  });
  const inscriptionArray = Object.values(txInfo.decodedPsbt.inscriptions);
  const arc20Array = Object.keys(arc20Map).map((v) => ({ ticker: v, amt: arc20Map[v] }));

  const brc20Array: { tick: string; amt: string; inscriptionNumber: number; preview: string }[] = [];
  txInfo.decodedPsbt.inputInfos.forEach((v) => {
    v.inscriptions.forEach((w) => {
      const inscriptionInfo = txInfo.decodedPsbt.inscriptions[w.inscriptionId];
      if (inscriptionInfo.brc20 && inscriptionInfo.brc20.op == 'transfer') {
        brc20Array.push({
          tick: inscriptionInfo.brc20.tick,
          amt: inscriptionInfo.brc20.amt,
          inscriptionNumber: w.inscriptionNumber,
          preview: inscriptionInfo.preview
        });
      }
    });
  });

  const runesArray: RuneBalance[] = [];
  txInfo.decodedPsbt.inputInfos.forEach((v) => {
    if (v.runes) {
      v.runes.forEach((w) => {
        runesArray.push(w);
      });
    }
  });

  const involvedAssets = useMemo(() => {
    const involved =
      ordinalsInscriptionCount > 0 || atomicalsNFTCount > 0 || arc20Count > 0 || brc20Count > 0 || runesCount > 0;
    if (!involved) return;
    return (
      <Column>
        <Text text={t('involved_assets')} preset="bold" />
        <Column justifyCenter>
          {ordinalsInscriptionCount > 0 ? (
            <Column
              fullX
              px="md"
              pt="md"
              pb="md"
              style={{
                backgroundColor: '#1e1a1e',
                borderRadius: 10,
                borderWidth: 1,
                borderColor: colors.border
              }}>
              <Row>
                <AssetTag type="Inscription" />
              </Row>

              <Row overflowX>
                {inscriptionArray.map((inscription, index) => {
                  return (
                    <div style={{ width: '80px' }} key={'inscription_' + index}>
                      <InscriptionPreview
                        key={'inscription_' + index}
                        data={inscription}
                        preset="small"
                        hideValue
                        onClick={() => {
                          window.open(inscription.preview);
                        }}
                      />
                    </div>
                  );
                })}
              </Row>
            </Column>
          ) : null}

          {arc20Array.length > 0 ? (
            <Column
              fullX
              px="md"
              pt="md"
              pb="md"
              style={{
                backgroundColor: '#1e1a1e',
                borderRadius: 10,
                borderWidth: 1,
                borderColor: colors.border
              }}>
              <Row>
                <AssetTag type="ARC20" />
              </Row>

              <Row overflowX>
                {arc20Array.map((w, index) => {
                  return <Arc20PreviewCard key={w.ticker} ticker={w.ticker || ''} amt={w.amt} />;
                })}
              </Row>
            </Column>
          ) : null}

          {brc20Array.length > 0 ? (
            <Column
              fullX
              px="md"
              pt="md"
              pb="md"
              style={{
                backgroundColor: '#1e1a1e',
                borderRadius: 10,
                borderWidth: 1,
                borderColor: colors.border
              }}>
              <Row>
                <AssetTag type="BRC20" />
              </Row>

              <Row overflowX>
                {brc20Array.map((w, index) => {
                  return (
                    <BRC20Preview
                      preset="small"
                      key={w.tick}
                      tick={w.tick || ''}
                      balance={w.amt}
                      type="TRANSFER"
                      inscriptionNumber={w.inscriptionNumber}
                      onClick={() => {
                        window.open(w.preview);
                      }}
                      priceInProps={true}
                      price={brc20PriceMap?.[w.tick]}
                    />
                  );
                })}
              </Row>
            </Column>
          ) : null}

          {runesArray.length > 0 ? (
            <Column
              fullX
              px="md"
              pt="md"
              pb="md"
              style={{
                backgroundColor: '#1e1a1e',
                borderRadius: 10,
                borderWidth: 1,
                borderColor: colors.border
              }}>
              <Row>
                <AssetTag type="RUNES" />
              </Row>

              <Row overflowX>
                {runesArray.map((w, index) => {
                  return <RunesPreviewCard key={'runes_' + index} balance={w} price={runesPriceMap?.[w.spacedRune]} />;
                })}
              </Row>
            </Column>
          ) : null}
        </Column>
      </Column>
    );
  }, []);

  if (type === TxType.SIGN_TX) {
    return (
      <Column gap="lg">
        <Row itemsCenter justifyCenter fullX py={'sm'}>
          <Text text={t('sign_transaction')} preset="title-bold" textCenter />
        </Row>
        <Row justifyCenter fullX>
          <Card style={{ backgroundColor: '#272626', flex: '1' }}>
            <Column fullX itemsCenter>
              <Row itemsCenter>
                <Image src={chain.icon} size={24} />
                <Text text={chain.label} />
              </Row>
              <Row
                style={{ borderTopWidth: 1, borderColor: colors.border, borderStyle: 'dashed', alignSelf: 'stretch' }}
                my="md"
              />
              <Column justifyCenter>
                <Row itemsCenter>
                  <Text
                    text={(receivingSatoshis > sendingSatoshis ? '+' : '') + balanceChangedAmount}
                    color={receivingSatoshis > sendingSatoshis ? 'white' : 'white'}
                    preset="bold"
                    textCenter
                    size="xxl"
                  />
                  <Text text={btcUnit} color="textDim" />
                </Row>
                <Row justifyCenter>
                  <BtcUsd sats={Math.abs(receivingSatoshis - sendingSatoshis)} bracket />
                </Row>
              </Column>
            </Column>
          </Card>
        </Row>
        <div />

        {involvedAssets}
      </Column>
    );
  }

  return (
    <Column gap="lg" style={{ position: 'relative' }}>
      <Row itemsCenter justifyCenter fullX py={'sm'}>
        <Text text={t('sign_transaction')} preset="title-bold" textCenter />
      </Row>
      <Row justifyCenter>
        <Card style={{ backgroundColor: '#272626', flex: '1' }}>
          <Column fullX itemsCenter>
            <Row itemsCenter justifyCenter>
              <Image src={chain.icon} size={24} />
              <Text text={chain.label} />
            </Row>
            <Row
              style={{ borderTopWidth: 1, borderColor: colors.border, borderStyle: 'dashed', alignSelf: 'stretch' }}
              my="md"
            />
            {rawTxInfo && (
              <Column>
                <Text text={t('send_to')} textCenter color="textDim" />
                <Row justifyCenter>
                  <AddressText addressInfo={rawTxInfo.toAddressInfo} textCenter />
                </Row>
              </Column>
            )}
            {rawTxInfo && (
              <Row
                style={{ borderTopWidth: 1, borderColor: colors.border, borderStyle: 'dashed', alignSelf: 'stretch' }}
                my="md"
              />
            )}

            {sendingInscriptions.length > 0 && (
              <Column justifyCenter>
                <Text
                  text={
                    sendingInscriptions.length === 1
                      ? t('spend_inscription')
                      : `${t('spend_inscription')} (${sendingInscriptions.length})`
                  }
                  textCenter
                  color="textDim"
                />
                <Row overflowX gap="lg" justifyCenter style={{ width: 280 }} pb="lg">
                  {sendingInscriptions.map((v) => (
                    <InscriptionPreview key={v.inscriptionId} data={v} preset="small" hideValue />
                  ))}
                </Row>
              </Column>
            )}
            {sendingInscriptions.length > 0 && (
              <Row style={{ borderTopWidth: 1, borderColor: colors.border }} my="md" />
            )}

            <Column>
              <Text text={t('spend_amount')} textCenter color="textDim" />

              <Column justifyCenter>
                <Row itemsCenter>
                  <Text text={spendAmount + ' ' + btcUnit} color="white" preset="bold" textCenter size="xxl" />
                </Row>
                <BtcUsd sats={spendSatoshis} textCenter bracket style={{ marginTop: -8 }} />

                {sendingInscriptionSaotoshis > 0 && (
                  <Text text={`${sendingInscriptionAmount} (${t('in_inscriptions')})`} preset="sub" textCenter />
                )}
                {isCurrentToPayFee && (
                  <Text text={`${feeAmount} ${btcUnit} (${t('network_fee_2')})`} preset="sub" textCenter />
                )}
              </Column>
            </Column>
          </Column>
        </Card>
      </Row>
      {involvedAssets}
    </Column>
  );
}
