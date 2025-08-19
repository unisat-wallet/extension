import { Column, Row, Text } from '@/ui/components';
import AlkanesNFTPreview from '@/ui/components/AlkanesNFTPreview';
import AlkanesPreviewCard from '@/ui/components/AlkanesPreviewCard/AlkanesPreviewCard';
import InscriptionPreview from '@/ui/components/InscriptionPreview';
import RunesPreviewCard from '@/ui/components/RunesPreviewCard';

const AssetList = ({ inscriptions, runes, txInfo, alkanes, t, isToSign, isMyAddress, runesPriceMap }) => {
  // use provided properties isToSign or isMyAddress to determine text color
  const textColor = isToSign ? 'white' : isMyAddress ? 'white' : 'textDim';

  return (
    <>
      {inscriptions.length > 0 && (
        <Row>
          <Column justifyCenter>
            <Text text={`${t('inscriptions')} (${inscriptions.length})`} color={textColor} />
            <Row overflowX gap="lg" style={{ width: 280 }} pb="lg">
              {inscriptions.map((w) => (
                <InscriptionPreview
                  key={w.inscriptionId}
                  data={txInfo.decodedPsbt.inscriptions[w.inscriptionId]}
                  preset="small"
                  hideValue
                  onClick={() => {
                    window.open(txInfo.decodedPsbt.inscriptions[w.inscriptionId]?.preview);
                  }}
                />
              ))}
            </Row>
          </Column>
        </Row>
      )}

      {runes.length > 0 && (
        <Row>
          <Column justifyCenter>
            <Text text={t('runes')} color={textColor} />
            <Row overflowX gap="lg" style={{ width: 280 }} pb="lg">
              {runes.map((w) => (
                <RunesPreviewCard key={w.runeid} balance={w} price={runesPriceMap?.[w.spacedRune]} />
              ))}
            </Row>
          </Column>
        </Row>
      )}

      {alkanes.length > 0 && (
        <Row>
          <Column justifyCenter>
            <Text text={t('alkanes') || 'Alkanes'} color={textColor} />
            <Row overflowX gap="lg" style={{ width: 280 }} pb="lg">
              {alkanes.map((v) => {
                if (v.type === 'nft') {
                  return <AlkanesNFTPreview key={v.alkaneid} alkanesInfo={v} preset="small" />;
                } else {
                  return <AlkanesPreviewCard key={v.alkaneid} balance={v} />;
                }
              })}
            </Row>
          </Column>
        </Row>
      )}
    </>
  );
};

export default AssetList;
