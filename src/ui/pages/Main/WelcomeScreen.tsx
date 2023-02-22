import { Button } from 'antd';
import { useTranslation } from 'react-i18next';

import { useWallet } from '@/ui/utils';

import { useNavigate } from '../MainRoute';

export default function WelcomeScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const wallet = useWallet();

  return (
    <div
      className="flex items-center justify-center h-full"
      style={
        {
          // backgroundImage:
          //   'linear-gradient(0deg, #1c1919 0%, #000000 50%, #1c1919 90.78%)',
        }
      }>
      <div className="flex flex-col items-center">
        <div className="flex items-center justify-center mb-10 gap-x-4 w-70">
          <img src="./images/wallet-logo.png" className="w-16 h-16 select-none" alt="" />
          <div className="text-4xl font-semibold tracking-widest select-none">UNISAT</div>
        </div>
        <div className="font-normal opacity-60 mb-10 mx-15 text-center">
          The first open-source browser extension wallet for Bitcoin NFTs
        </div>

        <div className="grid gap-5">
          <Button
            size="large"
            type="primary"
            className="border-none bg-primary box w380 content h-15_5"
            onClick={async () => {
              const isBooted = await wallet.isBooted();
              if (isBooted) {
                navigate('CreateMnemonicsScreen');
              } else {
                navigate('CreatePasswordScreen', { isNewAccount: true });
              }
            }}>
            {t('Create new wallet')}
          </Button>
          <Button
            size="large"
            type="default"
            className="box w380 default content"
            onClick={async () => {
              const isBooted = await wallet.isBooted();
              if (isBooted) {
                navigate('ImportMnemonicsScreen');
              } else {
                navigate('CreatePasswordScreen', { isNewAccount: false });
              }
            }}>
            {t('I already have a wallet')}
          </Button>
        </div>
      </div>
    </div>
  );
}
