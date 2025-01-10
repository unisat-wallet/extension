import React, { useEffect, useMemo, useState } from 'react';

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

interface SignPsbtWithRisksPopoverProps {
    decodedPsbt: DecodedPsbt;
    onConfirm: () => void;
    onClose: () => void;
}

export const SignPsbtWithRisksPopover: React.FC<SignPsbtWithRisksPopoverProps> = ({
    decodedPsbt,
    onConfirm,
    onClose
}) => {
    const [inputValue, setInputValue] = useState('');
    const [understand, setUnderstand] = useState(false);
    const [detailRisk, setDetailRisk] = useState<Risk | null>(null);

    // 1. Call all Hooks at the top
    useEffect(() => {
        setUnderstand(inputValue.toUpperCase() === AGREEMENT_TEXT);
    }, [inputValue]);

    // 2. If there is any CRITICAL risk, user cannot confirm
    const confirmable = useMemo(() => {
        const foundCriticalRisk = decodedPsbt.risks.find((v) => v.level === 'critical');
        return !foundCriticalRisk;
    }, [decodedPsbt]);

    // 3. After calling Hooks, you can do conditional rendering
    const shouldShowBadFeeRate =
        detailRisk && (detailRisk.type === RiskType.LOW_FEE_RATE || detailRisk.type === RiskType.HIGH_FEE_RATE);

    if (shouldShowBadFeeRate) {
        return <BadFeeRate decodedPsbt={decodedPsbt} risk={detailRisk} onClose={() => setDetailRisk(null)} />;
    }

    // 4. The rest of your UI
    return (
        <Popover>
            <Column justifyCenter itemsCenter>
                <Icon icon="alert" color="red" size={20} />

                <Text text="Use at your own risk" preset="title-bold" />
                <Text text="Please be aware that sending the following assets involves risk:" preset="sub" />

                <Column gap="md" fullX mb="md">
                    {decodedPsbt.risks.map((risk, index) => (
                        <Column
                            key={`risk_${index}`}
                            style={{
                                border: `1px solid ${colors.border}`,
                                borderRadius: 10
                            }}
                            px="md"
                            py="sm">
                            <Row justifyBetween justifyCenter mt="sm">
                                <Text text={risk.title} color={risk.level === 'warning' ? 'warning' : 'danger'} />
                                {visibleRiskDetailTypes.includes(risk.type) && (
                                    <Text
                                        text="View >"
                                        onClick={() => setDetailRisk(risk)}
                                        style={{ cursor: 'pointer' }}
                                    />
                                )}
                            </Row>

                            {/* Divider */}
                            <Row
                                style={{
                                    borderBottom: `1px solid ${colors.border}`,
                                    marginTop: 8,
                                    marginBottom: 8
                                }}
                            />

                            <Text text={risk.desc} preset="sub" />
                        </Column>
                    ))}

                    {confirmable && (
                        <Column>
                            <Text
                                text="I understand and accept the risks associated with this transaction."
                                preset="sub"
                            />

                            <Row itemsCenter gap="sm" mb="md">
                                <Text text={`Enter “${AGREEMENT_TEXT}” to proceed`} preset="bold" />
                            </Row>
                            <Input preset="text" autoFocus onChange={(e) => setInputValue(e.target.value)} />
                        </Column>
                    )}
                </Column>

                <Row full>
                    <Button text="Cancel" preset="default" full onClick={onClose} />

                    {confirmable && (
                        <Button text="Confirm" preset="danger" disabled={!understand} full onClick={onConfirm} />
                    )}
                </Row>
            </Column>
        </Popover>
    );
};
