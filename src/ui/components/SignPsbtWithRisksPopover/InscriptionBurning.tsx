import { DecodedPsbt } from '@/shared/types';
import { colors } from '@/ui/theme/colors';

import { Column } from '../Column';
import { Icon } from '../Icon';
import InscriptionPreview from '../InscriptionPreview';
import { Popover } from '../Popover';
import { Row } from '../Row';
import { Text } from '../Text';

export const InscriptionBurning = ({ decodedPsbt, onClose }: { decodedPsbt: DecodedPsbt; onClose: () => void }) => {
    const inputInscriptionMap = {};
    decodedPsbt.inputInfos.forEach((inputInfo) => {
        inputInfo.inscriptions.forEach((ins) => {
            inputInscriptionMap[ins.inscriptionId] = true;
        });
    });

    const outputInscriptionMap = {};
    decodedPsbt.outputInfos.forEach((outputInfo) => {
        outputInfo.inscriptions.forEach((ins) => {
            outputInscriptionMap[ins.inscriptionId] = true;
        });
    });

    const burnList: string[] = [];
    Object.keys(inputInscriptionMap).forEach((insId) => {
        if (!outputInscriptionMap[insId]) {
            burnList.push(insId);
        }
    });

    return (
        <Popover>
            <Column justifyCenter itemsCenter>
                <Row fullX justifyBetween>
                    <Row />
                    <Text text="Inscription Burn Risk List" preset="bold" />
                    <Icon
                        icon="close"
                        onClick={() => {
                            onClose();
                        }}
                    />
                </Row>
                <Row fullX style={{ borderBottomWidth: 1, borderColor: colors.border }} />
                <Row
                    justifyBetween
                    fullX
                    px="md"
                    py="xl"
                    style={{
                        backgroundColor: '#1e1a1e',
                        borderRadius: 10,
                        borderWidth: 1,
                        borderColor: '#442326'
                    }}
                    overflowX>
                    {burnList.map((burn, index) => {
                        return (
                            <InscriptionPreview
                                key={'inscription_burn_' + index}
                                data={decodedPsbt.inscriptions[burn]}
                                preset="small"
                            />
                        );
                    })}
                </Row>
            </Column>
        </Popover>
    );
};
