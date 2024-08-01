import { Row } from '../Row';
import { Text } from '../Text';

export interface AssetTagProps {
    type: 'BRC20' | 'ARC20' | 'Inscription' | 'Unconfirmed' | 'RUNES';
}

const colors = {
    BRC20: '#ABAE0B',
    ARC20: '#2B4E8B',
    Inscription: '#62A759',
    Unconfirmed: '#BC9238',
    RUNES: '#A14419'
};

export default function AssetTag(props: AssetTagProps) {
    const { type } = props;
    return (
        <Row style={{ backgroundColor: colors[type], borderRadius: 5 }} px="md" py="xs">
            <Text text={type} size="xs" />
        </Row>
    );
}
