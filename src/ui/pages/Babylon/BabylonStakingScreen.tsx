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
      mx="md"
      justifyBetween
      px="md"
      py="md"
      itemsCenter
      style={{
        backgroundColor: '#1A1A1A',
        borderRadius: 10
      }}>
      <Row justifyCenter>
        {props.icon}
        <Column gap="sm">
          <Text
            text={props.title}
            size="sm"
            style={{
              color: '#A6ADBB'
            }}
          />
          <Text text={props.value} size="sm" preset="bold" color="white" />
        </Column>
      </Row>

      {props.button}
    </Row>
  );
}

function Section3(props: { onClick: () => void }) {
  return (
    <Row
      mx="md"
      justifyBetween
      px="md"
      py="md"
      itemsCenter
      style={{
        backgroundColor: '#1A1A1A',
        borderRadius: 10
      }}
      onClick={props.onClick}>
      <Row justifyCenter px="md">
        <Image src={'./images/artifacts/wallet.png'} width={50} height={50} />

        <Column gap="sm">
          <Row itemsCenter>
            <Text text={'How to import BABY'} style={{ color: 'white' }} size="xs" />
            <Icon icon="circle-question" size={16} />
          </Row>

          <Text
            text={'Learn how to import your Babylon reward assets into a COSMOS-compatible wallet.'}
            style={{ color: '#A6ADBB' }}
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
                borderRadius: 10
              }}>
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

        <Section3
          onClick={() => {
            setImportBabyPopoverVisible(true);
          }}
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
