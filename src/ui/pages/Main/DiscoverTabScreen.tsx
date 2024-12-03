import { Carousel } from 'antd';
import { useEffect, useState } from 'react';

import { AppInfo } from '@/shared/types';
import { Card, Column, Content, Footer, Header, Image, Layout, Row, Text } from '@/ui/components';
import { Empty } from '@/ui/components/Empty';
import { NavTabBar } from '@/ui/components/NavTabBar';
import { TabBar } from '@/ui/components/TabBar';
import { useReadApp } from '@/ui/state/accounts/hooks';
import { useAppList, useBannerList } from '@/ui/state/discovery/hooks';
import { discoveryActions } from '@/ui/state/discovery/reducer';
import { useAppDispatch } from '@/ui/state/hooks';
import { useChain, useChainType } from '@/ui/state/settings/hooks';
import { shortDesc, useWallet } from '@/ui/utils';

import { SwitchChainModal } from '../Settings/SwitchChainModal';

function BannerItem({ img, link }: { img: string; link: string }) {
  return (
    <Row
      justifyCenter
      onClick={() => {
        window.open(link);
      }}>
      <Image src={img} width={300} height={98} />
    </Row>
  );
}

function AppItem({ info }: { info: AppInfo }) {
  const readApp = useReadApp();
  return (
    <Card
      preset="style1"
      style={{
        backgroundColor: 'rgba(30, 31, 36, 1)',
        borderRadius: 16
      }}
      onClick={() => {
        if (info.url) window.open(info.url);
        readApp(info.id);
      }}>
      <Row full>
        <Column justifyCenter>
          <Image src={info.logo} size={48} />
        </Column>

        <Column justifyCenter gap="zero">
          <Row itemsCenter>
            <Text text={info.title} />
            {info.new && <Text text="new!" color="red" />}
          </Row>

          <Text text={shortDesc(info.desc)} preset="sub" />
        </Column>
      </Row>
    </Card>
  );
}

export default function DiscoverTabScreen() {
  const chainType = useChainType();
  const chain = useChain();

  const [tabKey, setTabKey] = useState(0);

  const bannerList = useBannerList();
  const appList = useAppList();

  const [switchChainModalVisible, setSwitchChainModalVisible] = useState(false);

  const wallet = useWallet();
  const dispatch = useAppDispatch();
  useEffect(() => {
    wallet
      .getBannerList()
      .then((data) => {
        dispatch(discoveryActions.setBannerList(data));
      })
      .catch((e) => {
        dispatch(discoveryActions.setBannerList([]));
      });

    wallet
      .getAppList()
      .then((data) => {
        dispatch(discoveryActions.setAppList(data));
      })
      .catch((e) => {
        dispatch(discoveryActions.setAppList([]));
      });
  }, [chainType]);

  const tabItems = appList.map((v, index) => {
    return {
      key: index,
      label: v.tab,
      children: (
        <Column>
          {v.items.map((w) => (
            <AppItem key={w.id} info={w} />
          ))}
        </Column>
      )
    };
  });

  return (
    <Layout>
      <Header
        type="style2"
        LeftComponent={
          <Row>
            <Text preset="title-bold" text={'Explore the Latest'} />
          </Row>
        }
        RightComponent={
          <Card
            preset="style2"
            style={{
              backgroundColor: 'transparent'
            }}
            onClick={() => {
              setSwitchChainModalVisible(true);
            }}>
            <Image
              src={'./images/artifacts/chain-bar.png'}
              width={56}
              height={28}
              style={{
                position: 'absolute',
                right: 56 / 2
              }}
            />
            <Image
              src={chain.icon}
              size={22}
              style={{
                position: 'absolute',
                right: 55
              }}
            />
          </Card>
        }
      />
      <Content>
        <Column justifyCenter>
          <Carousel autoplay>
            {bannerList.map((v) => (
              <BannerItem key={v.img} img={v.img} link={v.link} />
            ))}
          </Carousel>

          {tabItems.length == 0 ? (
            <Empty />
          ) : (
            <TabBar
              defaultActiveKey={tabKey}
              activeKey={tabKey}
              items={tabItems}
              preset="style1"
              onTabClick={(key) => {
                setTabKey(key);
              }}
            />
          )}

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
