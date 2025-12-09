import { Button, Column, Text } from '@/ui/components';
import { ContextData, TabType, UpdateContextDataParams } from '@/ui/pages/Account/createHDWalletComponents/types';
import { getRestoreWallets } from '@unisat/wallet-shared';
import { useI18n } from '@unisat/wallet-state';

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
              updateContextData({ tabType: TabType.IMPORT_WORDS, restoreWalletType: item.value });
            }}>
            <Text text={t(item.name)} />
          </Button>
        );
      })}
    </Column>
  );
}
