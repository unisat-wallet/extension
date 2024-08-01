import { CHAINS, CHAINS_MAP, ChainType } from '@/shared/constant';
import { Card, Column, Image, Row, Text } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import { BottomModal } from '@/ui/components/BottomModal';
import { useReloadAccounts } from '@/ui/state/accounts/hooks';
import { useChain, useChangeChainTypeCallback } from '@/ui/state/settings/hooks';
import { colors } from '@/ui/theme/colors';
import { CloseOutlined } from '@ant-design/icons';

function ChainItem(props: { selected: boolean; chainType: ChainType; onClick }) {
    const chain = CHAINS_MAP[props.chainType];

    return (
        <Card
            style={{
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderRadius: 10,
                borderColor: colors.gold,
                borderWidth: props.selected ? 1 : 0
            }}
            mt="lg"
            onClick={props.onClick}>
            <Row fullX>
                <Row itemsCenter>
                    <Image src={chain.icon} size={30} />
                    <Text text={chain.label} />
                </Row>
            </Row>
        </Card>
    );
}

export const SwitchChainModal = ({ onClose }: { onClose: () => void }) => {
    const chain = useChain();
    const changeChainType = useChangeChainTypeCallback();
    const reloadAccounts = useReloadAccounts();
    const tools = useTools();
    return (
        <BottomModal onClose={onClose}>
            <Column justifyCenter itemsCenter>
                <Row justifyBetween itemsCenter style={{ height: 20 }} fullX>
                    <Row />
                    <Text text="Select Network" textCenter size="md" />
                    <Row
                        onClick={() => {
                            onClose();
                        }}>
                        <CloseOutlined />
                    </Row>
                </Row>

                <Row fullX style={{ borderTopWidth: 1, borderColor: colors.border }} mt="md" />

                <Column gap="zero" mt="sm" mb="lg" fullX>
                    {CHAINS.map((v) => (
                        <ChainItem
                            key={v.enum}
                            selected={v.enum == chain.enum}
                            chainType={v.enum}
                            onClick={async () => {
                                if (v.enum == chain.enum) {
                                    return;
                                }
                                await changeChainType(v.enum);
                                reloadAccounts();
                                tools.toastSuccess(`Changed to ${v.label}`);
                                onClose();
                            }}
                        />
                    ))}
                </Column>
            </Column>
        </BottomModal>
    );
};
