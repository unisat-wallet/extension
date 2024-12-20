import { RouteTypes, useNavigate } from '@/ui/pages/MainRoute';
import { useCurrentAccount } from '@/ui/state/accounts/hooks';
import { useAddressExplorerUrl, useChain } from '@/ui/state/settings/hooks';
import { fontSizes } from '@/ui/theme/font';
import { copyToClipboard, shortAddress } from '@/ui/utils';
import { CopyOutlined } from '@ant-design/icons';

import { useTools } from '../ActionComponent';
import { Column } from '../Column';
import { Icon } from '../Icon';
import { Row } from '../Row';
import { Text } from '../Text';
import './index.less';

const AccountSelect = () => {
    const navigate = useNavigate();
    const chain = useChain();

    const currentAccount = useCurrentAccount();
    const tools = useTools();
    const address = currentAccount.address;

    const addressExplorerUrl = useAddressExplorerUrl(address);

    return (
        <Row justifyBetween px="md" py="md" bg="card" rounded itemsCenter>
            <Row style={{ flex: 1 }}>
                <Icon icon="user" />
            </Row>

            <Column
                justifyCenter
                rounded
                px="sm"
                style={{
                    flex: 1
                }}
                onClick={() => {
                    copyToClipboard(address).then(() => {
                        tools.toastSuccess('Copied');
                    });
                }}>
                <Text text={shortAddress(currentAccount?.alianName, 8)} textCenter />
                <Row selfItemsCenter itemsCenter>
                    <Text text={shortAddress(address)} color="textDim" />
                    <CopyOutlined style={{ color: '#888', fontSize: 14 }} />

                    <Text
                        text={'History'}
                        size="xs"
                        onClick={() => window.open(addressExplorerUrl)} 
                    />

                    <Icon
                        icon="link"
                        size={fontSizes.xs}
                        onClick={() => window.open(addressExplorerUrl)}
                    />
                </Row>
            </Column>

            <Row
                style={{ flex: 1 }}
                fullY
                justifyEnd
                itemsCenter
                onClick={() => {
                    navigate(RouteTypes.SwitchAccountScreen);
                }}>
                <Icon icon="right" />
            </Row>
        </Row>
    );
};

export default AccountSelect;
