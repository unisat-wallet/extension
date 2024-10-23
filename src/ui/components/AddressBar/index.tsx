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
                style={{
                    padding: 5,
                    borderRadius: 7,
                    backgroundColor: 'rgba(240, 129, 51, 0.15)'
                }}
                onClick={async () => {
                    await copyToClipboard(publicKey).then(() => {
                        tools.toastSuccess('Copied');
                    });
                }}>
                <Text
                    text={`Token Deposit Address: ${shortAddress(publicKey)}`}
                    style={{ color: '#f08133' }}
                    preset="regular"
                />
                <CopyOutlined style={{ color: '#f08133', fontSize: 14 }} />
            </Row>
        </>
    );
}
