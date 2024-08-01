import { DecodedPsbt } from '@/shared/types';
import { colors } from '@/ui/theme/colors';

import { Column } from '../Column';
import { Icon } from '../Icon';
import { Popover } from '../Popover';
import { Row } from '../Row';
import { Text } from '../Text';

export const Arc20BurningList = ({ decodedPsbt, onClose }: { decodedPsbt: DecodedPsbt; onClose: () => void }) => {
    const inputTokenMap = {};

    decodedPsbt.inputInfos.forEach((inputInfo) => {
        inputInfo.atomicals.forEach((ins) => {
            if (ins.type === 'FT') {
                const ticker = ins.ticker || '';
                inputTokenMap[ticker] = inputTokenMap[ticker] || 0;
                inputTokenMap[ticker] += ins.atomicalValue;
            }
        });
    });

    const outputTokenMap = {};
    decodedPsbt.outputInfos.forEach((outputInfo) => {
        outputInfo.atomicals.forEach((ins) => {
            if (ins.type === 'FT') {
                const ticker = ins.ticker || '';
                outputTokenMap[ticker] = outputTokenMap[ticker] || 0;
                outputTokenMap[ticker] += ins.atomicalValue;
            }
        });
    });

    const burnList: { ticker: string; amount: number }[] = [];
    Object.keys(inputTokenMap).forEach((ticker) => {
        const outAmount = outputTokenMap[ticker] || 0;
        if (outAmount < inputTokenMap[ticker]) {
            burnList.push({
                ticker: ticker,
                amount: inputTokenMap[ticker] - outAmount
            });
        }
    });

    return (
        <Popover>
            <Column justifyCenter itemsCenter>
                <Row fullX justifyBetween>
                    <Row />
                    <Text text="ARC20 Burn Risk List" preset="bold" />
                    <Icon
                        icon="close"
                        onClick={() => {
                            onClose();
                        }}
                    />
                </Row>

                <Row fullX style={{ borderBottomWidth: 1, borderColor: colors.border }} />

                {burnList.map((burn, index) => {
                    return (
                        <Row
                            key={'arc20_burn_' + index}
                            justifyBetween
                            fullX
                            px="md"
                            py="xl"
                            style={{
                                backgroundColor: '#1e1a1e',
                                borderRadius: 10,
                                borderWidth: 1,
                                borderColor: '#442326'
                            }}>
                            <Row>
                                <Icon icon="burn" color="red" />
                                <Text text={burn.ticker} />
                            </Row>

                            <Text text={burn.amount} />
                        </Row>
                    );
                })}
            </Column>
        </Popover>
    );
};
