import { Column, Content, Header, Layout } from '@/ui/components';
import { AddressTypeCard } from '@/ui/components/AddressTypeCard';
import { useAddressTypeScreenLogic, useI18n, useNavigation, useWallet } from '@unisat/wallet-state';

export default function AddressTypeScreen() {
  const { t } = useI18n();
  const nav = useNavigation();
  const { currentKeyring, items, onClickItem } = useAddressTypeScreenLogic();

  const wallet = useWallet();

  return (
    <Layout>
      <Header
        onBack={() => {
          nav.goBack();
        }}
        title={t('address_type')}
      />
      <Content>
        <Column>
          {items.map((item, index) => {
            return (
              <AddressTypeCard
                key={index}
                label={item.name}
                address={item.address}
                assets={item.assets}
                checked={item.value == currentKeyring.addressType}
                onClick={() => onClickItem(item)}
              />
            );
          })}
        </Column>
      </Content>
    </Layout>
  );
}
