import { Content, Header, Layout, Column, Button, TextArea } from '@/ui/components';
import { useCurrentAccount } from '@/ui/state/accounts/hooks';
import { fontSizes } from '@/ui/theme/font';
import { useWallet } from '@/ui/utils';

const disclaimStr = `    By clicking the payment button, you will be redirected to moonpay.com, a separate platform owned by a third party, MoonPay. 

    Please note that credit card payment services are provided by MoonPay.

    UniSat Wallet acts solely as a facilitator and does not assume any responsibility for potential losses or damages arising from the use of the credit card payment service.

    Kindly take a moment to review and accept this disclaimer before proceeding further.`;
export default function MoonPayScreen() {
  const currentAccount = useCurrentAccount();
  const wallet = useWallet();
  return (
    <Layout>
      <Header
        onBack={() => {
          window.history.go(-1);
        }}
        title="Buy BTC with MoonPay"
      />
      <Content>
        <Column gap="xl" mt="lg">
          <Column justifyCenter rounded>
            <TextArea text={disclaimStr} style={{ fontSize: fontSizes.sm }} />
          </Column>

          <Button
            text="Continue with MoonPay"
            preset="primary"
            onClick={() => {
              wallet.createMoonpayUrl(currentAccount.address).then((url) => {
                window.open(url);
              });
            }}
          />
        </Column>
      </Content>
    </Layout>
  );
}
