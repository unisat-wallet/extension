import { getRestoreWallets } from '@/shared/constant';
import { Button, Column, Text } from '@/ui/components';
import { useI18n } from '@/ui/hooks/useI18n';
import { ContextData, TabType, UpdateContextDataParams } from '@/ui/pages/Account/createHDWalletComponents/types';

export function Step0({
  updateContextData
}: {
  contextData: ContextData;
  updateContextData: (params: UpdateContextDataParams) => void;
}) {
  const { t } = useI18n();
  return (
    <Column gap="lg">
      <Text text={t('choose_a_wallet_you_want_to_restore_from')} preset="title-bold" textCenter mt="xl" />
      {getRestoreWallets().map((item, index) => {
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
