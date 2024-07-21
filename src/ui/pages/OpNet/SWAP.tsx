import {
  IMotoswapPoolContract,
  IMotoswapRouterContract,
  JSONRpcProvider,
  MOTOSWAP_ROUTER_ABI,
  WBTC_ABI,
  getContract
} from 'opnet';
import { useState } from 'react';

import { Column, Content, Header, Icon, Layout, Text } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import { useCurrentAccount } from '@/ui/state/accounts/hooks';
import { useBlockstreamUrl, useOrdinalsWebsite } from '@/ui/state/settings/hooks';
import { fontSizes } from '@/ui/theme/font';
import { copyToClipboard, useWallet } from '@/ui/utils';
import { LoadingOutlined } from '@ant-design/icons';
import '@btc-vision/transaction';

import { useNavigate } from '../MainRoute';

interface LocationState {
  address: string;
}

export default function OpNetTokenScreen() {
  const navigate = useNavigate();

  const wallet = useWallet();

  const account = useCurrentAccount();

  const [loading, setLoading] = useState(true);
  useState(() => {
    const getData = async () => {
      const provider: JSONRpcProvider = new JSONRpcProvider('https://regtest.opnet.org');
      // const foundObject = rawTxInfo.items.find((obj) => obj.account && obj.account.address === rawTxInfo.account.address);
      // const wifWallet = await wallet.getInternalPrivateKey(foundObject?.account as Account);
      // const walletGet: Wallet = Wallet.fromWif(wifWallet.wif, networks.regtest);
      const getSwap: IMotoswapPoolContract = getContract<IMotoswapPoolContract>(
        'bcrt1q99qtptumw027cw8w274tqzd564q66u537vn0lh',
        WBTC_ABI,
        provider,
        'bcrt1p2m2yz9hae5lkypuf8heh6udnt0tchmxhaftcfslqsr5vrwzh34yqgn6hs6'
      );
      const getQuote: IMotoswapRouterContract = getContract<IMotoswapRouterContract>(
        'bcrt1qelqwcguvwkgr90w6u5f2q0a7gqlnq4w8rl26ht',
        MOTOSWAP_ROUTER_ABI,
        provider
      );
      const getData = await getQuote.getAmountsOut(1000n, [
        'bcrt1q99qtptumw027cw8w274tqzd564q66u537vn0lh',
        'bcrt1qwx9h2fvqlzx84t6jhxa424y7g2ynayt8p9rs38'
      ]);
      console.log(getData);
      setLoading(false);
    };
    getData();
  });
  const tools = useTools();

  const ordinalsWebsite = useOrdinalsWebsite();

  const mempoolWebsite = useBlockstreamUrl();
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

function Section({ value, title, link }: { value: string | number; title: string; link?: string }) {
  const tools = useTools();
  return (
    <Column>
      <Text text={title} preset="sub" />
      <Text
        text={value}
        preset={link ? 'link' : 'regular'}
        size="xs"
        wrap
        onClick={() => {
          if (link) {
            window.open(link);
          } else {
            copyToClipboard(value).then(() => {
              tools.toastSuccess('Copied');
            });
          }
        }}
      />
    </Column>
  );
}
