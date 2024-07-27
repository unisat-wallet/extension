import { getContract, IOP_20Contract, JSONRpcProvider, OP_20_ABI } from 'opnet';
import { useEffect, useMemo, useState } from 'react';

import { runesUtils } from '@/shared/lib/runes-utils';
import Web3API from '@/shared/web3/Web3API';
import { ContractInformation } from '@/shared/web3/interfaces/ContractInformation';
import { Button, Column, Content, Header, Icon, Image, Layout, Row, Text } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import { useCurrentAccount } from '@/ui/state/accounts/hooks';
import { colors } from '@/ui/theme/colors';
import { fontSizes } from '@/ui/theme/font';
import { copyToClipboard, useLocationState } from '@/ui/utils';
import { LoadingOutlined } from '@ant-design/icons';

import { useNavigate } from '../MainRoute';

interface LocationState {
  address: string;
}

export default function OpNetTokenScreen() {
  const navigate = useNavigate();
  const provider: JSONRpcProvider = new JSONRpcProvider('https://regtest.opnet.org');

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

  const account = useCurrentAccount();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getAddress = async () => {
      const btcbalanceGet = await provider.getBalance(account.address);
      const contract: IOP_20Contract = getContract<IOP_20Contract>(address, OP_20_ABI, provider);
      const contractInfo: ContractInformation | undefined = await Web3API.queryContractInformation(address);

      const balance = await contract.balanceOf(account.address);

      setBtcBalance({
        address: '',
        amount: btcbalanceGet,
        divisibility: 8,
        symbol: 'BTC',
        name: 'Bitcoin',
        logo: ''
      });
      if (!('error' in balance)) {
        const newSummaryData = {
          opNetBalance: {
            address: address,
            name: contractInfo?.name || '',
            amount: BigInt(balance.decoded[0].toString()),
            divisibility: contractInfo?.decimals || 8,
            symbol: contractInfo?.symbol,
            logo: contractInfo?.logo
          }
        };
        setTokenSummary(newSummaryData);
      }

      setLoading(false);
    };
    void getAddress();
  }, [account.address]);

  const enableTransfer = useMemo(() => {
    let enable = false;
    if (tokenSummary.opNetBalance.amount !== '0') {
      enable = true;
    }
    return enable;
  }, [tokenSummary]);

  const tools = useTools();
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
              <Image src={tokenSummary.opNetBalance.logo} size={fontSizes.tiny} />
              <Text
                text={`${runesUtils.toDecimalAmount(
                  tokenSummary.opNetBalance.amount,
                  tokenSummary.opNetBalance.divisibility
                )} ${tokenSummary.opNetBalance.symbol}`}
                preset="bold"
                textCenter
                size="xxl"
                wrap
              />
            </Row>

            <Row justifyBetween mt="lg">
              {tokenSummary.opNetBalance.address === Web3API.WBTC && btcBalance.divisibility == 8 ? (
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
              {tokenSummary.opNetBalance.address === Web3API.WBTC && btcBalance.divisibility == 8 ? (
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
