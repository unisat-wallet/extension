import { Checkbox, Tooltip } from 'antd';
import { useEffect, useState } from 'react';

import { fontSizes } from '@/ui/theme/font';

import { Icon } from '../Icon';
import { Row } from '../Row';
import { Text } from '../Text';

export function RBFBar({ defaultValue, onChange }: { defaultValue?: boolean; onChange: (val: boolean) => void }) {
    const [enableRBF, setEnableRBF] = useState(defaultValue ?? false);

    useEffect(() => {
        onChange(enableRBF);
    }, [enableRBF]);
    return (
        <Row justifyBetween>
            <Tooltip
                title={'A feature allows the transaction to be replaced.'}
                overlayStyle={{
                    fontSize: fontSizes.xs
                }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Row itemsCenter>
                        <Text text="RBF" color="textDim" />
                        <Icon icon="circle-question" color="textDim" />
                    </Row>
                </div>
            </Tooltip>
            <Checkbox
                onChange={() => {
                    setEnableRBF(!enableRBF);
                }}
                checked={enableRBF}></Checkbox>
        </Row>
    );
}
