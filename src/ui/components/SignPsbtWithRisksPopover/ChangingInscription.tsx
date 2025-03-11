import { DecodedPsbt } from '@/shared/types';
import { useI18n } from '@/ui/hooks/useI18n';
import { colors } from '@/ui/theme/colors';

import { Column } from '../Column';
import { Icon } from '../Icon';
import InscriptionPreview from '../InscriptionPreview';
import { Popover } from '../Popover';
import { Row } from '../Row';
import { Text } from '../Text';

export const ChangingInscription = ({ decodedPsbt, onClose }: { decodedPsbt: DecodedPsbt; onClose: () => void }) => {
  const { t } = useI18n();
  const inscriptionValueMap: { [key: string]: { in: number; out: number } } = {};
  decodedPsbt.inputInfos.forEach((inputInfo) => {
    inputInfo.inscriptions.forEach((ins) => {
      inscriptionValueMap[ins.inscriptionId] = inscriptionValueMap[ins.inscriptionId] || { in: 0, out: 0 };
      inscriptionValueMap[ins.inscriptionId].in = inputInfo.value;
    });
  });
  decodedPsbt.outputInfos.forEach((outputInfo) => {
    outputInfo.inscriptions.forEach((ins) => {
      inscriptionValueMap[ins.inscriptionId] = inscriptionValueMap[ins.inscriptionId] || { in: 0, out: 0 };
      inscriptionValueMap[ins.inscriptionId].out = outputInfo.value;
    });
  });
  const inscriptions = Object.keys(inscriptionValueMap)
    .map((id) => {
      return {
        id: id,
        in: inscriptionValueMap[id].in,
        out: inscriptionValueMap[id].out,
        data: decodedPsbt.inscriptions[id]
      };
    })
    .filter((v) => v.in !== v.out);

  return (
    <Popover>
      <Column justifyCenter itemsCenter>
        <Row fullX justifyBetween>
          <Row />
          <Text text={t('changing_inscriptoins')} preset="bold" />
          <Icon
            icon="close"
            onClick={() => {
              onClose();
            }}
          />
        </Row>

        <Row fullX style={{ borderBottomWidth: 1, borderColor: colors.border }} />

        <Row fullX overflowX style={{ maxWidth: '100%', padding: '8px 0' }}>
          {inscriptions.map((inscription, index) => {
            return (
              <Column
                key={inscription.id}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: '#442326',
                  marginLeft: index > 0 ? 8 : 0,
                  width: '150px',
                  flexShrink: 0
                }}>
                <div
                  style={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '16px 0 8px 0'
                  }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}>
                    <InscriptionPreview key={'inscription_' + index} data={inscription.data} preset="small" />
                  </div>
                </div>
                <Column
                  fullX
                  px="lg"
                  py="md"
                  style={{
                    borderTopWidth: 1,
                    borderColor: 'rgba(68, 35, 38, 0.5)'
                  }}>
                  <Row fullX justifyBetween>
                    <Text text={t('old_value')} preset="sub" />
                    <Text text={`${inscription.in} sats`} size="xs" />
                  </Row>
                  <Row fullX justifyBetween style={{ marginTop: 8 }}>
                    <Text text={t('new_value')} preset="sub" />
                    <Text text={`${inscription.out} sats`} size="xs" />
                  </Row>
                </Column>
              </Column>
            );
          })}
        </Row>
      </Column>
    </Popover>
  );
};
