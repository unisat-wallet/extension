import React, { useEffect, useState } from 'react';

import { ChainType } from '@/shared/constant';
import { BabylonPhaseState } from '@/shared/constant/babylon';
import { COSMOS_CHAINS_MAP } from '@/shared/constant/cosmosChain';
import { runesUtils } from '@/shared/lib/runes-utils';
import { BabylonAddressSummary, BabylonStakingStatusV2 } from '@/shared/types';
import { Button, Column, Content, Header, Icon, Image, Layout, Row, Text } from '@/ui/components';
import { Loading } from '@/ui/components/ActionComponent/Loading';
import { CopyableAddress } from '@/ui/components/CopyableAddress';
import { Popover } from '@/ui/components/Popover';
import { useBabylonConfig, useChain, useChainType } from '@/ui/state/settings/hooks';
import { fontSizes } from '@/ui/theme/font';
import { satoshisToAmount, useWallet } from '@/ui/utils';

import { useNavigate } from '../MainRoute';

const formatter = Intl.NumberFormat('en', {
  notation: 'compact',
  maximumFractionDigits: 2
});

export function NotSupportedLayout() {
  return (
    <Layout>
      <Header
        onBack={() => {
          window.history.go(-1);
        }}
        title="Babylon Staking"
      />
      <Content>
        <Text text={'Not supported'} />
      </Content>
    </Layout>
  );
}

function Section(props: { icon: React.ReactElement; title: string; value: string }) {
  return (
    <Row mx="md" my="sm" justifyBetween>
      <Row>
        {props.icon}
        <Text
          text={props.title}
          style={{
            color: '#A6ADBB'
          }}
          size="xs"
        />
      </Row>

      <Text text={props.value} color="white_muted3" size="xs" />
    </Row>
  );
}

function Section2(props: { icon: React.ReactElement; title?: string; value?: string; button?: React.ReactElement }) {
  return (
    <Row
      justifyBetween
      px="md"
      py="md"
      itemsCenter
      style={{
        backgroundColor: '#1A1A1A',
        borderRadius: 10
      }}>
      <Row justifyCenter itemsCenter>
        {props.icon}
        <Column gap="sm">
          <Text
            text={props.title}
            size="xs"
            style={{
              color: '#A6ADBB'
            }}
          />
          <Text text={props.value} size="sm" preset="bold" color="white" />
        </Column>
      </Row>
      <Row itemsCenter>
        {props.button}
      </Row>
    </Row>
  );
}

function Section3(props: { onClick: () => void }) {
  return (
    <Row
      justifyBetween
      px="md"
      py="md"
      itemsCenter
      style={{
        backgroundColor: '#1A1A1A',
        borderRadius: 10
      }}
      onClick={props.onClick}>
      <Row justifyCenter itemsCenter>
        <Image src={'./images/artifacts/wallet.png'} width={32} height={32} />

        <Column gap="sm">
          <Row itemsCenter>
            <Text text={'How to import BABY'} style={{ color: 'white' }} size="xs" />
            <Icon icon="circle-question" size={14} />
          </Row>

          <Text
            text={'Learn how to import your Babylon reward assets into a COSMOS-compatible wallet.'}
            style={{ color: '#ffffff99' }}
            size="xs"
          />
        </Column>
      </Row>
    </Row>
  );
}

function EnableImportBabyPopover({ onClose }: { onClose: () => void }) {
  return (
    <Popover onClose={onClose}>
      <Column justifyCenter itemsCenter>
        <Text text="How to Import BABY" preset="title-bold" />

        <Column gap="zero" mt="md">
          <Row>
            <Icon icon="baby-tip1" color="icon_yellow" size={28} />
            <div style={{ fontSize: fontSizes.sm, color: '#ddd' }}>
              Click the "HD Wallet #*" at the top left of the main page, then click the gear icon beside your wallet and
              choose "Show Secret Recovery Phrase." Enter your password to reveal your 12-word Seed Phrase.
            </div>
          </Row>
        </Column>

        <Column gap="zero">
          <Row>
            <Icon icon="baby-tip1" color="icon_yellow" size={28} />
            <div style={{ fontSize: fontSizes.sm, color: '#ddd' }}>
              Once you have your Seed Phrase, you can import it into a COSMOS-compatible wallet to access your Babylon
              reward assets.
            </div>
          </Row>
        </Column>
      </Column>
    </Popover>
  );
}

export default function BabylonStakingScreen() {
  const chainType = useChainType();
  const navigate = useNavigate();

  const babylonConfig = useBabylonConfig();
  const wallet = useWallet();

  const chain = useChain();
  if (!babylonConfig) {
    return <NotSupportedLayout />;
  }

  const babylonChain = COSMOS_CHAINS_MAP[babylonConfig.chainId];

  const [importBabyPopoverVisible, setImportBabyPopoverVisible] = useState(false);

  const [babylonAddressSummary, setBabylonAddressSummary] = useState<BabylonAddressSummary>({
    address: '',
    balance: {
      denom: 'ubnb',
      amount: '0'
    },
    rewardBalance: 0,
    stakedBalance: 0
  });

  const [babylonStakingStatus, setBabylonStakingStatus] = useState<BabylonStakingStatusV2>({
    active_tvl: 0,
    active_delegations: 0,
    active_stakers: 0,
    active_finality_providers: 0,
    total_finality_providers: 0
  });

  useEffect(() => {
    const run = async () => {
      if (babylonConfig.phase2.state === BabylonPhaseState.ACTIVE) {
        wallet.getBabylonAddressSummary(babylonConfig.chainId).then((summary) => {
          setBabylonAddressSummary(summary);
        });

        wallet.getBabylonStakingStatusV2().then((status) => {
          setBabylonStakingStatus(status);
        });
      } else {
        wallet.getBabylonAddressSummary(babylonConfig.chainId, false).then((summary) => {
          setBabylonAddressSummary(summary);
        });
      }
    };
    run();
  }, [babylonConfig]);

  let networkPrefix = '';
  if (chainType !== ChainType.BITCOIN_MAINNET) {
    networkPrefix = 'Testnet';
  }

  if (!babylonAddressSummary.address) {
    return (
      <Layout>
        <Header
          onBack={() => {
            window.history.go(-1);
          }}
          title="Babylon Bitcoin Staking"
        />
        <Content>
          <Loading />
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
        title="Babylon Bitcoin Staking"
      />
      <Content>
        <Column>
          <Row justifyCenter>
            <Row justifyCenter px="lg" py="sm" style={{ backgroundColor: '#3F3227', borderRadius: 10 }}>
              <CopyableAddress address={babylonAddressSummary.address} />
            </Row>
          </Row>

          {babylonConfig.phase1.state === BabylonPhaseState.CLOSED ? (
            <Column
              px="lg"
              py="lg"
              my="md"
              style={{
                backgroundColor: '#1A1A1A',
                borderRadius: 10
              }}>
              <Text text={'Babylon Bitcoin Staking Phase1'} preset="bold" mb="md" />

              <Button
                text="Closed"
                preset="defaultV2"
                textStyle={{
                  color: 'white'
                }}
                onClick={() => {
                  window.open(babylonConfig.phase1.stakingUrl, '_blank');
                }}
              />
            </Column>
          ) : null}

          {babylonConfig.phase2.state === BabylonPhaseState.ACTIVE ? (
            <Column
              px="lg"
              py="lg"
              my="md"
              style={{
                backgroundColor: '#1A1A1A',
                borderRadius: 10,
                position:'relative'
              }}>
              <svg
                style={{position:'absolute',right:8,top:8}}
                xmlns="http://www.w3.org/2000/svg" width="50" height="47" viewBox="0 0 50 47" fill="none">
                <path opacity="0.12" fillRule="evenodd" clipRule="evenodd"
                      d="M0.11176 8.92619C-0.132219 8.28576 0.0306182 7.56665 0.528399 7.08357L7.30606 0.512419C7.80384 0.0298399 8.54611 -0.128013 9.2062 0.108015L23.6573 5.25499C24.0125 5.38127 24.2482 5.709 24.2482 6.07582V9.14317C24.2482 9.37519 24.1531 9.59769 23.9841 9.76155L20.4665 13.1717C20.2179 13.4127 19.8467 13.4919 19.5164 13.3736L15.6344 11.9855L11.3689 10.4596C11.0081 10.3303 10.6566 10.6711 10.79 11.0214L13.7953 18.9205C13.9173 19.2407 13.8361 19.6005 13.587 19.8416L10.4597 22.8723C10.1077 23.2141 10.1077 23.7678 10.4597 24.1091L13.6035 27.1569C13.8527 27.3979 13.9338 27.7577 13.8118 28.078L10.8065 35.9761C10.6732 36.3264 11.0247 36.6672 11.3855 36.5379L19.533 33.6239C19.8633 33.5056 20.2344 33.5848 20.483 33.8258L23.9841 37.2199C24.1531 37.3838 24.2482 37.6063 24.2482 37.8383V40.9066C24.2482 41.2729 24.013 41.6007 23.6584 41.727L9.22379 46.8895C8.56319 47.1256 7.82089 46.9682 7.32311 46.4851L0.54491 39.9139C0.0471294 39.4314 -0.115669 38.7117 0.12831 38.0713L5.43536 24.1246C5.58371 23.7338 5.58371 23.3043 5.43536 22.9139L0.11176 8.92619ZM49.8882 38.0738C50.1322 38.7142 49.9694 39.4334 49.4716 39.9164L42.694 46.4876C42.1962 46.9702 41.4544 47.128 40.7938 46.892L26.3427 41.745C25.9876 41.6188 25.7518 41.291 25.7518 40.9242V37.8568C25.7518 37.6248 25.8469 37.4023 26.016 37.2384L29.5335 33.8283C29.7822 33.5868 30.1533 33.5081 30.4836 33.6264L34.3656 35.0145L38.6311 36.5404C38.9919 36.6697 39.3434 36.3289 39.21 35.9786L36.2047 28.0795C36.0827 27.7593 36.1639 27.3994 36.413 27.1584L39.5403 24.1276C39.8923 23.7859 39.8923 23.2321 39.5403 22.8909L36.3965 19.8431C36.1474 19.6015 36.0662 19.2422 36.1882 18.922L39.1935 11.0239C39.3268 10.6736 38.9753 10.3328 38.6145 10.4621L30.4671 13.3761C30.1368 13.4944 29.7656 13.4152 29.517 13.1742L26.016 9.78009C25.8469 9.61623 25.7518 9.39373 25.7518 9.16171V6.09336C25.7518 5.72704 25.987 5.39981 26.3416 5.27303L40.7762 0.108516C41.4368 -0.127511 42.1786 0.02984 42.6769 0.512921L49.4546 7.08407C49.9529 7.56665 50.1157 8.28626 49.8717 8.92669L44.5647 22.8728C44.4158 23.2637 44.4158 23.6932 44.5647 24.0835L49.8882 38.0738Z"
                      fill="#CE6533" />
              </svg>
              <Text text={'Babylon Bitcoin Staking Stats'} preset="bold" />

              <Section
                icon={<Icon icon={'baby-tvl'} color="orange_light2" size={18} />}
                title={`Confirmed ${chain.unit} TVL`}
                value={`${satoshisToAmount(babylonStakingStatus.active_tvl)} ${chain.unit}`}
              />
              <Section
                icon={<Icon icon={'baby-stakers'} color="orange_light2" size={18} />}
                title="Stakers"
                value={formatter.format(babylonStakingStatus.active_stakers)}
              />

              <Section
                icon={<Icon icon={'baby-delegation'} color="orange_light2" size={18} />}
                title="Delegations"
                value={formatter.format(babylonStakingStatus.active_delegations)}
              />

              <Section
                icon={<Icon icon={'baby-staking'} color="orange_light2" size={18} />}
                title="Finality Providers"
                value={`${babylonStakingStatus.active_finality_providers} Active (${babylonStakingStatus.total_finality_providers} Total)`}
              />

              <Button
                text="Go to Stake"
                preset="approval"
                textStyle={{
                  color: 'white'
                }}
                onClick={() => {
                  window.open(babylonConfig.phase2.stakingUrl, '_blank');
                }}
              />
            </Column>
          ) : null}
        </Column>
        <Section3
          onClick={() => {
            setImportBabyPopoverVisible(true);
          }}
        />

        {babylonConfig.phase2.state === BabylonPhaseState.ACTIVE ? (
          <Section2
            icon={<Icon icon={'staked-btc'} size={36} />}
            title={`Staked ${chain.unit}`}
            value={`${satoshisToAmount(babylonAddressSummary.stakedBalance)} ${chain.unit}`}
            button={
              <Button
                text="Unstake"
                preset="minimal"
                disabled={babylonAddressSummary.stakedBalance === 0}
                onClick={() => {
                  window.open(babylonConfig.phase2.stakingUrl, '_blank');
                }}
              />
            }
          />
        ) : null}

        {babylonConfig.phase2.state === BabylonPhaseState.ACTIVE ? (
          <Section2
            icon={<Icon icon={'claimable-baby'} size={36} />}
            title={`Claimable ${networkPrefix} ${babylonChain.stakeCurrency.coinDenom} Rewards`}
            value={`${runesUtils.toDecimalAmount(
              babylonAddressSummary.rewardBalance.toString(),
              babylonChain.stakeCurrency.coinDecimals
            )} ${babylonChain.stakeCurrency.coinDenom}`}
            button={
              <Button
                text="Claim"
                preset="minimal"
                disabled={babylonAddressSummary.rewardBalance === 0}
                onClick={() => {
                  window.open(babylonConfig.phase2.stakingUrl, '_blank');
                }}
              />
            }
          />
        ) : null}

        <Section2
          icon={<Icon icon={'baby'} size={32} />}
          title={`Total ${networkPrefix} ${babylonChain.stakeCurrency.coinDenom} Balance`}
          value={`${runesUtils.toDecimalAmount(
            babylonAddressSummary.balance.amount,
            babylonChain.stakeCurrency.coinDecimals
          )} ${babylonChain.stakeCurrency.coinDenom}`}
          button={
            <Button
              text="Send"
              preset="minimal2"
              disabled={babylonAddressSummary.balance.amount === '0'}
              onClick={() => {
                navigate('SendBABYScreen', {});
              }}
            />
          }
        />


      </Content>
      {importBabyPopoverVisible ? (
        <EnableImportBabyPopover
          onClose={() => {
            setImportBabyPopoverVisible(false);
          }}
        />
      ) : null}
    </Layout>
  );
}
