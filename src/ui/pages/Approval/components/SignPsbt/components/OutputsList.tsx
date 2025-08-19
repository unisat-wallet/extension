import { Card, Column, Row, ScrollableList, Text } from '@/ui/components';
import { AddressText } from '@/ui/components/AddressText';
import { colors } from '@/ui/theme/colors';
import { satoshisToAmount } from '@/ui/utils';

import AssetList from './AssetList';
import ContractSection from './ContractSection';

const OutputsList = ({ txInfo, t, currentAccount, btcUnit, canChanged, runesPriceMap, setContractPopoverData }) => {
  const outputInfos = txInfo.decodedPsbt.outputInfos;

  const renderOutputItem = (v, index) => {
    const isMyAddress = v.address === currentAccount.address;
    const inscriptions = v.inscriptions;
    const runes = v.runes || [];
    const alkanes = v.alkanes || [];

    // only show inscriptions when the condition is met
    const filteredInscriptions = !canChanged ? inscriptions : [];

    return (
      <Column style={index === 0 ? {} : { borderColor: colors.border, borderTopWidth: 1, paddingTop: 10 }}>
        <Column>
          <Row justifyBetween>
            <Column>
              <AddressText address={v.address} color={isMyAddress ? 'white' : 'textDim'} />
              {v.contract && <ContractSection contract={v.contract} setContractPopoverData={setContractPopoverData} />}
            </Column>

            <Row>
              <Text text={`${satoshisToAmount(v.value)}`} color={isMyAddress ? 'white' : 'textDim'} />
              <Text text={btcUnit} color="textDim" />
            </Row>
          </Row>
        </Column>

        <AssetList
          inscriptions={filteredInscriptions}
          runes={runes}
          txInfo={txInfo}
          alkanes={alkanes}
          t={t}
          isMyAddress={isMyAddress}
          runesPriceMap={runesPriceMap}
          isToSign={false}
        />
      </Column>
    );
  };

  return (
    <Column>
      <Text text={`${t('outputs')}: (${outputInfos.length})`} preset="bold" />
      <Card>
        <ScrollableList
          items={outputInfos}
          renderItem={renderOutputItem}
          maxVisibleItems={5}
          showScrollIndicator={true}
          showJumpButtons={true}
          emptyText={t('no_outputs')}
          itemHeight={70}
          style={{ width: '100%' }}
        />
      </Card>
    </Column>
  );
};

export default OutputsList;
