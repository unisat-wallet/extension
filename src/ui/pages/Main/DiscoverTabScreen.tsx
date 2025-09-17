import { useEffect, useState } from 'react';

import { ChainType } from '@/shared/constant';
import { AddressType, AppInfo } from '@/shared/types';
import { Card, Carousel, Column, Content, Footer, Header, Image, Layout, Row, Text, Tooltip } from '@/ui/components';
import { NavTabBar } from '@/ui/components/NavTabBar';
import { SwitchNetworkBar } from '@/ui/components/SwitchNetworkBar';
import { TabBar } from '@/ui/components/TabBar';
import { useI18n } from '@/ui/hooks/useI18n';
import { SearchBar } from '@/ui/pages/Main/DiscoverTabComponents/SearchBar';
import { useCurrentAddress, useReadApp } from '@/ui/state/accounts/hooks';
import { useAppList, useBannerList, useHasNewBanner, useLastFetchInfo } from '@/ui/state/discovery/hooks';
import { discoveryActions } from '@/ui/state/discovery/reducer';
import { useAppDispatch } from '@/ui/state/hooks';
import { useChainType, useNetworkType } from '@/ui/state/settings/hooks';
import { useWallet } from '@/ui/utils';
import { getAddressType } from '@/ui/utils/bitcoin-utils';

import { useNavigate } from '../MainRoute';
import { SwitchChainModal } from '../Settings/SwitchChainModal';

const APP_ID_BABYLON_STAKING = 1103;

function BannerItem({ img, link }: { img: string; link: string }) {
  return (
    <Row
      justifyCenter
      onClick={() => {
        window.open(link);
      }}>
      <Image
        src={img}
        width={'100%'}
        height={'auto'}
        style={{
          maxWidth: '512px'
        }}
      />
    </Row>
  );
}

function AppItem({ info, onClick }: { info: AppInfo; onClick?: () => void }) {
  const readApp = useReadApp();
  const navigate = useNavigate();
  const { t } = useI18n();

  const currentAddress = useCurrentAddress();
  const networkType = useNetworkType();

  // todo: Temporary handling plan, should change to control by config
  if (info.id === APP_ID_BABYLON_STAKING) {
    const addressType = getAddressType(currentAddress, networkType);
    if (addressType == AddressType.P2SH_P2WPKH || addressType == AddressType.P2PKH) {
      return <></>;
    }
  }

  return (
    <Card
      preset="style1"
      style={{
        backgroundColor: 'rgba(30, 31, 36, 1)',
        borderRadius: 16
      }}
      onClick={() => {
        if (onClick) {
          onClick();
          return;
        }

        if (info.route) {
          navigate(info.route as any);
          return;
        }

        if (info.url) {
          window.open(info.url);
          return;
        }

        readApp(info.id);
      }}>
      <Row full>
        <Column justifyCenter>
          <Image src={info.logo} size={48} />
        </Column>

        <Column justifyCenter gap="zero">
          <Row itemsCenter>
            <Text text={info.title} />
            {info.new && <Text text={t('new')} color="red" />}
          </Row>

          <Tooltip
            title={info.desc}
            overlayStyle={{
              fontSize: '10px',
              lineHeight: '14px'
            }}>
            <div>
              <Text text={info.desc} preset="sub" max2Lines />
            </div>
          </Tooltip>
        </Column>
      </Row>
    </Card>
  );
}

export default function DiscoverTabScreen() {
  const chainType = useChainType();
  const { t } = useI18n();

  const [tabKey, setTabKey] = useState(0);

  const bannerList = useBannerList();
  const appList = useAppList();
  const lastFetchInfo = useLastFetchInfo();
  const hasNewBanner = useHasNewBanner();

  const [switchChainModalVisible, setSwitchChainModalVisible] = useState(false);

  const wallet = useWallet();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (lastFetchInfo.lasfFetchChainType === chainType && Date.now() - lastFetchInfo.lastFetchTime < 1000 * 60 * 1) {
      return;
    }
    const fetchTime = Date.now();
    wallet
      .getBannerList()
      .then((data) => {
        dispatch(
          discoveryActions.setBannerList({
            bannerList: data,
            chainType,
            fetchTime
          })
        );
      })
      .catch((e) => {
        dispatch(
          discoveryActions.setBannerList({
            bannerList: [],
            chainType,
            fetchTime
          })
        );
      });

    wallet
      .getAppList()
      .then((data) => {
        dispatch(
          discoveryActions.setAppList({
            appList: data,
            chainType,
            fetchTime
          })
        );
      })
      .catch((e) => {
        dispatch(
          discoveryActions.setAppList({
            appList: [],
            chainType,
            fetchTime
          })
        );
      });
  }, [chainType, lastFetchInfo.lasfFetchChainType, lastFetchInfo.lastFetchTime]);

  useEffect(() => {
    if (hasNewBanner) {
      dispatch(discoveryActions.clearNewBannerFlag());
    }
  }, [hasNewBanner, dispatch]);

  useEffect(() => {
    if (tabKey > appList.length - 1) {
      setTabKey(0);
    }
  }, [appList, tabKey]);

  const tabItems = appList.map((v, index) => {
    return {
      key: index,
      label: v.tab,
      children: (
        <Column gap="lg">
          {v.items.map((w) => (
            <AppItem key={w.id} info={w} />
          ))}
        </Column>
      )
    };
  });

  const hasBanner = bannerList && bannerList.length > 0;

  return (
    <Layout>
      <Header
        type="home"
        LeftComponent={
          <Row>
            <Text preset="title-bold" text={t('dapp_center')} />
          </Row>
        }
        RightComponent={<SwitchNetworkBar />}
      />
      <Content>
        <Column justifyCenter>
          {(chainType === ChainType.FRACTAL_BITCOIN_MAINNET || chainType === ChainType.BITCOIN_MAINNET) && (
            <>
              <SearchBar />
              <Row mt="md" />
            </>
          )}
          {hasBanner ? (
            <Carousel autoplay>
              {bannerList.map((v) => (
                <BannerItem key={v.img} img={v.img} link={v.link} />
              ))}
            </Carousel>
          ) : null}

          {hasBanner ? <Row mt="md" /> : null}

          {tabItems.length > 1 ? (
            <TabBar
              defaultActiveKey={tabKey}
              activeKey={tabKey}
              items={tabItems}
              preset="style1"
              onTabClick={(key) => {
                setTabKey(key);
              }}
            />
          ) : null}

          {tabItems[tabKey] ? tabItems[tabKey].children : null}
        </Column>

        {switchChainModalVisible && (
          <SwitchChainModal
            onClose={() => {
              setSwitchChainModalVisible(false);
            }}
          />
        )}
      </Content>
      <Footer px="zero" py="zero">
        <NavTabBar tab="discover" />
      </Footer>
    </Layout>
  );
}
