import { useState } from 'react';

import { Content, Header, Icon, Layout } from '@/ui/components';
import { fontSizes } from '@/ui/theme/font';
import { LoadingOutlined } from '@ant-design/icons';
import '@btc-vision/transaction';

export default function OpNetTokenScreen() {
  const [loading, setLoading] = useState(true);
  useState(() => {
    const getData = async () => {
      // const foundObject = rawTxInfo.items.find((obj) => obj.account && obj.account.address === rawTxInfo.account.address);
      // const wifWallet = await wallet.getInternalPrivateKey(foundObject?.account as Account);
      // const walletGet: Wallet = Wallet.fromWif(wifWallet.wif, networks.regtest);
      /*const getSwap: IMotoswapPoolContract = getContract<IMotoswapPoolContract>(
                            Web3API.WBTC,
                          WBTC_ABI,
                          Web3API.provider,
                          'bcrt1p2m2yz9hae5lkypuf8heh6udnt0tchmxhaftcfslqsr5vrwzh34yqgn6hs6'
                        );

                        const getQuote: IMotoswapRouterContract = getContract<IMotoswapRouterContract>(
                          Web3API.MOTOSWAP_ROUTER,
                          MOTOSWAP_ROUTER_ABI,
                          provider
                        );

                        const getData = await getQuote.getAmountsOut(1000n, [
                          'bcrt1q99qtptumw027cw8w274tqzd564q66u537vn0lh',
                          'bcrt1qwx9h2fvqlzx84t6jhxa424y7g2ynayt8p9rs38'
                        ]);*/

      setLoading(false);
    };

    void getData();
  });

  if (loading) {
    return (
      <Layout>
        <Content itemsCenter justifyCenter>
          <Icon size={fontSizes.xxxl} color="gold">
            <LoadingOutlined />
          </Icon>
        </Content>
      </Layout>
    );
  }
  return (
    <Layout>
      <Header
        onBack={() => {
          window.history.go(-1);
        }}
      />
    </Layout>
  );
}
