import { useAccountPublicKey } from '@/ui/state/accounts/hooks';
import { copyToClipboard, shortAddress } from '@/ui/utils';
import { CopyOutlined } from '@ant-design/icons';

import { useTools } from '../ActionComponent';
import { Row } from '../Row';
import { Text } from '../Text';

export function AddressBar() {
    const tools = useTools();
    const publicKey = useAccountPublicKey();
    return (
        <>
            <Row
                selfItemsCenter
                itemsCenter
                onClick={() => {
                    copyToClipboard(publicKey).then(() => {
                        tools.toastSuccess('Copied');
                    });
                }}>
                <Text text={`Token Deposit Address: ${shortAddress(publicKey)}`} color="textDim" />
                <CopyOutlined style={{ color: '#888', fontSize: 14 }} />
            </Row>
        </>
    );
}
