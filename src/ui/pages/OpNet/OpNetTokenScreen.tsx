import { IOP_20Contract, JSONRpcProvider, OP_20_ABI, getContract } from 'opnet';
import { useEffect, useMemo, useState } from 'react';

import { runesUtils } from '@/shared/lib/runes-utils';
import { Button, Column, Content, Header, Icon, Layout, Row, Text } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import { useCurrentAccount } from '@/ui/state/accounts/hooks';
import { useBlockstreamUrl, useOrdinalsWebsite, useUnisatWebsite } from '@/ui/state/settings/hooks';
import { colors } from '@/ui/theme/colors';
import { fontSizes } from '@/ui/theme/font';
import { copyToClipboard, useLocationState, useWallet } from '@/ui/utils';
import { LoadingOutlined } from '@ant-design/icons';

import { useNavigate } from '../MainRoute';

interface LocationState {
  address: string;
}

export default function OpNetTokenScreen() {
  const navigate = useNavigate();

  const { address } = useLocationState<LocationState>();
  const [tokenSummary, setTokenSummary] = useState<any>({
    opNetBalance: {
      address: '',
      name: '',
      symbol: '',
      amount: '',
      divisibility: 0
    }
  });
  const [btcBalance, setBtcBalance] = useState<any>({
    opNetBalance: {
      address: '',
      name: '',
      symbol: '',
      amount: '',
      divisibility: 0
    }
  });
  const wallet = useWallet();

  const account = useCurrentAccount();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getAddress = async () => {
      const provider: JSONRpcProvider = new JSONRpcProvider('https://regtest.opnet.org');
      const btcbalanceGet = await provider.getBalance(account.address);
      const contract: IOP_20Contract = getContract<IOP_20Contract>(address, OP_20_ABI, provider);
      const contracName = await contract.name();
      const divisibility = await contract.decimals();
      const symbol = await contract.symbol();
      const balance = await contract.balanceOf(account.address);
      setBtcBalance({
        address: '',
        amount: btcbalanceGet,
        divisibility: 8,
        symbol: 'BTC',
        name: 'Bitcoin'
      });
      if ('error' in balance || 'error' in contracName || 'error' in divisibility || 'error' in symbol) {
        console.log(balance);
      } else {
        const newSummaryData = {
          opNetBalance: {
            address: address,
            name: contracName.decoded.toLocaleString(),
            amount: BigInt(balance.decoded[0].toString()),
            divisibility: parseInt(divisibility.decoded.toString()),
            symbol: symbol.decoded.toString()
          }
        };
        setTokenSummary(newSummaryData);
      }

      setLoading(false);
      console.log;
    };
    getAddress();
  }, [account.address]);

  const unisatWebsite = useUnisatWebsite();

  const enableTransfer = useMemo(() => {
    let enable = false;
    if (tokenSummary.opNetBalance.amount !== '0') {
      enable = true;
    }
    return enable;
  }, [tokenSummary]);

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
      {tokenSummary && (
        <Content>
          <Column py="xl" style={{ borderBottomWidth: 1, borderColor: colors.white_muted }}>
            <Row itemsCenter fullX justifyCenter>
              <Text
                text={`${runesUtils.toDecimalAmount(
                  tokenSummary.opNetBalance.amount,
                  tokenSummary.opNetBalance.divisibility
                )}`}
                preset="bold"
                textCenter
                size="xxl"
                wrap
              />
              {/* <BRC20Ticker tick={tokenSummary.runeBalance.symbol} preset="lg" /> */}
            </Row>

            <Row justifyBetween mt="lg">
              {tokenSummary.opNetBalance.address == 'bcrt1q99qtptumw027cw8w274tqzd564q66u537vn0lh' &&
              btcBalance.divisibility == 8 ? (
                <>
                  <Button
                    text="Wrap Bitcoin"
                    preset="primary"
                    icon="pencil"
                    onClick={(e) => {
                      console.log(btcBalance);
                      navigate('WrapBitcoinOpnet', {
                        OpNetBalance: btcBalance
                      });
                    }}
                    full
                  />
                  <Button
                    text="UnWrap Bitcoin"
                    preset="primary"
                    icon="pencil"
                    onClick={(e) => {
                      console.log(btcBalance);
                      navigate('UnWrapBitcoinOpnet', {
                        OpNetBalance: tokenSummary.opNetBalance
                      });
                    }}
                    full
                  />
                </>
              ) : (
                <></>
              )}

              <Button
                text="Send"
                preset="primary"
                icon="send"
                style={!enableTransfer ? { backgroundColor: 'grey' } : {}}
                disabled={!enableTransfer}
                onClick={(e) => {
                  navigate('SendOpNetScreen', {
                    OpNetBalance: tokenSummary.opNetBalance
                  });
                }}
                full
              />
            </Row>
            <Row justifyBetween mt="lg">
              {tokenSummary.opNetBalance.address == 'bcrt1q99qtptumw027cw8w274tqzd564q66u537vn0lh' &&
              btcBalance.divisibility == 8 ? (
                <>
                  <Button
                    text="Stake WBTC"
                    preset="primary"
                    icon="pencil"
                    onClick={(e) => {
                      console.log(btcBalance);
                      navigate('StakeWBTCoPNet', {
                        OpNetBalance: tokenSummary.opNetBalance
                      });
                    }}
                    full
                  />
                  <Button
                    text="Unstake WBTC"
                    preset="primary"
                    icon="pencil"
                    onClick={(e) => {
                      console.log(btcBalance);
                      // navigate('UnStakeWBTCoPNet', {
                      //   OpNetBalance: tokenSummary.opNetBalance
                      // });
                    }}
                    full
                  />
                </>
              ) : (
                <></>
              )}
            </Row>
          </Column>

          <Text
            text={tokenSummary.opNetBalance.name}
            preset="title-bold"
            onClick={() => {
              copyToClipboard(tokenSummary.opNetBalance.name).then(() => {
                tools.toastSuccess('Copied');
              });
            }}></Text>
        </Content>
      )}
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
