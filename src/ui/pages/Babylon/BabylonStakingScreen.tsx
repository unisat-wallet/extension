import React, { useEffect, useMemo, useState } from 'react';

import { ChainType } from '@/shared/constant';
import { BabylonConfigV2, BabylonPhaseState } from '@/shared/constant/babylon';
import { COSMOS_CHAINS_MAP } from '@/shared/constant/cosmosChain';
import { runesUtils } from '@/shared/lib/runes-utils';
import { BabylonAddressSummary } from '@/shared/types';
import { Button, Column, Content, Header, Icon, Image, Layout, Row, Text } from '@/ui/components';
import { useTools } from '@/ui/components/ActionComponent';
import { Loading } from '@/ui/components/ActionComponent/Loading';
import { CopyableAddress } from '@/ui/components/CopyableAddress';
import { Popover } from '@/ui/components/Popover';
import { useI18n } from '@/ui/hooks/useI18n';
import { useBabylonConfig, useChain, useChainType } from '@/ui/state/settings/hooks';
import { colors } from '@/ui/theme/colors';
import { satoshisToAmount, useWallet } from '@/ui/utils';

import { useNavigate } from '../MainRoute';

const formatter = Intl.NumberFormat('en', {
  notation: 'compact',
  maximumFractionDigits: 2
});

export function NotSupportedLayout() {
  const { t } = useI18n();
  return (
    <Layout>
      <Header
        onBack={() => {
          window.history.go(-1);
        }}
        title={t('babylon_staking')}
      />
      <Content>
        <Text text={t('not_supported')} />
      </Content>
    </Layout>
  );
}

function StatusTag({ status }: { status: 'Open' | 'Closed' | 'Pending' }) {
  const { t } = useI18n();

  const backgroundColors = {
    Open: 'rgba(124, 219, 152, 0.1)',
    Closed: 'rgba(255, 255, 255, 0.1)',
    Pending: 'rgba(244, 182, 44, 0.1)'
  };

  const textColors = {
    Open: 'rgba(124, 219, 152, 0.85)',
    Closed: 'rgba(255, 255, 255, 0.65)',
    Pending: 'rgba(244, 182, 44, 0.85)'
  };

  const statusToTranslationKey = {
    Open: 'open_babylon',
    Closed: 'closed_babylon',
    Pending: 'pending_babylon'
  };

  const backgroundColor = backgroundColors[status];
  const textColor = textColors[status];
  return (
    <Row
      style={{
        borderRadius: 20,
        backgroundColor,
        padding: 5,
        paddingLeft: 10,
        paddingRight: 10
      }}>
      <Text text={t(statusToTranslationKey[status])} style={{ color: textColor }} />
    </Row>
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

function Section2(props: {
  icon: React.ReactElement;
  title?: string;
  value?: string;
  button?: React.ReactElement;
  groupTop?: boolean;
  groupBottom?: boolean;
}) {
  return (
    <Row
      justifyBetween
      px="md"
      py="md"
      itemsCenter
      style={{
        backgroundColor: '#1A1A1A',
        borderRadius:
          props.groupTop && props.groupBottom
            ? '12px 12px 12px 12px'
            : props.groupTop
            ? '12px 12px 0px 0px'
            : props.groupBottom
            ? '0px 0px 12px 12px'
            : '0px 0px 0px 0px'
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
      <Row itemsCenter>{props.button}</Row>
    </Row>
  );
}

function Section3(props: { onClick: () => void }) {
  const { t } = useI18n();
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
            <Text text={t('how_to_import_baby')} style={{ color: 'white' }} size="xs" />
            <Icon icon="circle-question" size={14} />
          </Row>

          <Text
            text={t('learn_how_to_import_your_babylon_reward_assets_into_a_cosmos_compatible_wallet')}
            style={{ color: '#ffffff99' }}
            size="xs"
          />
        </Column>
      </Row>
    </Row>
  );
}

function EnableImportBabyPopover({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();
  function StepIcon({ step }: { step: number }) {
    return (
      <Row
        itemsCenter
        justifyCenter
        style={{
          width: 26,
          minWidth: 26,
          height: 26,
          minHeight: 26,
          borderRadius: 13,
          backgroundColor: '#F4B62C33'
        }}>
        <Text text={step} style={{ color: '#F4B62C' }} size="sm" />
      </Row>
    );
  }

  function StepItem({ step, title, images }: { step: number; title: string; images: string[] }) {
    return (
      <Row style={{ alignSelf: 'stretch' }}>
        <StepIcon step={step} />
        <Column gap={'md'}>
          <Text size={'sm'} color={'light'} text={title} />
          {images.map((image, index) => {
            return <Image key={index} src={image} width={'100%'} height={'unset'} />;
          })}
        </Column>
      </Row>
    );
  }

  return (
    <Popover onClose={onClose}>
      <Column justifyCenter itemsCenter gap={'md'}>
        <Text text={t('how_to_import_baby')} preset="title-bold" />

        <StepItem
          step={1}
          title={t('click_the_account_on_the_main_page')}
          images={['./images/artifacts/how-to-import-baby-1.png']}
        />
        <StepItem
          step={2}
          title={t('tap_the_more_menu_then_select_the_export_private_key_option')}
          images={['./images/artifacts/how-to-import-baby-2.png', './images/artifacts/how-to-import-baby-3.png']}
        />
        <StepItem
          step={3}
          title={t(
            'once_you_have_your_hex_private_key_you_can_import_it_into_a_cosmos_compatible_wallet_to_access_your_babylon_reward_assets'
          )}
          images={[]}
        />
      </Column>
    </Popover>
  );
}

function TransferBabyPopover({ onClose }: { onClose: () => void }) {
  const [showConfirm1, setShowConfirm1] = useState(false);
  const { t } = useI18n();

  const [showConfirm2, setShowConfirm2] = useState(false);
  const navigate = useNavigate();

  if (showConfirm1) {
    return (
      <Popover onClose={onClose}>
        <Column justifyCenter itemsCenter gap={'md'}>
          <Text text={t('convert_baby_to_brc20')} preset="bold" />
          <Row full mt="md" style={{ borderBottomWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' }} />

          <Column fullX px="md" py="lg" my="sm">
            <Text text={t('you_are_about_to_convert_your_native_baby_to_btc_brc20_baby')} />
            <Text text={t('once_the_conversion_is_complete_your_native_baby_cannot_be_restored')} />
            <Text text={t('do_you_confirm_the_conversion')} />
          </Column>

          <Row fullX>
            <Button
              text={t('cancel')}
              preset="defaultV2"
              full
              onClick={() => {
                setShowConfirm1(false);
              }}
            />
            <Button
              text={t('confirm')}
              preset="primaryV2"
              full
              onClick={() => {
                // TODO
              }}
            />
          </Row>
        </Column>
      </Popover>
    );
  }

  if (showConfirm2) {
    return (
      <Popover onClose={onClose}>
        <Column justifyCenter itemsCenter gap={'md'}>
          <Text text={t('transfer_baby_to_cosmos_wallet')} preset="bold" />
          <Row full mt="md" style={{ borderBottomWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' }} />

          <Column fullX px="md" py="lg" my="sm">
            <Text preset="default" text={t('you_are_about_to_transfer_your_native_baby_to_your_cosmos_wallet')} />
            <Text text={t('do_you_confirm_the_transfer')} />
          </Column>

          <Row fullX>
            <Button
              text={t('cancel')}
              preset="defaultV2"
              full
              onClick={() => {
                setShowConfirm2(false);
              }}
            />
            <Button
              text={t('confirm')}
              preset="primaryV2"
              full
              onClick={() => {
                navigate('SendBABYScreen');
              }}
            />
          </Row>
        </Column>
      </Popover>
    );
  }

  function ButtonItem({
    title,
    desc,
    onClick,
    disabled
  }: {
    title: string;
    desc: string;
    onClick?: () => void;
    disabled?: boolean;
  }) {
    return (
      <Row
        fullX
        px="md"
        py="lg"
        my="sm"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.06)',
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.35)',
          borderRadius: 8,
          opacity: disabled ? 0.5 : 1
        }}
        onClick={onClick}>
        <Column gap="md" style={{}}>
          <Text preset="default" text={title} style={{ fontWeight: 'bold' }} />
          <Text preset="sub" text={desc} />
        </Column>
      </Row>
    );
  }

  return (
    <Popover onClose={onClose}>
      <Column justifyCenter itemsCenter gap={'md'}>
        <Text text={t('transfer')} preset="bold" />
        <Row full style={{ borderBottomWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' }} />

        <ButtonItem
          title={t('click_baby_to_brc20_coming_soon')}
          desc={t('convert_your_native_baby_to_btc_brc20_baby')}
          disabled
        />
        <ButtonItem
          onClick={() => {
            setShowConfirm2(true);
          }}
          title={t('transfer_baby_to_cosmos_wallet')}
          desc={t('transfer_your_baby_to_your_cosmos_wallet')}
        />
      </Column>
    </Popover>
  );
}

export default function BabylonStakingScreen() {
  const chainType = useChainType();
  const navigate = useNavigate();
  const { t } = useI18n();
  const babylonConfig = useBabylonConfig();
  const wallet = useWallet();
  const chain = useChain();
  if (!babylonConfig) {
    return <NotSupportedLayout />;
  }

  const babylonChain = COSMOS_CHAINS_MAP[babylonConfig.chainId];

  const [importBabyPopoverVisible, setImportBabyPopoverVisible] = useState(false);
  const [importTransferBabyPopoverVisible, setTransferBabyPopoverVisible] = useState(false);

  const [addressLoading, setAddressLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(true);

  const [babylonConfigV2, setBabylonConfigV2] = useState<BabylonConfigV2>();

  const [babylonAddressSummary, setBabylonAddressSummary] = useState<BabylonAddressSummary>({
    address: '',
    balance: {
      denom: 'ubnb',
      amount: '0'
    },
    rewardBalance: 0,
    stakedBalance: 0
  });

  const tools = useTools();

  const formattedBalance = useMemo(() => {
    return runesUtils.toDecimalAmount(babylonAddressSummary.balance.amount, babylonChain.stakeCurrency.coinDecimals);
  }, [babylonAddressSummary.balance.amount, babylonChain.stakeCurrency.coinDecimals]);

  const formattedRewardBalance = useMemo(() => {
    return runesUtils.toDecimalAmount(
      babylonAddressSummary.rewardBalance.toString(),
      babylonChain.stakeCurrency.coinDecimals
    );
  }, [babylonAddressSummary.rewardBalance, babylonChain.stakeCurrency.coinDecimals]);

  useEffect(() => {
    const loadSummary = async () => {
      try {
        const address = await wallet.getBabylonAddress(babylonConfig.chainId);
        setBabylonAddressSummary((prev) => ({ ...prev, address }));
        setAddressLoading(false);

        const babylonConfigV2 = await wallet.getBabylonConfig();
        setBabylonConfigV2(babylonConfigV2);
        setSummaryLoading(false);

        if (babylonConfigV2 && babylonConfigV2.phase2.state === BabylonPhaseState.ACTIVE) {
          const summary = await wallet.getBabylonAddressSummary(babylonConfig.chainId, babylonConfigV2);
          setBabylonAddressSummary(summary);
          setStatusLoading(false);
        }
      } catch (e) {
        tools.toastError((e as any).message);
      } finally {
        setSummaryLoading(false);
        setStatusLoading(false);
      }
    };

    loadSummary();
  }, []);

  let networkPrefix = '';
  if (chainType !== ChainType.BITCOIN_MAINNET) {
    networkPrefix = 'Testnet';
  }

  if (addressLoading) {
    return (
      <Layout>
        <Header
          onBack={() => {
            window.history.go(-1);
          }}
          title={t('babylon_bitcoin_staking')}
        />
        <Content>
          <Loading />
        </Content>
      </Layout>
    );
  }

  function ClaimedBabySection(props: { groupTop?: boolean; groupBottom?: boolean }) {
    return (
      <Section2
        icon={<Icon icon={'claimed-baby'} size={36} />}
        title={`${t('claimabled')} ${networkPrefix} Baby`}
        value={summaryLoading ? `${t('loading')}...` : `${formattedBalance} ${babylonChain.stakeCurrency.coinDenom}`}
        button={
          <Button
            style={{ margin: 0 }}
            text={t('transfer')}
            preset="minimal2"
            textStyle={{
              color: 'white'
            }}
            // disabled={summaryLoading || babylonAddressSummary.balance.amount === '0'}
            onClick={() => {
              setTransferBabyPopoverVisible(true);
            }}
          />
        }
        {...props}
      />
    );
  }

  return (
    <Layout>
      <Header
        onBack={() => {
          navigate('DiscoverTabScreen');
        }}
        title={t('babylon_bitcoin_staking')}
      />
      <Content>
        <Column>
          <Row justifyCenter>
            <Row justifyCenter px="lg" py="sm" style={{ backgroundColor: '#3F3227', borderRadius: 10 }}>
              <CopyableAddress address={babylonAddressSummary.address} />
            </Row>
          </Row>

          {babylonConfigV2 && babylonConfigV2.phase1.state === BabylonPhaseState.CLOSED ? (
            <Column
              px="lg"
              py="lg"
              my="md"
              style={{
                backgroundColor: '#1A1A1A',
                borderRadius: 10
              }}>
              <Row justifyBetween itemsCenter>
                <Text text={babylonConfigV2.phase1.title} preset="bold" />
                <StatusTag status="Closed" />
              </Row>
              <Button
                text={t('go_to_babylon')}
                onClick={() => {
                  window.open(babylonConfigV2.phase1.stakingUrl, '_blank');
                }}
              />
            </Column>
          ) : null}

          {babylonConfigV2 && babylonConfigV2.phase2.state === BabylonPhaseState.PENDING ? (
            <Column
              px="lg"
              py="lg"
              my="md"
              style={{
                backgroundColor: '#1A1A1A',
                borderRadius: 10
              }}>
              <Row justifyBetween itemsCenter>
                <Text text={babylonConfigV2.phase2.title} preset="bold" />
                <StatusTag status="Pending" />
              </Row>
              <Button
                text={t('go_to_babylon')}
                onClick={() => {
                  window.open(babylonConfigV2.phase2.stakingUrl, '_blank');
                }}
              />
            </Column>
          ) : null}

          {babylonConfigV2 && babylonConfigV2.phase2.state === BabylonPhaseState.ACTIVE ? (
            <Column
              px="lg"
              py="lg"
              my="md"
              style={{
                backgroundColor: '#1A1A1A',
                borderRadius: 10,
                position: 'relative'
              }}>
              <Row justifyBetween itemsCenter>
                <Text text={t('babylon_bitcoin_staking_phase2')} preset="bold" />
                <StatusTag status="Open" />
              </Row>

              <Button
                text={t('go_to_babylon')}
                preset="minimal"
                onClick={() => {
                  window.open(babylonConfigV2.phase2.stakingUrl, '_blank');
                }}
              />
            </Column>
          ) : null}
        </Column>
        {/* <Section3
          onClick={() => {
            setImportBabyPopoverVisible(true);
          }}
        /> */}

        {babylonConfigV2 && babylonConfigV2.phase2.state === BabylonPhaseState.ACTIVE ? (
          <Section2
            icon={<Icon icon={'staked-btc'} size={36} />}
            title={`${t('staked')} ${chain.unit}`}
            value={
              summaryLoading
                ? `${t('loading')}...`
                : `${satoshisToAmount(babylonAddressSummary.stakedBalance)} ${chain.unit}`
            }
            button={
              <Button
                style={{ margin: 0 }}
                text={t('unstake')}
                preset="minimal"
                disabled={summaryLoading || babylonAddressSummary.stakedBalance === 0}
                onClick={() => {
                  window.open(babylonConfigV2.phase2.stakingUrl, '_blank');
                }}
              />
            }
            groupTop
            groupBottom
          />
        ) : null}

        {babylonConfigV2 && babylonConfigV2.phase2.state === BabylonPhaseState.ACTIVE ? (
          <Column gap="zero">
            <React.Fragment>
              <Section2
                icon={<Icon icon={'claimable-baby'} size={36} />}
                title={`${t('claimable')} ${networkPrefix} BABY`}
                value={
                  summaryLoading
                    ? `${t('loading')}...`
                    : `${formattedRewardBalance} ${babylonChain.stakeCurrency.coinDenom}`
                }
                button={
                  <Button
                    style={{ margin: 0 }}
                    text={t('claim')}
                    preset="minimal"
                    disabled={summaryLoading || babylonAddressSummary.rewardBalance === 0}
                    onClick={() => {
                      window.open(babylonConfigV2.phase2.stakingUrl, '_blank');
                    }}
                  />
                }
                groupTop
              />
              <Row full style={{ borderBottomWidth: 2, borderColor: colors.border2 }} />
              <ClaimedBabySection groupBottom />
            </React.Fragment>
          </Column>
        ) : babylonConfigV2 && babylonConfigV2.showClaimed ? (
          <ClaimedBabySection groupTop groupBottom />
        ) : null}
      </Content>
      {importBabyPopoverVisible ? (
        <EnableImportBabyPopover
          onClose={() => {
            setImportBabyPopoverVisible(false);
          }}
        />
      ) : null}

      {importTransferBabyPopoverVisible ? (
        <TransferBabyPopover
          onClose={() => {
            setTransferBabyPopoverVisible(false);
          }}
        />
      ) : null}
    </Layout>
  );
}
