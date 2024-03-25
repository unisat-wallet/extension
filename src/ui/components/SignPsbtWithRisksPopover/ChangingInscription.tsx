import { DecodedPsbt } from '@/shared/types';
import { colors } from '@/ui/theme/colors';

import { Column } from '../Column';
import { Icon } from '../Icon';
import InscriptionPreview from '../InscriptionPreview';
import { Popover } from '../Popover';
import { Row } from '../Row';
import { Text } from '../Text';

export const ChangingInscription = ({ decodedPsbt, onClose }: { decodedPsbt: DecodedPsbt; onClose: () => void }) => {
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
          <Text text="Changing Inscriptoins" preset="bold" />
          <Icon
            icon="close"
            onClick={() => {
              onClose();
            }}
          />
        </Row>

        <Row fullX style={{ borderBottomWidth: 1, borderColor: colors.border }} />

        {inscriptions.map((inscription, index) => {
          return (
            <Row
              key={inscription.id}
              justifyBetween
              fullX
              justifyCenter
              px="md"
              py="xl"
              style={{
                backgroundColor: '#1e1a1e',
                borderRadius: 10,
                borderWidth: 1,
                borderColor: '#442326'
              }}>
              <InscriptionPreview key={'inscription_sending_' + index} data={inscription.data} preset="small" />
              <Column justifyCenter>
                <Text text={`Old Value: `} preset="sub" textEnd />
                <Text text={`${inscription.in} sats`} textEnd />

                <Text text={`New Value: `} preset="sub" textEnd />
                <Text text={`${inscription.out} sats`} textEnd />
              </Column>
            </Row>
          );
        })}
      </Column>
    </Popover>
  );
};
