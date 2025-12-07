import { Button, Content, Header, Input, Layout } from '@/ui/components';
import { useEditAccountNameScreenLogic } from '@unisat/wallet-state';

export default function EditAccountNameScreen() {
  const { onInputChange, onClickBack, handleOnClick, handleOnKeyUp, isValidName, truncatedTitle, account, t } =
    useEditAccountNameScreenLogic();
  return (
    <Layout>
      <div style={{ position: 'relative' }}>
        <Header onBack={onClickBack} title={truncatedTitle} />
      </div>
      <Content>
        <Input
          placeholder={account.alianName}
          defaultValue={account.alianName}
          onChange={onInputChange}
          onKeyUp={handleOnKeyUp}
          autoFocus={true}
          maxLength={20}
        />
        <Button disabled={!isValidName} text={t('change_account_name')} preset="primary" onClick={handleOnClick} />
      </Content>
    </Layout>
  );
}
