import { Card, Column, Row, ScrollableList, Text } from '@/ui/components';
import { AddressText } from '@/ui/components/AddressText';
import { colors } from '@/ui/theme/colors';
import { satoshisToAmount } from '@/ui/utils';

import AssetList from './AssetList';
import ContractSection from './ContractSection';

const InputsList = ({ txInfo, t, address, btcUnit, runesPriceMap, setContractPopoverData }) => {
  const inputInfos = txInfo.decodedPsbt.inputInfos;

  const renderInputItem = (v, index) => {
    const isToSign = txInfo.toSignInputs.find((input) => input.index === index);
    const inscriptions = v.inscriptions;
    const runes = v.runes || [];
    const alkanes = v.alkanes || [];

    return (
      <Row style={index === 0 ? {} : { borderColor: colors.border, borderTopWidth: 1, paddingTop: 10 }} itemsCenter>
        <Column fullX>
          <Row fullX justifyBetween>
            <Column>
              <Row>
                <AddressText
                  inputInfo={{
                    txid: v.txid,
                    vout: v.vout,
                    value: v.value,
                    address: v.address,
                    inscriptions,
                    runes,
                    alkanes
                  }}
                  address={v.address}
                  color={isToSign ? 'white' : 'textDim'}
                />
                {isToSign && (
                  <Row style={{ borderWidth: 1, borderColor: 'gold', borderRadius: 5, padding: 2 }}>
                    <Text text={t('to_sign')} color="gold" size="xs" />
                  </Row>
                )}
              </Row>
              {v.contract && <ContractSection contract={v.contract} setContractPopoverData={setContractPopoverData} />}
            </Column>
            <Row>
              <Text text={`${satoshisToAmount(v.value)}`} color={isToSign ? 'white' : 'textDim'} />
              <Text text={btcUnit} color="textDim" />
            </Row>
          </Row>

          <AssetList
            inscriptions={inscriptions}
            runes={runes}
            txInfo={txInfo}
            alkanes={alkanes}
            t={t}
            isToSign={isToSign}
            isMyAddress={address === v.address}
            runesPriceMap={runesPriceMap}
          />
        </Column>
      </Row>
    );
  };

  return (
    <Column>
      <Text text={`${t('inputs')}: (${inputInfos.length})`} preset="bold" />
      <Card gap="zero">
        <ScrollableList
          items={inputInfos}
          renderItem={renderInputItem}
          maxVisibleItems={5}
          showScrollIndicator={true}
          showJumpButtons={true}
          emptyText={t('no_inputs')}
          itemHeight={70}
          style={{ width: '100%' }}
        />
      </Card>
    </Column>
  );
};

export default InputsList;
