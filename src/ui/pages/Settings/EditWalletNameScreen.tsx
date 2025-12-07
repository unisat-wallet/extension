import { Button, Content, Header, Input, Layout } from '@/ui/components';
import { useEditWalletNameScreenLogic } from '@unisat/wallet-state';

export default function EditWalletNameScreen() {
  const { truncatedTitle, keyring, isValidName, handleOnClick, handleOnKeyUp, onInputChange, t } =
    useEditWalletNameScreenLogic();

  return (
    <Layout>
      <div style={{ position: 'relative' }}>
        <Header
          onBack={() => {
            window.history.go(-1);
          }}
          title={truncatedTitle}
        />
      </div>
      <Content>
        <Input
          placeholder={keyring.alianName}
          defaultValue={keyring.alianName}
          onChange={(e) => onInputChange(e)}
          onKeyUp={(e) => handleOnKeyUp(e)}
          autoFocus={true}
          maxLength={20}
        />
        <Button
          disabled={!isValidName}
          text={t('change_wallet_name')}
          preset="primary"
          onClick={(e) => handleOnClick()}
        />
      </Content>
    </Layout>
  );
}
