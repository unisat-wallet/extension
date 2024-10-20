import { useEffect, useMemo, useState } from 'react';

import { DecodedPsbt, Risk, RiskType } from '@/shared/types';
import { colors } from '@/ui/theme/colors';

import { Button } from '../Button';
import { Column } from '../Column';
import { Icon } from '../Icon';
import { Input } from '../Input';
import { Popover } from '../Popover';
import { Row } from '../Row';
import { Text } from '../Text';
import { BadFeeRate } from './BadFeeRate';


const AGREEMENT_TEXT = 'CONFIRM';

const visibleRiskDetailTypes = [RiskType.LOW_FEE_RATE, RiskType.HIGH_FEE_RATE];

export const SignPsbtWithRisksPopover = ({
    decodedPsbt,
    onConfirm,
    onClose
}: {
    decodedPsbt: DecodedPsbt;
    onConfirm: () => void;
    onClose: () => void;
}) => {
    const [inputValue, setInputValue] = useState('');
    const [understand, setUnderstand] = useState(false);
    useEffect(() => {
        if (inputValue.toUpperCase() === AGREEMENT_TEXT) {
            setUnderstand(true);
        } else {
            setUnderstand(false);
        }
    }, [inputValue]);

    const [detailRisk, setDetailRisk] = useState<Risk | null>();
    if (detailRisk) {
        if (detailRisk.type === RiskType.LOW_FEE_RATE || detailRisk.type === RiskType.HIGH_FEE_RATE) {
            return <BadFeeRate decodedPsbt={decodedPsbt} risk={detailRisk} onClose={() => setDetailRisk(null)} />;
        }
    }

    const confirmable = useMemo(() => {
        const foundCriticalRisk = decodedPsbt.risks.find((v) => v.level === 'critical');
        return !foundCriticalRisk;
    }, [decodedPsbt]);

    return (
        <Popover>
            <Column justifyCenter itemsCenter>
                <Icon icon={'alert'} color={'red'} size={20} />
                <Text text="Use at your own risk" preset="title-bold" />
                <Text text={'Please be aware that sending the following assets involves risk:'} preset="sub" />

                <Column gap="md" fullX mb="md">
                    {decodedPsbt.risks.map((risk, index) => {
                        return (
                            <Column
                                key={`risk_${index}`}
                                style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 10 }}
                                px="md"
                                py="sm">
                                <Row justifyBetween justifyCenter mt="sm">
                                    <Text text={risk.title} color={risk.level === 'warning' ? 'warning' : 'danger'} />
                                    {visibleRiskDetailTypes.includes(risk.type) ? (
                                        <Text
                                            text={'View>'}
                                            onClick={() => {
                                                setDetailRisk(risk);
                                            }}
                                        />
                                    ) : null}
                                </Row>
                                <Row style={{ borderBottomWidth: 1, color: colors.border }}></Row>
                                <Text text={risk.desc} preset="sub" />
                            </Column>
                        );
                    })}

                    {confirmable && (
                        <Column>
                            <Text
                                text={'I understand and accept the risks associated with this transaction.'}
                                preset="sub"
                            />

                            <Row itemsCenter gap="sm" mb="md">
                                <Text text={`Enter “${AGREEMENT_TEXT}” to proceed`} preset="bold" />
                            </Row>
                            <Input
                                preset="text"
                                autoFocus={true}
                                onChange={(e) => {
                                    setInputValue(e.target.value);
                                }}
                            />
                        </Column>
                    )}
                </Column>

                <Row full>
                    <Button
                        text={'Cancel'}
                        preset="default"
                        full
                        onClick={() => {
                            if (onClose) {
                                onClose();
                            }
                        }}
                    />

                    {confirmable && (
                        <Button
                            text={'Confirm'}
                            preset="danger"
                            disabled={!understand}
                            full
                            onClick={() => {
                                if (onConfirm) {
                                    onConfirm();
                                }
                            }}
                        />
                    )}
                </Row>
            </Column>
        </Popover>
    );
};
