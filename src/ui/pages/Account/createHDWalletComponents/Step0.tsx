import { RESTORE_WALLETS } from '@/shared/constant';
import { Button, Column, Text } from '@/ui/components';
import { ContextData, TabType, UpdateContextDataParams } from '@/ui/pages/Account/createHDWalletComponents/types';

export function Step0({
    updateContextData
}: {
    contextData: ContextData;
    updateContextData: (params: UpdateContextDataParams) => void;
}) {
    return (
        <Column gap="lg">
            <Text text="Choose a wallet you want to restore from" preset="title-bold" textCenter mt="xl" />
            {RESTORE_WALLETS.map((item, index) => {
                return (
                    <Button
                        key={index}
                        preset="default"
                        onClick={() => {
                            updateContextData({ tabType: TabType.STEP2, restoreWalletType: item.value });
                        }}>
                        <Text text={item.name} />
                    </Button>
                );
            })}
        </Column>
    );
}
