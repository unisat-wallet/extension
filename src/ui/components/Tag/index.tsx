import { Row } from '../Row';
import { Text } from '../Text';

export interface AssetTagProps {
    type: 'self-issuance';
    small?: boolean;
}

const colors = {
    'self-issuance': 'orange'
};

export default function Tag(props: AssetTagProps) {
    const { type, small } = props;
    return (
        <Row
            style={{ borderColor: colors[type], borderWidth: 1, borderRadius: small ? 4 : 5 }}
            px={small ? 'sm' : 'md'}
            py={small ? 'zero' : 'xs'}
            itemsCenter>
            <Text text={type} size={small ? 'xxs' : 'xs'} style={{ color: colors[type] }} />
        </Row>
    );
}
