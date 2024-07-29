import { getContract, IOP_20Contract, OP_20_ABI } from 'opnet';
import { useEffect, useMemo, useState } from 'react';

import { runesUtils } from '@/shared/lib/runes-utils';
import { addressShortner } from '@/shared/utils';
import Web3API from '@/shared/web3/Web3API';
import { ContractInformation } from '@/shared/web3/interfaces/ContractInformation';
import { Button, Column, Content, Header, Icon, Image, Layout, Row, Text } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import { useCurrentAccount } from '@/ui/state/accounts/hooks';
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

  const account = useCurrentAccount();
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);

  const wallet = useWallet();

  useEffect(() => {
    const getAddress = async () => {
      Web3API.setNetwork(await wallet.getChainType());

      const btcbalanceGet = await Web3API.provider.getBalance(account.address);
      const contract: IOP_20Contract = getContract<IOP_20Contract>(address, OP_20_ABI, Web3API.provider);
      const contractInfo: ContractInformation | undefined = await Web3API.queryContractInformation(address);

      const balance = await contract.balanceOf(account.address);
      const getOwner = await contract.isAddressOwner(account.address);

      if (!('error' in getOwner)) {
        setIsOwner(getOwner.decoded[0] as boolean);
      }
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
  const copy = (data) => {
    copyToClipboard(data);
    tools.toastSuccess('Copied' + data);
  };
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

            <Row
              itemsCenter
              fullX
              justifyCenter
              onClick={(e) => {
                copy(tokenSummary.opNetBalance.address);
              }}>
              <Icon icon="copy" color="textDim" />
              <Text
                text={addressShortner(tokenSummary.opNetBalance.address)}
                color="textDim"
                style={{
                  overflowWrap: 'anywhere'
                }}
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
                      navigate('UnStakeWBTCoPNet', {
                        OpNetBalance: tokenSummary.opNetBalance
                      });
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

          {!isOwner ? (
            <Row justifyBetween full>
              <Button
                text="Mint"
                preset="primary"
                icon="pencil"
                onClick={(e) => {
                  navigate('Mint', {
                    OpNetBalance: tokenSummary.opNetBalance
                  });
                }}
                full
              />
              {/* <Button
                text="Airdrop"
                preset="primary"
                icon="pencil"
                onClick={(e) => {
                  navigate('Airdrop', {
                    OpNetBalance: tokenSummary.opNetBalance
                  });
                }}
                full
              /> */}
            </Row>
          ) : (
            <></>
          )}
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
