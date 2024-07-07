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

  const wallet = useWallet();

  const account = useCurrentAccount();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getAddress = async () => {
      console.log(address);
      const provider: JSONRpcProvider = new JSONRpcProvider('https://regtest.opnet.org');

      const contract: IOP_20Contract = getContract<IOP_20Contract>(address, OP_20_ABI, provider);
      const contracName = await contract.name();
      const divisibility = await contract.decimals();
      const balance = await contract.balanceOf(account.address);
      if ('error' in balance || 'error' in contracName || 'error' in divisibility) {
      } else {
        const newSummaryData = {
          opNetBalance: {
            address: address,
            name: contracName.decoded.toLocaleString(),
            amount: BigInt(balance.decoded[0].toString()),
            divisibility: parseInt(divisibility.decoded.toString()),
            symbol: ''
          }
        };
        setTokenSummary(newSummaryData);
      }

      setLoading(false);
      console.log;
    };
    getAddress();
  }, [account.address]);

  const navigate = useNavigate();

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
              {/* <Button
                text="Mint"
                preset="primary"
                style={!enableMint ? { backgroundColor: 'grey' } : {}}
                disabled={!enableMint}
                icon="pencil"
                onClick={(e) => {
                  window.open(`${unisatWebsite}/runes/inscribe?tab=mint&rune=${tokenSummary.runeInfo.rune}`);
                }}
                full
              /> */}

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
          </Column>

          <Text
            text={tokenSummary.opNetBalance.name}
            preset="title-bold"
            onClick={() => {
              copyToClipboard(tokenSummary.opNetBalance.name).then(() => {
                tools.toastSuccess('Copied');
              });
            }}></Text>
          {/* {tokenSummary.runeLogo ? (
            <Row>
              <InscriptionPreview data={tokenSummary.runeLogo} preset="small" asLogo />
            </Row>
          ) : null} */}

          {/* <Column gap="lg">
            <Section title="runeid" value={tokenSummary.runeInfo.runeid} />

            <Section title="mints" value={tokenSummary.runeInfo.mints} />

            <Section
              title="supply"
              value={`${runesUtils.toDecimalAmount(tokenSummary.runeInfo.supply, tokenSummary.runeInfo.divisibility)} ${
                tokenSummary.runeInfo.symbol
              }`}
            />

            <Section
              title="premine"
              value={`${runesUtils.toDecimalAmount(
                tokenSummary.runeInfo.premine,
                tokenSummary.runeInfo.divisibility
              )} ${tokenSummary.runeInfo.symbol}`}
            />

            <Section title="burned" value={tokenSummary.runeInfo.burned} />

            <Section title="divisibility" value={tokenSummary.runeInfo.divisibility} />

            <Section title="symbol" value={tokenSummary.runeInfo.symbol} />

            <Section title="holders" value={tokenSummary.runeInfo.holders} />

            <Section title="transactions" value={tokenSummary.runeInfo.transactions} />

            <Section
              title="etching"
              value={tokenSummary.runeInfo.etching}
              link={`${mempoolWebsite}/tx/${tokenSummary.runeInfo.etching}`}
            />

            {tokenSummary.runeInfo.parent ? (
              <Section
                title="parent"
                value={tokenSummary.runeInfo.parent}
                link={`${ordinalsWebsite}/inscription/${tokenSummary.runeInfo.parent}`}
              />
            ) : null}
          </Column> */}
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
